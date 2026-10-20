# T3 — Product plan

Ticket row (Tech Spec, Build plan): **T3 Data + mock layer**. Scope: "`types.ts`, `constants.ts`, seed data, mock services with delays and `?mockError`, Zustand stores, `analytics.ts` stub". Depends on: T1. Done when: "Services callable from a test page; seed data loads".

T3 builds the data foundation that every app ticket (T5 to T11) sits on. It wires nothing into a product route. The only page it ships is the dev test page `/dev/mock`.

## Scope

**In**

- Extend `src/lib/types.ts` with every type in the Tech Spec "Data model", verbatim. Keep the existing `Role` line.
- Extend `src/lib/constants.ts` with domain constants: categories and sub-services, statuses and their labels, US states, demo accounts, limits, and the error and service messages. Keep everything T2 put there unchanged.
- `src/lib/mock/seed.ts`: the seed table counts (4 categories, 2 customers, 6 workers, 12 jobs, 2 templates, 1 payment method).
- `src/lib/mock/services.ts`: every function in the spec's service list, with the 400–800 ms delay, `?mockError=1`, the mock auth table and the "Other mock rules". Plus `resetDemoData()` (orchestrator decision).
- A persisted mock database inside `src/lib/mock` (seed copied on first load, mutated by services, restored by `resetDemoData()`). It is internal: UI code never imports it or the seed.
- Zustand stores with `persist` in `src/lib/store`: session, job draft, worker onboarding progress.
- Zod schemas in `src/lib/validation`, one per form, built from the "Validation rules" table, plus a hand-written Zod → React Hook Form resolver helper (no `@hookform/resolvers`). Reason: the spec says schemas are "shared between forms and mock services", and the service input types (`SignUpInput`, `CardInput`) come from them. See Open question 1.
- `src/lib/analytics.ts` stub: `track(eventName, props)` typed to the PRD event names, logging to the console.
- `/dev/mock` test page.

**Out**

- Any product screen or route guard: auth screens and guards → T5; job builder → T6/T7; dashboards → T8/T10; onboarding → T9.
- The user-facing "Reset demo data" button → T5 (demo accounts panel). T3 only exposes `resetDemoData()`.
- The demo "Approve" button → T10 (T3 makes `workers.updateOnboarding` able to set `verified`).
- Wiring funnel events, source/device/UTM capture and "fires once" de-duplication → T11. T3 fires no events.
- `AppPrompt` dismiss storage (7 days) → T11.
- Toasts, components such as `AddressInput`, `PhotoUploader`, `PriceInput`, `StatusBadge` → their tickets.
- Real uploads, card processing or any network call. New libraries.
- PRD deferrals: scheduling (date/time), refunds and disputes, chat and live tracking, price guidance, smart matching.

## Screens

| Route | Purpose | Access |
| --- | --- | --- |
| `/dev/mock` (`src/app/dev/mock/page.tsx`) | Dev page that calls every mock service, shows the seed loads, and shows the four states. The T3 "Done when" check | Public, **not linked** from anywhere, **noindex, nofollow** through page `metadata.robots` (same pattern as `/styleguide`) |

Page rules:

- `page.tsx` is a server component that exports only `metadata` and renders a client component (`"use client"`) that holds all interactive parts. Under `cacheComponents: true`, nothing uncached (`new Date()`, `Math.random()`, `localStorage`, search params) runs during server render.
- If the client part reads search params with `useSearchParams`, it sits inside a `<Suspense>` boundary. Simpler: services read `window.location.search` at call time, so the page needs no search-param hook.
- What it shows (copy in `constants.ts`, for example `DEV_MOCK_COPY`):
  1. A short intro and the `?mockError=1` instruction.
  2. **Seed check**: loads the seed through services (not by importing seed) and shows what came back, for example the demo customer's jobs, templates and payment method, the demo worker's profile and board, and the workers for one area. See Open question 13 for full counts.
  3. **Service panels**, grouped `auth` / `jobs` / `workers` / `templates` / `payments`. Each call has a button with fixed sample arguments, and shows loading (button spinner or `LoadingState`), success (result as readable JSON or a short summary), error (`ErrorState` with Retry) and empty (`EmptyState`, for example the brand-new customer's job list).
  4. **Stores**: current session, job draft and onboarding progress, each with a clear button.
  5. **Reset demo data** button calling `resetDemoData()` (dev page only; the user-facing button is T5).
- Uses `LoadingState`, `EmptyState`, `ErrorState` and `Button` from T2. Works at 1280, 1024, 768 and 375 px with no sideways scroll (long JSON wraps or scrolls inside its own box).

## Components

| Component | New or existing (path) | Used on | Responsibility |
| --- | --- | --- | --- |
| `LoadingState`, `EmptyState`, `ErrorState` | Existing (`src/components/states/*`) | `/dev/mock` | The four states for each service panel |
| `Button` | Existing (`src/components/ui/button.tsx`) | `/dev/mock` | Service call buttons, `loading` while pending |
| `Container` | Existing (`src/components/layout/container.tsx`) | `/dev/mock` | Page width |
| Dev mock page | New (`src/app/dev/mock/page.tsx`) | `/dev/mock` | Metadata (noindex) and the client panel |
| Dev panels | New, page-local (`src/app/dev/mock/_components/*`) | `/dev/mock` | Service panels, seed check, store viewer, reset. Page-local like `src/app/styleguide/_components` |

No new shared component. The UI planner decides the panel layout.

## Data and services

### 1. Types (`src/lib/types.ts`)

Copy verbatim from the Tech Spec "Data model": `Role` (exists), `CategoryId`, `Category`, `User`, `VerificationStatus`, `WorkerProfile`, `Address`, `PricingType`, `JobStatus`, `Job`, `JobDraft`, `Template`, `PaymentMethod`.

Referenced by the service signatures but **not defined** in the spec (Open question 2): `WorkerSummary`, `SignUpInput`, `CardInput`. Proposal, using only existing fields:

- `SignUpInput` and `CardInput` = `z.infer` of the sign-up and card schemas.
- `WorkerSummary` = what Step 5 shows ("name, rating and ID-Card badges"): `Pick<User, 'id' | 'firstName' | 'lastName' | 'photoUrl' | 'phoneVerified'> & Pick<WorkerProfile, 'rating' | 'jobsCompleted' | 'idStatus' | 'insuranceStatus'>`.

Also a `Session` type for the store (user plus expiry), and a typed service error (a code plus the spec message), so screens can tell "No account found" from a `?mockError` failure.

### 2. Constants (`src/lib/constants.ts`, extend)

- `CATEGORIES: Category[]` with exact names: "Outdoor Home Service", "House Cleaning", "Item Disposal", "Custom". Outdoor sub-services: "Lawn Mowing, Weed Removal, Planting, Gutter Service, Other". The other three lists are **unknown** (Open question 3).
- `OTHER_SUB_SERVICE = 'Other'` (it opens the text field).
- Status labels: `VERIFICATION_STATUS_LABELS` = Not started, Under review, Verified, Rejected (PRD). `JOB_STATUS_LABELS` for open, accepted, in_progress, completed, cancelled (wording not in the spec: Open question 4).
- Match type labels: "Post to Job Board" (default) and "Pick a Worker". Pricing labels: "Fixed Price", "Hourly".
- `US_STATES`: 50 states plus DC (codes and names).
- Limits (provisional per spec): fixed price $5–$5,000; hourly rate $10–$200; hours 1–12 in 0.5 steps; radius 5–200 miles; up to 5 photos; 10 MB per file; description 10–500; "Other" text 3–100; template name 3–40; mock delay 400–800 ms; session length 30 days.
- Demo: `demo.customer@choresforme.test`, `demo.worker@choresforme.test`, OTP code `123456`.
- `VALIDATION_MESSAGES`: every error message in the "Validation rules" table, verbatim.
- `SERVICE_MESSAGES`: "No account found", "You already have an account — log in", "This job was just taken", "That code didn't work. Try again".
- `DEV_MOCK_COPY` for the test page.

### 3. Seed (`src/lib/mock/seed.ts`)

| Entity | Count | Notes (spec) |
| --- | --- | --- |
| Categories | 4 | Reuse `CATEGORIES` from constants, do not copy them |
| Customers | 2 | `demo.customer@…` has history; one brand new for empty states (email: Open question 5) |
| Workers | 6 | Users with role worker plus `WorkerProfile`s. Ratings 3.8 to 5.0. Statuses: 4 verified, 1 under review, 1 rejected (with `rejectionReason`). Which one is `demo.worker@…`: Open question 6 |
| Jobs | 12 | Every `JobStatus` present, 3 US cities, both fixed and hourly, both `board` and `direct` |
| Templates | 2 | For the demo customer |
| Payment methods | 1 | Visa ending 4242, for the demo customer |

- Fixed ids and fixed ISO timestamps (no `new Date()` or random at module level).
- Every seeded `User` has a valid `mobile` (`+1XXXXXXXXXX`), `dob` (workers 18+), and an `authProvider`.
- Seed addresses double as the mocked address autocomplete source (spec: "autocomplete mocked from seed addresses"). Cities: Open question 7.
- Photos and worker `photoUrl`: Open question 8.

### 4. Mock services (`src/lib/mock/services.ts`, the only entry point)

All functions return a Promise after a random 400–800 ms delay. Signatures exactly as in the spec:

| Function | T3 behaviour (from the spec) |
| --- | --- |
| `auth.signUp(input)` | Creates the user in the mock DB and sets the session. Email already present → rejects with "You already have an account — log in" |
| `auth.login(email, password)` | Any seeded email with any password succeeds and sets the session. Unknown email → "No account found" |
| `auth.loginWithProvider(provider, role)` | Returns a user with `authProvider` set. New users then complete mobile, DOB and Terms (shape: Open question 9) |
| `auth.sendOtp(mobile)` | Resolves |
| `auth.verifyOtp(mobile, code)` | `true` for `123456`, `false` for anything else |
| `auth.requestPasswordReset(email)` | Always resolves (the "Check your email" screen is T5) |
| `auth.logout()` | Clears the session; keeps the mock DB |
| `jobs.listForCustomer(customerId)` | That customer's jobs (`[]` for the brand-new customer) |
| `jobs.listBoard(workerId)` | Open board jobs "filtered by area + categories" of that worker (area rule: Open question 10) |
| `jobs.get(id)` | The job; unknown id rejects (screen shows "We couldn't find this job") |
| `jobs.create(draft)` | Creates a job for the session customer, `status: 'open'`. Board jobs then appear on matching boards (status of direct jobs: Open question 11) |
| `jobs.accept(jobId, workerId)` | Open job → `accepted` with `workerId`. Not open → rejects with "This job was just taken" |
| `jobs.cancel(jobId)` | Sets `cancelled` (allowed statuses: Open question 12) |
| `jobs.rate(jobId, stars)` | Sets `customerRating` (range and rules: Open question 12) |
| `workers.listForArea(address, category)` | **Verified** workers serving that category in that area |
| `workers.getProfile(userId)` | The `WorkerProfile` |
| `workers.updateOnboarding(userId, patch)` | Merges the patch and returns the profile. Also used by T10's demo Approve to set `verified` |
| `workers.uploadDocument(userId, kind, file)` | Returns `under_review` and sets the matching status (`idStatus` for `id_front`/`id_back`, `insuranceStatus` for `insurance`). The file is not stored or sent |
| `templates.list(customerId)` / `templates.save(customerId, name, draft)` | List and create |
| `payments.listMethods(userId)` / `payments.addMethod(userId, card)` | Accepts any 16-digit number; stores only brand and last 4 |
| `resetDemoData()` | Restores the seed (what else it clears: Open question 14) |

Mock layer internals (not exported to UI): the delay helper, the `?mockError` check, the persisted mock DB. The mock DB persists to `localStorage`, so a job posted as a customer shows on the worker board after switching accounts, and accounts created by sign-up still work after logout.

**`?mockError=1`** (spec, verbatim): "Add `?mockError=1` to any URL to make the next service call reject, so error states can be shown on demand." Plan: the service checks `window.location.search` when called. When `mockError=1` is present, the next call rejects with a mock-error code after the normal delay. Whether it then re-arms or stays one-shot per page load is Open question 15.

### 5. Stores (`src/lib/store`, Zustand `persist`, `localStorage`)

| Store | Fields | Notes |
| --- | --- | --- |
| Session | `user` (or null), `expiresAt` | "Sessions persist for 30 days on the same device unless the user logs out". Expired → treated as logged out. Exposes a hydration flag so T5 guards do not redirect before rehydration |
| Job draft | `JobDraft` (includes `lastStep`) plus set/patch/clear | Saved at every step, survives reload and Back. Cleared after `jobs.create` succeeds (T7 calls clear) |
| Worker onboarding | Which onboarding steps are done, plus the current step | "Area, services, ID, insurance and payout steps save progress and can be resumed". Profile data itself goes through `workers.updateOnboarding` |

Stores are client only. UI reads stores and calls services; stores never import seed.

### 6. Validation (`src/lib/validation`)

- `zod-resolver.ts`: a small hand-written resolver that runs a Zod schema and maps issues to React Hook Form `FieldErrors` by path (nested paths too). Forms use `mode: 'onBlur'` plus validation on submit, and RHF's `shouldFocusError` focuses the first invalid field.
- Field rules (shared pieces): name, email, password, mobile (10 digits in, `+1XXXXXXXXXX` out), OTP, DOB (role aware), terms, address (line1, city, state, zip, optional landmark), description, photos, fixed price, hourly rate, hours, radius, card number, expiry, CVC, routing number, account number, file checks (type, 10 MB).
- One schema per form: sign-up, login (Open question 16), OTP, forgot password, category, services, location, details, match, review (template name when ticked), card, worker area, worker services, ID, insurance, payout.
- All messages from `VALIDATION_MESSAGES`, verbatim. Date checks ("not in the future", "18 or older", "not in the past") use today's date at validation time, never at render.

### 7. Analytics (`src/lib/analytics.ts`)

- `track(eventName, props)` where `eventName` is a union of the exact PRD event names (list under Analytics). Logs to the console in a format T11 can extend (for example `[analytics] event_name {…}`).
- The props type includes `role`, `device` and `source` (PRD: "Each event carries source (search, ad, referral, direct), device type and role"). Filling them is T11.

## Behaviour and rules

1. "All data goes through `src/lib/mock/services.ts`. UI code never imports seed data directly." (AGENTS.md) This applies to `/dev/mock` too.
2. "Screens call only these async service functions; each returns a Promise with a 400–800 ms simulated delay, so loading states are real and the swap to HTTP calls later touches only `lib/mock`." (Tech Spec)
3. "All domain types live in `lib/types.ts` and mirror the Android apps' fields." "Never invent a new colour, font size, data shape or duplicate component." (Tech Spec)
4. Constants: "`constants.ts` # categories, sub-services, statuses". "Copy and labels live in `src/lib/constants.ts`." (Tech Spec, AGENTS.md)
5. "Same data as the apps. Categories, fields and statuses match the Android apps so the backend stays shared." (PRD)
6. Mock auth table (Tech Spec): Google/Facebook → demo dialog, "returns a user with `authProvider` set; new users then complete mobile, DOB and Terms". "Email sign-up: Creates the user in the store; an email already in seed data returns the 'already have an account' error". "Login: Any seeded email with any password succeeds; unknown email returns 'No account found'". "OTP: Code `123456` always succeeds; any other code fails". "Forgot password: Always shows the 'Check your email' success screen". "Session: Stored in the Zustand session store (persisted); logout clears session, keeps seed data".
7. "`jobs.accept` fails with 'This job was just taken' when the job is no longer open (to demonstrate first come, first served)." "The Job Board is first come, first served." (Tech Spec, AGENTS.md)
8. "`workers.uploadDocument` returns `under_review`; a dev-only 'Approve' button on the worker dashboard flips statuses to `verified` for demos." "ID and insurance status shows as 'Under review' until approved."
9. "`payments.addMethod` accepts any 16-digit number and stores only the brand and last 4 digits." "No real personal data. Uploads and card fields are UI only, and nothing is sent anywhere."
10. "Add `?mockError=1` to any URL to make the next service call reject, so error states can be shown on demand."
11. "Jobs are on demand, with no date or time picker." `Job` has no date/time field beyond `createdAt`/`completedAt`.
12. "Hourly jobs take a rate plus a number of hours." `amount` is "fixed total or hourly rate"; `hours` is "required when hourly, 1 to 12".
13. "One role per account." "US addresses only." "Date of birth is required for both roles, and workers must be 18 or older." (AGENTS.md)
14. "Customer is charged on completion, and there are no refunds." No refund field or service.
15. Validation: "Each form has one Zod schema in `lib/validation`; errors show under the field on blur and on submit, and the first invalid field gets focus." Every rule and message in the "Validation rules" table, verbatim. "Price limits, hour limits and the radius range are provisional values for the demo."
16. "Validate with the shared Zod schemas in `lib/validation`; never inline ad-hoc validation." "Schemas shared between forms and mock services."
17. Stores: "Zustand with `persist` (localStorage) — Holds mock session, job draft and worker onboarding progress." "The job draft is saved in the browser at every step and attached to the account at sign-up, so nothing typed is lost." "Back never clears entered data."
18. "Sessions persist for 30 days on the same device unless the user logs out." (PRD)
19. Seed counts and mixes exactly as in the seed table; demo logins "customer `demo.customer@choresforme.test`, worker `demo.worker@choresforme.test`, any password".
20. "Every data screen ships four states: loading, empty, error and success." "Errors never clear typed input." (applies to `/dev/mock`)
21. "Do not add libraries without approval." No `@hookform/resolvers`, no `uuid`, no date library.
22. "Server components are the default. Add `'use client'` only for interactive flows, forms and stores." Stores, services and the dev panels are client-side.
23. "No development build names visible" (PRD). `/dev/mock` is noindex and unlinked, like `/styleguide`.
24. Analytics: "call `track(eventName, props)` from `src/lib/analytics.ts`, using the event names in the PRD 'Funnel analytics' section exactly." "`lib/analytics.ts` that logs events to the console. Swappable later for GA4 or PostHog."

## Analytics

T3 fires **no** events. It defines the typed event names, verbatim from the PRD:

- Customer: `landing_view`, `job_builder_start`, `category_selected`, `services_selected`, `address_entered`, `details_entered`, `match_choice`, `signup_started`, `signup_completed`, `payment_added`, `job_posted`
- Worker: `worker_page_view`, `worker_signup_started`, `worker_signup_completed`, `area_set`, `services_set`, `board_viewed`, `id_uploaded`, `insurance_uploaded`, `payout_added`, `worker_verified`, `first_job_accepted`
- Hand-off: `app_prompt_shown`, `app_prompt_clicked`, `app_first_login`

## Acceptance criteria

From the T3 Build plan row:

- [ ] Services callable from a test page; seed data loads

Global (every ticket), copied verbatim:

- [ ] `npm run lint` and `npm run typecheck` pass with no errors
- [ ] No console errors or warnings on the touched pages
- [ ] Loading, empty, error and success states render (error via `?mockError=1`)
- [ ] All interactive elements reachable by keyboard with a visible focus ring
- [ ] Only design tokens used for colour, type and spacing

Later-ticket criteria the data layer must already support (copied verbatim; T3 checks the service behaviour on `/dev/mock`, the screen checks belong to T5–T10):

- [ ] OTP `123456` verifies; any other code shows the error
- [ ] An existing email shows "You already have an account — log in"
- [ ] A worker under 18 cannot complete sign-up (sign-up schema rejects it)
- [ ] Reloading or going Back keeps every entered value (job draft store persists)
- [ ] Hourly shows the live estimated total (rate × hours) (data: `amount` × `hours`)
- [ ] Non-US or invalid ZIP addresses cannot continue (address schema)
- [ ] Pick a Worker lists only verified workers serving that category; empty state switches to Job Board (`workers.listForArea` returns only verified)
- [ ] Posting creates a job that appears on the customer dashboard and, for board jobs, on the worker board
- [ ] Save As Template creates a template that can be re-posted in one tap (`templates.save` / `templates.list`)
- [ ] Area, services, ID, insurance and payout steps save progress and can be resumed
- [ ] After uploads, statuses show "Under review" on the checklist and ID-Card (`uploadDocument` returns `under_review`)
- [ ] Accept shows "Verify to accept" until verified; the demo Approve button flips statuses (`updateOnboarding` can set `verified`)
- [ ] Accepting an already-taken job shows "This job was just taken"

T3-specific checks for QA:

- [ ] No file outside `src/lib/mock` imports `seed.ts` or the mock DB
- [ ] Every service call takes 400–800 ms and the test page shows its loading state
- [ ] With `?mockError=1`, the next call rejects and the panel shows `ErrorState`; Retry behaves as decided in Open question 15
- [ ] After a reload, session, draft, onboarding progress and created data are still there; `resetDemoData()` restores the seed
- [ ] `/dev/mock` has noindex in its robots meta and no link to it exists
- [ ] Existing T2 exports in `types.ts` and `constants.ts` are unchanged; `/styleguide` still builds
- [ ] `npm run build` passes (pipeline)

## Open questions

1. **Validation in T3.** The T3 row does not name `lib/validation`, but the spec says the schemas are "shared between forms and mock services" and the service input types come from them. The plan puts all form schemas and the resolver helper in T3. Confirm, or limit T3 to the schemas the services need (sign-up, card) and leave the rest to T5–T10.
2. **Undefined types.** `WorkerSummary`, `SignUpInput` and `CardInput` are used in signatures but not defined. Approve the proposal in Data §1 (built only from existing fields)?
3. **Sub-services.** The spec says "Exact names and sub-services from the apps" but lists only Outdoor ("e.g. Lawn Mowing, Weed Removal, Planting, Gutter Service, Other"). What are the sub-services for House Cleaning, Item Disposal and Custom? Is the Outdoor list complete? Does every category end with "Other"?
4. **Job status labels.** The PRD gives verification labels but no display text for `open`, `accepted`, `in_progress`, `completed`, `cancelled`. Use "Open", "Accepted", "In progress", "Completed", "Cancelled"?
5. **Brand-new customer.** Which email (for example `new.customer@choresforme.test`), and is it listed in the "Demo accounts" panel?
6. **`demo.worker` status.** Is the demo worker one of the 4 verified workers (to demo Accept) or the under-review one (to demo "Verify to accept" and Approve)?
7. **Seed cities and service area.** Which 3 US cities? And which addresses count as "outside the service area" for Step 3's "notify me" capture (the PRD lists "Which US states are served at launch" as open)?
8. **Seed images.** Job photos and worker `photoUrl`s need image files. Use empty photo arrays and initials avatars, or will the client supply images?
9. **New social users.** `loginWithProvider` returns `Promise<User>`, but `User.mobile` and `User.dob` are required and a new social user has neither yet. What does it return for a new user (a partial identity, or an incomplete user that `signUp` completes)? And which "demo identity" is prefilled in the dialog?
10. **Board area filter.** `Address` has no coordinates, so "filtered by area" and the worker radius (5–200 miles) cannot be computed. Filter by same city, same state, or ZIP? Also the board shows "distance" (PRD). Where does that come from?
11. **Direct jobs.** When a customer picks a worker, is the new job `open` (the worker still accepts) or `accepted`? Do direct jobs ever show on the board?
12. **Cancel and rate rules.** Which statuses can be cancelled? Is `stars` 1–5 and only for `completed` jobs? Does a rating update the worker's `rating`?
13. **Seed check on the test page.** No listed service returns all users or all 12 jobs, so full counts cannot be shown through services. Approve a dev-only `getSeedSummary()` next to `resetDemoData()`, or is a check through the listed calls enough?
14. **`resetDemoData()` scope.** Does it also clear the session, job draft and onboarding stores, or only restore the mock DB?
15. **`?mockError=1` timing.** "make the next service call reject". One-shot (only the first call after the URL loads fails, so Retry succeeds), or every call while the param is in the URL (Retry keeps failing until the param is removed)? The plan assumes one-shot per URL load.
16. **Login password rule.** "Any password" works for login, but the password rule is "at least 8 characters with a letter and a number". Does the login form only require a non-empty password?
17. **Missing services for later tickets.** Screens may call only the listed functions, but these needs have no service: My Jobs list for a worker (T10), mark started/completed (T10), Earnings totals and payouts (T10), edit a job before acceptance (T8), update account details (T8), Favourite Workers (PRD Step 5 and Account; no field in the data model), address autocomplete (T6/T9), "notify me" email capture (T6). Add them in T3, add them in their own ticket, or drop the feature?
18. **Card rules.** `payments.addMethod` "accepts any 16-digit number", but the card rule allows 15 digits for Amex. How is the brand detected (standard prefixes: 4 Visa, 5 Mastercard, 34/37 Amex?), and does `addMethod` accept 15-digit Amex?
19. **Smaller data gaps.** Is the profile photo on Verify ID required? Is there a minimum age for customers (the spec only says "not in the future")? Should `jobs.accept` also reject unverified workers, or is that only a UI rule? Is the sign-up "email already exists" check against seed only, or also accounts created in the demo? Should `rejectionReason` copy for the rejected seed worker come from the client?

## Orchestrator decisions (binding; resolve the open questions above)

Provisional values below are marked **[provisional]**. Keep them in `constants.ts`/`seed.ts` in one clearly named place so the client can replace them; they are logged as client open questions in PROGRESS.md.

1. **Validation:** T3 owns every form schema in `src/lib/validation` plus the hand-written Zod→RHF resolver. Messages verbatim from the spec.
2. **Undefined types:** the proposed `WorkerSummary`, `SignUpInput`, `CardInput` shapes are approved (built only from existing fields).
3. **Sub-services [provisional]:** Outdoor = Lawn Mowing, Weed Removal, Planting, Gutter Service, Other. House Cleaning = Standard Cleaning, Deep Cleaning, Move-in / Move-out, Window Cleaning, Other. Item Disposal = Furniture Removal, Appliance Removal, Yard Waste, Garage Cleanout, Other. Custom = Other only (the description carries the detail). Every list ends with "Other".
4. **Job status labels:** Open, Accepted, In progress, Completed, Cancelled.
5. **Brand-new customer:** `new.customer@choresforme.test`, listed in the Demo accounts panel.
6. **`demo.worker` is verified** (to demo Accept). The under-review and rejected states come from the other seed workers and from newly signed-up workers.
7. **Seed cities and service area [provisional]:** Austin, Dallas and Houston, TX. Served states = `['TX']`. Any other valid US state is "outside the service area" and shows Step 3's notify-me capture.
8. **Images:** jobs have empty photo arrays; workers use initials avatars (no image files).
9. **New social users:** `loginWithProvider` returns a `User` with `mobile: ''`, `dob: ''` and `phoneVerified: false`; the UI (T5) treats empty mobile/dob as "complete your profile" and finishes it through `auth.signUp`/a profile update. Demo identities [provisional]: Google → "Alex Rivera", `alex.google@choresforme.test`; Facebook → "Sam Lee", `sam.facebook@choresforme.test`.
10. **Board area filter:** same state AND the worker's categories AND a deterministic mock distance (derived from the ZIP codes, stable per job/worker pair) within `radiusMiles`. The board exposes that distance (for example `jobs.listBoard` returns jobs plus `distanceMiles`, typed as an extension of `Job`).
11. **Direct jobs:** created as `accepted` with `workerId` set; they never appear on the board.
12. **Cancel and rate:** cancel is allowed for `open` and `accepted` only. `stars` is an integer 1–5, only for `completed` jobs, once; it updates the worker's `rating` as a running average.
13. **Dev-only `getSeedSummary()`** next to `resetDemoData()`: approved; used only by `/dev/mock`.
14. **`resetDemoData()`** restores the mock DB and clears the session, job-draft and onboarding stores.
15. **`?mockError=1`** is one-shot per URL load: the first service call after the page loads with the param rejects; Retry then succeeds.
16. **Login form** only requires a non-empty password (any password works); the 8-char rule applies to sign-up only.
17. **Extra services, added in T3** (same delay and mockError rules): `jobs.listForWorker` (My Jobs), `jobs.start`, `jobs.complete`, `jobs.update` (only before acceptance), `earnings.summary(workerId)` (derived from completed jobs), `users.update(userId, patch)`, `addresses.suggest(query)` (from seed addresses), `notify.capture(email, address)` (stored in the mock DB), and Favourite Workers as `favourites.list(customerId)` / `favourites.toggle(customerId, workerId)` (stored in the mock DB; no change to the spec types).
18. **Cards:** detect the brand by prefix (4 Visa, 51–55/2221–2720 Mastercard, 34/37 Amex). Accept 16 digits for Visa/Mastercard and 15 for Amex (the validation rule wins over the "any 16-digit" note). Store brand and last 4 only.
19. **Smaller gaps:**
    - The profile photo is optional on Verify ID and required before the Chores ID-Card shows (PRD).
    - Customer DOB only has to be valid and not in the future (spec).
    - `jobs.accept` also rejects unverified workers ("Verify to accept").
    - The duplicate-email check covers every account in the mock DB.
    - Rejected seed worker `rejectionReason` [provisional]: "The ID photo was unclear. Please upload a new photo."
20. **Reset demo data link:** the Tech Spec puts it in the footer ("A 'Reset demo data' link in the footer (demo builds only)"). T3 adds a small client `ResetDemoDataButton` to the existing T2 `Footer`. Show it in every build (every build is a demo build); it confirms with a native confirm dialog, then reloads. This replaces the T2 note that put it in T5.
