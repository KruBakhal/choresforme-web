# T5 — QA report (Auth)

Reviewer: qa-reviewer, round 1. Scope: the uncommitted T5 working tree on `mvp-build` (T1–T4 committed).

How it was checked: lint, typecheck and build; a read of every changed and new file; a scan for the hard rules and style rules; curl of every T5 route on `next start -p 3100`; then every journey run in a real browser (built-in browser pane) against the production build at 1280, 1024, 768 and 375 px. Cleanup done: `cfm-*` localStorage keys cleared, viewport reset to desktop, server process tree killed with `taskkill /T /F`, ports 3100 and 3000 free.

```
QA report — T5 Auth

Code health: lint pass · typecheck pass · build pass

Flow
- [PASS] Routes: /login, /signup, /signup?role=customer, /signup?role=worker, /signup?role=admin, /forgot-password, /dashboard, /worker/dashboard all return 200; auth pages are noindex, have their own titles and are not in sitemap.xml; marketing links to /login, /signup and /signup?role=worker resolve
- [PASS] Hard rules: no API routes or server actions, no new packages (package.json unchanged), no seed imports outside src/lib/mock, mock-layer changes limited to the approved verifiedMobiles / ROLE_MISMATCH / ROLE_REQUIRED; no external script or iframe loads when the social dialog opens
- [PASS] Hard load of /login, /signup?role=customer and /forgot-password: the page becomes interactive (submit shows validation, Google opens the dialog)
- [PASS] Login form: empty submit shows "Enter a valid email address" / "Enter your password" with aria-describedby and aria-invalid, and focus goes to Email; password show/hide toggle (48 px) keeps the value
- [PASS] "No account found": FormAlert above the form takes focus, with a Sign up link that keeps next; email and password are kept; email is not marked invalid
- [PASS] Demo accounts panel: lists the 3 DEMO_ACCOUNTS and shows "Any password" and 123456; one click fills and submits; the clicked row shows "Logging in…" and the other rows and the form are disabled
- [PASS] Guard: signed out, /worker/dashboard → /login?next=%2Fworker%2Fdashboard; the demo worker login lands back on /worker/dashboard; Sign up and Forgot password links keep next
- [PASS] Hard reload of /dashboard while signed in stays on the page (shell skeleton, then content, no redirect)
- [PASS] Separate accounts notice: a customer on /worker/dashboard or /signup?role=worker, and a worker on /dashboard, see the notice (h1 focused, no Footer, per the plan); "Log out and create a customer account" logs out and opens /signup?role=customer; "Go to my dashboard" goes to the user's own dashboard
- [PASS] Signed-in user on /login?next=/faq → /faq; on a same-role /signup?role=customer → /dashboard (decision 7)
- [PASS] Customer email sign-up: all 7 field errors show at once with aria-describedby (hint + error); Send code → OTP panel with box 1 focused; 5 digits + Enter → "Enter the 6-digit code"; wrong code → "That code didn't work. Try again", digits kept, box 1 selected; paste "12 34-56" fills all six boxes; Backspace on an empty box moves back; 123456 → "Mobile number verified", focus moves to Date of birth; Enter in the mobile field or in the OTP boxes never submits the form
- [PASS] Duplicate email: info FormAlert "You already have an account — log in" with a Log in link, focused; every value kept (including the verified mobile)
- [PASS] New account: lands on /dashboard; the stored user has phoneVerified true and mobile +1XXXXXXXXXX
- [PASS] Worker under 18 (DOB 2010): "You must be 18 or older to work on Chores For Me", not submitted; with an adult DOB the worker sign-up goes to next (/workers); Change and Log in links keep next and utm_*
- [PASS] Change number: clears the code, makes the mobile editable and focuses it; Resend shows a 30 s countdown
- [PASS] Social sign-in, new identity from /login: dialog "Signing in with Google (demo)" with the read-only identity, focus on "Continue as Alex"; Esc closes and returns focus to the trigger; Continue → ROLE_REQUIRED view with the two role options and the title focused; Cancel, close and Esc are disabled while "Signing in…"; choosing a role → /signup?role=<role>&next=… complete profile
- [PASS] Complete profile: identity block, mobile with OTP, DOB and Terms; the session is not treated as complete until it is saved (the guard sends /dashboard to /signup?role=customer&next=%2Fdashboard; /signup?role=worker goes to the account's own role); a worker under 18 is blocked; saving lands on the role home with phoneVerified true; "Not you? Log out" signs out and shows the plain sign-up form with the h1 focused
- [PASS] Social ROLE_MISMATCH on /signup?role=worker with a customer identity: the separate accounts view, h3 focused, no session started; "Sign up with email instead" closes the dialog and focuses First name
- [PASS] Facebook new identity on /signup?role=worker: complete profile for a worker, h1 focused; an existing incomplete identity from /login goes to the complete-profile form
- [PASS] Forgot password: validation, "Check your email" view with the h1 focused, "Back to log in" keeps next, "Use a different email" restores the form with the email kept and focused
- [PASS] ?mockError=1: login (demo row) and forgot password show the inline alert above the form, focused, and the retry succeeds with the values kept; social dialog shows the alert inside the dialog and focus returns to "Continue as Alex", retry succeeds; Send code shows the error under the mobile row and the retry opens the OTP panel
- [PASS] Log out from the SideNav (1280) and the mobile Account sheet (375) clears the session and goes to /login
- [PASS] Header island: when signed in, "Dashboard" replaces Log in / Sign up in the desktop Header and in the mobile menu sheet; Post a job stays
- [PASS] Role picker: /signup and /signup?role=admin show the picker; cards link to ?role= and keep next and utm_*; the form's h1 takes focus after the client-side switch
- [PASS] Console: no hydration warnings and no T5 errors. The only errors are prefetch 404s for routes owned by later tickets (/post-job/category, /dashboard/jobs|history|account, /worker/dashboard/my-jobs|earnings|account); there are also two font-preload warnings from the global layout
- [BLOCKING] Log in again after logging out — src/components/auth/login-page-client.tsx:78 and src/components/auth/login-form.tsx:73-74 — after a successful login, `navigating` (page) and `submitting` (form) stay true by design. Cache Components is on (next.config.ts:6), so Next keeps the visited /login route mounted in a hidden Activity and restores its state on the next client-side visit. Log out (SideNav, Account sheet, or any LogoutButton with the default /login destination) then shows the old instance: the previous email filled in, the submit stuck on "Logging in…", the form, the social buttons and all three demo rows disabled. Reproduced at 375 (demo worker login → Account → Log out). The user cannot log in again without a reload, so the core demo loop (log in → log out → log in as the other demo account) is a dead end — Fix: reset the pending state when the route is shown again, for example clear `navigating`/`busy`/`pendingEmail` and the form's `submitting` in an effect cleanup (Activity runs cleanups when it hides the route), or key the view on a per-visit value; then re-test logout → login at every width
- [BLOCKING] Sign-up page frozen on a return visit — src/components/auth/sign-up-page-client.tsx:114-115 (also `handlePendingChange` at :106-107) — `goTo` sets `frozen` to the current view and never clears it, and the Activity-preserved route keeps that state. Reproduced: /signup?role=customer → Google (existing customer) → /dashboard → Account → Log out → /login → "Sign up" → the URL is /signup but the page still shows the customer form with every field, the social buttons and Create account disabled; the picker and the ?role= param are ignored until a reload — Fix: clear `frozen` (and `alert`) when the route is hidden or the URL changes (effect cleanup, or reset on a `searchParams`/visit key); re-test sign-up → log out → /signup and the picker

Design
- [PASS] /login at 1280 / 1024: split 584 / 457 px card left; Demo accounts panel top right; brand panel below it (not sticky); the "Use a demo account" link is hidden at lg
- [PASS] /login at 768: one centred 576 px column with card chrome, then the demo panel, then the brand strip (8-column grid); at 375 no card chrome, full-width controls, jump link moves focus to "Demo accounts"
- [PASS] /signup?role= at 1280 / 1024: split layout, brand panel in row 1 of the right column and sticky; worker sign-up shows the worker brand content; name fields side by side (sm+), stacked at 375; the OTP boxes fit (44 px at 375, 48 px at 1024)
- [PASS] Role picker: two 368 px cards side by side at 1280, side by side at 768, stacked at 375
- [PASS] /forgot-password: centred 512 px card at 1024 / 1280, full-width at 375
- [PASS] Social dialog: centred 448 px modal at 1280 and 768, bottom sheet at 375 with full-width stacked buttons; the close button is 44 px
- [PASS] Dashboards: SideNav Log out with the user block at 1024 / 1280, icon-only Log out at 768, mobile top bar with Account sheet at 375; the placeholder EmptyState and the separate accounts notice (wrap-safe primary, 310×73 at 375) fit
- [PASS] No horizontal scroll (scrollWidth equals clientWidth) on every auth route, the dialog, the dashboards and the notice at 1280, 1024, 768 and 375
- [PASS] Tokens: no raw hex, text-white, text-brand, border-brand, text-sm/xs/base, font-medium/bold, ring- or arbitrary sizes in T5 files; copy lives in constants.ts
- [PASS] Focus ring: visible 2 px ink outline on tabbed controls; tab order on /signup?role=worker matches UI plan §5
- [BLOCKING] Focus after a failed submit goes to Date of birth, not the first invalid field — src/components/auth/sign-up-form.tsx:231 and src/components/auth/complete-profile-form.tsx:114 — `form.register("dob")` is called in the form's own render body, while every other field registers inside a child (FormField render prop, Controller). That makes `dob` the first name in RHF's mount order, and `shouldFocusError` follows that order. Submitting an empty sign-up form at 1280 sends focus to Date of birth, past First name, Last name, Email, Password and Mobile (the complete profile form also focuses DOB before Mobile). This breaks the Tech Spec validation rule "the first invalid field gets focus" and the UI plan §14 / §17 check "focus lands on First name". Keyboard and screen-reader users are sent past five invalid fields — Fix: register `dob` the way the other fields do (call `form.register("dob")` inside DobField's child render, or pass `register`/`name` down), or call `form.setFocus` on the first error in DOM order in the `handleSubmit` error callback; then re-test the empty submit on both forms

Minor (log only, does not block)
- src/components/auth/terms-field.tsx:21-22 and src/components/auth/sign-up-page-client.tsx:161, :243 — the "Terms" link and the "Log in" link buttons are 43 px wide (44 px tall), just under the 44 px target — add `min-w-11` (or padding) to these link targets
- src/components/layout/app-shell.tsx:59 — the customer mobile top bar logo mark link is 40×44 px (the mark-only design is approved; the touch target width is not 44) — give the Logo link `min-w-11` or padding in mark mode
- src/components/auth/social-sign-in-dialog.tsx:110 — if a retry from the role view (View B) fails, focus goes to `primaryRef`, which only exists in View A, so focus is lost after the disabled option re-enables — focus the role title or the option that was pressed in View B
- src/components/auth/sign-up-page-client.tsx:63, :77, :134-165 — a redirect with `status: false` (incomplete session on /signup or on the other role's ?role=) renders the role picker until `router.replace` lands, a brief picker flash — render the skeleton or `AuthRedirecting` for that case
- src/components/auth/social-sign-in-dialog.tsx (View B) — at 375 the role-choice sheet is about 689 px tall (UI plan §8 estimated ~520 and "fits a 667 px phone without scrolling"); it scrolls inside the sheet on a 667 px phone — tighten the role option descriptions or the spacing if the client cares
- src/app/(auth)/login/page.tsx:18-20 — the Suspense fallback (`LoginPageFallback`) is a full interactive copy that React replaces once the URL params resolve (the element refs went stale), so a very fast first keystroke or click can be lost — accept, or render the fallback inert
- Known, already reported: after social sign-in from /login, focus does not move to the complete-profile h1 (confirmed: focus is on BODY)

Manual checks for the person
- /login at 1280 — log in with the Demo customer, log out from the SideNav, then try to log in again with the Demo worker without reloading (BLOCKING #1 repro; should work after the fix)
- /signup at 375 — sign in with Google as an existing customer from /signup?role=customer, log out from the Account sheet, tap "Sign up": the picker must show and the form must not be disabled (BLOCKING #2 repro)
- /signup?role=customer and /signup?role=worker at 1280 — submit the empty form with the keyboard: focus must land on First name (BLOCKING #3); on the complete-profile form it must land on Mobile number
- /signup?role=worker at 375 — open the OTP panel, type six digits quickly on a real phone keyboard and with SMS autofill (one automated run dropped a digit when typing fast right after an error; a single key press worked)
- /login at 375 and 768 — hard reload and start typing in Email at once; check nothing typed is lost when the page takes over from the fallback
- /login at 1280 — open the Google dialog, press Continue and press Esc and click the overlay while "Signing in…": the dialog must stay open
- /signup?role=worker at 1024 and 1280 — scroll the long form: the sticky brand panel (about 824 px tall at 1024 × 768) must not hide its lower content for good; its end must come into view at the bottom of the form
- /login, /signup?role=worker, /forgot-password, /dashboard and /worker/dashboard at 1280, 1024, 768 and 375 — visual polish against UI plan §2–§13 (spacing, card chrome from md, brand strip at 768, bottom sheet at 375)
- / at 1280 and 375 while signed in — the Header shows "Dashboard" instead of Log in / Sign up after hydration with no layout jump beyond the label; signed out, it shows Log in / Sign up
- All touched pages at each width — DevTools console: no errors or warnings apart from the prefetch 404s for later-ticket routes

Verdict: NEEDS FIXES (3 blocking)
```

---

## Round 2

What changed: the new `src/lib/hooks/use-revisit-key.ts` keys the flow views so they remount each time Cache Components shows a route again (LoginPageClient, SignUpPageClient → SignUpView, ForgotPasswordPageClient, LogoutButton, AccountMenu). The new `src/components/forms/focus-first-error.ts` focuses the first invalid field in DOM order (`shouldFocusError: false`) in SignUpForm and CompleteProfileForm.

How it was checked: lint, typecheck and build; a read of both new files and every call site; then the round-1 repros and a regression pass in the browser, against `next build && next start -p 3100` and against `next dev -p 3100`. Most journeys were run as client-side navigation sequences in one tab, so the Activity-preserved routes were exercised. Cleanup done: `cfm-*` keys cleared, viewport reset to desktop, both server trees killed with `taskkill /T /F`, ports 3100 and 3000 free.

```
QA report — T5 Auth (round 2)

Code health: lint pass · typecheck pass · build pass

Round-1 BLOCKING, re-checked
- [PASS] Log in again after logging out. Production at 1028–1280 px, SideNav Log out: 5 demo-panel cycles in a row with no reload (customer → worker → new customer → worker → customer), plus 2 cycles through the email/password form. After every logout /login is fresh: empty email, "Log in" enabled, all three demo rows enabled. Production at 375 px, Account sheet Log out: 4 cycles, same result. The Activity-hidden dashboard keeps no side effects on /login (no aria-hidden, no scroll lock, no focus guards, pointer events normal). Dev (Strict Mode): 3 SideNav cycles pass, and a hard load does not count as a revisit (typed email kept)
- [PASS] Sign-up page on a return visit. Production at 375: /login → Sign up → picker → customer → Google (new identity) → complete profile (OTP 123456, DOB, Terms) → /dashboard → Account → Log out → /login → Sign up shows the enabled picker; the worker card opens /signup?role=worker with First name, Google and "Create worker account" all enabled. Forgot password → "Check your email" → Back to log in → Forgot password? shows the empty form again
- [PASS] Focus on the first invalid field. /signup?role=worker: empty submit → First name; then Email, then Mobile ("Enter a 10-digit US mobile number"), then Mobile with "Verify your mobile number", then OTP box 1 while the code panel is open, then Date of birth (also for the under-18 error), then Terms. Complete profile (Facebook new identity): empty submit → Mobile, and → OTP box 1 once a code was sent. Dev: empty /signup?role=customer submit → First name

Regression pass (round-1 PASS items)
- [PASS] Login: "No account found" alert, focused, with the Sign up link
- [PASS] Guard and next: signed out /worker/dashboard → /login?next=%2Fworker%2Fdashboard → demo worker → back on /worker/dashboard; /dashboard at 375 → /login?next=%2Fdashboard
- [PASS] Separate accounts: worker on /dashboard sees the notice (h1); "Log out and create a customer account" → /signup?role=customer with the session cleared and the form enabled
- [PASS] OTP: wrong code → "That code didn't work. Try again", box 1 focused; 123456 → "Mobile number verified", focus to Date of birth
- [PASS] Duplicate email: "You already have an account — log in" (info alert, focused, values kept); with a new email the account is created and lands on /dashboard
- [PASS] Forgot password: "Check your email" (see above)
- [PASS] "Not you? Log out" on complete profile: session cleared, plain worker sign-up form with the h1 focused
- [PASS] Header island: signed in, "Dashboard" replaces Log in / Sign up and opens the role's dashboard; after logout it shows Log in / Sign up again
- [PASS] No horizontal scroll: /login, /signup, /signup?role=worker, /forgot-password at 1280 (scrollWidth = clientWidth 1265), and /login, /signup, /signup?role=customer, /forgot-password at 375 (375)
- [PASS] Console: no hydration or React warnings in production or dev; only the known prefetch 404s for later-ticket routes and the global font-preload warnings

New issues
- None BLOCKING
- No new MINOR issues

Manual checks for the person (changes from round 1)
- Replace the three BLOCKING repro checks with: /login at 1280 and 375 — log in and out with the demo panel several times without reloading, using the SideNav and the Account sheet; /signup at 375 — after a social sign-in and a logout, "Sign up" shows the enabled picker; /signup?role=worker at 1280 — an empty keyboard submit focuses First name, and complete profile focuses Mobile number
- New: /dashboard at 1280 as a worker — press "Log out and create a customer account" a few times from a cold page load. In one production run the hand-off to /signup?role=customer arrived as a full page load instead of a client navigation. It landed in the right state and I could not reproduce it, so it is not raised as an issue
- All other round-1 manual checks stand

Verdict: READY TO COMMIT
```
