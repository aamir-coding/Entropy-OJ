# Worker QA & Security Audit Report
## Scope: `apps/worker/src` + `docker/`
**Auditor Role:** Principal Distributed Systems Engineer & QA Auditor
**Date:** 2026-08-31
**Files Inspected:** `src/worker.ts`, `src/config/env.ts`, `src/config/db.ts`, `src/config/redis.ts`, `src/queue/submissionWorker.ts`, `src/sandbox/evaluator.ts`, `src/sandbox/dockerRunner.ts`, `src/sandbox/sandbox.test.ts`, `docker/Dockerfile.runner`, `docker/runner.sh`, `Dockerfile`, `package.json`, `.env`

---

## 🔴 CRITICAL

---

### [CRITICAL] — Non-Idempotent Job Processing: `acceptedSubmissions` Counter Double-Increments on BullMQ Retry

**Location:** [`src/queue/submissionWorker.ts`, lines 85–89](file:///c:/aamir_all_files/anti-online-judge/apps/worker/src/queue/submissionWorker.ts#L85-L89); shared `QueueConfig.DEFAULT_JOB_ATTEMPTS = 2`

**The Bug:** The worker's job processor allows BullMQ to retry a failed job up to 2 times. The catch block at line 97–105 rethrows the error after writing `INTERNAL_ERROR` to MongoDB, which signals BullMQ to re-attempt the job. On a retry, `evaluateSubmission` runs again from scratch. If the first attempt fully succeeded — updated the Solution to `ACCEPTED` and incremented `acceptedSubmissions` — but then the MongoDB `$inc` at line 86 threw a transient network error causing the rethrow, BullMQ retries the entire job. The second attempt would evaluate the code again, find `ACCEPTED`, and call `$inc { acceptedSubmissions: 1 }` a **second time**, permanently inflating the counter. There is no idempotency guard checking the current Solution verdict before re-evaluating or re-incrementing.

**Impact:** Problem acceptance counters silently double-count on transient errors during retries. The `acceptanceRate` statistic becomes permanently inflated for affected problems, with no mechanism to detect or correct the corruption.

**Fix Strategy:** Before evaluating, check if the Solution document already has a non-PENDING verdict and return immediately (idempotency guard). For the `$inc acceptedSubmissions`, use a conditional MongoDB update that only increments if the previous verdict was PENDING, preventing double-increments on retry.

---

### [CRITICAL] — Docker Container Leak: `--rm` Is Ineffective When `execFileAsync` Is Killed by Node.js Timeout

**Location:** [`src/sandbox/dockerRunner.ts`, `runTestCase()`, lines 154–162](file:///c:/aamir_all_files/anti-online-judge/apps/worker/src/sandbox/dockerRunner.ts#L154-L162)

**The Bug:** `execFileAsync('docker', args, { timeout: wallTimeoutMs })` launches a `docker run --rm` container. When the Node.js-level `timeout` fires, `child_process` sends `SIGTERM` to the `docker` **CLI process** — not to the Docker container itself. Killing the Docker CLI process merely orphans the API connection; the container continues running on the Docker daemon. The `--rm` flag only removes the container when it exits normally or when the daemon kills it. Since the container is still running user code (e.g., an infinite loop), it becomes a zombie container: running indefinitely, consuming CPU and memory on the host. With `WORKER_CONCURRENCY=2` and a flood of TLE submissions, zombie containers accumulate without bound.

**Impact:** Host server CPU and memory are exhausted by orphaned containers. The worker host becomes unresponsive; new submissions cannot be processed; in extreme cases the host OS OOM-kills the worker process itself.

**Fix Strategy:** Use `docker run --name <submission-id>-<testcase-index>` to name each container, then explicitly call `docker kill <name>` in the `catch` block after the Node.js timeout fires. This guarantees the container is terminated regardless of what happens to the CLI process.

---

### [CRITICAL] — `runner.sh` Is Vulnerable to Shell Injection via Unquoted `$CMD` Variable

**Location:** [`docker/runner.sh`, line 56](file:///c:/aamir_all_files/anti-online-judge/apps/worker/docker/runner.sh#L56)

**The Bug:** `$CMD < "$INPUT_FILE" > "$OUTPUT_FILE" 2> "$STDERR_FILE"` — the `$CMD` variable is unquoted in the execution line. `$CMD` is set from `$LANG`, which arrives from the Docker `args` array built in `dockerRunner.ts` using `job.data.language` from the BullMQ job payload. If an attacker bypasses API validation and injects a crafted language string like `cpp; rm -rf /workspace;` directly into the BullMQ queue, the unquoted `$CMD` would split on the semicolon and execute arbitrary shell commands as the `runner` user inside the container. Although `runner` is unprivileged, workspace corruption and output file fabrication (producing a false Accepted verdict for any submission) are both achievable.

**Impact:** A malicious BullMQ job payload can trigger arbitrary shell command execution inside the sandbox container, enabling verdict fabrication, workspace corruption, and container-level denial of service.

**Fix Strategy:** Quote `$CMD` as `"$CMD"` in the execution line, and add a strict allowlist check at the very top of the `run` block — if `$LANG` is not exactly `cpp` or `python` (string equality, not pattern match), exit immediately with error code 1 before setting `$CMD`.

---

### [CRITICAL] — Worker Has No `unhandledRejection` / `uncaughtException` Handler — Any Async Error Crashes the Entire Process

**Location:** [`src/worker.ts`, `bootstrap()`, lines 5–31](file:///c:/aamir_all_files/anti-online-judge/apps/worker/src/worker.ts#L5-L31)

**The Bug:** `bootstrap()` registers SIGINT/SIGTERM handlers but never registers `process.on('unhandledRejection', ...)` or `process.on('uncaughtException', ...)`. Errors thrown outside the BullMQ job processor's try/catch — such as MongoDB reconnect callbacks, Redis event emitter errors, or any module-level async code — result in an unhandled exception that crashes the entire Node.js process without triggering `worker.close()`. BullMQ has no opportunity to release job locks, leaving active jobs in `stalled` state in Redis.

**Impact:** Any single unhandled exception in any event callback terminates the worker process instantly. BullMQ stall detection will eventually re-queue stalled jobs after the stall timeout period, but during the downtime all submissions queue up unprocessed while the judge appears "online" to users.

**Fix Strategy:** Add `process.on('unhandledRejection', (reason) => { console.error('[Worker] Unhandled rejection:', reason); })` and `process.on('uncaughtException', (err) => { console.error('[Worker] Uncaught exception:', err); process.exit(1); })` in `bootstrap()`. A controlled `process.exit(1)` on uncaught exceptions lets a container orchestrator restart the worker cleanly rather than leaving it in an undefined state.

---

## 🟠 HIGH

---

### [HIGH] — No Dead-Letter Queue (DLQ) Handler — Permanently Failed Jobs Leave Submissions in PENDING State Forever

**Location:** [`src/queue/submissionWorker.ts`, `worker.on('failed', ...)`, lines 118–120](file:///c:/aamir_all_files/anti-online-judge/apps/worker/src/queue/submissionWorker.ts#L118-L120)

**The Bug:** When a job exhausts all retry attempts, BullMQ moves it to the `failed` job set. The `worker.on('failed', ...)` handler only logs `console.error`. It does not check `job.attemptsMade >= QueueConfig.DEFAULT_JOB_ATTEMPTS` to detect final failures, and performs no compensating MongoDB update. If both retry attempts fail (e.g., MongoDB is down), the Solution document remains permanently in PENDING state. The client polls for 30 seconds, sees no update, and the user is left with a broken "Evaluating…" spinner with no way to know the evaluation permanently failed.

**Impact:** On infrastructure instability, permanently orphaned PENDING submissions accumulate. Users never see a final verdict, the `totalSubmissions` counter is inflated with unresolvable records, and the problem's acceptance rate is permanently skewed downward.

**Fix Strategy:** In `worker.on('failed', ...)`, check `if (job.attemptsMade >= QueueConfig.DEFAULT_JOB_ATTEMPTS)` and perform a best-effort MongoDB update to set the Solution's verdict to `INTERNAL_ERROR` with a user-facing explanatory message. This is the DLQ compensating action ensuring no submission is ever left in PENDING state permanently.

---

### [HIGH] — `acceptedSubmissions` Increment Is Not Atomic With Solution Verdict Update

**Location:** [`src/queue/submissionWorker.ts`, lines 74–89](file:///c:/aamir_all_files/anti-online-judge/apps/worker/src/queue/submissionWorker.ts#L74-L89)

**The Bug:** Two separate MongoDB operations are performed sequentially: (1) update Solution verdict, (2) if accepted, increment Problem's `acceptedSubmissions`. These are not atomic. If the process crashes or the MongoDB connection drops between operation 1 and operation 2, the Solution is marked `ACCEPTED` but the Problem's counter is never incremented — permanently understating the acceptance rate. Combined with the retry double-increment risk (Critical #1), the counter can drift in either direction.

**Impact:** Permanent, non-recoverable data corruption of problem acceptance rate statistics. In aggregate across many transient failures, the displayed acceptance rates become meaningless.

**Fix Strategy:** Use a MongoDB session/transaction to make both operations atomic, or use a single aggregation pipeline update. At minimum, add a periodic reconciliation job that audits `acceptedSubmissions` against `Solution.countDocuments({ verdict: 'Accepted' })` and corrects drift.

---

### [HIGH] — Worker Re-Declares Mongoose Models With `strict: false` — Bypasses All Schema Validation

**Location:** [`src/queue/submissionWorker.ts`, lines 13–46](file:///c:/aamir_all_files/anti-online-judge/apps/worker/src/queue/submissionWorker.ts#L13-L46)

**The Bug:** The worker does not import canonical model definitions from a shared package. Instead it re-declares minimal `mongoose.Schema` objects with `{ strict: false }`. This means Mongoose will write any arbitrary field to MongoDB documents without validation. A typo in a field name (e.g., `verdit` instead of `verdict`) is silently written without error, leaving the submission permanently in PENDING state with no compile-time or runtime warning.

**Impact:** Schema drift between the server's model definitions and the worker's loose schemas creates broken documents invisible at write time. Any future worker refactor that misspells a field name produces silently corrupted MongoDB documents.

**Fix Strategy:** Extract canonical Mongoose model definitions into a shared `@anti-oj/models` package so both the server and worker import and use the same validated, `strict: true` schemas. Remove `strict: false` from all worker-side schema declarations.

---

### [HIGH] — `output.txt` Has No Size Cap — Printing-Loop Submissions Exhaust the Host's `/tmp` Partition

**Location:** [`docker/runner.sh`, line 56](file:///c:/aamir_all_files/anti-online-judge/apps/worker/docker/runner.sh#L56); [`src/sandbox/dockerRunner.ts`, line 170](file:///c:/aamir_all_files/anti-online-judge/apps/worker/src/sandbox/dockerRunner.ts#L170)

**The Bug:** `$CMD < input.txt > output.txt` has no output size limit. A submission that prints unbounded output (e.g., `while True: print("A" * 1000000)` in Python) will continuously write to `/workspace/output.txt`, which is volume-mounted from the **host's tmpdir**. During the wall-clock timeout grace period (2.5x TLE + overhead), gigabytes of data can fill the host's `/tmp` partition before the container is killed. With `WORKER_CONCURRENCY=2`, two simultaneous output-flooding submissions can exhaust `/tmp` entirely.

**Impact:** Host `/tmp` partition exhaustion causes all subsequent `fs.mkdtemp()` workspace creations to fail, crashing the worker's ability to process any new submissions. This is an effective host-level disk DoS attack requiring only 2 concurrent malicious submissions.

**Fix Strategy:** Pipe the command output through `head -c 65536` (64KB limit) before writing to `output.txt` in `runner.sh`. Additionally, mount the workspace directory as a `tmpfs` with a fixed size cap using `docker run --tmpfs /workspace:size=100m` to enforce a hard disk usage limit per container.

---

### [HIGH] — Each Submission Spawns `1 + N` Docker Container Lifecycles (1 Compile + N Test Cases)

**Location:** [`src/sandbox/evaluator.ts`, lines 24–58](file:///c:/aamir_all_files/anti-online-judge/apps/worker/src/sandbox/evaluator.ts#L24-L58); [`src/sandbox/dockerRunner.ts`, `compile()` and `runTestCase()`](file:///c:/aamir_all_files/anti-online-judge/apps/worker/src/sandbox/dockerRunner.ts)

**The Bug:** `compile()` launches one `docker run --rm` container, and `runTestCase()` launches another separate `docker run --rm` container per test case. For a problem with 7 test cases, one submission spawns 8 Docker container lifecycles. Each `docker run` cold start takes 200–500ms of overhead independent of code execution time. With `WORKER_CONCURRENCY=2` processing 7-testcase problems simultaneously, 16 container starts run concurrently, saturating the Docker daemon.

**Impact:** End-to-end evaluation latency is dominated by Docker startup overhead rather than actual code execution. A 1-second time limit problem takes 5–8 seconds wall-clock. Under submission load, the Docker daemon becomes the bottleneck and throughput collapses.

**Fix Strategy:** Reuse a single long-running container per job for both compilation and all test case runs using `docker exec`, reducing the container lifecycle count from `1 + N` to `1` per job. Alternatively, restructure `runner.sh` to accept all test cases in a batch and process them inside a single container invocation.

---

## 🟡 MEDIUM

---

### [MEDIUM] — `parseMetrics` Returns All Zeros on Missing/Malformed `metrics.txt` — Mis-Classifies TLE/MLE/RTE as Wrong Answer

**Location:** [`src/sandbox/dockerRunner.ts`, `parseMetrics()`, lines 190–232](file:///c:/aamir_all_files/anti-online-judge/apps/worker/src/sandbox/dockerRunner.ts#L190-L232); [`src/sandbox/evaluator.ts`, lines 60–101](file:///c:/aamir_all_files/anti-online-judge/apps/worker/src/sandbox/evaluator.ts#L60-L101)

**The Bug:** If `metrics.txt` is absent or malformed (e.g., container killed before `/usr/bin/time` wrote it), `parseMetrics` returns all-zero values. In the evaluator: `timedOut = false`, `cpuTimeMs = 0 > timeLimitMs` is false (TLE not detected), `maxRssKb = 0 > memoryLimitKb` is false (MLE not detected), `exitCode = 0 !== 0` is false (RTE not detected). The evaluator then compares empty `output.txt` against expected output and returns `WRONG_ANSWER` instead of `INTERNAL_ERROR`.

**Impact:** TLE, MLE, and RTE submissions are incorrectly classified as WRONG_ANSWER when the container is killed before metrics are written, misleading users about the nature of their failure.

**Fix Strategy:** After `parseMetrics`, add a sentinel check: if all key metrics are zero AND `timedOut` is false AND `output.txt` is empty AND `stderr.txt` is empty, return `INTERNAL_ERROR` instead of proceeding to output comparison. This correctly handles the "container killed before any output" case.

---

### [MEDIUM] — Worker `bootstrap()` Has No Redis Readiness Check Before Starting Job Processing

**Location:** [`src/worker.ts`, `bootstrap()`, lines 5–26](file:///c:/aamir_all_files/anti-online-judge/apps/worker/src/worker.ts#L5-L26)

**The Bug:** `bootstrap()` calls `connectDB()` (which exits on failure) then immediately calls `createSubmissionWorker()`, which creates a BullMQ Worker and begins polling Redis. `redisClient` is instantiated at module import time with `enableReadyCheck: false`. If Redis is not yet available, BullMQ silently retries internally but logs "BullMQ Submission Worker ready" — appearing healthy while processing nothing.

**Impact:** The worker logs a successful startup but silently processes no jobs during Redis unavailability. Submissions pile up in the queue with no consumer, and the issue is invisible until an operator notices queue depth growing.

**Fix Strategy:** Add `await redisClient.ping()` in `bootstrap()` before creating the BullMQ worker, with a startup failure and `process.exit(1)` if the ping throws, consistent with how MongoDB connectivity is enforced via `connectDB()`.

---

### [MEDIUM] — `EXIT_CODE` in `metrics.txt` Parsed as Hexadecimal but GNU time `%x` Outputs Decimal

**Location:** [`src/sandbox/dockerRunner.ts`, `parseMetrics()`, line 222](file:///c:/aamir_all_files/anti-online-judge/apps/worker/src/sandbox/dockerRunner.ts#L222)

**The Bug:** `result.exitCode = parseInt(val, 16) || 0` parses the value as base-16. GNU time's `%x` on Linux outputs the exit status as a **decimal integer**, not hex. For exit code `11` (SIGSEGV): `parseInt('11', 16)` = `17` decimal — an incorrect value. For `12` (SIGSEGV on some signals): `parseInt('12', 16)` = `18`. This produces wrong `exitCode` values in logs for signal-killed processes (though the verdict is still `RUNTIME_ERROR` since `exitCode !== 0` remains true).

**Impact:** Incorrect exit code values in logs and stored metrics for signal-killed processes, making debugging harder. No incorrect verdict is issued, but data integrity in the `exitCode` field is compromised.

**Fix Strategy:** Change `parseInt(val, 16)` to `parseInt(val, 10)` to correctly parse GNU time's decimal `%x` output. Verify the actual output format of `/usr/bin/time -f "EXIT_CODE=%x"` inside the Debian container before finalizing.

---

### [MEDIUM] — Windows Host Docker Volume Mount Path Conversion Is Incomplete

**Location:** [`src/sandbox/dockerRunner.ts`, lines 66, 130](file:///c:/aamir_all_files/anti-online-judge/apps/worker/src/sandbox/dockerRunner.ts#L66)

**The Bug:** `this.workspaceDir.replace(/\\/g, '/')` converts `C:\Users\...\job-xxx` to `C:/Users/.../job-xxx`. Docker Desktop on Windows requires paths in the format `//c/Users/.../job-xxx` (Git Bash style) or the path must be configured via Docker Desktop's file sharing settings. The simple backslash-to-slash replacement produces a path that Docker silently accepts but maps to an empty/incorrect mount point inside the container, causing all workspace files to be missing.

**Impact:** On Windows development hosts with Docker Desktop, all submissions return `INTERNAL_ERROR` because compiled binaries, input files, and output files are never found in the container's `/workspace`. This is a complete development environment blocker on Windows.

**Fix Strategy:** Add platform detection: on Windows, convert the path to the Docker Desktop WSL2 format (`/mnt/c/...` for WSL2 or `//c/...` for Hyper-V backend). Use `process.platform === 'win32'` to conditionally apply the correct conversion. Document that Linux is the recommended production host platform.

---

## 🔵 LOW

---

### [LOW] — `redisClient.disconnect()` Is Not Awaited in `gracefulShutdown`

**Location:** [`src/worker.ts`, lines 19–21](file:///c:/aamir_all_files/anti-online-judge/apps/worker/src/worker.ts#L19-L21)

**The Bug:** `redisClient.disconnect()` returns a Promise in ioredis v5+, but is called without `await`. The process exits before the TCP FIN handshake completes, resulting in connection-reset errors on the Redis server side on every worker restart.

**Impact:** Noisy Redis server-side connection-reset error logs on every worker deployment or restart. In high-churn environments this floods Redis monitoring alerts.

**Fix Strategy:** Change `redisClient.disconnect()` to `await redisClient.disconnect()` to match the already-correct `await worker.close()` and `await disconnectDB()` patterns in the same function.

---

### [LOW] — `Dockerfile` Is a Single-Stage Build Containing Dev Dependencies in the Production Image

**Location:** [`Dockerfile`, lines 1–29](file:///c:/aamir_all_files/anti-online-judge/apps/worker/Dockerfile#L1-L29)

**The Bug:** `npm install` installs all dependencies including devDependencies (`tsx`, `typescript`, `@types/node`) in the single build stage, and the final production image contains these unused packages, increasing image size and attack surface.

**Impact:** Unnecessarily large Docker image with increased pull times and a larger attack surface. No direct functional impact.

**Fix Strategy:** Convert to a two-stage Dockerfile: a `builder` stage that installs all deps and compiles TypeScript, and a lean `runner` stage that runs `npm ci --omit=dev` and copies only `dist/` into a fresh `node:22-bookworm-slim` base image.

---

### [LOW] — Sandbox Tests Require a Live Docker Daemon With No Skip Guard

**Location:** [`src/sandbox/sandbox.test.ts`, entire file](file:///c:/aamir_all_files/anti-online-judge/apps/worker/src/sandbox/sandbox.test.ts)

**The Bug:** All 5 tests invoke real `docker run` commands with no check for Docker availability and no mock strategy. In a CI environment without Docker-in-Docker, every test fails with `spawn docker ENOENT` or similar, and no tests can run at all.

**Impact:** Tests cannot run in standard CI pipelines without DinD configuration; the test suite is not portable and provides misleading failures in environments where Docker is unavailable.

**Fix Strategy:** Add a `before` hook that runs `docker info` and calls `it.skip` on all tests if Docker is unavailable. Separate unit tests (with mocked `execFileAsync`) from integration tests (requiring Docker) into distinct test files, run via separate CI jobs.

---

### [LOW] — `runner.sh` `awk` Wall-Timeout Calculation Has No Input Validation — Zero or Non-Numeric `TIME_LIMIT_MS` Bypasses Timeout

**Location:** [`docker/runner.sh`, line 40](file:///c:/aamir_all_files/anti-online-judge/apps/worker/docker/runner.sh#L40)

**The Bug:** `WALL_TIMEOUT_SEC=$(awk "BEGIN {print ($TIME_LIMIT_MS / 1000) * 2.5 + 0.5}")` — if `$TIME_LIMIT_MS` is `0`, `WALL_TIMEOUT_SEC` becomes `0.5` seconds. If `$TIME_LIMIT_MS` is empty or non-numeric, `awk` may output `0.5` or fail silently. A `timeout "0.5s"` kills virtually every submission instantly, always returning TLE regardless of actual performance.

**Impact:** Malformed or zero `TIME_LIMIT_MS` in a job payload causes all submissions to instantly time out with a false TLE verdict. While the server validates this field, a directly-injected queue payload bypasses that validation.

**Fix Strategy:** Add a shell arithmetic guard at the top of the `run` block: validate that `TIME_LIMIT_MS` is a positive integer greater than a minimum threshold (e.g., 100), and exit with error code 1 if validation fails, returning `INTERNAL_ERROR` to the caller.

---

*Total Issues Found: 15*
*Critical: 4 | High: 5 | Medium: 4 | Low: 5 (5 items in LOW section)*

---
