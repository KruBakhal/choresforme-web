# T7 — Product plan

Ticket row (Tech Spec, Build plan): **T7 Job builder 6–8**. Scope: "Review with inline sign-up, Payment, Confirmation, Save As Template". Depends on: T5, T6. Done when: "A guest can post a job end to end".

T7 finishes the customer job builder. A guest who has finished steps 1–5 signs up or logs in inline on Review (step 6), chooses or adds a card on Payment (step 7), posts the job, and lands on Confirmation (step 8) with the app prompt. The orchestrator decisions in the brief (1–9) are binding and are referred to below as "decision N".

## Scope

**In**

- Three fixed routes under the existing `src/app/post-job/layout.tsx`: `/post-job/review`, `/post-job/payment`, `/post-job/confirmation`. Each page exports `instant = false`, `noindex` metadata, and renders its client view inside `<Suspense>`, as the T6 step pages do.
- Review (step 6): `ReviewSummary` with Edit links back to steps 1–5, the Save As Template checkbox and name, and an inline auth card. The card shows sign-up or login for a guest, the complete-profile form for an unfinished social customer, and the Post card ("Continue to payment") for a customer.
- Payment (step 7): saved methods from `payments.listMethods`, an "Add a new card" form through `payments.addMethod` (brand and last 4 only), the order summary, and the note "charged on completion, no refunds". Posting runs `jobs.create`, then `templates.save` when the box is ticked, then clears the draft and goes to Confirmation (decisions 2, 3 and 5).
- Confirmation (step 8): the posted job summary (read only), what happens next, the `AppPrompt`, and the next actions (decision 4).
- `AppPrompt`, built once and reusable by T11 on the worker dashboard: device-aware, with dismiss for 7 days (decision 4).
- Guards: `RequireRole role="customer"` on Payment and Confirmation (decision 6), the draft guard on Review and Payment, and the Confirmation fallback (Open question 14).
- Small extensions to existing pieces, with no duplicates (see Components): an Edit-link return path on the T6 steps, a `templateName` field in the job-draft store, and optional "switch mode" callbacks on `LoginForm` and `SignUpForm`.
- Copy in `src/lib/constants.ts` (extend `JOB_BUILDER_COPY` with `meta.review|payment|confirmation`, `review`, `payment` and `confirmation`; add `APP_PROMPT_COPY`). Provisional copy is marked as such.

**Out**

- Firing analytics events. T11 wires all of them (decision 8); T7 only keeps clear trigger points (see Analytics).
- The real customer dashboard, Re-post of a template in one tap, Favourite management and job photo placeholders (T8). The worker board that shows posted board jobs (T10). The worker-dashboard placement of `AppPrompt` and its events (T11).
- A toast library (no sonner). Radix Toast is not added in T7 either (decision 7, Open question 16).
- Real payments: no charge, no tokenisation, no payment SDK, and nothing leaves the browser (AGENTS rules 1 and 9).
- PRD deferrals: refunds and disputes, scheduling (no date or time picker), tipping, an iPhone app.
- Earlier minor issues listed in PROGRESS.md (T12), including the T3 Amex CVC ordering note in `src/lib/validation/payment.ts:52`.

## Screens

| Route | Purpose | Access |
| --- | --- | --- |
| `/post-job/review` | Step 6 Review & Post: summary with Edit links, Save As Template, then sign up or log in inline, or continue to Payment | Public (guest or customer). A worker session sees the separate-accounts notice (existing `JobBuilderGate`). Draft guard: steps 1–5 complete |
| `/post-job/payment` | Step 7 Payment: choose a saved card or add one, read the charge rule, post the job | Customer (`RequireRole`). Draft guard: steps 1–5 complete and Review passed |
| `/post-job/confirmation` | Step 8 Confirmation: job posted, what happens next, app prompt, next actions | Customer (`RequireRole`). Needs `?job=<id>` for a job owned by this customer, otherwise the fallback (Open question 14) |

All three use the existing frame: `AuthHeader`, Stepper ("Step 6/7/8 of 8"), `StepLayout` (where it fits) and `Footer showMobileCta={false}`.

## Components

| Component | New or existing (path) | Used on | Responsibility |
| --- | --- | --- | --- |
| Review, Payment and Confirmation pages | New (`src/app/post-job/{review,payment,confirmation}/page.tsx`) | Steps 6–8 | Server component: `metadata` (noindex), `instant = false`, client view in `<Suspense>` with `StepSkeleton` |
| `ReviewStep` | New (`src/components/post-job/review-step.tsx`) | Step 6 | Reads the draft, renders `ReviewSummary`, `SaveTemplateField` and `ReviewAuthPanel`, validates `reviewSchema` on Continue, saves the template choice, `completeStep(6)`, then goes to Payment |
| `ReviewSummary` | New (`src/components/flow/review-summary.tsx`, Tech Spec inventory) | Step 6 (editable), step 8 (read only) | Sections Category, Services, Where, Details (description, photo count, price, estimated total), Who. Each section has an "Edit" link to its step (`?from=review`) when editable. Takes a draft or a posted `Job` |
| `ReviewAuthPanel` | New (`src/components/post-job/review-auth-panel.tsx`) | Step 6 | Guest: a Sign up / Log in switch that embeds `SocialButtons role="customer"` plus `SignUpForm role="customer"` or `LoginForm`. Incomplete social customer: `CompleteProfileForm`. Customer: the Post card ("Signed in as …", "Not you? Log out", Continue to payment). It never redirects (decision 1) |
| `SaveTemplateField` | New (`src/components/post-job/save-template-field.tsx`) | Step 6; a name-only variant on step 8 | Checkbox "Save as template"; when ticked, a required name field (3–40 characters, "Name this template") |
| `PaymentStep` | New (`src/components/post-job/payment-step.tsx`) | Step 7 | Loads methods (four states), the method choice, the card form, the charge note, the order summary, and the post sequence (rules 22–27) |
| `PaymentMethodPicker` | New (`src/components/job/payment-method-picker.tsx`) | Step 7; T8 Account may reuse | Radio group of saved methods ("Visa ending 4242") plus "Add a new card" |
| `CardFields` | New (`src/components/forms/card-fields.tsx`) | Step 7; T8 Account may reuse | Card number (live brand label), expiry MM/YY, CVC; values live only in form state |
| `ConfirmationStep` | New (`src/components/post-job/confirmation-step.tsx`) | Step 8 | Loads the job (`jobs.get`), checks ownership, shows `ReviewSummary` read only, what happens next, the template status or offer, `AppPrompt`, and the actions |
| `AppPrompt` | New (`src/components/layout/app-prompt.tsx`, Tech Spec inventory) | Step 8; T11 worker dashboard | Props: `app` (`customer` / `worker`), `message`, and optional `onShown` / `onInstallClick` for T11. Android: message plus a Play Store button (`PLAY_STORE_CUSTOMER_URL` for the customer app). Elsewhere: "We'll email and text you updates". Dismiss hides it for 7 days |
| Device and dismiss helpers | New (`src/lib/device.ts`: `isAndroidUserAgent(ua)`; `src/lib/app-prompt.ts`: read and write the dismiss expiry) | `AppPrompt`; T11 device prop | Client-only, after mount; storage wrapped in try/catch |
| `Stepper`, `StepLayout`, `StepSkeleton` | Existing (`src/components/flow/*`) | Steps 6–8 | Step N of 8; Back and Continue; `loading` on Continue (first real use) |
| `JobStepRoute`, `JobBuilderGate`, `useStepNavigation` | Existing (`src/components/post-job/*`) | Steps 6–7 | Draft guard and revisit key; the worker notice; focus moves to the heading on a step change. **Extend** `useStepNavigation` (or the step views) for the `?from=review` return (Open question 7), and extend the guard to require `lastStep >= 6` before Payment |
| `JobSummaryPanel` | Existing (`src/components/job/job-summary-panel.tsx`) | Step 7 (order summary) | Reused as is for the order summary with the estimate and "You're charged when the job is done." |
| `WorkerCard` | Existing (`src/components/job/worker-card.tsx`) | Step 6 Who section (optional) | Only if a non-selectable display fits; otherwise show the name plus badges as text (UI planner decides) |
| `SignUpForm`, `LoginForm`, `CompleteProfileForm`, `SocialButtons`, `LogoutButton` | Existing (`src/components/auth/*`) | Step 6 | Embedded with `onSuccess`, no redirects. **Extend** `LoginForm` and `SignUpForm` with optional `onSignUpInstead` / `onLogInInstead` callbacks so their alert actions switch the inline mode (Open question 4). `/login` and `/signup` keep their hrefs |
| `RequireRole`, `GuardLoading` | Existing (`src/components/auth/*`) | Steps 7–8 | Customer guard. Inside `/post-job` the gate shows the worker notice first, so `RequireRole`'s own mismatch view (which has its own header and `<main>`) must never render nested here |
| `FormField`, `FormAlert`, `focusFirstError` | Existing (`src/components/forms/*`) | Steps 6–8 | Labels, inline errors, inline alerts (decision 7), first-error focus |
| `Input`, `Label`, `Checkbox`, `RadioGroup`, `Button`, `Skeleton`, `Separator`, `Dialog` | Existing (`src/components/ui/*`) | Steps 6–8 | `Dialog` only through the existing social sign-in dialog |
| `LoadingState`, `EmptyState`, `ErrorState` | Existing (`src/components/states/*`) | Steps 7–8 | Methods list and job load states |
| `ExternalLink` | Existing (`src/components/marketing/external-link.tsx`) | `AppPrompt`, FAQ links | New-tab link with icon |

## Data and services

**Types** (`src/lib/types.ts`, existing; no new domain types): `JobDraft`, `Job`, `Template`, `PaymentMethod`, `CardInput`, `CardBrand`, `User`, `Session`, `WorkerSummary`, `ServiceErrorCode` (`SIGN_IN_REQUIRED`, `CARD_FAILED`, `MOCK_ERROR`, `NOT_VERIFIED`, `INVALID_INPUT`, `JOB_NOT_FOUND`).

**Services** (`src/lib/mock/services.ts`, existing; 400–800 ms delay, one-shot `?mockError=1`):

| Call | Where | Use |
| --- | --- | --- |
| `auth.signUp`, `auth.login`, `auth.loginWithProvider`, `auth.sendOtp`, `auth.verifyOtp`, `users.update` | Step 6 | Called by the embedded T5 forms; each starts or updates the session |
| `auth.logout` | Step 6 | "Not you? Log out" (keeps the draft) |
| `workers.listForArea(address, category)` | Steps 6 and 8, direct jobs only | Resolve the picked worker's name (Open question 8) |
| `payments.listMethods(userId)` | Step 7 | Saved methods (seed: `demo.customer` has Visa 4242; `new.customer` has none) |
| `payments.addMethod(userId, card)` | Step 7 | Validates with `cardSchema` and stores `{ brand, last4 }` only |
| `jobs.create(draft)` | Step 7 | Needs a customer session. Board job: `open`. Direct job: `accepted` with `workerId` (T3 decision 11). Validates with `jobPostSchema` |
| `templates.save(customerId, name, draft)` | Step 7 (after create); step 8 offer | Name checked with `templateNameSchema`; stores `job: { ...draft, savedAsTemplate: true }` |
| `jobs.get(id)` | Step 8 | Load the posted job; `JOB_NOT_FOUND` → fallback |

**Stores** (`src/lib/store`, existing):

- `useJobDraftStore`: `draft`, `patchDraft`, `completeStep`, `clear` (revokes photo URLs), `useJobDraftHydrated`, `isJobDraftEmpty`. **Change:** add a persisted `templateName?: string` beside `draft` (it is not a `Job` field, so `JobDraft` stays as the spec defines it). `clear()` resets it. `draft.savedAsTemplate` holds the checkbox.
- `useSessionStore`, `useSessionHydrated`, `selectSessionUser`, `isSessionActive`: guest, customer, incomplete or worker.
- `STORE_KEYS`: add a key for the app-prompt dismiss expiry, per app (`customer` / `worker`). `clearStores()` / "Reset demo data" also clears it (Open question 18).

**Schemas** (`src/lib/validation`):

- Existing: `reviewSchema` (savedAsTemplate + templateName), `templateNameSchema`, `cardSchema`, `detectCardBrand`, `jobPostSchema`, the auth schemas used by the T5 forms, and `zodResolver`.
- New, in `payment.ts`: `paymentSchema`, either `{ method: 'saved', methodId }` or `{ method: 'new', card: cardSchema }`. One saved method is always preselected when any exist, so no new "choose a method" message is needed.
- New, in `job.ts`: `saveTemplateSchema = z.object({ name: templateNameSchema })` for the Confirmation offer.

**Helpers** (existing `src/lib/job-builder.ts`): `firstIncompleteStepBefore`, `stepRoute`, `estimatedTotal`, `formatUsd`, `findCategory`, `workerDisplayName`, `revokePhotoUrls`. New: `isAndroidUserAgent`, plus the dismiss read/write helpers.

**Constants** (existing): `POST_JOB_STEPS` (steps 6–8 already listed), `PLAY_STORE_CUSTOMER_URL`, `VALIDATION_MESSAGES` (`templateName`, `cardNumber`, `expiry`, `cvc`), `SERVICE_MESSAGES.cardFailed`, `SCREEN_STATE_COPY.postingJob` / `cardError` / `jobBuilderError` / `jobNotFound`, `JOB_STATUS_LABELS`, `ROLE_HOME`, `FAQ_HREF`, the FAQ ids `payment-timing` and `cancellation-fee`, `LIMITS.templateNameMin/Max`.

## Behaviour and rules

Flow and guards

1. "`/post-job/*` steps 1 to 6 are public; the draft lives in the job-draft store. Opening a later step with missing earlier data redirects to the first incomplete step." (Tech Spec) Review uses `JobStepRoute step={6}`. Payment needs steps 1–5 complete **and** `lastStep >= 6` with a valid `reviewSchema`, otherwise it goes to Review.
2. Route map: `/post-job/payment` and `/post-job/confirmation` are **Customer** routes. "guarded routes redirect to `/login?next=<route>` when there is no mock session." Use `RequireRole role="customer"` with a `StepSkeleton` loading view (decision 6). An unfinished social customer goes to `/signup?role=customer&next=…` (existing guard behaviour). Order on Payment: session guard first, then the draft guard.
3. A worker session on any step 6–8 sees the separate-accounts notice (existing `JobBuilderGate`; decision 1). This includes a worker who logs in inline on Review: the session starts and the notice replaces the page, and the draft is kept (Open question 5).
4. Back: Review → step 5, Payment → Review. Stepper: "Step 6 of 8", "Step 7 of 8", "Step 8 of 8" (T6 decision 1).
5. Every view is keyed with `useRevisitKey` (routes stay alive in a hidden Activity). Nothing uncached runs during the server render, and each page is `instant = false` (orchestrator brief).

Review & Post (step 6)

6. "Summary with edit links, Save As Template checkbox | Not logged in → sign-up or login inline on this screen, then continue" (PRD). "`ReviewSummary` | Step 6 | Sections with Edit links back to each step" (Tech Spec).
7. Edit links go to the step with `?from=review`. Continue on that step returns to Review when steps 1–5 are all complete, and otherwise continues normally (Open question 7). Existing T6 rules still apply: a category change clears the services and the picked worker, and an address change clears the worker.
8. Inline auth (decision 1): forms are embedded, never a redirect, with the role fixed to `customer`: `SignUpForm role="customer"`, `LoginForm`, and `SocialButtons role="customer"` in both modes. "Guest mode is replaced on the web by 'build the job first, create the account at checkout'" (PRD). The default mode is Sign up (Open question 3).
9. Sign-up rules from T5 apply unchanged: OTP `123456`, DOB required, Terms, "You already have an account — log in", "New social users must still add mobile, DOB and accept Terms". A new social customer completes `CompleteProfileForm` inline on Review.
10. After auth, the user stays on Review. The panel becomes the Post card, focus moves to its heading, and "Continue to payment" leads on (decision 1, Open question 1). "The job draft is saved in the browser at every step and attached to the account at sign-up, so nothing typed is lost." (PRD) The draft is unchanged by auth, and `jobs.create` uses the session's customer.
11. A guest has no path to Payment except through auth. The Continue to Payment action exists only on the Post card (Open question 2).
12. Save As Template: "Template name | Required when Save As Template is ticked, 3–40 characters | 'Name this template'" (Tech Spec). The checkbox and name are available to guests too. They are saved to the draft store as the user edits ("Reloading or going Back keeps every entered value") and validated with `reviewSchema` on Continue. The first invalid field gets focus.
13. FAQ links (T6 decision 18): Review links "When am I charged?" (`/faq#payment-timing`) and "Is there a fee to cancel a job?" (`/faq#cancellation-fee`), opening in a new tab.

Payment (step 7)

14. "Add or choose a payment method, confirm | Customer is charged on job completion; no refunds in the MVP; mock data only" (PRD). AGENTS: "The customer is charged on completion, and there are no refunds." The page states both near the Post button (decision 2), and links the payment-timing FAQ.
15. Saved methods come from `payments.listMethods`. The first is preselected; "Add a new card" opens `CardFields`. With no saved methods, the card form shows directly (Open question 9).
16. Card validation, verbatim: "Card number | 16 digits (15 for Amex) | 'Enter a valid card number'"; "Expiry | MM/YY, not in the past | 'Enter a valid expiry date'"; "CVC | 3 digits (4 for Amex) | 'Enter the security code'". Errors show on blur and on submit; the first invalid field gets focus.
17. "Uploads and payment fields are UI only; nothing leaves the browser." Card values stay in form state only: never in the draft, the session, localStorage, the URL or analytics props. `payments.addMethod` keeps "only the brand and last 4 digits". A short demo note asks for a test card (Open question 11).
18. Order summary: `JobSummaryPanel` with the estimated total ("Estimated total"; hourly shows rate × hours) and "You're charged when the job is done."
19. Screen states, verbatim: "Payment | Button spinner, 'Posting your job…' | — | Inline 'We couldn't add this card' | Confirmation page". The methods list adds Loading (skeleton rows), Empty (the card form) and Error (`ErrorState` with Retry).
20. Responsive, verbatim: "Payment | Card form left, order summary right | Stacked | Stacked, summary first".

Posting (decision 3)

21. One primary action posts the job (Open question 9). Sequence: (a) when a new card is entered, `payments.addMethod`; (b) `jobs.create(draft)` with `savedAsTemplate`; (c) when ticked, `templates.save(customerId, templateName, draft without photos)`; (d) clear the draft (`clear()` revokes the photo URLs) and `router.replace('/post-job/confirmation?job=<id>')`.
22. The button shows a spinner with "Posting your job…" and is disabled for the whole sequence, so a double post is impossible. "Errors never clear typed input."
23. An `addMethod` failure shows the inline "We couldn't add this card" (FormAlert); the typed card stays and nothing is posted. If `addMethod` succeeded but `jobs.create` failed, the new card becomes the selected saved method, so Retry does not add it twice.
24. A `jobs.create` failure shows the inline "Something went wrong. Your job is saved — try again" (the spec's job-builder copy as a FormAlert, decision 7). `SIGN_IN_REQUIRED` (expired session) sends the user to `/login?next=/post-job/payment`.
25. A `templates.save` failure never blocks posting. Confirmation then offers the template again (Open question 13).
26. A direct match is created `accepted` with `workerId`; a board job is `open` and appears on matching boards (T3 decision 11). AC: "Posting creates a job that appears on the customer dashboard and, for board jobs, on the worker board."
27. There must be no flash of a step-1 redirect between posting and Confirmation: the Payment draft guard must not fire on the cleared draft before navigation completes.

Confirmation (step 8)

28. "Job posted, what happens next, app hand-off prompt" (PRD). It shows `ReviewSummary` read only, built from the posted `Job` (with status label and photo count; the photos themselves were revoked, see Open question 17), what happens next by match type, and the template result or offer.
29. It loads the job with `jobs.get(?job)` (Loading skeleton, Error `ErrorState` with Retry). Not found, or another customer's job: "We couldn't find this job" plus "Go to my dashboard" (`/dashboard`) and "Post a job". No `?job=`: the fallback in Open question 14.
30. App prompt (PRD App hand-off): "Job posted (confirmation) | Customer | 'Get notified the moment a worker accepts — install the app' | Android users: Play Store button; iPhone and desktop: 'We'll email and text you updates'". "Never block a web action behind an install." "Detect the device … iPhone and desktop users see email and SMS updates instead of a dead link." "A dismissed prompt stays hidden for 7 days." AC: "App prompt shows the Play Store button on Android user agents and 'We'll email and text you updates' elsewhere; dismiss hides it for 7 days."
31. `AppPrompt` detects the device on the client after mount and renders nothing before that (no hydration mismatch, no flash of the wrong variant). The Play Store link is `PLAY_STORE_CUSTOMER_URL` (decision 4) and opens in a new tab. The prompt shows only with a found job.
32. Actions: "Go to my dashboard" (primary) and "Post another job" (`/post-job/category`).

Forms, states, layout

33. "Each form has one Zod schema in `lib/validation`; errors show under the field on blur and on submit, and the first invalid field gets focus." Use `focusFirstError` with `shouldFocusError: false`, as T5 and T6 do.
34. Feedback is inline `FormAlert` everywhere; no toast in T7 (decision 7, Open question 16).
35. `?mockError=1` (one-shot) shows the error of the first service call: Review → the auth call or the worker lookup; Payment → `listMethods` (`ErrorState`, Retry succeeds); Confirmation → `jobs.get` (`ErrorState`, Retry succeeds). See Open question 21 for the card error.
36. Responsive, verbatim: "Review & Post | Summary left, inline sign-up or Post card right | Stacked | Stacked"; Payment as in rule 20. Confirmation has no row; see Open question 23. No horizontal scroll at 375 px, nothing removed on mobile, touch targets at least 44 px, no hover-only actions.
37. Accessibility: "WCAG 2.1 AA: labels on every field, keyboard navigation, sufficient contrast". On a step change, focus moves to the step heading. After inline auth, focus moves to the Post card heading. The posting status is announced. The saved-method list is a radio group. The AppPrompt dismiss button has an accessible name.
38. Copy lives in `constants.ts`, only design tokens are used, and every page is `noindex` and kept out of the sitemap (T6 decision 19).

## Analytics

T7 fires **no** events (decision 8; T11 wires them). Each trigger point must be a single, clear code path (a callback or one function) so T11 can add `track()` without restructuring. Event names are exactly as in the PRD.

| Event | Trigger point in T7 code | Suggested props for T11 (plus role, device, source) |
| --- | --- | --- |
| `signup_started` | Review, Sign up mode: the first interaction with `SignUpForm` (first field change), or the social dialog opened from Sign up mode. Once per Review visit | `source: 'review_inline'`, `method: email \| google \| facebook` |
| `signup_completed` | Review: `SignUpForm.onSuccess`, or `CompleteProfileForm.onSuccess` for a new social customer | `source: 'review_inline'`, `method` |
| `payment_added` | Payment: `payments.addMethod` resolves (a new card only; choosing a saved card fires nothing) | `brand` (never digits) |
| `job_posted` | Payment: `jobs.create` resolves. Never on Confirmation load, so a reload doesn't double-count | `category`, `matchType`, `pricingType`, `estimatedTotal`, `savedAsTemplate`, `photoCount` |
| `app_prompt_shown` | `AppPrompt` `onShown`: first visible render on Confirmation (not when dismissed) | `app: 'customer'`, `placement: 'job_confirmation'`, `variant: android \| updates` |
| `app_prompt_clicked` | `AppPrompt` `onInstallClick`: the Play Store button (Android only; the other variant has no link) | `app`, `placement` |

Notes for T11: logging in inline (existing account) has no PRD event. A social sign-in on Review that creates a new customer counts as sign-up (`signup_started` when the dialog opens in Sign up mode; `signup_completed` after profile completion). Prompt dismiss and `templates.save` have no PRD event; do not add one. `app_first_login` happens in the Android app. UTM carry-through is T11.

## Acceptance criteria

**Customer job builder** (Tech Spec, verbatim; the criteria that apply to steps 6–8)

- [ ] Steps 1 to 6 work with no session; the progress bar shows the step out of the total *(step 6 in T7)*
- [ ] Reloading or going Back keeps every entered value *(step 6: the template choice and name; card fields are deliberately not kept)*
- [ ] Step 6 without a session shows inline sign-up; after sign-up, the draft is attached and the flow continues to Payment
- [ ] Posting creates a job that appears on the customer dashboard and, for board jobs, on the worker board *(the dashboard is T8 and the board is T10; in T7, verify with `/dev/mock` `jobs.listForCustomer` and `jobs.listBoard`)*
- [ ] Save As Template creates a template that can be re-posted in one tap *(Re-post is T8; in T7, verify with `/dev/mock` `templates.list`)*

**Dashboards and hand-off** (verbatim; the AppPrompt part)

- [ ] App prompt shows the Play Store button on Android user agents and "We'll email and text you updates" elsewhere; dismiss hides it for 7 days

**Role selection and auth** (verbatim; they must still pass in the inline embed)

- [ ] New social users must still add mobile, DOB and accept Terms
- [ ] OTP `123456` verifies; any other code shows the error
- [ ] An existing email shows "You already have an account — log in"

**Global (every ticket)** (verbatim)

- [ ] `npm run lint` and `npm run typecheck` pass with no errors
- [ ] No console errors or warnings on the touched pages
- [ ] Loading, empty, error and success states render (error via `?mockError=1`)
- [ ] All interactive elements reachable by keyboard with a visible focus ring
- [ ] Only design tokens used for colour, type and spacing

**Ticket done when** (Build plan): "A guest can post a job end to end."

**T7 checks from the decisions** (not AC text)

- [ ] Guest, end to end: steps 1–5 → Review → sign up inline (OTP `123456`) → stays on Review → Payment → add a card → Post → Confirmation. The draft is cleared, and the new job is `open` (board) or `accepted` (direct)
- [ ] `demo.customer`: Review shows the Post card at once; Payment preselects Visa ending 4242; posting needs no new card
- [ ] A worker who logs in inline on Review sees the separate-accounts notice; the draft is kept
- [ ] `/post-job/payment` as a guest → `/login?next=/post-job/payment`; as a customer with an incomplete draft → the first incomplete step; without passing Review → Review
- [ ] `/post-job/confirmation` with no `?job=`, and with another customer's or an unknown id, shows the agreed fallback (Open question 14)
- [ ] The stored payment method has only `id`, `brand` and `last4`; no card digits appear in localStorage, the URL or the console
- [ ] Edit link → change → Continue returns to Review with the change shown
- [ ] AppPrompt: Android UA (DevTools device emulation) shows the Play Store button; a desktop UA shows the updates text; after Dismiss and a reload it stays hidden; with the expiry set 7 days back, it shows again
- [ ] No flash of step 1 between Post and Confirmation; double-clicking Post creates one job
- [ ] Every page checked at 1280, 1024, 768 and 375 px; `npm run build` passes

## Open questions

Each has a proposed default. The default applies unless the orchestrator decides otherwise.

1. **What happens right after inline auth.** Decision 1 says "stays on Review and continues to Payment". *Default:* no auto-advance. The panel turns into the Post card ("Signed in as <name>"), focus moves to it, and one click on "Continue to payment" advances, so the user can still check the summary and the template choice.
2. **Guest's Continue.** *Default:* a guest has no Continue to Payment. On mobile the sticky footer shows Back only, and the auth card is the call to action. A short line above the auth card reads "Create an account or log in to post your job" [provisional].
3. **Default inline mode.** *Default:* Sign up (the PRD places account creation here), with a visible "Already have an account? Log in" switch. Social buttons show in both modes with the role fixed to customer.
4. **Links inside the embedded forms.** The T5 alerts link to `/login` or `/signup`, which would leave the page. *Default:* add optional `onLogInInstead` / `onSignUpInstead` callbacks to `SignUpForm` / `LoginForm` (non-breaking), so on Review the alert action switches the inline mode. "Forgot password?" goes to `/forgot-password?next=/post-job/review` (the draft is persisted).
5. **A worker account logging in inline.** *Default:* no pre-check. The login succeeds, `JobBuilderGate` shows the separate-accounts notice ("Log out and create a customer account"), and the draft is kept for after they switch.
6. **"Not you? Log out" on the Post card.** *Default:* yes. It uses `LogoutButton` with the destination `/post-job/review`. The draft is kept, and the guest auth card shows again.
7. **Return from Edit links.** *Default:* `?from=review`. When steps 1–5 are all complete, that step's Continue goes back to Review (label "Save and return to review" [provisional]); otherwise it continues to the next step. This is a small extension of the T6 navigation, not a rewrite.
8. **Picked worker's name on Review and Confirmation.** The draft holds only `workerId`. *Default:* look it up with `workers.listForArea(address, category)`. On Review, a worker who no longer qualifies has `workerId` cleared (T6 rule 25), and the guard sends the user to step 5. On Confirmation, a failed lookup falls back to "your chosen worker" [provisional].
9. **Payment interaction.** *Default:* one primary button, "Post job" [provisional], that adds the new card (if any) and then posts. The first saved method is preselected; "Add a new card" is the last option. A newly added card is always saved for next time, with no "save card" checkbox (not in the specs).
10. **Payment method on the job.** `Job` has no payment field. *Default:* the chosen method is not recorded on the job (no type change); charging on completion belongs to the real backend.
11. **Demo card note.** *Default:* a short note by the card fields: "Demo only — don't enter a real card. Try 4242 4242 4242 4242." [provisional].
12. **When and how the template is saved.** *Default:* the checkbox and name are chosen on Review (guests too, kept in the draft store as `templateName`). The template is saved right after `jobs.create` succeeds, from the posted draft **without photos** (object URLs die) and with `matchType` / `workerId` as posted. Nothing is saved if the user abandons Payment.
13. **Save As Template on Confirmation** (decision 5: "Review or Confirmation"). *Default:* Confirmation shows "Saved as template '<name>'" when it saved. When the box wasn't ticked, or saving failed (with a quiet inline note), it shows a small name-only Save As Template form (`saveTemplateSchema`, "Name this template"). The "saved / failed / none" result is kept in memory with the job id, so after a reload the offer shows unless the job says `savedAsTemplate`.
14. **Confirmation fallback** (decision 6). *Default:* the URL is `/post-job/confirmation?job=<id>` (a mock id, not personal data), so a reload works. With no `?job=`: if a draft is in progress, `router.replace` to its first incomplete step or Review; otherwise `router.replace('/dashboard')`. An unknown id, or another customer's job: "We couldn't find this job" plus "Go to my dashboard" and "Post a job".
15. **History after posting.** *Default:* `router.replace` to Confirmation, so Payment leaves the history. Browser Back from Confirmation lands on Review, whose guard sends the empty draft to step 1. Confirmation's main action is "Go to my dashboard".
16. **Toasts** (decision 7). *Default:* inline `FormAlert` everywhere in T7; Radix Toast is not added. The spec's "Toast 'Something went wrong. Your job is saved — try again'" becomes an inline alert above Post, and "any action that changes data shows a success toast" is met by the Confirmation page itself and by inline "Saved as template" text. Radix Toast (already available through the installed `radix-ui` package) stays for T10's "Job accepted" / "This job was just taken" if needed.
17. **Photos on the posted job.** `clear()` revokes the object URLs (decision 3), so the stored job's photo URLs are dead at once. *Default:* Confirmation shows the photo count, not thumbnails. T8 shows a placeholder for broken job photos (T6 decision 17).
18. **AppPrompt details.** *Default:* Android = `/Android/i` on `navigator.userAgent`, read after mount. Android shows the PRD message plus a "Get it on Google Play" button [provisional label]. Every other device shows only "We'll email and text you updates" (no install text, no dead link). Both variants have Dismiss, which stores an expiry timestamp (now + 7 days) in localStorage per app (`customer` / `worker`, so T11's worker prompt is independent). Storage errors mean "not dismissed". "Reset demo data" clears it.
19. **Order of guards on Payment.** *Default:* session first, as the routing rules say (guest → `/login?next=/post-job/payment`; after login the draft guard may then send them back to an earlier step), then the draft guard.
20. **Amount wording.** The PRD says the customer is charged on completion but doesn't say whether hourly jobs are charged the estimate or the actual hours. *Default:* Payment and Confirmation say "Estimated total" and "You're charged when the job is done. There are no refunds." [provisional], with no claim about the final amount.
21. **Showing "We couldn't add this card" on demand.** `?mockError=1` is one-shot per URL load and is used up by `payments.listMethods` on Payment. *Default:* accept this. The card error path is checked in code review, and any `addMethod` rejection (`CARD_FAILED` or `MOCK_ERROR`) shows "We couldn't add this card". No change to the T3 mock runtime.
22. **FAQ links in the flow.** *Default (from T6 decision 18):* payment-timing and cancellation-fee on Review, and payment-timing on Payment. Both open in a new tab, so a typed card isn't lost.
23. **Confirmation layout** (no row in Responsive layouts). *Default:* one centred column (about 640 px) at every width. Stepper "Step 8 of 8", "Job posted" heading, what happens next, summary, template status or offer, AppPrompt, then the actions. Same order on all widths; the UI planner refines it.
24. **What-happens-next copy** [provisional]. Board: "Your job is on the job board. Verified workers near you can see it, and the first to accept gets it." Direct: "We've sent your job to <name>. It shows as Accepted in your dashboard." Both: "We'll email and text you updates."
25. **Provisional copy** for client approval: the Review, Payment and Confirmation headings and helper text, the auth-card intro and mode switch, "Signed in as" / "Not you? Log out", the Continue labels ("Continue to payment", "Post job", "Save and return to review"), the Save As Template labels, the demo card note, the charge and no-refunds note, the what-happens-next copy, the template status text, the AppPrompt button label and dismiss label, the "your chosen worker" fallback, and the page titles.

## Orchestrator decisions (binding)

All 25 open questions above are resolved with their proposed defaults, as written. The small changes to existing code the plan lists (the `templateName` draft field, the optional `onLogInInstead`/`onSignUpInstead` callbacks, `?from=review`, the Payment guard `lastStep >= 6`, `paymentSchema` and `saveTemplateSchema`) are approved. The hand-off event names were checked against the PRD (`app_prompt_shown → app_prompt_clicked → app_first_login`) and match `ANALYTICS_EVENTS.handOff`. Provisional copy goes in `constants.ts` and is logged as a client question.
