# Frontend QA & Security Audit Report
## Scope: `apps/client/src`
**Auditor Role:** Principal Frontend QA Engineer & Security Auditor
**Date:** 2026-08-31
**Files Inspected:** `main.tsx`, `App.tsx`, `api/client.ts`, `context/AuthContext.tsx`, `components/AuthModal.tsx`, `components/Navbar.tsx`, `components/VerdictBadge.tsx`, `components/ViewCodeModal.tsx`, `pages/HomePage.tsx`, `pages/ProblemDetailPage.tsx`, `pages/ProfilePage.tsx`, `pages/NotFoundPage.tsx`, `vite.config.ts`, `package.json`

---

## 🔴 CRITICAL

---

### [CRITICAL] — Fake "Run Samples" is Functionally Deceptive and Structurally Broken

**Location:** [`ProblemDetailPage.tsx` — `handleRunSampleCases()`, lines 143–160](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/pages/ProblemDetailPage.tsx#L143-L160)

**The Bug:** The "Run Samples" feature does not actually execute the user's code. It takes `problem.sampleCases`, maps them to result objects, and hardcodes `actual: sc.output` and `passed: true` for every case — unconditionally. The rendered Sample Runner panel then shows hardcoded "Passed" badges with the *expected* output in the "Output:" field, not actual program output. The user's editor code (`editorCode`) is never read or sent to any endpoint. This is a fundamentally misleading simulation.

**Impact:** Users receive false feedback — their code always appears to pass all sample cases even when it is completely wrong. This destroys the core trust loop of an online judge. A user can submit broken code, see all samples "pass" in the runner, be confused when they get Wrong Answer on final submission, and lose confidence in the platform.

**Fix Strategy:** Connect this button to a real backend endpoint (e.g., `POST /submissions/run`) that accepts the code, language, and sample inputs and returns actual stdout/stderr. Alternatively, clearly label the button as "View Sample Cases" if no live run is intended.

---

### [CRITICAL] — Polling Interval Leaks on Rapid Re-Submission (Race Condition / Memory Leak)

**Location:** [`ProblemDetailPage.tsx` — `startPollingSubmission()`, lines 196–229](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/pages/ProblemDetailPage.tsx#L196-L229)

**The Bug:** `startPollingSubmission` is a regular function (not a hook), called from inside `handleSubmitCode`. It captures `pollIntervalRef.current` and clears the old interval before setting a new one — that part is fine. However, `loadPastSubmissions` is called from inside the interval callback at line 220. `loadPastSubmissions` itself is defined as an `async` function that closes over `problem` and `user` at the time the component renders. Because the interval callback is a stale closure, if `problem` or `user` changes between submission and resolution, `loadPastSubmissions` could silently no-op (`if (!problem || !user) return`) even though both exist. More critically, if the component unmounts (e.g., user navigates away) **during** an active poll, the cleanup `useEffect` at line 232 clears the interval — but the final async tick that already fired before the clear can still complete its `setState` calls (`setActiveSubmission`, `setSubmitting`) on an unmounted component, causing the "Can't perform a React state update on an unmounted component" warning (or, in React 18+ Strict Mode, silent double-invoke side effects).

**Impact:** Potential stale state updates after unmount; in edge cases, the `submitting` spinner may freeze on `true` if the component unmounts mid-poll and then the user navigates back to a new instance of the page.

**Fix Strategy:** Use an `AbortController` pattern or an `isMounted` ref inside the polling closure, and gate all `setState` calls behind a mounted check. Move `loadPastSubmissions` inside the polling closure or pass it as a stable callback ref.

---

### [CRITICAL] — Missing Global Error Boundary — Any Runtime Exception Crashes the Entire App

**Location:** [`main.tsx`, line 6–9](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/main.tsx#L6-L9) / [`App.tsx`](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/App.tsx)

**The Bug:** There is no React Error Boundary anywhere in the component tree. `main.tsx` renders `<App>` directly. If any child throws during render (e.g., a null-access on an API response, a Monaco editor crash, or any uncaught exception), React will unmount the entire tree and display a blank white screen with no message. This is especially dangerous given that `ProblemDetailPage` accesses deeply nested fields from API responses typed as `any[]` (e.g., `sub.code`, `sub.executionTime`) without null guards.

**Impact:** Any single runtime render error leaves the user with a blank page with zero recovery path. In production, this is a complete application outage for that user session.

**Fix Strategy:** Create a class-based `ErrorBoundary` component and wrap `<App>` (or at minimum each `<Route>` element) with it, providing a meaningful fallback UI with a "Reload" CTA.

---

## 🟠 HIGH

---

### [HIGH] — `useEffect` Missing Dependency: `loadPastSubmissions` is an Unstable Reference

**Location:** [`ProblemDetailPage.tsx`, `useEffect` at line 115–119](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/pages/ProblemDetailPage.tsx#L115-L119)

**The Bug:** The `useEffect` that triggers `loadPastSubmissions()` lists `[leftTab, user, problem]` as dependencies. However, `loadPastSubmissions` itself is a plain `async` function defined in the component body (lines 100–113) — it is a new function reference every render. If it were listed in the dep array, it would cause an infinite loop. But by not listing it, the effect is actually correct *only by accident*: it runs `loadPastSubmissions` via a captured stale closure. If `loadPastSubmissions` ever reads state or props that change independently (e.g., a future refactor adds a filter), the stale closure will silently use old values. ESLint's `react-hooks/exhaustive-deps` rule would flag this.

**Impact:** Subtle stale-closure data bugs after future refactors; currently `loadPastSubmissions` will also be called inside the polling interval after a fresh submit but referencing a potentially different `problem` object.

**Fix Strategy:** Wrap `loadPastSubmissions` in a `useCallback` with its own dependency array (`[problem, user]`), then safely add it to the `useEffect` deps list, breaking the stale closure chain.

---

### [HIGH] — Auth State Form Fields Not Reset When Modal Mode Switches

**Location:** [`AuthModal.tsx`, `openAuthModal` toggle buttons, lines 167–189](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/components/AuthModal.tsx#L167-L189)

**The Bug:** When the user switches from Login to Register (or vice versa) by clicking "Create one" / "Sign In" toggle buttons, `setError(null)` is called and `openAuthModal(mode)` fires. However, the `email`, `password`, and `fullName` state values are **never cleared**. If a user typed an email/password in Login mode, switched to Register, and submits — those stale field values are sent to the register endpoint. More insidiously, the `password` field retains its value visually (because it's `type="password"`, the hidden dots make it non-obvious), misleading users into thinking they have a fresh form.

**Impact:** Users may inadvertently submit credentials from a previous form attempt to the wrong endpoint, causing confusing error messages or unexpected behavior. Minor security risk: password value stays in memory state longer than necessary.

**Fix Strategy:** In the toggle click handlers, also call `setEmail('')`, `setPassword('')`, and `setFullName('')` to fully reset the form state when switching modes.

---

### [HIGH] — Navbar Dropdown Has No Outside-Click Handler — Can Only Close by Hover-Leave

**Location:** [`Navbar.tsx`, `dropdownOpen` state, lines 191–276](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/components/Navbar.tsx#L191-L277)

**The Bug:** The user dropdown menu closes only via `onMouseLeave` on the dropdown container (line 209). There is no click-outside handler (`document.addEventListener('mousedown', ...)` or a portal with a backdrop). On a touch device, `onMouseLeave` never fires. On desktop, if the user's mouse exits from the bottom of the dropdown directly onto page content without passing through the trigger button, `dropdownOpen` may stay `true`. Additionally, pressing `Escape` does nothing.

**Impact:** On mobile/tablet the dropdown becomes permanently open after one tap. On desktop, edge-case hover paths can leave a zombie dropdown floating over the page, blocking clicks.

**Fix Strategy:** Add a `useEffect` that attaches a `mousedown` event listener to `document` and sets `setDropdownOpen(false)` when a click is detected outside the dropdown's ref. Also add keyboard `keydown` listener to close on `Escape`.

---

### [HIGH] — `handleCopyInput` and `handleCopy` in `ViewCodeModal` Have No Error Handling on `navigator.clipboard`

**Location:** [`ProblemDetailPage.tsx` — `handleCopyInput()`, line 136–140](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/pages/ProblemDetailPage.tsx#L136-L140); [`ViewCodeModal.tsx` — `handleCopy()`, lines 26–30](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/components/ViewCodeModal.tsx#L26-L30)

**The Bug:** Both functions call `await navigator.clipboard.writeText(...)` without a `try/catch`. The Clipboard API requires the page to be served over HTTPS **and** requires the browser's Clipboard permission. In HTTP contexts (dev server without TLS) or browsers that deny the permission, this call will throw a `DOMException: NotAllowedError`. The thrown exception is unhandled, propagating as an unhandled promise rejection.

**Impact:** The copy button silently fails in non-HTTPS contexts or permission-denied environments. In React, unhandled promise rejections do not cause re-renders, so the UI shows no error — the user simply sees no feedback and doesn't know the copy failed.

**Fix Strategy:** Wrap `navigator.clipboard.writeText` in a `try/catch` block; on failure, fall back to the legacy `document.execCommand('copy')` approach or show an error toast/tooltip.

---

### [HIGH] — `ProfilePage` `useEffect` Redirects But Has Missing Dependencies (ESLint Exhaustive-Deps Violation)

**Location:** [`ProfilePage.tsx`, `useEffect` lines 42–46](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/pages/ProfilePage.tsx#L42-L46)

**The Bug:** The `useEffect` that calls `openAuthModal('login')` when `!user` lists `[authLoading, user]` as dependencies but omits `openAuthModal`. `openAuthModal` is a function reference from `useAuth()` — if `AuthContext` ever recreates this function on re-render (which it currently does because it's not `useCallback`-wrapped), the dep array is incomplete. More importantly, this effect opens the modal imperatively as a side effect of navigation, which is an anti-pattern. If `authLoading` flips from `true` → `false` and `user` is null while the component is unmounting (route change mid-load), this triggers state updates on an unmounting context.

**Impact:** Potential stale closure on `openAuthModal`; in SSR or Strict Mode double-invocation, the modal could be triggered twice. The redirect logic also has a race: if auth resolves after a slow network, the modal fires even if the user is navigating away.

**Fix Strategy:** Use `useCallback` on `openAuthModal` in `AuthContext` so it's a stable reference. Consider replacing the modal-trigger side effect with `useNavigate` redirect logic or a route guard HOC to handle unauthenticated access declaratively.

---

### [HIGH] — `ProblemDetailPage` `useEffect` for Problem Load Stale `language` Dependency

**Location:** [`ProblemDetailPage.tsx`, `loadProblem` effect, lines 78–97](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/pages/ProblemDetailPage.tsx#L78-L97)

**The Bug:** Inside `loadProblem`, at line 87, `LANGUAGE_CONFIGS[language].starterCode` is called — reading the `language` state variable. However, `language` is **not** in the `useEffect` dependency array (only `[problemCodeParam]` is). This means the effect captures a stale `language` value from initial render. If the user somehow triggers a route-level re-mount with a different initial language, or if this effect runs before `language` stabilizes, `setEditorCode` will set the wrong starter code. The `handleLanguageChange` function (line 122–126) correctly calls `setEditorCode(LANGUAGE_CONFIGS[newLang].starterCode)`, making this bug currently dormant but a trap for future changes.

**Impact:** Wrong starter template set on initial load in edge cases; stale closure on `language` read inside the effect.

**Fix Strategy:** Remove the `setEditorCode` call from inside the `loadProblem` effect entirely (starter code initialization should be in the initial state or in `handleLanguageChange`), keeping the effect's logic pure to fetching problem data only.

---

## 🟡 MEDIUM

---

### [MEDIUM] — `any[]` Type for `pastSubmissions` Defeats TypeScript Guarantees

**Location:** [`ProblemDetailPage.tsx`, line 67](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/pages/ProblemDetailPage.tsx#L67)

**The Bug:** `const [pastSubmissions, setPastSubmissions] = useState<any[]>([])` uses the `any` escape hatch. Downstream, fields like `sub._id`, `sub.verdict`, `sub.language`, `sub.code`, `sub.submittedAt`, `sub.executionTime`, `sub.memoryUsed` are accessed without type safety. If the API response shape changes, TypeScript will not catch the mismatch at compile time.

**Impact:** Any API contract change silently propagates to runtime crashes. The `ISubmissionHistoryItem` type already exists in `@anti-oj/shared` and is used correctly in `ProfilePage.tsx` (line 26) — this is an oversight, not a missing type.

**Fix Strategy:** Change the type to `useState<ISubmissionHistoryItem[]>([])` to match what is already used in `ProfilePage` — the shared type already models all accessed fields.

---

### [MEDIUM] — `VerdictBadge` Uses Tailwind-Style Class Names That Don't Exist in the CSS System

**Location:** [`VerdictBadge.tsx`, lines 29, 35, 41, 47, 53, 59, 65, 71](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/components/VerdictBadge.tsx#L29-L71)

**The Bug:** All icon elements inside `getBadgeConfig()` use Tailwind-style utility classes directly in JSX: `className="w-4 h-4 text-emerald-400"`, `text-rose-400`, `text-amber-400`, `animate-spin`, etc. This project does **not** use Tailwind CSS — the project uses vanilla CSS (`src/styles/index.css`). These class names will produce no styling. The icons will be unsized and uncolored, relying entirely on SVG defaults.

**Impact:** Verdict icons render at incorrect sizes and wrong colors in production, making the badge visually broken and inconsistent with the rest of the UI which uses CSS custom properties.

**Fix Strategy:** Replace all Tailwind utility class names on icon elements with inline `style` props using the project's CSS custom properties (e.g., `style={{ color: 'var(--verdict-ac)', width: 16, height: 16 }}`), consistent with every other component in the codebase.

---

### [MEDIUM] — `ViewCodeModal` Verdict Color Logic Uses Hardcoded String Comparison Instead of Enum

**Location:** [`ViewCodeModal.tsx`, line 61](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/components/ViewCodeModal.tsx#L61)

**The Bug:** `verdict === 'Accepted'` — uses a raw string literal for the comparison. The rest of the codebase uses `Verdicts.ACCEPTED` from `@anti-oj/shared`. If the enum value is ever changed (e.g., to `'AC'`), this comparison silently breaks and all non-Accepted verdicts will display in the "wrong" red color, including verdicts that should be neutral (e.g., Time Limit Exceeded).

**Impact:** Visual regression — all verdict colors in the View Code modal become incorrect when enum values change.

**Fix Strategy:** Import `Verdicts` from `@anti-oj/shared` and replace the string literal with `Verdicts.ACCEPTED`.

---

### [MEDIUM] — `ProfilePage` Verdict Filter Hardcodes String Literals That Don't Match Enum Values

**Location:** [`ProfilePage.tsx`, line 232](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/pages/ProfilePage.tsx#L232)

**The Bug:** The filter pills array is `['All', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Compilation Error']` — raw strings used to filter `sub.verdict`. The `filteredSubmissions` filter at line 89–92 does `sub.verdict === selectedVerdictFilter`. If the actual enum values stored in `verdict` differ from these display strings (e.g., `Verdicts.WRONG_ANSWER = 'WA'` vs the filter string `'Wrong Answer'`), the filter will always return zero results for those categories silently.

**Impact:** Verdict filters silently show empty tables for any verdict whose enum value doesn't exactly match the hardcoded string, with no error shown to the user.

**Fix Strategy:** Build the filter array from `Verdicts` enum constants (e.g., `Verdicts.ACCEPTED`, `Verdicts.WRONG_ANSWER`) and use those same constants in the `filter()` predicate. Provide display labels separately.

---

### [MEDIUM] — `AuthContext` `login()` and `register()` Double-Set User State (Redundant `refreshUser` Call)

**Location:** [`AuthContext.tsx`, `login()` lines 47–54; `register()` lines 56–63](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/context/AuthContext.tsx#L47-L63)

**The Bug:** After a successful login, `setUser(res.data.data.user)` is called (line 50), immediately followed by `await refreshUser()` (line 51), which makes a second API call (`GET /auth/me`) and then also calls `setUser` and `setStats` again. This means two sequential state updates occur: the first sets `user` from the login response, the second overwrites it from the `GET /auth/me` response. This causes two re-renders of the entire context tree and makes an unnecessary additional network request on every login/register.

**Impact:** Double re-render of all context consumers on login/register; unnecessary latency; if the second request fails but the first succeeded, `user` is reset to `null` in the catch block, logging the user out immediately after a successful login.

**Fix Strategy:** Remove the `setUser` call from `login()` and `register()`, and rely solely on `refreshUser()` to populate user state after authentication, or conversely, set user/stats from the login response directly and skip the second `refreshUser()` call.

---

### [MEDIUM] — `HomePage` `fetchProblems` Effect Fires on Every `user` State Change

**Location:** [`HomePage.tsx`, `useEffect` line 45–47](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/pages/HomePage.tsx#L45-L47)

**The Bug:** `useEffect(() => { fetchProblems(); }, [selectedDifficulty, selectedTag, searchQuery, user])` — `user` is in the dependency array. This means the problems list is re-fetched every time the `user` object identity changes (e.g., after login or after `refreshUser()` is called). The `user` object from `setUser(res.data.data.user)` will be a new object reference every time, even if semantically identical. Given that `login()` calls `setUser` then `refreshUser()` (setting it again), this triggers **two** problem-list refetches on a single login action.

**Impact:** Unnecessary duplicate API calls on auth events, adding latency; if the problems endpoint requires auth and returns different results for logged-in vs. guest users, the double-fetch race condition could result in the first (guest) response overwriting the second (authenticated) response's problem list.

**Fix Strategy:** Replace `user` in the dependency array with `user?._id` (a primitive string) so the effect only re-runs when the actual user identity changes, not on every object reference change.

---

### [MEDIUM] — Search Input Fires API Call on Every Keystroke Without Debouncing

**Location:** [`HomePage.tsx`, search input `onChange` line 177; `useEffect` line 45–47](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/pages/HomePage.tsx#L173-L182)

**The Bug:** `setSearchQuery(e.target.value)` is called on every keystroke. `searchQuery` is in the `useEffect` dependency array, so `fetchProblems()` fires an API request on every single character typed. A user typing "two pointers" (12 characters) generates 12 consecutive API requests, each potentially returning different results and causing rapid loading state flickers.

**Impact:** API hammering on every keystroke; loading spinner flickers on every character; potential rate-limiting by the backend; poor UX.

**Fix Strategy:** Implement debouncing — maintain a separate `debouncedSearchQuery` state using `useEffect` with a `setTimeout` delay (300–500ms), and use the debounced value in the fetch dependency array instead of the raw `searchQuery`.

---

### [MEDIUM] — No `aria-label` or Accessibility Attributes on Any Interactive Elements

**Location:** Multiple components — `Navbar.tsx` buttons (lines 145, 253, 280, 289), `AuthModal.tsx` form inputs (lines 90, 110, 129), `ProblemDetailPage.tsx` tab buttons, console drawer toggle

**The Bug:** No interactive buttons or inputs across the entire client have `aria-label`, `role`, or `aria-expanded` attributes. The user profile dropdown button has no `aria-haspopup="true"` or `aria-expanded={dropdownOpen}`. The console collapse toggle has no `aria-label="Toggle console"`. The form inputs have `<label>` elements but their `htmlFor` attributes are not set — they only use `style` blocks without connecting the `<label>` to the `<input>` via `id`. Labels for "Email" and "Password" in `AuthModal.tsx` (lines 105, 124) are not programmatically associated with their inputs.

**Impact:** Screen readers cannot interpret the UI; keyboard-only navigation is broken; form labels are not associated with inputs, so clicking "Email" does not focus the email field.

**Fix Strategy:** Add `htmlFor` on all `<label>` elements matching input `id`s; add `aria-label`, `aria-expanded`, `aria-haspopup` to all interactive controls; add `role="dialog"` and `aria-modal="true"` to modal containers.

---

### [MEDIUM] — `ProblemDetailPage` Has No Error State for Failed Problem Load

**Location:** [`ProblemDetailPage.tsx`, `loadProblem` catch block, line 89–92](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/pages/ProblemDetailPage.tsx#L89-L92)

**The Bug:** On `api.get()` failure (network error, 404, 500), the catch block only does `console.error(...)` and sets `setLoadingProblem(false)`. `problem` remains `null`. The component then renders the "Problem Not Found" fallback (line 249–257) — but this is misleading for network errors (a 5xx or timeout should say "Server error, try again", not "Problem Not Found"). There is also no retry button for transient failures.

**Impact:** A 500 or network timeout gives the user the same UI as a genuinely nonexistent problem code, providing no guidance for recovery.

**Fix Strategy:** Add a separate `errorMessage` state. Populate it with a relevant message in the catch block, and render a distinct error UI (with a retry button) separate from the 404-style "Problem Not Found" fallback.

---

## 🔵 LOW

---

### [LOW] — `window.confirm()` Used in `handleResetCode` — Blocks the Main Thread

**Location:** [`ProblemDetailPage.tsx`, `handleResetCode()`, line 130](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/pages/ProblemDetailPage.tsx#L130)

**The Bug:** `window.confirm('Reset editor to initial starter template?')` — the native browser dialog is synchronous and blocks the entire JavaScript event loop. It is also unstyled, inconsistent with the dark-mode design, and is disallowed inside iframes (would silently auto-close).

**Impact:** Jarring UX inconsistency; fails entirely if the page is ever embedded in a frame; freezes Monaco editor's WebWorker communication.

**Fix Strategy:** Replace with a small in-UI confirmation modal or inline confirmation state (e.g., a two-step button: first click shows "Are you sure? Reset / Cancel" in the button itself).

---

### [LOW] — Judge Status Badge is Always "Online" — Hardcoded Static UI

**Location:** [`Navbar.tsx`, lines 123–140](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/components/Navbar.tsx#L123-L140)

**The Bug:** The "Online" judge status badge with the pulsing green dot is completely static HTML with no backing data. There is no health check call, no websocket subscription, and no state variable. It always shows "Online" regardless of whether the judge worker or server is actually reachable.

**Impact:** The badge actively misleads users during outages, causing them to believe the judge is functional when submissions are failing, increasing support burden.

**Fix Strategy:** Add a lightweight `GET /health` poll on a slow interval (e.g., every 60s) and drive the badge from the response. Show "Degraded" or "Offline" states with appropriate colors when the check fails.

---

### [LOW] — `ProblemDetailPage` Sub-Header Uses `<h1>` Inside a Non-Page-Level Component

**Location:** [`ProblemDetailPage.tsx`, line 286](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/pages/ProblemDetailPage.tsx#L286)

**The Bug:** `<h1 style={{ ... }}>{problem.name}</h1>` is rendered inside the workspace sub-header, which is correct for this page's heading hierarchy. However, `ProfilePage.tsx` (line 128) also renders an `<h1>` for the user's name. Both are correct in isolation, but combined with `NotFoundPage`'s `<h1>404</h1>`, every page has an `<h1>`, which is good — but the `index.html` also already has an implied `<title>` tag. This is not a critical issue but worth noting for future SEO review when a proper `<title>` per-route system is added.

**Impact:** Minimal; correct current SEO for SPA. Low risk of heading hierarchy issues on future page composition changes.

**Fix Strategy:** Integrate a per-route `<title>` update (via `document.title` assignment in `useEffect` or a `react-helmet` equivalent) so crawlers and browser tabs show meaningful titles per page.

---

### [LOW] — `console.error` Used for User-Facing Errors Throughout

**Location:** [`HomePage.tsx` line 39](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/pages/HomePage.tsx#L39); [`ProblemDetailPage.tsx` lines 90, 109, 224](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/pages/ProblemDetailPage.tsx#L90); [`ProfilePage.tsx` line 58](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/pages/ProfilePage.tsx#L58)

**The Bug:** API fetch failures in `HomePage`, `ProblemDetailPage`, and `ProfilePage` catch blocks silently swallow errors with only `console.error`. No user-facing error UI is shown for failed `GET /problems`, failed `GET /submissions/user/:id`, or failed submission history load.

**Impact:** The user sees a blank or empty table with no explanation. They have no way to know if "No submissions" means they have none, or if the fetch failed.

**Fix Strategy:** Set a local `error` state string in each catch block and render a visible error banner/message in the UI, offering a retry action where appropriate.

---

### [LOW] — Submission Polling Max Wait is 30 Seconds With No User-Visible Timeout Message

**Location:** [`ProblemDetailPage.tsx`, `startPollingSubmission()`, lines 200–228](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/pages/ProblemDetailPage.tsx#L200-L228)

**The Bug:** After 30 poll attempts (30 seconds), the interval is cleared and `setSubmitting(false)` is called. However, `activeSubmission.verdict` will still be `Verdicts.PENDING` (the last polled value) — the verdict badge will permanently show "Running..." with a spinner, even though polling has silently stopped. There is no timeout message, no indication to the user that the evaluation timed out.

**Impact:** The user is left staring at a "Running..." badge indefinitely with no feedback that the judge has timed out on the client side.

**Fix Strategy:** On timeout, set a distinct "timed out" state or update `activeSubmission` with a synthetic `INTERNAL_ERROR` verdict and display an explanatory message such as "Evaluation is taking longer than expected. Please check your submission history."

---

### [LOW] — `AuthModal` Form State Not Reset on Successful Auth Close

**Location:** [`AuthContext.tsx`, `login()` line 52; `register()` line 61](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/context/AuthContext.tsx#L52); [`AuthModal.tsx`, `handleSubmit` lines 27–29](file:///c:/aamir_all_files/anti-online-judge/apps/client/src/components/AuthModal.tsx#L27-L29)

**The Bug:** On successful auth, `setIsAuthModalOpen(false)` is called from `AuthContext` before `AuthModal`'s own `handleSubmit` clears the fields at lines 27–29. Because `closeAuthModal` sets `isAuthModalOpen` to false, the component returns `null` early (line 14), and React unmounts the component *before* the `setFullName('')`, `setEmail('')`, `setPassword('')` state setters execute. Local state of an unmounted component is dropped by React, so the clearing code at lines 27–29 is dead code that never runs.

**Impact:** If the modal is reopened later, the fields would be empty anyway (because the component remounts), so this is a state management logic error that is currently harmless. However, if the component is ever converted to use `visibility: hidden` instead of conditional null-return, the stale credentials would be visible.

**Fix Strategy:** Clear the form fields *before* calling `login()`/`register()` completes or move the clearing logic into the modal's `onClose` callback to make the intent explicit.

---

*Total Issues Found: 16*
*Critical: 3 | High: 6 | Medium: 7 | Low: 6 (6 items merged into LOW section above)*

---
