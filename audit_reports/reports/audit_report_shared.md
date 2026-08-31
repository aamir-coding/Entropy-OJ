# Shared Package QA & Architecture Audit Report
## Scope: `packages/shared/src`
**Auditor Role:** Principal Software Architect & QA Auditor
**Date:** 2026-08-31
**Files Inspected:** `src/index.ts`, `src/constants/verdicts.ts`, `src/constants/languages.ts`, `src/constants/limits.ts`, `src/types/index.ts`, `src/utils/diffOutput.ts`, `src/utils/diffOutput.test.ts`, `src/validation/auth.schema.ts`, `src/validation/submission.schema.ts`, `src/validation/problem.schema.ts`, `package.json`, `tsconfig.json`, `dist/index.js`

---

## 🔴 CRITICAL

---

### [CRITICAL] — Broken ESM/CJS Export Map: `"import"` Condition Resolves to Raw TypeScript Source — Crashes Vite Client Build

**Location:** [`package.json`, lines 8–15](file:///c:/aamir_all_files/anti-online-judge/packages/shared/package.json#L8-L15)

**The Bug:** The `"exports"` map defines:
```
"import": "./src/index.ts"
```
When the Vite client (`apps/client`) resolves `@anti-oj/shared` via the ESM `import` condition, it receives `./src/index.ts` — a **raw TypeScript file**, not a compiled JS module. Vite does not transpile TypeScript files from linked workspace `node_modules` packages by default. The `"module"` field at line 6 also points to `./src/index.ts`. This means the client either fails at bundling time (`Cannot parse TypeScript in dependency`) or, if `optimizeDeps` or `ssr.noExternal` is configured permissively, silently receives type-only declarations stripped of runtime values. The server and worker, which use the `"require"` condition, correctly receive `./dist/index.js` and are unaffected.

**Impact:** The client build is broken or unreliable in production. Any `import { Verdicts } from '@anti-oj/shared'` in the client resolves to a `.ts` file that Vite cannot natively process as a dependency, causing bundler errors or missing runtime constants (`Verdicts` becomes `undefined`), breaking verdict display throughout the UI.

**Fix Strategy:** Change the `"import"` condition to `"./dist/index.js"` and add a separate `"types"` condition pointing to `"./dist/index.d.ts"`. Build the shared package to CommonJS (or add a dual ESM/CJS output) and ensure the `"module"` field is removed or also points to the compiled output, never to raw `.ts` source.

---

## 🟠 HIGH

---

### [HIGH] — Single Barrel `export *` Re-Export Destroys Tree-Shaking for the Client Bundle

**Location:** [`src/index.ts`, lines 1–8](file:///c:/aamir_all_files/anti-online-judge/packages/shared/src/index.ts#L1-L8)

**The Bug:** Every symbol from every module is re-exported via `export *` from a single `index.ts`. When the client imports `import { Verdicts } from '@anti-oj/shared'`, the bundler must load the entire shared package barrel — including `zod` validation schemas (`auth.schema.ts`, `submission.schema.ts`, `problem.schema.ts`) and the Zod library itself — even if the client never uses validation schemas at runtime. The Zod schemas are server-side concerns (used in Express middleware), not client concerns. The compiled CommonJS output (`dist/index.js`) uses `__exportStar` which is not statically analyzable by most bundlers, making tree-shaking impossible.

**Impact:** The client's JavaScript bundle includes the entire Zod library and all three validation schema modules unnecessarily, inflating bundle size. Zod v3 is approximately 14KB minified+gzipped. For a performance-sensitive SPA, this is a direct Core Web Vitals regression with no benefit.

**Fix Strategy:** Split the package into domain-scoped sub-exports using `"exports"` sub-path conditions (e.g., `@anti-oj/shared/types`, `@anti-oj/shared/constants`, `@anti-oj/shared/validation`) so consumers can import only what they need. Move Zod schemas to a server-only sub-path export that is never included in client-facing imports.

---

### [HIGH] — `diffOutput` Utility Is Exported in the Shared Package but Contains Pure Runtime Logic Intended Only for the Worker

**Location:** [`src/index.ts`, line 5](file:///c:/aamir_all_files/anti-online-judge/packages/shared/src/index.ts#L5); [`src/utils/diffOutput.ts`](file:///c:/aamir_all_files/anti-online-judge/packages/shared/src/utils/diffOutput.ts)

**The Bug:** `diffOutput` and `normalizeOutput` are judge evaluation utilities — they exist solely to compare program output against expected test case output inside the worker's `evaluator.ts`. They have no use case in the server or client. By living in `packages/shared` and being exported from the root barrel, they are bundled into every consumer. More critically, if the client ever calls `diffOutput` (which it could, since it's exported), it runs string comparison logic that belongs to the secure judge evaluation layer in untrusted client code — mixing judge logic with UI logic and making future refactors of the comparison algorithm harder to reason about.

**Impact:** Bundle bloat in all consumers; architectural boundary violation (judge logic bleeds into the shared contract layer); any change to the comparison algorithm must be made cautiously knowing it is imported by the client, server, and worker simultaneously.

**Fix Strategy:** Move `diffOutput.ts` and its test into `apps/worker/src/sandbox/` where it is only consumed. The shared package should contain only contracts (types, constants, validation schemas) — not implementation logic.

---

### [HIGH] — `LanguageConfig` Interface Couples Server/Worker Concerns (`compileBudgetMs`) to Client-Only Concerns (`monacoLanguage`, `starterCode`)

**Location:** [`src/constants/languages.ts`, lines 10–18](file:///c:/aamir_all_files/anti-online-judge/packages/shared/src/constants/languages.ts#L10-L18); `LANGUAGE_CONFIGS` constant, lines 20–64

**The Bug:** `LanguageConfig` is a single interface that bundles both client-UI concerns (`monacoLanguage`, `starterCode`) and backend execution concerns (`compileBudgetMs`, `extension`). `LANGUAGE_CONFIGS` contains multi-line template literal `starterCode` strings (for the Monaco editor) that are shipped to the worker and server via the shared barrel import. The worker has zero use for Monaco language IDs or starter code templates. The server never reads `starterCode` either. These strings inflate the CJS bundle loaded by the worker process at startup.

**Impact:** Every time a language's starter code template is edited (a UI concern), it triggers a rebuild of the shared package and a redeployment of the worker — an unnecessary coupling between the UI team's work and the judge infrastructure. Monorepo change blast radius is unnecessarily wide.

**Fix Strategy:** Split `LanguageConfig` into two interfaces: `LanguageExecutionConfig` (containing `id`, `extension`, `compileBudgetMs`) for backend use, and `LanguageUIConfig` (containing `monacoLanguage`, `starterCode`) for client use. Move the `LanguageUIConfig` and `starterCode` constants into `apps/client/src/` where they exclusively belong.

---

### [HIGH] — `ISubmissionResponse` Duplicates `ISolution` With Two `verdict` Fields, Creating a Contradictory Type

**Location:** [`src/types/index.ts`, lines 71–86](file:///c:/aamir_all_files/anti-online-judge/packages/shared/src/types/index.ts#L71-L86)

**The Bug:** `ISubmissionResponse` has two properties: `status: Verdict` (line 73) and `verdict: Verdict` (line 78) — both of type `Verdict`. This is a redundant, contradictory design: `status` and `verdict` carry identical semantic meaning (the current evaluation status of a submission). The server's `createSubmission` controller populates both fields with `Verdicts.PENDING` because the interface forces it. Any consumer that reads `submission.status` versus `submission.verdict` may get different cached values if only one is updated (e.g., the worker updates the `verdict` field in MongoDB, but a cached API response still has the old `status`). Additionally, `ISolution` (lines 55–69) and `ISubmissionResponse` share nearly all the same optional fields with no inheritance relationship, creating a type maintenance surface that will drift over time.

**Impact:** API consumers (the client) must decide which field is authoritative. The current client code reads `submission.verdict`, but the shape contract exposes `status` too, inviting future bugs where the wrong field is read. Type duplication means future field additions must be made in two places, with omissions causing subtle type-safety regressions.

**Fix Strategy:** Remove the `status` field from `ISubmissionResponse` entirely — `verdict` is the canonical field name used throughout the system. Refactor `ISubmissionResponse` to extend `ISolution` (or use a `Pick<ISolution, ...>` utility type) so the two types share a single definition that cannot drift apart.

---

## 🟡 MEDIUM

---

### [MEDIUM] — `QueueConfig` (Backend Infrastructure Constant) Is Co-Located With `ExecutionLimits` (Judge Constants) in `limits.ts`

**Location:** [`src/constants/limits.ts`, lines 11–15](file:///c:/aamir_all_files/anti-online-judge/packages/shared/src/constants/limits.ts#L11-L15)

**The Bug:** `QueueConfig` (containing `SUBMISSION_QUEUE_NAME`, `DEFAULT_JOB_ATTEMPTS`, `BACKOFF_DELAY_MS`) is a BullMQ/Redis infrastructure constant. It has no meaning to the client and no direct use in the server beyond the queue setup. `ExecutionLimits` is a code-execution constraint relevant to the worker and the `createSubmissionSchema` validator. Mixing infrastructure config (BullMQ queue names) with execution limits (time/memory/code-size bounds) in a single file violates the Single Responsibility Principle. The `SUBMISSION_QUEUE_NAME` string being shared is particularly fragile — if the worker and server ever import from different versions of the built shared package, a queue name mismatch would silently disconnect producer from consumer.

**Impact:** Cognitive overhead when onboarding developers; if `SUBMISSION_QUEUE_NAME` ever needs environment-based overriding (e.g., `submission-queue-staging` vs `submission-queue-prod`), the constant being hardcoded in a shared package makes this impossible without a rebuild.

**Fix Strategy:** Split `limits.ts` into `executionLimits.ts` (for judge constraints) and `queueConfig.ts` (for BullMQ configuration). Evaluate whether `QueueConfig` should live in the shared package at all, or whether the queue name should be an environment variable read by both the server and worker independently.

---

### [MEDIUM] — `ProblemDifficulty` Type Is Defined as a Raw String Literal Union — Not Derived From a Canonical Constant Object

**Location:** [`src/types/index.ts`, line 11](file:///c:/aamir_all_files/anti-online-judge/packages/shared/src/types/index.ts#L11)

**The Bug:** `export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard'` is a plain string literal union. The server's `Problem` Mongoose schema defines `enum: ['Easy', 'Medium', 'Hard']` (in `apps/server/src/models/Problem.ts`) as a separate, independent string array. The Zod `problemFilterSchema` defines `z.enum(['Easy', 'Medium', 'Hard'])` as yet another independent declaration. There is no single canonical source of truth; these three definitions can drift apart silently. If a new difficulty level (e.g., `'Expert'`) is added to one, it will not be automatically enforced in the others.

**Impact:** Adding a new difficulty requires changes in at minimum three places across two packages. A missed update causes a category mismatch where a problem is stored with an unrecognized difficulty that passes Zod validation but fails Mongoose validation (or vice versa), producing inconsistent behavior with cryptic errors.

**Fix Strategy:** Introduce a `PROBLEM_DIFFICULTIES` constant object (`as const`) analogous to `Verdicts`, derive `ProblemDifficulty` as `(typeof PROBLEM_DIFFICULTIES)[keyof typeof PROBLEM_DIFFICULTIES]`, and have both the Zod schema and the Mongoose enum reference `Object.values(PROBLEM_DIFFICULTIES)` — creating a single canonical source from which all three consumers derive.

---

### [MEDIUM] — `tsconfig.json` Compiles to CommonJS (`"module": "CommonJS"`) While `package.json` Advertises ESM via `"module"` Field

**Location:** [`tsconfig.json`, line 4](file:///c:/aamir_all_files/anti-online-judge/packages/shared/tsconfig.json#L4); [`package.json`, line 6](file:///c:/aamir_all_files/anti-online-judge/packages/shared/package.json#L6)

**The Bug:** `tsconfig.json` sets `"module": "CommonJS"`, meaning `tsc` outputs CJS (`require`/`module.exports`) into `dist/`. The `package.json` `"module"` field — which bundlers like Vite/Rollup/webpack use as the ESM entrypoint — points to `./src/index.ts`. There is no ESM (`"module": "ESNext"`) build output. The `"exports"."import"` condition (Critical #1) attempts to serve ESM but has no compiled ESM artifact to point to. This means there is a fundamental mismatch: the package is CJS-only at the compiled level, but advertises ESM entry points that either don't exist (compiled) or are raw TypeScript.

**Impact:** Bundlers that follow the `"exports"` map strictly will encounter unexpected module format mismatches. The `"require"` consumers (server, worker via tsx/Node) work correctly, but the `"import"` consumer (Vite client) receives invalid artifacts — reinforcing and explaining the Critical #1 breakage at its root cause.

**Fix Strategy:** Add a second `tsconfig.esm.json` that targets `"module": "ESNext"` and `"outDir": "./dist/esm"`, and update the `package.json` `"exports"` `"import"` condition to point to `./dist/esm/index.js`. Update the build script to run both compilations. This creates a proper dual-module package.

---

### [MEDIUM] — `normalizeOutput` Has No Guard Against Pathologically Large Input Strings

**Location:** [`src/utils/diffOutput.ts`, `normalizeOutput()`, lines 8–18](file:///c:/aamir_all_files/anti-online-judge/packages/shared/src/utils/diffOutput.ts#L8-L18)

**The Bug:** `normalizeOutput` accepts an arbitrary `string` with no length guard. The worker calls this with `runRes.actualOutput` read from `output.txt`. As established in the worker audit, `output.txt` has no size cap, meaning a flooding submission can produce a multi-hundred-megabyte string. `str.replace(/\r\n/g, '\n').split('\n').map(...).join('\n')` on a 100MB string causes massive in-process heap allocations in Node.js. Each regex and split/join on a 100MB string allocates multiple intermediate copies, potentially allocating 500MB+ of V8 heap in a single call.

**Impact:** A single submission that floods `output.txt` with huge output can cause the worker process to OOM and crash (even if the host disk issue from the worker audit is fixed), since the string processing itself is a memory amplifier independent of disk usage.

**Fix Strategy:** Add an early-exit guard at the top of `normalizeOutput`: if `str.length` exceeds a defined constant (e.g., `MAX_OUTPUT_SIZE_BYTES = 65536`), truncate to that length and append a sentinel marker (e.g., `\n<OUTPUT TRUNCATED>`) before proceeding with normalization.

---

## 🔵 LOW

---

### [LOW] — `ALL_VERDICTS` Is a Mutable Array That Can Be Mutated at Runtime

**Location:** [`src/constants/verdicts.ts`, line 25](file:///c:/aamir_all_files/anti-online-judge/packages/shared/src/constants/verdicts.ts#L25)

**The Bug:** `export const ALL_VERDICTS: Verdict[] = Object.values(Verdicts)` — while the `Verdicts` object itself is `as const` and immutable, `ALL_VERDICTS` is typed as `Verdict[]` (a plain mutable array). Any consumer can call `ALL_VERDICTS.push('Hacked')` or `ALL_VERDICTS.sort()` and mutate the array in-process, affecting all other code that references `ALL_VERDICTS` in the same runtime (since module exports are cached singletons in Node.js CommonJS). The Mongoose Solution model uses `enum: ALL_VERDICTS` — if the array is mutated before model initialization, the database enum constraint is corrupted.

**Impact:** Defensive-programming risk. While unlikely in the current codebase, a future developer who mutates `ALL_VERDICTS` for sorting or filtering purposes silently corrupts Mongoose enum validation for the entire process lifetime without any TypeScript error.

**Fix Strategy:** Type `ALL_VERDICTS` as `readonly Verdict[]` (i.e., `Object.values(Verdicts) as readonly Verdict[]`) to prevent mutation at the TypeScript type level. Optionally use `Object.freeze(Object.values(Verdicts))` for runtime protection.

---

### [LOW] — `registerSchema` Does Not Validate Password Strength Beyond a 6-Character Minimum

**Location:** [`src/validation/auth.schema.ts`, lines 15–18](file:///c:/aamir_all_files/anti-online-judge/packages/shared/src/validation/auth.schema.ts#L15-L18)

**The Bug:** Password validation only enforces `min(6)` and `max(100)`. The password `'aaaaaa'` (6 identical characters) passes validation and is accepted. There is no requirement for mixed case, digits, or special characters. For a competitive programming platform where users' submission history and solved problems are valuable to them, a weak password policy is a security gap.

**Impact:** Users can register with trivially guessable passwords, increasing account takeover risk via credential stuffing attacks. The 6-character minimum provides minimal protection against modern brute-force tooling.

**Fix Strategy:** Add a Zod `.regex()` constraint requiring at least one letter and one digit (e.g., `/(?=.*[a-zA-Z])(?=.*\d)/`), and raise the minimum length to 8 characters, consistent with modern NIST password guidelines. Update the client's AuthModal validation feedback to match.

---

### [LOW] — `diffOutput` Test Suite Has No Test for Empty String vs Empty String Edge Case

**Location:** [`src/utils/diffOutput.test.ts`](file:///c:/aamir_all_files/anti-online-judge/packages/shared/src/utils/diffOutput.test.ts)

**The Bug:** The test suite covers CRLF normalization, trailing whitespace, trailing newlines, internal whitespace preservation, and line-by-line mismatch identification — but not the `actual = ''` vs `expected = ''` case (both empty), nor `actual = ''` vs `expected = 'something'`. In `normalizeOutput`, `if (!str) return ''` handles falsy values, but an empty string is already falsy in JS — however a string of only whitespace (`'   '`) is truthy and would be normalized to `''`. The test does not verify that `diffOutput('   ', '')` returns `isMatch: true` (it should, by the normalization rules).

**Impact:** An untested edge case: a submission that produces only whitespace output compared against a truly empty expected output would incorrectly return `isMatch: false` if `normalizeOutput('   ')` produces `''` but the comparison skips the early-exit equality check. Verifying this deterministically requires a test that currently does not exist.

**Fix Strategy:** Add test cases for: `diffOutput('', '')`, `diffOutput('   ', '')`, and `diffOutput('', 'expected')` to verify correct behavior at the empty-output boundary, which is a common edge case in judge output comparison (e.g., problems that require printing nothing for certain inputs).

---

*Total Issues Found: 12*
*Critical: 1 | High: 4 | Medium: 4 | Low: 3*

---
