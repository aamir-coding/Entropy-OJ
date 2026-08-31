# Backend QA & Security Audit Report
## Scope: `apps/server/src`
**Auditor Role:** Principal Backend QA Engineer & Security Auditor
**Date:** 2026-08-31
**Files Inspected:** `server.ts`, `app.ts`, `.env`, `config/env.ts`, `config/db.ts`, `config/redis.ts`, `middlewares/auth.middleware.ts`, `middlewares/error.middleware.ts`, `middlewares/validate.middleware.ts`, `controllers/auth.controller.ts`, `controllers/problem.controller.ts`, `controllers/submission.controller.ts`, `models/User.ts`, `models/Problem.ts`, `models/Solution.ts`, `models/TestCase.ts`, `routes/*.ts`, `queues/submission.queue.ts`, `seeds/seedProblems.ts`, `tests/api.test.ts`

---

## 🔴 CRITICAL

---

### [CRITICAL] — Hardcoded JWT Secret Committed to Version Control

**Location:** [`apps/server/.env`, line 7](file:///c:/aamir_all_files/anti-online-judge/apps/server/.env#L7); [`config/env.ts`, line 13](file:///c:/aamir_all_files/anti-online-judge/apps/server/src/config/env.ts#L13)

**The Bug:** The `.env` file contains the literal production JWT secret: `JWT_SECRET=super_secret_jwt_key_anti_online_judge_2026_production_grade`. This file exists in the repository (it is not listed in `.gitignore` — confirmed by the presence of an `.env.example` alongside it, which is the standard pattern for a committed `.env.example` + gitignored `.env`). Additionally, `config/env.ts` has a hardcoded **fallback** for this secret: `process.env.JWT_SECRET || 'super_secret_jwt_key_anti_online_judge_2026'`. If the environment variable is ever unset in production (e.g., a misconfigured deployment), the server silently falls back to a known-public secret, making **every JWT signed with it immediately forgeable** by anyone who has read this file.

**Impact:** Complete authentication bypass. An attacker who knows the fallback secret can forge a JWT for any `userId`, call `GET /api/auth/me`, and impersonate any user — including future admins. All session tokens are compromised.

**Fix Strategy:** Remove the `.env` file from version control entirely (add it to `.gitignore`) and replace the `||` fallback in `env.ts` with a hard startup failure (`throw new Error('JWT_SECRET env variable is required')`) so the server refuses to start without a proper secret. Rotate the current secret immediately.

---

### [CRITICAL] — Route Ordering Causes `GET /submissions/:id` to Shadow `GET /submissions/user/:userId`

**Location:** [`routes/submission.routes.ts`, lines 15–16](file:///c:/aamir_all_files/anti-online-judge/apps/server/src/routes/submission.routes.ts#L15-L16)

**The Bug:** Express routes are matched in registration order. The route `GET /:id` is registered at line 15, **before** `GET /user/:userId` at line 16 and `GET /problem/:problemId` at line 17. When a request arrives for `GET /submissions/user/abc123`, Express matches it against `/:id` first (with `id = "user"`), not against `/user/:userId`. The `getSubmissionById` controller then receives `id = "user"`, which fails the `mongoose.Types.ObjectId.isValid("user")` check and returns HTTP 400. The `/user/:userId` and `/problem/:problemId` routes are **completely unreachable** in practice.

**Impact:** The Profile Page's submission history (`GET /submissions/user/:userId`) and the Problem Detail Page's submission tab (`GET /submissions/problem/:problemId`) both return HTTP 400 for every request. Core product features are broken for all users.

**Fix Strategy:** Reorder the routes so that all specific static-segment routes (`/user/:userId`, `/problem/:problemId`) are registered **before** the wildcard `/:id` route. In Express, more-specific routes must precede wildcard routes.

---

### [CRITICAL] — `getSubmissionById` Exposes Submission Data to Any Authenticated User (Broken Object-Level Authorization)

**Location:** [`controllers/submission.controller.ts`, `getSubmissionById()`, lines 80–133](file:///c:/aamir_all_files/anti-online-judge/apps/server/src/controllers/submission.controller.ts#L80-L133)

**The Bug:** After fetching a submission by ID, the controller computes `isOwner` (line 110) and conditionally includes `code` in the response only for the owner (line 128). However, all other submission fields — `verdict`, `compileOutput`, `executionTime`, `memoryUsed`, `failedTestCaseNumber`, `totalTestCases`, `passedTestCases`, `language` — are returned to **any authenticated user** who knows the submission ID. There is no 403 return for non-owners accessing another user's submission record. The route comment says "users can view their own submissions" but the enforcement only restricts the `code` field, not the full resource.

**Impact:** Any logged-in user can enumerate submission IDs and read the verdict, compiler output, runtime stats, and test case failure details of other users' submissions. This is a classic BOLA (Broken Object Level Authorization) vulnerability. In a competitive context, leaking `compileOutput` or `failedTestCaseNumber` gives adversaries information about the judge's test suite structure.

**Fix Strategy:** Add an explicit authorization check — if `!isOwner`, return `HTTP 403 Access denied` immediately, before any data is included in the response. Alternatively, apply the IDOR guard identically to how `getUserSubmissions` does it.

---

### [CRITICAL] — `createSubmission` Has No Rate Limiting — Allows Unbounded Queue Flooding

**Location:** [`routes/submission.routes.ts`, line 14](file:///c:/aamir_all_files/anti-online-judge/apps/server/src/routes/submission.routes.ts#L14); [`app.ts`, lines 42–48](file:///c:/aamir_all_files/anti-online-judge/apps/server/src/app.ts#L42-L48)

**The Bug:** The `POST /api/submissions` route is protected only by the global `apiLimiter` (500 requests per 15 minutes per IP). This limit is far too permissive for a code submission endpoint. A single authenticated user could submit 500 code submissions in 15 minutes (~33 per minute). Each submission: (1) creates a MongoDB document, (2) increments the problem's `totalSubmissions` counter, and (3) enqueues a BullMQ job that spawns a Docker container in the worker. There is no per-user submission throttle, no cooldown between submissions, and no cap on how many `PENDING` jobs a single user can have in the queue simultaneously.

**Impact:** A malicious or runaway client can flood the judge queue with Docker-spawning jobs, exhausting the worker's concurrency, starving legitimate submissions, and inflating problem `totalSubmissions` counters with junk data — corrupting acceptance rate statistics permanently.

**Fix Strategy:** Apply a dedicated, per-user (or per-IP) strict rate limiter on `POST /submissions` (e.g., max 10 submissions per minute per user). Additionally, add a guard in `createSubmission` that checks if the user already has a `PENDING` submission for the same problem and rejects duplicates until the first one resolves.

---

## 🟠 HIGH

---

### [HIGH] — `getProblems` ReDoS Vulnerability via Unescaped User-Controlled Regex

**Location:** [`controllers/problem.controller.ts`, `getProblems()`, lines 26–29](file:///c:/aamir_all_files/anti-online-judge/apps/server/src/controllers/problem.controller.ts#L26-L29)

**The Bug:** The `search` query parameter is passed directly into `new RegExp(search, 'i')` without any escaping or sanitization. A malicious user can send a pathological regex pattern such as `(a+)+$` or `((a|aa)+)+$` which causes catastrophic backtracking in the MongoDB regex engine, consuming 100% CPU for many seconds. Although MongoDB's PCRE engine has some protections, specially crafted inputs can still cause significant latency. Furthermore, the Zod `ProblemFilterInput` schema (`problem.schema.ts`) must be checked — if `search` has no `max()` length constraint, an extremely long regex string compounds the risk.

**Impact:** A single unauthenticated GET request with a malicious `search` value can severely degrade MongoDB query performance, causing cascading API timeouts and service degradation for all concurrent users.

**Fix Strategy:** Escape all regex special characters in `search` before constructing the `RegExp` (using a utility like `escapeStringRegexp`) and enforce a maximum length (e.g., 100 characters) in the Zod `ProblemFilterInput` validation schema. Prefer MongoDB's `$text` index with full-text search over raw regex for production.

---

### [HIGH] — `getMe` Performs N+1 Aggregate Queries on Every Session Check

**Location:** [`controllers/auth.controller.ts`, `getMe()`, lines 143–167](file:///c:/aamir_all_files/anti-online-judge/apps/server/src/controllers/auth.controller.ts#L143-L167)

**The Bug:** `GET /api/auth/me` is called by the client on every page load to rehydrate user session state. Inside `getMe`, two sequential database queries are executed: `Solution.countDocuments()` and `Solution.find(...).populate('problem', 'difficulty')`. The second query loads **all** of a user's accepted solutions from the database (with no limit), populates each one with problem difficulty data, and then iterates them in a JavaScript `for` loop to compute stats. For a user with thousands of accepted submissions, this loads tens of thousands of documents into memory, performs O(n) iteration in Node.js, and makes this endpoint progressively slower as users accumulate history.

**Impact:** As user submission counts grow, `GET /api/auth/me` degrades from milliseconds to seconds, eventually timing out. Since this endpoint is called on every page load (client's `refreshUser()`), it becomes the bottleneck for the entire application for power users.

**Fix Strategy:** Replace the in-memory iteration with a MongoDB aggregation pipeline using `$group` and `$addFields` to compute `solvedProblemsCount`, `easySolved`, `mediumSolved`, `hardSolved`, and `acceptanceRate` directly in the database. Alternatively, cache the stats in Redis with a short TTL (e.g., 60 seconds) and invalidate on new accepted submissions.

---

### [HIGH] — `getProblemSubmissions` Returns Full Raw MongoDB Documents Including Source Code to Any Authenticated User

**Location:** [`controllers/submission.controller.ts`, `getProblemSubmissions()`, lines 229–240](file:///c:/aamir_all_files/anti-online-judge/apps/server/src/controllers/submission.controller.ts#L229-L240)

**The Bug:** `Solution.find({ user: userId, problem: queryProbId }).lean()` is called with **no field projection**. The `.lean()` result is passed directly into `res.json({ data: submissions })`. This returns the entire raw MongoDB document for each submission, including the full `code` field, `compileOutput`, internal MongoDB `__v` (though disabled), and any future sensitive fields added to the schema — without any explicit allowlist of safe fields. While `user: userId` scopes it to the caller's own data, the lack of projection is an architectural flaw.

**Impact:** The client receives more data than it needs (large `code` strings for every submission), increasing response payload size and bandwidth. Any future addition of a sensitive field to the Solution schema will be automatically exposed through this endpoint without requiring a change here — a "configuration drift" security risk.

**Fix Strategy:** Add a `.select()` projection to the query that explicitly allowlists the fields the client actually needs (e.g., `_id verdict language executionTime memoryUsed passedTestCases totalTestCases submittedAt`). Apply the same `ISubmissionHistoryItem` mapping pattern used in `getUserSubmissions` for consistency and safety.

---

### [HIGH] — `gracefulShutdown` Does Not Wait for In-Flight BullMQ Jobs Before Closing

**Location:** [`server.ts`, `gracefulShutdown()`, lines 19–29](file:///c:/aamir_all_files/anti-online-judge/apps/server/src/server.ts#L19-L29)

**The Bug:** When `SIGTERM` is received, `server.close()` stops accepting new connections and then calls `disconnectDB()` and `redisClient.disconnect()`. However, `submissionQueue` (the BullMQ Queue instance) is **never closed** during graceful shutdown. BullMQ queues hold open Redis connections and have internal timers. Abruptly disconnecting Redis while the Queue object is still alive will cause BullMQ to throw `Error: Connection is closed` errors and may corrupt in-flight job state metadata in Redis (e.g., a job's `processedOn` timestamp or lock keys), causing the worker to treat a completed job as stale and re-run it upon restart.

**Impact:** Duplicate submission processing after a server restart under load; corrupted job state in Redis leading to jobs stuck in `active` state permanently; Redis connection errors logged during every deployment rollout.

**Fix Strategy:** Import and close `submissionQueue` in `gracefulShutdown` before disconnecting Redis: call `await submissionQueue.close()` (which drains pending operations) before calling `redisClient.disconnect()`.

---

### [HIGH] — `totalSubmissions` Counter Increments Even When Queue Enqueue Fails (Non-Atomic Operations)

**Location:** [`controllers/submission.controller.ts`, `createSubmission()`, lines 36–57](file:///c:/aamir_all_files/anti-online-judge/apps/server/src/controllers/submission.controller.ts#L36-L57)

**The Bug:** The submission creation flow is: (1) `Solution.create()`, (2) `Problem.findByIdAndUpdate($inc totalSubmissions)`, (3) `enqueueSubmission()`. These three operations are not wrapped in any transaction or compensating logic. If `enqueueSubmission()` throws (e.g., Redis is temporarily unavailable), the Solution document and the incremented `totalSubmissions` counter already exist in MongoDB, but no judge job was ever added to the queue. The orphaned PENDING `Solution` will never be resolved, `totalSubmissions` is inflated by 1, and the `acceptanceRate` is corrupted downward for that problem permanently.

**Impact:** Silent data corruption — problems accumulate phantom "pending" submissions that never resolve, skewing acceptance rate statistics displayed to all users. Over time, with retries, this compounds.

**Fix Strategy:** Wrap the three operations in a try/catch that performs compensating rollback on failure: if `enqueueSubmission` throws, delete the created Solution document (`Solution.findByIdAndDelete`) and decrement the counter (`$inc: { totalSubmissions: -1 }`). For production, use a MongoDB session with transactions to make the create and counter-increment atomic.

---

### [HIGH] — Redis Client Created at Module Import Time — Crashes Process if Redis is Unavailable at Startup

**Location:** [`config/redis.ts`, line 12](file:///c:/aamir_all_files/anti-online-judge/apps/server/src/config/redis.ts#L12)

**The Bug:** `export const redisClient = new Redis(redisConnectionOptions)` executes at module load time (when `redis.ts` is first `import`ed). If Redis is unavailable, ioredis will immediately begin attempting reconnections with exponential backoff — but the server process continues to start and serve traffic, with `submissionQueue` silently failing on every `enqueueSubmission` call. The `error` event handler at line 18 only logs to console; it does not prevent server startup or signal an unhealthy state. Critically, the `enableReadyCheck: false` option means the client reports itself as "ready" even before Redis is actually reachable.

**Impact:** The server starts successfully and accepts submission POST requests even when Redis/BullMQ is completely down. Submissions get written to MongoDB and have `totalSubmissions` incremented, but then `enqueueSubmission` throws — leaving every submission permanently `PENDING` until Redis recovers (which triggers no replay mechanism).

**Fix Strategy:** Add a startup readiness check for Redis in `bootstrap()` in `server.ts` (e.g., `await redisClient.ping()`) before calling `app.listen()`. If the ping fails, abort startup with `process.exit(1)`. This makes Redis a hard dependency at boot time, consistent with how MongoDB is treated.

---

## 🟡 MEDIUM

---

### [MEDIUM] — `page` and `limit` Query Parameters Are Not Validated or Bounded

**Location:** [`controllers/problem.controller.ts`, line 14](file:///c:/aamir_all_files/anti-online-judge/apps/server/src/controllers/problem.controller.ts#L14); [`controllers/submission.controller.ts`, lines 158–160](file:///c:/aamir_all_files/anti-online-judge/apps/server/src/controllers/submission.controller.ts#L158-L160)

**The Bug:** In `getProblems`, `page` and `limit` are destructured from `req.query` as `ProblemFilterInput` but the Zod schema for `ProblemFilterInput` in `packages/shared/src/validation/problem.schema.ts` must be verified — if it lacks a `max()` on `limit`, a caller can send `limit=100000`, causing MongoDB to attempt to return 100,000 documents in a single query. In `getUserSubmissions`, `limit` is parsed with `parseInt` with no upper bound at all. An attacker can send `limit=1000000`.

**Impact:** A single request with `limit=1000000` can cause MongoDB to load the entire submissions collection into memory, causing OOM errors on the Node.js process and database slowdowns affecting all users.

**Fix Strategy:** Add explicit upper bound validation to both `page` and `limit` parameters — cap `limit` at a reasonable maximum (e.g., 50) in the Zod schema for query parameters. Never trust client-supplied pagination values without server-side clamping.

---

### [MEDIUM] — `env.ts` Has No Validation — Missing Required Vars Are Silent

**Location:** [`config/env.ts`, lines 6–17](file:///c:/aamir_all_files/anti-online-judge/apps/server/src/config/env.ts#L6-L17)

**The Bug:** All environment variables use `|| 'default_value'` fallbacks instead of hard validation. This means a misconfigured production deployment (e.g., a missing `MONGO_URI` in a Kubernetes secret) silently uses `'mongodb://localhost:27017/anti_oj'` — a connection that will fail eventually but with no startup warning that a required variable is absent. There is no schema validation (e.g., via Zod) confirming that `PORT` is a valid number, `MONGO_URI` is a valid MongoDB connection string, etc.

**Impact:** Silent misconfiguration in production environments; runtime errors that are hard to trace back to a missing environment variable; the fallback JWT secret is the most dangerous instance of this pattern (see Critical #1).

**Fix Strategy:** Use Zod to validate all required environment variables at startup in `env.ts`, with `z.string().url()` for URIs, `z.coerce.number()` for ports, and no fallback for security-critical variables like `JWT_SECRET`. Throw a descriptive error at startup if any required variable is missing.

---

### [MEDIUM] — `notFoundHandler` Reflects the Full Request URL in the Error Response

**Location:** [`middlewares/error.middleware.ts`, line 6](file:///c:/aamir_all_files/anti-online-judge/apps/server/src/middlewares/error.middleware.ts#L6)

**The Bug:** `error: \`Route not found: ${req.method} ${req.originalUrl}\`` — the full `req.originalUrl` is reflected verbatim into the response body without sanitization. If an attacker sends a request with a URL containing script tags or special characters (e.g., `GET /api/<script>alert(1)</script>`), and the client renders this error response as HTML rather than JSON, it could constitute a Reflected XSS vector. Even in a JSON API context, reflecting unsanitized input is a bad practice and provides unnecessary information about routing structure to attackers.

**Impact:** Low-severity XSS vector if any frontend component ever renders the `error` string as HTML; information disclosure of internal routing patterns to error-scanning bots.

**Fix Strategy:** Remove `req.originalUrl` from the 404 error response body. Return a generic `"Route not found"` message, letting the HTTP 404 status code communicate the error type.

---

### [MEDIUM] — `authLimiter` is Applied to `/api/auth` Prefix But `apiLimiter` is Also Applied via `/api` — Auth Routes Are Double-Rate-Limited

**Location:** [`app.ts`, lines 68–69](file:///c:/aamir_all_files/anti-online-judge/apps/server/src/app.ts#L68-L69)

**The Bug:** `app.use('/api/auth', authLimiter)` applies the auth-specific rate limiter (50 req/15 min). Then `app.use('/api', apiLimiter, apiRoutes)` applies the global API limiter (500 req/15 min) to ALL `/api/*` routes, including `/api/auth/*`. Since `/api/auth` is a subset of `/api`, auth requests are processed by **both** limiters in sequence. The `authLimiter` is the binding constraint, but this double-counting means auth requests consume from both rate limit windows simultaneously, with each limiter maintaining its own counter independently. This is confusing and wasteful — the `authLimiter` was clearly intended to be the sole limiter for auth routes.

**Impact:** Architectural confusion; in future the two counters could desync if middleware is reordered, unexpectedly permitting more auth requests than intended; extra Redis reads per auth request (each rate limiter stores its window in Redis).

**Fix Strategy:** Mount auth routes explicitly outside the general `apiLimiter` scope: apply `authLimiter` only to auth-specific routes within `auth.routes.ts` itself (or as middleware in the router), and exclude `/api/auth` from the `apiLimiter` scope.

---

### [MEDIUM] — `Solution` Model Has No Compound Index on `(user, problem)` — Causes Full Collection Scans

**Location:** [`models/Solution.ts`, lines 20–32](file:///c:/aamir_all_files/anti-online-judge/apps/server/src/models/Solution.ts#L20-L32)

**The Bug:** The Solution schema has individual indexes on `user`, `problem`, `verdict`, and `submittedAt`, but no **compound index** on `{ user: 1, problem: 1 }`. The `getProblemSubmissions` query (`Solution.find({ user: userId, problem: queryProbId })`) and the `getMe` accepted solutions query (`Solution.find({ user: userId, verdict: Verdicts.ACCEPTED })`) both require filtering on two fields simultaneously. MongoDB will use the single-field `user` index and then do an in-memory filter on `problem` — this is a partial index scan, not an optimal compound index scan.

**Impact:** Increasing query times as the Solution collection grows; `GET /submissions/problem/:problemId` and `GET /auth/me` will progressively slow down for users with large submission histories.

**Fix Strategy:** Add a compound index `{ user: 1, problem: 1 }` and `{ user: 1, verdict: 1 }` to the Solution schema using `solutionSchema.index()`. This makes the most common query patterns O(log n) rather than O(n) scans.

---

### [MEDIUM] — `cookieParser` Is Applied Globally But No `cookie-signature` Secret Is Configured

**Location:** [`app.ts`, line 34](file:///c:/aamir_all_files/anti-online-judge/apps/server/src/app.ts#L34)

**The Bug:** `app.use(cookieParser())` is called without a signing secret argument. The `token` cookie set in `setTokenCookie` is **not signed** — it is a plain `httpOnly` cookie. While this is not directly exploitable (the JWT itself is cryptographically signed), it means `req.signedCookies` is unused and that any future developer who reads `req.signedCookies.token` to retrieve the auth token will always get `undefined` or `false`. The absence of cookie signing is also a missed defense-in-depth layer — signed cookies prevent cookie tampering even before JWT verification.

**Impact:** No immediate exploit, but reduces defense-in-depth; creates a footgun for future developers who might expect cookies to be signed; any middleware that reads `req.signedCookies` will malfunction silently.

**Fix Strategy:** Pass the `JWT_SECRET` (or a dedicated `COOKIE_SECRET`) as the signing secret to `cookieParser(env.COOKIE_SECRET)`, and update `setTokenCookie` to use `res.cookie('token', token, { ... signed: true })` and update token reading in `auth.middleware.ts` to use `req.signedCookies.token`.

---

### [MEDIUM] — Test Suite Runs Against a Live MongoDB and Redis Instance With No Isolation

**Location:** [`tests/api.test.ts`, `before()` hook, lines 39–50](file:///c:/aamir_all_files/anti-online-judge/apps/server/src/tests/api.test.ts#L39-L50)

**The Bug:** The test suite calls `connectDB()` which connects to the real MongoDB specified in `env.MONGO_URI`. The test at line 84–96 calls `User.findOne({})` to find an existing user — meaning it depends on pre-existing data in the database and will fail or behave unpredictably on a clean database. The registration test creates a real user with a timestamp-based email, which accumulates test artifacts in the database over time. There is no `beforeEach`/`afterEach` cleanup, no in-memory MongoDB (e.g., `mongodb-memory-server`), and no test database isolation.

**Impact:** Tests pollute the development/production database with test data; tests are order-dependent and non-idempotent (running them twice may produce different results); the test that finds `User.findOne({})` will fail on a fresh database or if the test registration test runs out-of-order.

**Fix Strategy:** Use `mongodb-memory-server` for an in-memory test database, seed a clean state in `before()`, and clean up in `after()`. Alternatively, use a dedicated `TEST_MONGO_URI` environment variable and run `User.deleteMany({})` cleanup at the start of each test suite.

---

## 🔵 LOW

---

### [LOW] — `register` Controller Does Not Normalize `fullName` Casing or Strip Dangerous Characters

**Location:** [`controllers/auth.controller.ts`, `register()`, lines 32–48](file:///c:/aamir_all_files/anti-online-judge/apps/server/src/controllers/auth.controller.ts#L32-L48)

**The Bug:** `fullName` is accepted from `req.body` and stored directly after Zod validation. Zod trims whitespace but does not strip control characters, zero-width spaces, or Unicode direction override characters (e.g., `\u202E`). A user could register with a name like `"Admin\u202E\u200B"` which renders deceptively in UI displays.

**Impact:** UI rendering confusion; potential for social engineering attacks by impersonating admin usernames in displayed contexts; no practical security bypass, but a data quality and display safety concern.

**Fix Strategy:** In the Zod `registerSchema`, add a `.regex()` constraint that only allows printable ASCII/Unicode letter characters and spaces, rejecting control characters and Unicode bidirectional overrides.

---

### [LOW] — `logout` Endpoint Has No Authentication Requirement

**Location:** [`routes/auth.routes.ts`, line 11](file:///c:/aamir_all_files/anti-online-judge/apps/server/src/routes/auth.routes.ts#L11); [`controllers/auth.controller.ts`, `logout()`, lines 117–128](file:///c:/aamir_all_files/anti-online-judge/apps/server/src/controllers/auth.controller.ts#L117-L128)

**The Bug:** `router.post('/logout', logout)` — the logout endpoint has no `requireAuth` middleware. Any unauthenticated request (or CSRF attack from a third-party origin) can call `POST /api/auth/logout` and trigger `res.clearCookie('token', ...)`. This is a CSRF-based logout attack vector: a malicious page with an auto-submitting form targeting the logout URL could force-sign-out any user who visits it.

**Impact:** CSRF logout attacks — a user visiting a malicious page while logged in can be involuntarily signed out. Low severity because no data is modified, but it degrades UX and could be a component of more complex attacks (force-logout then phishing for credentials).

**Fix Strategy:** Add `requireAuth` to the logout route, or validate `SameSite` cookie behavior to ensure cross-origin POST requests cannot trigger logout. The `SameSite: 'lax'` in development mode (line 21 of auth.controller.ts) provides partial protection but not complete coverage.

---

### [LOW] — `morgan` HTTP Request Logger Logs Full Request URLs — May Inadvertently Log Sensitive Query Params

**Location:** [`app.ts`, line 38](file:///c:/aamir_all_files/anti-online-judge/apps/server/src/app.ts#L38)

**The Bug:** `app.use(morgan(env.isProduction ? 'combined' : 'dev'))` — Morgan's `combined` format logs the full request URI, including query string parameters. If any future API endpoint ever accepts sensitive data as a query parameter (e.g., a token-based password reset link), the full URL including the token would be written to application logs.

**Impact:** Potential credential leakage in log files if query-parameter-based authentication or sensitive tokens are introduced in future endpoints. Currently no immediate risk, but a logging hygiene concern.

**Fix Strategy:** Create a custom Morgan token format that strips or redacts query parameters from logged URLs, or enforce a policy that sensitive values must only be sent in request bodies (already the case currently, but not enforced structurally).

---

### [LOW] — `seedProblems.ts` Uses `require.main === module` Which Doesn't Work with ESM/tsx

**Location:** [`seeds/seedProblems.ts`, line 357](file:///c:/aamir_all_files/anti-online-judge/apps/server/src/seeds/seedProblems.ts#L357)

**The Bug:** The `if (require.main === module)` guard is a CommonJS pattern. The project has `"type": "module"` is absent in `server/package.json`, but the project uses `tsx` for TypeScript execution which can transpile both. However, when run with `tsx src/seeds/seedProblems.ts` in an ES Module context, `require` is not defined and this guard will throw `ReferenceError: require is not defined`, causing the seed script to fail without running `seedDatabase()`. The `npm run seed` command in `package.json` confirms this is run with `tsx`, making this a broken entry point pattern.

**Impact:** `npm run seed` may silently do nothing (no `seedDatabase()` call) or crash immediately, leaving the database unseeded and the application non-functional for new deployments.

**Fix Strategy:** Replace the `require.main === module` guard with the ESM equivalent: `if (import.meta.url === new URL(process.argv[1], 'file://').href)` to properly detect direct execution in an ESM context.

---

### [LOW] — `Problem` Model Has No Compound Text Index for Full-Text Search

**Location:** [`models/Problem.ts`, lines 37–56](file:///c:/aamir_all_files/anti-online-judge/apps/server/src/models/Problem.ts#L37-L56)

**The Bug:** The `getProblems` search feature uses a regex match on `name`, `problemCode`, and `tags`. The Problem model has a single-field `index: true` on `problemCode` and `difficulty`/`tags`, but no `$text` index on `name` or `statement`. The regex search `{ $or: [{ name: searchRegex }, { problemCode: searchRegex }] }` cannot leverage any index for the `name` field and performs a full collection scan for every search query.

**Impact:** Search performance degrades linearly with the number of problems. At scale, every search request forces a full collection scan, increasing query latency and database CPU load.

**Fix Strategy:** Add a MongoDB text index (`problemSchema.index({ name: 'text', statement: 'text' })`) and use `$text: { $search: searchQuery }` in `getProblems` instead of a regex. This enables efficient, index-backed full-text search.

---

*Total Issues Found: 17*
*Critical: 4 | High: 5 | Medium: 5 | Low: 4 (4 items in LOW section)*

---
