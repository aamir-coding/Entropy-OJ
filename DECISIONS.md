# Online Judge — Decisions & Risk Register

Living log of every open question raised during HLD review (Aug 26, 2026 planning session). Update status as decisions land or get revisited — this file is the source of truth, not the chat history. Add new rows as new questions surface mid-phase.

**Legend:** ✅ Resolved · ⏳ Deferred (no action needed yet) · ❗ Open (needs a decision)

## ✅ Resolved

| ID | Item | Decision |
|---|---|---|
| — | Repo strategy | Monorepo, npm workspaces: `client`, `server`, `worker`, `shared` |
| — | V1 languages | C++ and Python at launch |
| — | Code editor | Monaco |
| R1 | Verdict aggregation | Fail-fast — stop at the first non-`Accepted` test case, report that verdict |
| R2 | Output diffing | Trim trailing whitespace per line + at EOF; preserve internal whitespace |
| R3 | Time-limit semantics | CPU time (not wall-clock) drives `Time Limit Exceeded`; wall-clock stays only as a hard kill-switch |
| R4 | Compilation step | Separate compile-time budget, distinct from per-test execution time; compile once per submission inside the execution container. Exact budget (~10s starting guess) gets tuned with real data in Phase 4. |
| R5 | Schema addition | Add `compileOutput: String` to `Solutions` |
| R6 | Hidden test-case leakage | Verdict responses return pass/fail + failing test number only — never a hidden case's expected/actual output |
| R7 | IDOR on submission history | `GET /api/submissions/user/:userId` derives the user from the JWT, never trusts the URL param |
| R9 | Language field validation | `Solution.language` checked against the shared allow-list before it ever reaches the worker |
| R10 | Runner image hygiene | Pin base images to digests; add Dependabot/Trivy scanning once images exist |
| R11 | Execution Layer network model | Reframed from "private network" to: EC2 security group with zero public inbound ports + scoped Redis/Mongo credentials + TLS on both outbound connections |
| R13a | New verdict value | Add `Internal Error` — distinct from user-caused `Runtime Error` — for infra failures / exhausted retries |
| — | Email uniqueness | Normalize to lowercase before the uniqueness check |
| R8 | MongoDB write-scoping enforcement | Code-level only for V1 — the worker's own code is the trust boundary, documented as a known trade-off. Revisit an internal write-API only if a compliance/audit need arises. |
| R12 | Content-management path for V1 | Seed scripts only — no bespoke CLI |
| R15 | JWT storage & expiry | httpOnly + `Secure` + `SameSite=Strict` cookie, not `localStorage`. No refresh-token flow for V1 — ~7-day expiry, re-login after |

## ⏳ Deferred — resolved naturally when we reach the phase

| ID | Item | Resolved in |
|---|---|---|
| R13b | BullMQ retry count / backoff strategy | Phase 5 — Worker integration (needs real load to tune, not a paper decision) |
| R14 | Client-side polling timeout / backoff | Phase 6 — Frontend submission flow |
| — | `dob` field on `User` | Phase 1 — default is to drop it; speak up then if you want it kept |

## ❗ Open

None. All 15 items from HLD review are resolved or deferred as of Aug 26, 2026 — **Phase 0 cleared to start.**
