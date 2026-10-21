# T9 — Product plan

Ticket row (Tech Spec Build plan): **T9 Worker onboarding** · "Why join, area + radius, services, ID, insurance, payout, checklist" · Depends on T5 · **Done when: A new worker reaches "Under review"**.

## Scope

**In**
- Switch the worker post-sign-up route to `/worker/onboarding/area` (`POST_SIGN_UP_ROUTE.worker` in `src/lib/constants.ts`; T5 decision 9). `ROLE_HOME.worker` stays `/worker/dashboard`.
- Five guarded onboarding routes, as fixed folders (same pattern as T6's `/post-job/*`): `/worker/onboarding/area`, `/services`, `/id`, `/insurance`, `/payout`.
- An onboarding layout: worker guard, minimal header with Log out, and a Footer without the mobile CTA bar.
- Your area: base address (US only) plus a 5–200 mile radius slider, shown on a token-styled map placeholder panel (orchestrator decision 1).
- Your services: pick at least one of the four categories.
- Verify ID: front and back of the photo ID (both required, labelled correctly) plus an optional profile photo. Camera or file.
- Insurance: one document, image or PDF.
- Payout account: bank routing and account numbers, UI only, demo note (decision 3).
- Per-file upload with a progress bar, "Upload failed" + retry, and the status "Under review" (decision 2).
- "Your progress" `VerificationChecklist` and the `IdCard` preview, built here; T10 reuses them (decision 5).
- Save and resume: each step saves through `workers.updateOnboarding` / `workers.uploadDocument`, the onboarding store records progress, and guards redirect to the first incomplete required step (decision 4).
- A pure helper module for step completeness and routes (shared with T10).
- The analytics trigger points listed below (T11 wires the calls; decision 8).

**Out**
- "Why join": the T4 `/workers` page is that screen (T4 decision 10). Nothing new is built.
- Sign-up itself (T5), apart from the route constant switch.
- The Jobs board ("Browse jobs (read-only)"), "Verify to accept", the demo Approve button, My Jobs, Earnings, Account, and placing the checklist and ID-Card on the dashboard. All T10.
- The "Worker account created" and "Worker verified" app prompts (T11), and every `track()` call (T11).
- Real uploads, browser-side compression, OCR or automatic ID/age checks. ID and insurance are reviewed manually and show "Under review" (AGENTS.md).
- Notifications, review-time estimates (PRD: "to confirm with the client"), and a card payout option (see Open questions).
- No map SDK, map image file or geocoding.

## Screens

| Route | Purpose | Access |
| --- | --- | --- |
| `/workers` (existing, T4) | "Why join". Its CTA goes to `/signup?role=worker`. Unchanged. | Public |
| `/signup?role=worker` (existing, T5) | Account. After sign-up or complete profile it now goes to `next`, otherwise `/worker/onboarding/area`. | Public |
| `/worker/onboarding/area` | "Your area" (Step 1 of 4): base address, radius slider, map placeholder | Worker |
| `/worker/onboarding/services` | "Your services" (Step 2 of 4): one or more categories | Worker |
| `/worker/onboarding/id` | "Verify ID" (Step 3 of 4): ID front, ID back, optional profile photo, upload rows | Worker |
| `/worker/onboarding/insurance` | "Insurance" (Step 4 of 4): one document, upload row | Worker |
| `/worker/onboarding/payout` | "Payout account" (not counted in "of 4"): routing and account number, demo note | Worker |
| `/worker/dashboard` (existing placeholder) | Where onboarding ends, and the "Browse jobs (read-only)" board in T10 | Worker |

Every guarded route uses `RequireRole role="worker"`. No session goes to `/login?next=<route>`. An unfinished social profile goes to `/signup?role=worker&next=<route>`. A customer sees the separate-accounts notice.

**Proposed step order** (decision 6; see Open question 1):
`/workers` → sign-up → **area (1/4)** → **services (2/4)** → **id (3/4)** → **insurance (4/4)** → **payout** → `/worker/dashboard`.
- From the ID step on, a secondary link "See jobs near you first" goes to `/worker/dashboard`, so the PRD's "Browse jobs (read-only)" before "★ Verify" stays one click away without a new route.
- After payout, or "Skip for now" on payout, the worker lands on `/worker/dashboard` (the board in T10).

## Components

| Component | New or existing (path) | Used on | Responsibility |
| --- | --- | --- | --- |
| `RequireRole`, `GuardLoading` | Existing `src/components/auth/require-role.tsx`, `guard-loading.tsx` | Onboarding layout | Worker guard, `next`, separate-accounts notice |
| `AuthHeader` | Existing `src/components/auth/auth-header.tsx`, extend with an optional actions slot | Onboarding layout | Skip link, logo, and a Log out control (`LogoutButton`) for onboarding |
| `LogoutButton` | Existing `src/components/auth/logout-button.tsx` | Onboarding header | Log out |
| `Footer` | Existing `src/components/layout/footer.tsx` (`showMobileCta={false}`) | Onboarding layout | Same as the job builder |
| `Stepper` | Existing `src/components/flow/stepper.tsx`, extend `GRID_COLS` with `4` | Area, services, ID, insurance | "Step N of 4" plus labels |
| `StepLayout` | Existing `src/components/flow/step-layout.tsx` | All 5 steps | Heading, Back/Continue, sticky mobile footer, aside slot (the progress panel) |
| `StepSkeleton` | Existing `src/components/flow/step-skeleton.tsx` | All 5 steps | Loading state while the profile loads |
| `ErrorState` | Existing `src/components/states/error-state.tsx` | All 5 steps | `getProfile` failure with Retry |
| `FormAlert`, `FormField`, `focus-first-error` | Existing `src/components/forms/*` | All forms | Inline submit error, field errors, first invalid field focus |
| `AddressInput` | Existing `src/components/forms/address-input.tsx` | Area | US address, mocked autocomplete |
| `SelectableCard` | Existing `src/components/flow/selectable-card.tsx` (`type="checkbox"`) | Services | Four category cards |
| `PhotoUploader` | Existing `src/components/forms/photo-uploader.tsx` (`max={1}`, `allowCamera`) | ID (profile photo) | Optional profile photo, local preview only |
| `ui/slider` | **New** shadcn primitive `src/components/ui/slider.tsx` (Radix, from the installed `radix-ui` package) | Area | Radius control |
| `ui/progress` | **New** shadcn primitive `src/components/ui/progress.tsx` (Radix, same package). See Open question 4. | Upload rows | Per-file progress bar |
| `RadiusField` | **New** `src/components/worker/radius-field.tsx` | Area | Labelled slider, 5–200, visible value read-out ("25 miles"), `aria-valuetext`, error slot |
| `AreaMapPlaceholder` | **New** `src/components/worker/area-map-placeholder.tsx` | Area | Token-styled panel (no image file): base address line and "Within N miles"; an illustrative ring that scales with the radius; a prompt before an address exists |
| `DocumentUploadField` | **New** `src/components/forms/document-upload-field.tsx` | ID (front, back), Insurance | One file: choose or take a photo, local preview (thumbnail for JPG/PNG/WebP; file tile with name for HEIC and PDF), remove, then an upload row: progress bar, "Upload failed" + Retry, status badge. Holds the `File` (PhotoUploader only holds URLs). |
| `VerificationBadge` | **New** `src/components/worker/verification-badge.tsx` | Checklist, IdCard, upload rows | `VerificationStatus` pill with icon and label (StatusBadge pattern; colour is never the only signal) |
| `VerificationChecklist` | **New** `src/components/worker/verification-checklist.tsx` | Onboarding aside (T10: dashboard) | Rows with a label, status and link to the step; the current step is marked; an `items` prop so T10 can show only ID, Insurance and Payout (PRD dashboard) |
| `IdCard` | **New** `src/components/worker/id-card.tsx` | Onboarding aside (T10: Account) | Chores ID-Card from real data: name, photo or initials, Phone / ID / Insurance badges. The T4 `IdCardPreview` (marketing sample) stays unchanged. |
| `OnboardingProgressPanel` | **New** `src/components/worker-onboarding/onboarding-progress-panel.tsx` | All 5 steps (aside) | "Your progress" checklist plus IdCard. Desktop: right column. Tablet: above the form. Mobile: collapsed disclosure at the top ("Your progress · N of 5 done") |
| `OnboardingStepRoute` | **New** `src/components/worker-onboarding/onboarding-step-route.tsx` | All 5 pages | Stays mounted for the route: `useRevisitKey`, loads `workers.getProfile`, runs the step guard, records `currentStep`, renders loading / error / step |
| `AreaStep`, `ServicesStep`, `IdStep`, `InsuranceStep`, `PayoutStep` | **New** `src/components/worker-onboarding/*-step.tsx` | Each page | One React Hook Form per step with the existing Zod schema |
| `worker-onboarding.ts` | **New** `src/lib/worker-onboarding.ts` | Steps, guard, T10 | Pure helpers: `isOnboardingStepComplete(profile, step)`, `firstIncompleteRequiredStep`, `firstIncompleteStep` (resume target for T10), `onboardingStepRoute(step)`, `isUnderReviewReached(profile)` |
| Onboarding layout + pages | **New** `src/app/worker/onboarding/layout.tsx`, `src/app/worker/onboarding/{area,services,id,insurance,payout}/page.tsx` | — | Guard and shell; each page has `export const instant = false` with a comment, `noindex` metadata and a title from constants |

## Data and services

**Types** (`src/lib/types.ts`, no changes): `WorkerProfile`, `VerificationStatus`, `Address`, `CategoryId`, `DocumentKind` (`id_front | id_back | insurance`), `OnboardingStep` (`area | services | id | insurance | payout`), `OnboardingProgress`, `User` (`firstName`, `lastName`, `phoneVerified`, `photoUrl`), `ServiceErrorCode` (`UPLOAD_FAILED`, `INVALID_INPUT`, `MOCK_ERROR`).

**Mock services** (`src/lib/mock/services.ts`; no changes proposed, except Open question 6):
- `workers.getProfile(userId)` on every step load. It drives the form defaults, the checklist and the IdCard.
- `workers.updateOnboarding(userId, patch)`:
  - Area: `{ baseAddress, radiusMiles }`.
  - Services: `{ categories }`.
  - Payout: `{ payoutAdded: true }`. The bank numbers are validated, then discarded. Nothing else is stored or sent.
- `workers.uploadDocument(userId, kind, file)`: `id_front`, `id_back` and `insurance`, one call per file. It validates the file, drops it and returns `under_review`, and sets `idStatus` / `insuranceStatus` to `under_review`.
- The session user comes from the session store (`useSessionStore`): name and `phoneVerified` for the IdCard.

**Store** (`src/lib/store/onboarding-store.ts`, existing): `byUser[userId] = { completedSteps, currentStep }`.
- `markStepComplete(userId, step)` after each successful save or upload.
- `setCurrentStep(userId, step)` on each step visit, so T10 can offer "Continue where you left off".
- `useOnboardingHydrated()` before guards run.

**Zod schemas** (`src/lib/validation/worker.ts`, existing; no new schemas):
- `workerAreaSchema`: `baseAddress` (`addressSchema`) and `radiusMiles` (`radiusSchema`, 5–200).
- `workerServicesSchema`: `categories`, at least one.
- `idDocumentsSchema`: `idFront` and `idBack` required (JPG/PNG/HEIC/WebP, max 10 MB); `profilePhoto` optional.
- `insuranceSchema`: `document` required, image or PDF, max 10 MB.
- `payoutSchema`: `routingNumber` (9 digits) and `accountNumber` (4–17 digits).
- `documentFileSchemas`: per-kind checks, also used by the mock.

**Constants** (`src/lib/constants.ts`):
- Existing: `ONBOARDING_STEPS`, `LIMITS.radiusMin/radiusMax/radiusDefault` (5/200/25), `CATEGORIES`, `VERIFICATION_STATUS_LABELS`, `VALIDATION_MESSAGES`, `SERVICE_MESSAGES.uploadFailed`, `SCREEN_STATE_COPY.uploadFailed/underReview`, `PHOTO_MIME_TYPES`, `DOCUMENT_MIME_TYPES`, `SERVED_STATES`.
- Changed: `POST_SIGN_UP_ROUTE.worker = "/worker/onboarding/area"`.
- New: `WORKER_ONBOARDING_COPY` (step labels, headings, helper lines, demo note, checklist and IdCard labels, page titles), all **[provisional]** except the verbatim spec strings.

**Helpers reused**: `isServedState` / `stateName` (`src/lib/job-builder.ts`) for the area note (Open question 7).

## Behaviour and rules

**Flow and routing**
1. "Why join" is `/workers`, with one CTA, "Create worker account" (PRD Worker flow step 1; T4 decision 10).
2. The account role is Worker. After sign-up (email or social complete-profile), go to `next` if present, otherwise `/worker/onboarding/area` (T5 decisions 9 and 10).
3. "Guarded routes redirect to `/login?next=<route>` when there is no mock session." A customer on `/worker/*` sees the "separate accounts" notice (Tech Spec routing rules).
4. Step order as proposed in Screens. The Stepper shows "Step N of 4" for area, services, ID and insurance, matching the route map labels "(1/4)…(4/4)". Payout is shown as "Payout account" and is not counted.
5. "Steps 6 to 8 [ID, insurance, payout] can be done in any order and resumed later" (PRD). So the guard enforces only area and then services: opening services without a saved area, or ID / insurance / payout without a saved area and services, redirects to the first incomplete one of those two (decision 4; Open question 2). ID, insurance and payout are open once area and services are done.
6. Back goes to the previous step. Area has no Back. Every step has "Finish later", which goes to `/worker/dashboard` and keeps what is saved. ID, insurance and payout also have "Skip for now", which goes to the next step (payout's goes to `/worker/dashboard`). Payout is "Required before the first payout, not before applying" (PRD).
7. "Progress is saved. A user who leaves mid-flow returns to where they stopped" (PRD principle 6). Each step saves on Continue and pre-fills from `getProfile` on every visit, so area, services, ID, insurance and payout "save progress and can be resumed" (acceptance). Unsaved edits on the current step are not kept when the user leaves without Continue.
8. Completion is read from the `WorkerProfile` (the source of truth), and the store mirrors it:
   - area: a valid `baseAddress` and radius;
   - services: `categories.length ≥ 1`;
   - id: `idStatus` is `under_review` or `verified`;
   - insurance: the same for `insuranceStatus`;
   - payout: `payoutAdded`.

   `rejected` counts as incomplete.
9. Each guarded page has `export const instant = false` with a comment, and its step view is keyed with `useRevisitKey` (decision 7; T8 decision 5).
10. Onboarding pages are `noindex` and stay out of the sitemap (same as the auth and builder pages).

**Your area**

11. "Base address and service radius on a map", "Same fields as the app's Choose Your City; US addresses only" (PRD).
12. The map is a "Static map image placeholder + radius slider", with no map SDK (Tech Spec). It is a token-styled panel, not an image file, showing the base address and radius (decision 1).
13. The radius is a shadcn `slider` with an accessible value read-out, 5–200 miles, default `LIMITS.radiusDefault` (25) (decision 1; T3). Error: "Choose a radius between 5 and 200 miles".
14. Address errors are verbatim: "Enter the street address", "Enter the city", "Choose a state", "Enter a 5-digit ZIP code".

**Your services**

15. "Multi-select categories: Outdoor Home Service, House Cleaning, Item Disposal, Custom", "At least one" (PRD). Error: "Choose at least one service you offer".

**Documents (ID and insurance)**

16. ID: "Photo ID front and back (correctly labelled), profile photo", "camera or file upload" (PRD). "ID requires front and back, labelled correctly" (acceptance). Errors: "Upload the front of your ID" / "Upload the back of your ID".
17. The profile photo is optional on Verify ID and required before the Chores ID-Card shows (T3 decision 19; PRD profile-photo rule). It is not uploaded (no `DocumentKind` for it) and is kept only as a local preview for the IdCard (Open question 5).
18. "ID must be valid and show the worker is 18 or older" is checked by manual review, not in the UI. DOB 18+ was already enforced at sign-up.
19. Insurance: "Required, image or PDF, max 10 MB". Error: "Upload your insurance document".
20. Uploads are UI only through `workers.uploadDocument`. Each file shows a progress bar (simulated across the mock delay), then the status "Under review". File contents are never shown beyond a local preview (decision 2; AGENTS.md rule 9).
21. Document upload states (Tech Spec Screen states):
    - Loading: "Progress bar per file".
    - Empty: "Upload prompt".
    - Error: "'Upload failed' + retry per file".
    - Success: "Status 'Under review'".

    Retry re-sends only that file. A successful file is never sent again in the same visit. Errors never clear the chosen file.
22. Upload starts on the step's primary action ("Submit for review" [provisional]) after the schema passes, not on file pick (Open question 3). When every row succeeds, an inline status (`role="status"`, no toast; T8 decision 2) says "Under review" and the primary action becomes Continue.
23. "ID and insurance status shows as 'Under review' until approved" (AGENTS.md). Revisiting a step with `under_review` or `verified` shows the status, not the upload controls. `rejected` shows the `rejectionReason` and the upload controls again ("Rejected (with reason and a re-upload button)", PRD).
24. **Done when:** once `idStatus` and `insuranceStatus` are both `under_review`, the worker has reached "Under review". "After uploads, statuses show 'Under review' on the checklist and ID-Card" (acceptance).

**Payout**

25. "Payout account (bank or card), as the app's Update Payout Account" (PRD). The spec validates only bank fields: "Routing number 9 digits, account number 4–17 digits", with errors "Enter a 9-digit routing number" / "Enter a valid account number". The MVP collects those two fields only (Open question 8).
26. UI only: the numbers are never stored, logged or sent. Only `payoutAdded: true` is saved (decision 3). Fake test values only, with a demo note [provisional]: "Demo only — don't enter real bank details. Try routing number 110000000 and account number 000123456789." The fields are `inputMode="numeric"` and `autoComplete="off"`.
27. On revisit with `payoutAdded`, show "Payout account added" [provisional] and an "Update payout account" action that reopens empty fields.

**Checklist and ID-Card**

28. `VerificationChecklist` and `IdCard` show the statuses "Not started, Under review, Verified, Rejected" (Tech Spec component notes; PRD).
29. Onboarding checklist rows: Your area, Your services, Verify ID, Insurance, Payout account. ID and insurance use the verification statuses. Area, services and payout show "Done" or "Not started" [provisional]. Each row links to its step, and the current step is marked (`aria-current="step"`). T10 uses the same component with ID, Insurance and Payout only ("Verification checklist: ID, Insurance, Payout", PRD).
30. IdCard: "Chores ID-Card with Phone, ID and Insurance". Phone comes from `user.phoneVerified` (Verified or Not started). ID and insurance come from the profile. The name follows the WorkerCard format "First L." (T6). It shows the profile photo preview when one was chosen this session, otherwise initials and a note that a profile photo is needed for the ID-Card.
31. Responsive (Tech Spec "Worker onboarding"):
    - Desktop: "Form left, 'Your progress' checklist and ID-Card preview right".
    - Tablet: "Checklist above the form".
    - Mobile: "Checklist collapsed at top".

    The IdCard preview is never removed below desktop, only rearranged: it sits inside the panel or the disclosure.

**States, errors and copy**

32. Every step renders loading (StepSkeleton), error (ErrorState with Retry when `getProfile` fails, including `?mockError=1`) and success (the form). Empty applies only to the document upload prompt.
33. The submit spinner is on the primary button. A failed save shows an inline `FormAlert` above the footer, "Something went wrong. Your progress is saved — try again" [provisional], following the job-builder pattern but with no toast (T8 decision 2). Typed input is kept. "Errors show under the field on blur and on submit, and the first invalid field gets focus."
34. Use "identity verification" in copy (fixes the current typo; PRD). Show no review time (PRD open item).
35. Touch targets are at least 44 px. No horizontal scroll at 375 px. Nothing is hidden on mobile. Desktop hover is never the only way to act. Tokens only.

## Analytics

T9 makes no `track()` calls; T11 wires them (decision 8). Event names are verbatim from the PRD. Trigger points:

| Event | Fires when | Where |
| --- | --- | --- |
| `worker_signup_started` | The worker sign-up form is first shown in a visit (`/signup?role=worker`, or "I want to earn doing chores" chosen on the picker), or a social sign-in starts with role worker | T5 sign-up (T11 wires it) |
| `worker_signup_completed` | `auth.signUp` succeeds for a worker (email), or a worker's complete-profile save succeeds (social), just before the redirect to `/worker/onboarding/area` | T5 sign-up and complete profile |
| `area_set` | `updateOnboarding` succeeds on Your area (Continue) | `AreaStep` |
| `services_set` | `updateOnboarding` succeeds on Your services | `ServicesStep` |
| `id_uploaded` | Both `id_front` and `id_back` uploads have succeeded for one submission (once, not per file) | `IdStep` |
| `insurance_uploaded` | The `insurance` upload succeeds | `InsuranceStep` |
| `payout_added` | `updateOnboarding({ payoutAdded: true })` succeeds | `PayoutStep` |

Not T9: `worker_page_view` (`/workers`, T4/T11), `board_viewed`, `worker_verified` and `first_job_accepted` (T10/T11). Props must never include file contents, file names, addresses or bank numbers.

## Acceptance criteria

From the Tech Spec, verbatim.

**Worker onboarding**
- [ ] Area, services, ID, insurance and payout steps save progress and can be resumed
- [ ] ID requires front and back, labelled correctly
- [ ] After uploads, statuses show "Under review" on the checklist and ID-Card

Not T9 (T10): "Accept shows 'Verify to accept' until verified; the demo Approve button flips statuses" and "Accepting an already-taken job shows 'This job was just taken'".

**Role selection and auth** (re-checked because of the route switch)
- [ ] After login, users land on `next` or their role's dashboard

**Global (every ticket)**
- [ ] `npm run lint` and `npm run typecheck` pass with no errors
- [ ] No console errors or warnings on the touched pages
- [ ] Loading, empty, error and success states render (error via `?mockError=1`)
- [ ] All interactive elements reachable by keyboard with a visible focus ring
- [ ] Only design tokens used for colour, type and spacing

**Ticket done when:** A new worker reaches "Under review". The path is `/workers` → "Create worker account" → sign-up → area → services → ID → insurance, after which the checklist and ID-Card show "Under review" for ID and Insurance. Checked at 1280, 1024, 768 and 375 px.

## Open questions

Each has a proposed default. The default applies unless the orchestrator decides otherwise.

1. **Step order vs "Browse jobs (read-only)".** The PRD puts Browse jobs between services and ID. The route map numbers area, services, ID and insurance 1/4–4/4, and the board is T10. *Default:* area → services → ID → insurance → payout → `/worker/dashboard`. A "See jobs near you first" link to `/worker/dashboard` appears from the ID step on. *Alternative:* Services Continue goes to `/worker/dashboard`, and the T10 checklist leads into ID. That is closer to the PRD order, but T9's Done-when then depends on T10.
2. **Guards vs "any order".** Decision 4 says guards go to the first incomplete step. The PRD says ID, insurance and payout can be done in any order. *Default:* guards enforce only area, then services. ID, insurance and payout are freely reachable once those two are saved.
3. **When files upload.** *Default:* on the step's primary action, after validation, with one row per file uploaded in parallel. This avoids flipping the ID status on a front-only upload, and a one-shot `?mockError=1` fails one row, which shows the per-file retry. *Alternative:* upload as soon as each file is picked.
4. **Progress bar primitive.** *Default:* shadcn `progress` (Radix `react-progress`, already in the installed `radix-ui` package; no new dependency, as with `slider`), with a percentage that is simulated during the 400–800 ms mock call and reaches 100% when it resolves. *Alternative:* native `<progress>` styled with tokens.
5. **Profile photo storage.** No `DocumentKind` exists for it, and object URLs break on reload (T6/T7 precedent). *Default:* keep it as an in-memory preview for this tab only, with no `users.update({ photoUrl })`. The IdCard falls back to initials with a "Add a profile photo" note after a reload. Optional, never blocks Continue.
6. **ID status after a single side.** `uploadDocument('id_front')` already sets `idStatus = under_review`. If the back then fails and the worker leaves, a reload reads "Under review". *Default:* no mock change. In the visit, the step stays incomplete until both rows succeed. The leftover edge case only occurs after a forced `?mockError` and is accepted for the demo. *Alternative (needs approval):* the mock flips `idStatus` only once both sides are on record.
7. **Worker base address outside `SERVED_STATES`.** The PRD says only "US addresses only" for workers. *Default:* any US state is accepted. A non-blocking note says jobs may not appear there yet [provisional]. There is no notify-me capture.
8. **Payout fields.** The PRD says "bank or card". The spec validates only routing and account numbers. *Default:* bank account only (routing number, account number). No account holder name, account type or confirm field. The card option is post-MVP and logged for the client.
9. **Radius slider step.** Not specified. *Default:* steps of 5 miles (5–200), arrow keys ±5, Page Up/Down ±25. The read-out says "N miles". There is no separate number input.
10. **Landmark on the worker address.** `AddressInput` shows an optional landmark. *Default:* keep it unchanged (optional, saved if given). No component change.
11. **Checklist labels for non-verification rows.** *Default:* "Done" / "Not started" [provisional] for area, services and payout. Payout is labelled "Payout account", with the PRD line "Required before your first payout" [provisional].
12. **Re-upload while "Under review".** *Default:* not offered. Upload controls return only on `rejected`. The PRD's Account "Update Document" / "re-upload documents" is T10.
13. **Log out and exit in the onboarding shell.** *Default:* `AuthHeader` gets an optional actions slot holding `LogoutButton`. "Finish later" on each step goes to `/worker/dashboard`. The side nav is not shown during onboarding (focused flow, like the job builder).
14. **Worker login with unfinished onboarding.** The routing rule says "After login, users go to `next` if present, else to their role's dashboard". *Default:* unchanged; T10's dashboard checklist offers "Continue where you left off" via `firstIncompleteStep` and the store's `currentStep`. T9 adds no login redirect.
15. **Editing from the dashboard.** The T10 board empty state links to "edit area and services". *Default:* the onboarding pages double as edit pages (pre-filled) and Continue keeps the normal order. No `?from=` return path in T9; T10 may add one.
16. **IdCard rating.** *Default:* the T9 preview shows no rating or job count (a new worker has 0). T10 decides for Account.
17. **Provisional copy** for client approval: step headings and helper lines, Stepper labels, "Submit for review", "See jobs near you first", "Finish later", "Skip for now", the map placeholder text, the out-of-area note, the upload prompt and file tile text, the payout demo note and "Payout account added", the checklist "Done" / "Not started" labels, the IdCard photo note, the save error line, and the page titles.

## Orchestrator decisions (binding)

1. All 17 open questions above are resolved with their proposed defaults, **except Q6**.
2. **Q6 is overridden:** change the mock so that `workers.uploadDocument` sets `idStatus` to `under_review` only once both `id_front` and `id_back` have been uploaded for that user. A single side leaves it `not_started`; record which sides are in the mock DB. Insurance is unchanged.
3. **Edits to existing files, approved:** an optional actions slot on `AuthHeader`, and a 4-column option in Stepper's `GRID_COLS`. Both are small, scoped extensions.
4. **New primitives approved:** shadcn `slider` and `progress`, both Radix-based and using the installed `radix-ui` package. If either pulls in a non-Radix package, stop and report it.
5. The worker post-sign-up route constant switches to `/worker/onboarding/area`.
