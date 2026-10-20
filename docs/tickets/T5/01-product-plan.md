# T5 — Product plan

Ticket row (Tech Spec, Build plan): **T5 Auth**. Scope: "Login, sign-up, role picker, demo social dialog, OTP, forgot password, route guards, demo accounts panel". Depends on: T2, T3. Done when: "Auth acceptance criteria pass".

T5 adds the `(auth)` route group (`/login`, `/signup`, `/forgot-password`), the reusable auth forms, the demo social dialog, the hand-built `OtpInput`, a client-side route guard, and two guarded placeholder dashboards that prove it. The marketing links to `/login`, `/signup` and `/signup?role=worker` go live.

## Scope

**In**

- `src/app/(auth)/layout.tsx`: minimal shell with the `Logo` linking to `/`, `<main id="main">`, and the `Footer` or no Footer as the UI planner decides (orchestrator decision 7). Remove `src/app/(auth)/.gitkeep`.
- `/login`: email and password form, Google and Facebook buttons, "Forgot password?" link, "Sign up" link, and the Demo accounts panel.
- `/signup`: role picker when no valid `role` param is present; with `?role=customer` or `?role=worker`, the sign-up form for that role, with the picker skipped.
- Sign-up form: first and last name, email, password (with a visibility toggle), mobile (+1) verified by SMS code (`OtpInput`), date of birth, and one Terms and Privacy checkbox. Google and Facebook buttons sit on the same screen.
- Demo social sign-in dialog, "Signing in with Google (demo)" / "Signing in with Facebook (demo)", with the demo identity prefilled.
- Profile completion for new social users: mobile with OTP, date of birth and Terms, before the session counts as complete (orchestrator decision 2).
- "Separate accounts" notice: for a social sign-in whose existing account has the other role, for a guarded route opened with the wrong role, and for a logged-in user who opens the other role's sign-up.
- `/forgot-password`: email form, then the "Check your email" success screen (always succeeds).
- Reusable route guard (one component or hook) that waits for session hydration, redirects to `/login?next=<route>` without a session, and shows the separate accounts notice on a role mismatch.
- Post-login redirect: to `next` if present, otherwise to the role's dashboard.
- Guarded placeholders at the real routes `/dashboard` (customer) and `/worker/dashboard` (worker): AppShell for the role with "Dashboard coming soon". T8 and T10 replace the page content. Remove the `.gitkeep` files in `src/app/dashboard` and `src/app/worker/dashboard`.
- shadcn primitives (Radix) themed with tokens: `input`, `label`, `dialog`, `checkbox`. `radio-group` only if the UI planner needs it. **Not** shadcn `input-otp`.
- Auth copy in `src/lib/constants.ts` (new `AUTH_COPY` block, plus a demo password constant for the panel).
- Auth page metadata (a title per page).
- Mock-layer adjustments to `auth.loginWithProvider` (and, if approved, `auth.verifyOtp` / `auth.signUp`), kept inside `src/lib/mock` plus any new `ServiceErrorCode` in `src/lib/types.ts`. See Data and services and Open questions 1 to 3.

**Out**

- Inline sign-up or login on Review & Post, step 6 (T7). T5 builds `SignUpForm` and `LoginForm` so T7 can embed them (orchestrator decision 6).
- The real customer and worker dashboards, their Account pages and their logout entry (T8, T10). The guard on `/post-job/payment`, `/post-job/confirmation` and `/worker/onboarding/*` (T7, T9 reuse the T5 guard).
- Worker onboarding after sign-up (T9). Until T9 lands, a new worker goes to `/worker/dashboard` (see Open question 9).
- Funnel analytics wiring, UTM capture and cookie consent (T11). See Analytics.
- A session-aware Header (Log in / Sign up swap to an account menu). Not in either spec; see Open question 12.
- "Reset demo data": it already lives in the Footer (T3 decision 20) and is not repeated in the Demo accounts panel.
- Real password reset emails, real SMS, real OAuth SDKs, profile photo (collected later per the PRD).
- PRD deferrals: scheduling, refunds and disputes, chat and live tracking, price guidance, smart matching, an iPhone app.
- Fixing T2–T4 minor issues in PROGRESS.md (T12).

## Screens

| Route | Purpose | Access |
| --- | --- | --- |
| `/login` | Email and password login, Google and Facebook demo sign-in, Forgot password link, Sign up link, Demo accounts panel | Public |
| `/signup` | Role picker "How do you want to use Chores For Me?" with two cards and a "Log in" link | Public |
| `/signup?role=customer` / `?role=worker` | Sign-up form for that role (picker skipped); also the place where a new social user completes the profile | Public |
| `/forgot-password` | Email form, then the "Check your email" success screen | Public |
| `/dashboard` | Placeholder customer dashboard, "Dashboard coming soon", in `AppShell role="customer"` | Customer (guarded) |
| `/worker/dashboard` | Placeholder worker dashboard, "Dashboard coming soon", in `AppShell role="worker"` | Worker (guarded) |

Within these screens: the demo social dialog (modal on desktop and tablet, bottom sheet on mobile), the OTP entry (inline under the mobile field, see Open question 1), the complete-profile form for new social users, and the separate accounts notice.

## Components

| Component | New or existing (path) | Used on | Responsibility |
| --- | --- | --- | --- |
| `Logo` | Existing (`src/components/layout/logo.tsx`) | Auth layout | Links home |
| `Footer` | Existing (`src/components/layout/footer.tsx`) | Auth layout, if the UI planner keeps it | Use `showMobileCta={false}` if kept (no "Post a job" bar on auth pages, UI planner to confirm) |
| `AppShell` | Existing (`src/components/layout/app-shell.tsx`) | `/dashboard`, `/worker/dashboard` | Role nav and shell around the placeholder. No change |
| `LoadingState`, `ErrorState`, `EmptyState` | Existing (`src/components/states/*`) | Guard while hydrating; placeholders | `LoadingState` while the session hydrates |
| `Button`, `Separator`, `Sheet`, `Skeleton` | Existing (`src/components/ui/*`) | All auth screens | Button spinner and disabled state while submitting; `Sheet` is an option for the mobile bottom-sheet dialog |
| `Input`, `Label`, `Dialog`, `Checkbox` (+ `RadioGroup` if needed) | New, shadcn Radix (`src/components/ui/*`) | Forms, social dialog, Terms | Themed with tokens; 44 px touch targets |
| `AuthLayout` | New (`src/app/(auth)/layout.tsx`) | All auth routes | Minimal shell (Logo, main, Footer per UI plan) |
| `AuthCard` | New (`src/components/auth/auth-card.tsx`) | Login, sign-up, forgot password, complete profile | Title, sub-line, inline error message slot above the form, body |
| `AuthBrandPanel` | New (`src/components/auth/auth-brand-panel.tsx`) | Login, sign-up (desktop split screen) | Brand panel with trust points; desktop only per the Responsive table |
| `FormField` (label, control, error, hint) | New (`src/components/forms/form-field.tsx`, UI planner may relocate) | Every auth form; reused by T6–T9 | Label, error under the field linked with `aria-describedby`, `aria-invalid` |
| `PasswordInput` | New (`src/components/auth/password-input.tsx`) | Login, sign-up | Password field with a show/hide toggle (PRD) |
| `SocialButtons` | New (`src/components/auth/social-buttons.tsx`) | Login, sign-up | "Continue with Google" / "Continue with Facebook"; opens the demo dialog only; no external SDK |
| `SocialSignInDialog` | New (`src/components/auth/social-sign-in-dialog.tsx`) | Login, sign-up | "Signing in with Google (demo)" with the `DEMO_SOCIAL_IDENTITIES` identity prefilled; Confirm calls `auth.loginWithProvider`; Cancel closes |
| `OtpInput` | New, hand-built (`src/components/auth/otp-input.tsx`) | Sign-up, complete profile | 6 single-digit inputs; paste fills all; auto-advance; Backspace moves back; digits only; one accessible group label |
| `MobileVerifyField` | New (`src/components/auth/mobile-verify-field.tsx`) | Sign-up, complete profile | Mobile input, "Send code" (`auth.sendOtp`), `OtpInput`, "Verify" (`auth.verifyOtp`), field marked verified on success |
| `RolePicker` | New (`src/components/auth/role-picker.tsx`) | `/signup` | Two large cards, "I need help with chores" (Customer) and "I want to earn doing chores" (Worker), each with a one-line description; one tap continues to `?role=`; "Log in" link below |
| `LoginForm` | New (`src/components/auth/login-form.tsx`) | `/login`; embeddable by T7 | `loginSchema`; calls `auth.login`; `onSuccess(user)` callback, no redirect inside |
| `SignUpForm` | New (`src/components/auth/sign-up-form.tsx`) | `/signup?role=`; embeddable by T7 | Props: `role`, `onSuccess(user)`, optional `next`; `signUpSchema`; calls `auth.signUp`; includes `MobileVerifyField` and `SocialButtons`; no redirect inside |
| `CompleteProfileForm` | New (`src/components/auth/complete-profile-form.tsx`) | `/signup` (new social user); embeddable by T7 | `completeProfileSchema`; mobile with OTP, DOB, Terms; saves with `users.update` |
| `ForgotPasswordForm` | New (`src/components/auth/forgot-password-form.tsx`) | `/forgot-password` | `forgotPasswordSchema`; `auth.requestPasswordReset`; swaps to the "Check your email" screen |
| `DemoAccountsPanel` | New (`src/components/auth/demo-accounts-panel.tsx`) | `/login` | Lists `DEMO_ACCOUNTS` (Demo customer, Demo worker, New customer (no history)) with one-click fill and login; shows OTP code `123456` and "any password" |
| `SeparateAccountsNotice` | New (`src/components/auth/separate-accounts-notice.tsx`) | Guard, social sign-in mismatch, `/signup?role=` with an other-role session | Short message that customer and worker accounts are separate, with a sign-up link for the other role (see Open question 6) |
| `RequireRole` (guard) | New (`src/components/auth/require-role.tsx`, or a `useRequireRole` hook) | `/dashboard` and `/worker/dashboard` layouts; reused by T7–T10 | Waits for `useSessionHydrated()`; no session → `router.replace('/login?next=<route>')`; role mismatch → `SeparateAccountsNotice`; incomplete social profile → completion (Open question 4); else renders children |
| Auth redirect helpers | New (`src/lib/auth/redirect.ts`) | Login, sign-up, guard | `dashboardFor(role)` (`/dashboard` or `/worker/dashboard`), `safeNext(param)` (only same-site paths starting with a single `/`), `loginHref(next)` |
| Dashboard placeholders | New (`src/app/dashboard/layout.tsx` + `page.tsx`, `src/app/worker/dashboard/layout.tsx` + `page.tsx`) | — | Guard + AppShell + "Dashboard coming soon"; a Log out button to test the guard (Open question 11) |

## Data and services

**Types** (`src/lib/types.ts`, existing): `Role`, `User`, `Session`, `SignUpInput`, `SocialProvider`, `AuthProvider`, `UserPatch`, `ServiceErrorCode`. Possibly new error codes `ROLE_MISMATCH` (and `ROLE_REQUIRED`), see Open questions 2 and 3.

**Services** (`src/lib/mock/services.ts`, existing):

| Call | Used for | Notes |
| --- | --- | --- |
| `auth.login(email, password)` | Login form, demo panel | Any account, any non-empty password; unknown email → "No account found" |
| `auth.signUp(input)` | Sign-up form | Existing email → `ACCOUNT_EXISTS` "You already have an account — log in" (show a link to `/login`) |
| `auth.loginWithProvider(provider, role)` | Social dialog | Today returns an existing account unchanged and starts its session even if the role differs (T3 QA). **T5 adjusts it:** when the existing account's role differs from `role`, reject with a typed code (proposed `ROLE_MISMATCH`) and do not start a session; the UI shows `SeparateAccountsNotice` |
| `auth.sendOtp(mobile)` | "Send code" | Validates the mobile only |
| `auth.verifyOtp(mobile, code)` | "Verify" | `123456` → `true`, else `false` ("That code didn't work. Try again"). Today it only marks `phoneVerified` when a session user with that mobile exists; see Open question 1 |
| `auth.requestPasswordReset(email)` | Forgot password | Always resolves |
| `auth.logout()` | Placeholder Log out, separate accounts "log out and sign up" | Clears the session, keeps the data |
| `users.update(userId, patch)` | Complete profile (mobile, dob, phoneVerified) | Syncs the session user |
| `isServiceError` | All forms | Read `code` and `message` for the inline error above the form |

**Store** (`src/lib/store`, existing): `useSessionStore` (`session`, `setSession`, `updateUser`, `clear`), `useSessionHydrated()`, `isSessionActive()`, `selectSessionUser`. The services set the session; the UI only reads it (and calls `auth.logout`).

**Schemas** (`src/lib/validation`, existing): `loginSchema`, `signUpSchema` (role-aware 18+), `otpSchema`, `forgotPasswordSchema`, `completeProfileSchema` (role-aware 18+), `zodResolver`. No new schemas, except possibly a form-level "mobile verified" check (Open question 1).

**Constants** (`src/lib/constants.ts`): existing `DEMO_ACCOUNTS`, `DEMO_OTP_CODE`, `DEMO_SOCIAL_IDENTITIES`, `VALIDATION_MESSAGES`, `SERVICE_MESSAGES`, `HEADER_ACTIONS`, `WORKER_SIGNUP_HREF`, `NAV_ITEMS`, `FOOTER.terms` / `FOOTER.privacy`, `LIMITS.sessionDays`. New: `AUTH_COPY` (page titles, labels, buttons, picker cards, dialog title, separate accounts notice, "Check your email", demo panel, placeholder dashboard copy) and `DEMO_PASSWORD` for the panel's one-click login [provisional copy].

## Behaviour and rules

Role selection

1. "Header 'Sign up' or a direct /signup link | Unknown | Yes" shows the picker; "Post a job, category tile, service page | Customer | No"; "Earn with Chores For Me, Start earning, worker page | Worker | No"; "Login with an existing account | Read from the account | No" (PRD).
2. Picker: "Two large cards: **I need help with chores** (Customer) and **I want to earn doing chores** (Worker), each with a one-line description." "One tap selects and continues; no separate Next button." "A 'Log in' link sits below for returning users." Continuing sets `?role=` and keeps any other query params (`next`, `utm_*`): "UTM parameters are kept through the whole flow, including sign-up."
3. "One role per account: customer and worker accounts are separate, as in the apps today." (AGENTS.md: "One role per account.")
4. "A logged-in user who clicks the other role's CTA sees a short message explaining the accounts are separate." (PRD). In T5 this covers `/signup?role=<other role>` with an active session.

Sign-up

5. Fields: first and last name, email, password (skipped with Google or Facebook), "Mobile (+1) … At sign-up, verified by SMS code", "Date of birth … At sign-up, required for both roles", "Terms & Privacy consent … At sign-up, one checkbox". Profile photo is collected later, not here (PRD).
6. "Password: at least 8 characters, shown with a visibility toggle; inline errors, never a cleared form." (PRD)
7. "An email already registered shows 'You already have an account — log in' instead of an error." (PRD) The message links to `/login`.
8. Workers must be 18 or older: "You must be 18 or older to work on Chores For Me". Customer DOB only has to be valid and not in the future (T3 decision 19).
9. The account role is the `role` param (or the picker choice). The form never lets a worker sign-up create a customer account or the reverse.

Social sign-in

10. "Continue with Google / Facebook | Opens a small in-page dialog 'Signing in with Google (demo)' with the demo identity prefilled; on confirm, returns a user with `authProvider` set; new users then complete mobile, DOB and Terms" (Tech Spec). No external SDK is loaded (AGENTS.md hard rule 3).
11. "Google and Facebook prefill name and email; the user adds mobile and accepts Terms." (PRD) A new social user must complete mobile, DOB, Terms and OTP before the session counts as complete (orchestrator decision 2). Until then the guard does not treat the session as signed in (Open question 4).
12. If the returned account's role differs from the role the user chose, show the "separate accounts" notice instead of signing in as the wrong role (orchestrator decision 2). Demo identities: Google → Alex Rivera, `alex.google@choresforme.test`; Facebook → Sam Lee, `sam.facebook@choresforme.test` [provisional].

OTP

13. "Phone verification by one-time SMS code supports the existing 'Phone verified' status on the Chores ID-Card." (PRD)
14. "OTP | Code `123456` always succeeds; any other code fails". Errors: "Enter the 6-digit code" (not 6 digits) / "That code didn't work. Try again" (wrong code). Success: "Field marked verified". Loading: "Button spinner".
15. `OtpInput` is hand-built: 6 single-digit inputs, paste support, auto-advance, Backspace handling (orchestrator decision 1).

Login and redirects

16. "Login | Any seeded email with any password succeeds; unknown email returns 'No account found'". The login form requires only a non-empty password; the 8-character rule applies to sign-up only (T3 decision 16).
17. "After login, users go to `next` if present, else to their role's dashboard." Same after sign-up and social sign-in. `next` is used only when it is a same-site path (`/…`, not `//…` or a full URL) [engineering safeguard].
18. "Sessions persist for 30 days on the same device unless the user logs out." "Session | Stored in the Zustand session store (persisted); logout clears session, keeps seed data".

Forgot password

19. "Sign-in methods: … Forgot Password by email link." "Forgot password | Always shows the 'Check your email' success screen". The email is still validated ("Enter a valid email address").

Route guards

20. "guarded routes redirect to `/login?next=<route>` when there is no mock session." Client-side only, after the persisted session has hydrated; no redirect or flash of protected content before hydration (orchestrator decision 3).
21. "A worker session hitting `/dashboard` (or a customer hitting `/worker/*`) sees the 'separate accounts' notice with a sign-up link for the other role."
22. An expired session counts as logged out (`isSessionActive`).

Demo accounts panel

23. "Demo logins (shown on the login page in a 'Demo accounts' panel): customer `demo.customer@choresforme.test`, worker `demo.worker@choresforme.test`, any password." Plus `new.customer@choresforme.test` (T3 decision 5). One-click fill and login; shows OTP `123456` (orchestrator decision 4). No Reset button here.

Forms, states, layout

24. "Each form has one Zod schema in `lib/validation`; errors show under the field on blur and on submit, and the first invalid field gets focus." Use the existing schemas and messages verbatim.
25. Screen states: "Login / Sign-up | Button spinner, form disabled | — | Inline message above the form | Redirect to next route"; "OTP | Button spinner | — | 'That code didn't work. Try again' | Field marked verified". "errors never clear typed input". `?mockError=1` makes the first service call reject; show `SERVICE_MESSAGES.mockError` inline above the form, and the retry (submit again) succeeds.
26. Responsive: "Login / sign-up | Split screen: form card left, brand panel with trust points right | Centred card, no brand panel | Full-width form"; "Role picker | Two large cards side by side | Side by side | Stacked cards"; "Dialogs | Centred modal | Centred modal | Bottom sheet". No horizontal scroll at 375 px; touch targets at least 44 px; no action only on hover.
27. Accessibility: "WCAG 2.1 AA: labels on every field, keyboard navigation, sufficient contrast". The dialog traps focus, closes on Esc and returns focus to the button that opened it.
28. Copy lives in `constants.ts`; only design tokens for colour, type and spacing.

## Analytics

T5 fires **no** events. The Tech Spec gives "wire every funnel event" to T11, and the T5 row does not assign any (orchestrator decision 5).

Auth-related events T11 must wire (names exactly as in the PRD):

| Event | Funnel | Where in T5 code |
| --- | --- | --- |
| `signup_started` | Customer | Customer `SignUpForm` (or social dialog) starts. Also from T7's inline sign-up on step 6 |
| `signup_completed` | Customer | Customer account is complete (after OTP, or after social profile completion) |
| `worker_signup_started` | Worker | Worker `SignUpForm` (or social dialog) starts |
| `worker_signup_completed` | Worker | Worker account is complete |

`app_first_login` (Hand-off) happens in the Android app, not on the web. Login itself has no PRD event. T5 should expose clear completion points (`onSuccess` callbacks) so T11 can add `track()` calls without restructuring.

## Acceptance criteria

**Role selection and auth** (Tech Spec, verbatim)

- [ ] `/signup` without a role shows the picker; with `?role=` it skips it
- [ ] Google and Facebook buttons open the demo sign-in dialog and never load an external SDK
- [ ] New social users must still add mobile, DOB and accept Terms
- [ ] OTP `123456` verifies; any other code shows the error
- [ ] A worker under 18 cannot complete sign-up
- [ ] An existing email shows "You already have an account — log in"
- [ ] After login, users land on `next` or their role's dashboard

**Global (every ticket)** (Tech Spec, verbatim)

- [ ] `npm run lint` and `npm run typecheck` pass with no errors
- [ ] No console errors or warnings on the touched pages
- [ ] Loading, empty, error and success states render (error via `?mockError=1`)
- [ ] All interactive elements reachable by keyboard with a visible focus ring
- [ ] Only design tokens used for colour, type and spacing

**T5 checks from the orchestrator decisions** (not Tech Spec text)

- [ ] `/dashboard` and `/worker/dashboard` without a session redirect to `/login?next=/dashboard` (or `/worker/dashboard`); after login the user lands there
- [ ] A worker session on `/dashboard` and a customer session on `/worker/dashboard` see the separate accounts notice with a sign-up link for the other role
- [ ] No redirect and no flash of protected content before the session has hydrated (hard reload while signed in stays on the page)
- [ ] Social sign-in with an identity whose account has the other role shows the separate accounts notice and starts no session
- [ ] A new social user is not signed in as complete until mobile (with OTP), DOB and Terms are done
- [ ] `OtpInput`: paste of 6 digits fills all boxes; typing auto-advances; Backspace on an empty box moves back
- [ ] Demo accounts panel lists the 3 `DEMO_ACCOUNTS`, logs in with one click and shows `123456`
- [ ] `/forgot-password` always reaches "Check your email" for a valid email
- [ ] Header and marketing links to `/login`, `/signup` and `/signup?role=worker` no longer 404
- [ ] `SignUpForm` and `LoginForm` take `onSuccess` and do not redirect themselves (ready for T7)
- [ ] Every screen checked at 1280, 1024, 768 and 375 px

## Open questions

1. **When is the mobile verified?** The OTP screen state's success is "Field marked verified", which reads as inline verification inside the sign-up form, before submit. But `auth.verifyOtp` only marks `phoneVerified` when a session user with that mobile exists, and `auth.signUp` always stores `phoneVerified: false`. Options: (a) inline OTP before submit, with a mock-layer tweak (for example `verifyOtp` remembers verified numbers in the mock DB and `signUp` / `users.update` set `phoneVerified: true` for them), plus a new message when the user submits without verifying (copy needed, for example "Verify your mobile number"); or (b) submit creates the account, then an OTP step follows (no service change, but the account exists unverified if the user leaves). Recommendation: (a).
2. **Role mismatch in `loginWithProvider`.** Proposed: reject with a new `ServiceErrorCode` `ROLE_MISMATCH` (message = the separate accounts copy) without starting a session. This adds a code to `src/lib/types.ts`. Approve, or prefer the UI calling `auth.logout()` right after a mismatch?
3. **Social buttons on `/login` have no role.** For an existing identity the role comes from the account. For a new identity, which role? Options: make `role` optional and reject with `ROLE_REQUIRED` when the identity is new, then show the role picker and retry; or send the user to `/signup` (picker). Also: is the dialog's prefilled identity editable (more demo identities) or read-only?
4. **Where does an incomplete social session go?** If a new social user leaves before finishing, the persisted session has an empty mobile or DOB. Proposed: "incomplete" = empty `mobile` or `dob` (T3 decision 9), and the guard, `/login` and `/signup` send that user to the complete-profile form at `/signup?role=<account role>` (keeping `next`). There is no route for it in the spec. Note: seed worker Olivia Martinez has `phoneVerified: false` but a mobile, so under this rule she is complete; confirm that is fine.
5. **Copy not in the specs [provisional]:** the separate accounts notice, the role cards' one-line descriptions, the brand panel trust points, the dialog body and buttons, "Check your email" body, the Demo accounts panel text, "Dashboard coming soon", page titles, the "Verify your mobile number" message (if option 1a), "Resend code" / "Change number" labels.
6. **Separate accounts sign-up link while logged in.** The link to `/signup?role=<other>` would hit the same notice again for a logged-in user. Proposed: the notice offers "Log out and create a <role> account" (calls `auth.logout()` then goes to the sign-up), plus "Go to my dashboard". Confirm.
7. **Logged-in user on `/login` or same-role `/signup`.** Not specified. Proposed: redirect to `next` or the role's dashboard.
8. **Invalid `?role=` value** (for example `?role=admin`). Proposed: treat as no role and show the picker.
9. **Where does a new account go after sign-up?** "After login …" covers login only. Proposed: `next` if present; else customer → `/dashboard`, worker → `/worker/dashboard` until T9 changes it to `/worker/onboarding/area` (PRD worker flow step 3).
10. **Should `next` be carried between `/login` and `/signup`** (the "Sign up" and "Log in" links, and the picker)? Proposed: yes.
11. **Log out on the placeholders.** No logout control exists yet (AppShell has none; T8/T10 own Account). Proposed: a simple "Log out" button on both placeholders so the guard can be tested, replaced by T8/T10.
12. **Session-aware Header.** The marketing Header always shows Log in / Sign up, even when signed in. Neither spec covers a signed-in Header. Leave for T8/T12, or add a "Dashboard" link in T5?
13. **OTP extras.** "Resend code" and "Change number" are not specified. Add them (mock `sendOtp` again), or keep only Send and Verify?
14. **`SelectableCard`.** The component inventory lists it for "role". The picker continues on one tap (navigation, no selected state), so T5 proposes plain link cards in `RolePicker` and leaves `SelectableCard` to T6. Confirm.
15. **SEO for auth pages.** Should `/login`, `/signup` and `/forgot-password` be `noindex` and stay out of the sitemap (T4 sitemap lists marketing routes only)?
16. **Tablet "no brand panel"** vs AGENTS.md "nothing removed on mobile". The Tech Spec table removes the brand panel at tablet and mobile; T5 follows the spec table. Confirm the trust points may be dropped there, or show them compactly under the form.

## Orchestrator decisions (binding; resolve the open questions above)

1. **OTP is inline (option a).** In the sign-up and complete-profile forms the mobile field has "Send code" → `OtpInput` → "Verified". Submitting is blocked until the mobile is verified, with the message "Verify your mobile number" [provisional]. Mock-layer change allowed: `auth.verifyOtp` records verified numbers in the mock DB without needing a session, and `auth.signUp` sets `phoneVerified: true` when that mobile was verified.
2. **`ROLE_MISMATCH`** is approved as a new `ServiceErrorCode` in `types.ts`, plus `ROLE_REQUIRED` (see 3).
3. **Social sign-in on `/login`:** the role is optional. A new identity with no role is rejected with `ROLE_REQUIRED`; the dialog then shows the two role cards inline and continues with the chosen role. The prefilled demo identity is read-only (it's a demo).
4. **Unfinished social sign-up:** a user is incomplete when `mobile` or `dob` is empty. They finish at `/signup?role=<role>`, which shows `CompleteProfileForm` when an incomplete session exists. Seed worker Olivia (has a mobile, `phoneVerified: false`) counts as complete.
5. **Provisional copy:** all of it goes in `constants.ts` and is logged as a client question.
6. **Separate accounts notice:** for a logged-in user the action is "Log out and create a <role> account" (logs out, then `/signup?role=<other>`).
7. **Signed-in user on `/login` or a same-role `/signup`:** redirect to `next`, otherwise the role's dashboard.
8. **Invalid `?role=`:** show the picker.
9. **After sign-up:** go to `next`, otherwise the role's home. Use one constant for each role's post-sign-up route: customer `/dashboard`; worker `/worker/dashboard` for now (T9 switches it to `/worker/onboarding/area`).
10. **Carry `next`** across login ↔ sign-up ↔ the picker.
11. **Log out:** add it to `AppShell` (SideNav footer area on md+, and an Account/Log out control in the mobile top bar). Extend the T2 components; don't duplicate them.
12. **Header when signed in:** a small client island replaces "Log in" / "Sign up" with a "Dashboard" link (to the role's home) once the session store has hydrated. Before hydration it renders the signed-out links (no layout shift beyond the label).
13. **OTP extras:** "Resend code" (calls `sendOtp` again, with a 30 s cooldown) and "Change number" (clears the code, focuses mobile) are both in.
14. **Role picker cards:** plain link cards (two large cards per the PRD). `SelectableCard` stays with T6.
15. **Auth pages are noindex** and left out of the sitemap.
16. **Brand panel on tablet and phone:** follow the spec's responsive layout, but don't drop content. Below lg, the brand panel's trust points render as a compact strip under the form. Nothing is removed, only rearranged.
