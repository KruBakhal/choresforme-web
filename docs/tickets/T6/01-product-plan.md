# T6 — Product plan

Ticket row (Tech Spec, Build plan): **T6 Job builder 1–5**. Scope: "Category, Services, Where, Details (pricing + hours), Who; draft persistence and step guards". Depends on: T2, T3. Done when: "Steps 1–5 criteria pass".

T6 builds the first five public steps of the customer job builder at the five fixed routes from the route map. It ends on step 5, whose Continue goes to `/post-job/review`. That route shows a 404 until T7 ships.

## Scope

**In**

- Five fixed routes (orchestrator decision 1): `/post-job/category`, `/post-job/services`, `/post-job/location`, `/post-job/details`, `/post-job/match`, plus a shared `src/app/post-job/layout.tsx`. Delete `src/app/post-job/[step]/.gitkeep` and its folder.
- Draft persistence through the existing job-draft store: values are saved on Continue, on Back and while the user types (see rule 9).
- Step guards: opening a later step with missing earlier data redirects to the first incomplete step.
- `?category=<id>` on `/post-job/services` pre-selects the category and skips step 1. The links from T4 already exist.
- Shared flow components from the inventory: `Stepper`, `StepLayout`, `SelectableCard`, `AddressInput`, `PhotoUploader`, `PriceInput`, `WorkerCard`, plus a "Your job" summary panel (from the Responsive layouts table).
- Step 3: address autocomplete (`addresses.suggest`), a served-state check, and "notify me" capture (`notify.capture`) for addresses outside the service area.
- Step 4: description with a live counter; photos (UI only, object URLs, up to 5, camera capture on mobile); Fixed or Hourly price with a live estimated total.
- Step 5: Post to Job Board (the default) or Pick a Worker. Pick a Worker lists verified workers serving the area and category, with favourites first for a logged-in customer. It ships all four states.
- New Radix shadcn primitives, only as needed (orchestrator decision 2): `radio-group`, `textarea`, `select`, and `toggle-group` only if the UI planner prefers it to `radio-group` for Fixed/Hourly. `slider` is **not** needed in T6 (the worker radius is T9).
- Small helpers: a served-state check, a "first incomplete step" helper, an estimated-total helper and currency formatting. Plus a `notifyMeSchema` in `src/lib/validation/job.ts`.
- Copy in `src/lib/constants.ts` (`POST_JOB_STEPS`, `JOB_BUILDER_COPY`). Provisional copy is marked as such.
- Page metadata (a title per step).

**Out**

- Steps 6–8: `/post-job/review`, `/payment`, `/confirmation`, inline sign-up, attaching the draft to the account, Save As Template, `jobs.create`, and clearing the draft after posting (all T7).
- Edit links from Review back to the steps, and any "return to review" behaviour (T7; see Open question 14).
- Firing analytics events (T11). T6 lists the trigger points only; see Analytics.
- Favourite toggling (`favourites.toggle`). Favourites are only read in T6; managing them is T8 Account.
- Real uploads, photo compression, map SDKs, and new non-Radix libraries (no toast library, no combobox library).
- PRD deferrals: date and time scheduling ("Jobs are on demand, with no date or time picker"), price guidance, smart matching, refunds, chat.
- T2–T5 minor issues in PROGRESS.md (T12).

## Screens

| Route | Purpose | Access |
| --- | --- | --- |
| `/post-job/category` | Step 1 Category: choose exactly one of the 4 categories | Public (guest or customer; a worker session sees the separate accounts notice, rule 4) |
| `/post-job/services` | Step 2 Services: multi-select sub-services; "Other" opens a text field. `?category=<id>` pre-selects the category and skips step 1 | Public |
| `/post-job/location` | Step 3 Where: US address with autocomplete and optional landmark; outside the service area → "notify me" email capture | Public |
| `/post-job/details` | Step 4 Details: description, optional photos, Fixed Price or Hourly (rate + hours) with the estimated total | Public |
| `/post-job/match` | Step 5 Who: Post to Job Board (default) or Pick a Worker; Continue → `/post-job/review` (404 until T7) | Public |

Every step has the same frame: the Stepper ("Step N of total"), a step heading, the form, Back and Continue, and the "Your job" summary panel.

## Components

| Component | New or existing (path) | Used on | Responsibility |
| --- | --- | --- | --- |
| Post-job layout | New (`src/app/post-job/layout.tsx`) | All steps | Minimal flow header (reuse the `AuthHeader` pattern: skip link + `Logo`), `<main id="main">`, `Footer showMobileCta={false}` so the "Post a job" bar never covers Continue. The UI planner confirms |
| Step pages | New (`src/app/post-job/{category,services,location,details,match}/page.tsx`) | Each step | Server component: `metadata` plus the client view inside `<Suspense>` with a static skeleton fallback |
| Step views | New (`src/components/post-job/*-step.tsx`, one per step) | Each step | Client form (one RHF instance per step), reads and writes the draft, runs the guard |
| `Stepper` | New (`src/components/flow/stepper.tsx`) | All steps; reused by T7 and T9 | Progress bar plus "Step N of total" and the step labels. Compact on mobile |
| `StepLayout` | New (`src/components/flow/step-layout.tsx`) | All steps; T7, T9 | Heading, form slot, summary slot, Back and Continue (Continue has a `loading` state); sticky Continue footer on mobile |
| `SelectableCard` | New (`src/components/flow/selectable-card.tsx`) | Step 1 (single), step 2 (multi), step 5 match type (single) | Card with radio or checkbox semantics, selected state, 44 px+ target, keyboard support. Built on `radio-group` / `checkbox` |
| `JobSummaryPanel` ("Your job") | New (`src/components/job/job-summary-panel.tsx`) | All steps; T7 may reuse | Live summary of the draft plus the current step's values, with the price estimate. Sticky right at desktop, a panel above Continue at tablet, a collapsible bar at mobile |
| `AddressInput` | New (`src/components/forms/address-input.tsx`) | Step 3; reused by T9 worker area | Line 1 with mocked autocomplete (`addresses.suggest`), city, state (`select` of `US_STATES`), ZIP, optional landmark. Choosing a suggestion fills every field. US only. Accessible combobox, hand-built (no library) |
| `NotifyMeForm` | New (`src/components/job/notify-me-form.tsx`) | Step 3 | Shown when the state is not served: email (pre-filled from the session if any) → `notify.capture(email, address)`; button spinner, inline error, success message |
| `PhotoUploader` | New (`src/components/forms/photo-uploader.tsx`) | Step 4; reused by T9 ID and insurance | Previews, remove, a 5-photo limit, type and size checks, and "Take photo" (camera) on mobile. Creates object URLs and revokes them on remove |
| `PriceInput` | New (`src/components/job/price-input.tsx`) | Step 4 | Fixed or Hourly toggle, amount input (USD), hours selector (1–12 in 0.5 steps), live estimated total (rate × hours) |
| `WorkerCard` (+ skeleton) | New (`src/components/job/worker-card.tsx`) | Step 5; T8 favourites | Initials avatar (no photo files), name, rating and jobs completed, ID-Card badges (Phone, ID, Insurance), a "Favourite" tag, selectable (single) |
| `FormField`, `FieldError`, `FormAlert`, `focusFirstError` | Existing (`src/components/forms/*`) | All steps | Labels, errors under the field, the inline alert, first-error focus in DOM order |
| `Input`, `Label`, `Checkbox`, `Button`, `Skeleton`, `Separator`, `Sheet`, `Accordion` | Existing (`src/components/ui/*`) | All steps | `Sheet` or `Accordion` is an option for the mobile summary bar (UI planner decides) |
| `RadioGroup`, `Textarea`, `Select` (+ `ToggleGroup` optional) | New shadcn Radix (`src/components/ui/*`) | Steps 1, 3, 4, 5 | Themed with tokens; 44 px targets |
| `LoadingState`, `EmptyState`, `ErrorState` | Existing (`src/components/states/*`) | Step 5 list; hydration skeletons | The four states |
| `SeparateAccountsNotice` | Existing (`src/components/auth/separate-accounts-notice.tsx`) | All steps, for a worker session | Same "Log out and create a customer account" action as T5 decision 6 |
| `CATEGORY_ICONS`, `CATEGORY_DESCRIPTIONS` | Existing (`src/lib/constants.ts`) | Step 1 cards | Reuse; do not copy. `CategoryTile` is a link card, so step 1 uses `SelectableCard` instead |
| `useRevisitKey` | Existing (`src/lib/hooks/use-revisit-key.ts`) | Every step view | Key the step view so a revisit remounts it and re-reads the draft |

## Data and services

**Types** (`src/lib/types.ts`, existing; no new types expected): `JobDraft` (`Partial<Omit<Job, 'id'|'customerId'|'status'|'createdAt'>> & { lastStep: number }`), `Address`, `CategoryId`, `PricingType`, `MatchType`, `WorkerSummary`, `Session`.

Draft fields per step:

| Step | Draft fields written | Completeness check (existing schema) |
| --- | --- | --- |
| 1 | `category` | `categorySchema` |
| 2 | `subServices`, `otherText` | `servicesSchema` (with `category`; sub-services must belong to the category) |
| 3 | `address` (with optional `landmark`) | `locationSchema` **and** state in `SERVED_STATES` (Open question 3) |
| 4 | `description`, `photos`, `pricingType`, `amount`, `hours` | `detailsSchema` |
| 5 | `matchType`, `workerId` | `matchSchema` |

`lastStep` is raised with `completeStep(n)` on a valid Continue and never lowered.

**Services** (`src/lib/mock/services.ts`, existing; all have a 400–800 ms delay and the one-shot `?mockError=1`):

| Call | Step | Use |
| --- | --- | --- |
| `addresses.suggest(query)` | 3 | Autocomplete for 2+ characters, up to 5 results (debounced; the UI planner sets the delay) |
| `notify.capture(email, address)` | 3 | "Notify me" for an address outside the service area (orchestrator decision 4) |
| `workers.listForArea(address, category)` | 5 | Verified workers serving that category whose area covers the address, sorted by rating |
| `favourites.list(customerId)` | 5 | Only with an active **customer** session (orchestrator decision 5). Used to sort and tag; see rule 23 |

**Stores** (`src/lib/store`, existing):

- `useJobDraftStore`: `draft`, `patchDraft`, `completeStep`, `clear`, `setDraft`; `useJobDraftHydrated()`; `isJobDraftEmpty()`.
  - **Change needed for photos** (orchestrator decision 3): object URLs do not survive a reload. The persisted copy must **not** keep `photos`: exclude them in `partialize` while keeping them in memory for the tab's lifetime. After a reload the draft has no photos, and step 4 shows a short note (provisional copy). Revoke object URLs on remove, on `clear()` and when photos are replaced.
- `useSessionStore` / `useSessionHydrated()` / `isSessionActive()` / `selectSessionUser`: to know whether the visitor is a logged-in customer (favourites, notify-me email prefill) or a worker (rule 4).

**Schemas** (`src/lib/validation`, existing): `categorySchema`, `servicesSchema`, `locationSchema` (`addressSchema`), `detailsSchema`, `matchSchema`, `photoFileSchema` / `PHOTO_FILE_RULE`, `zodResolver`. **New:** `notifyMeSchema = z.object({ email: emailSchema })` in `job.ts` (spec rule: never validate inline).

**Constants** (`src/lib/constants.ts`): existing `CATEGORIES`, `OTHER_SUB_SERVICE`, `LIMITS`, `US_STATES`, `SERVED_STATES`, `MATCH_TYPE_LABELS`, `PRICING_TYPE_LABELS`, `VALIDATION_MESSAGES`, `SCREEN_STATE_COPY.pickWorkerEmpty`, `SCREEN_STATE_COPY.jobBuilderError`, `PHOTO_MIME_TYPES`, `HEADER_ACTIONS.postJob`, `postJobForCategory`. **New:** `POST_JOB_STEPS` (number, route and label for all 8 PRD steps: Category, Services, Where, Details, Who, Review & Post, Payment, Confirmation) and `JOB_BUILDER_COPY` (headings, helper text, buttons, summary labels, notify-me copy, photo note, page titles) [provisional].

**Helpers** (new, small, pure; the engineer picks the paths, for example `src/lib/job-builder.ts`):

- `isServedState(state)`: `SERVED_STATES.includes(state)`. T3 has the constant only.
- `firstIncompleteStep(draft)`: returns the route of the first step whose check above fails, or null.
- `estimatedTotal(pricingType, amount, hours)` and `formatUsd(value)`. The mock layer has a private `jobTotal`; do not import mock internals into the UI.

## Behaviour and rules

Flow and routing

1. "`/post-job/*` steps 1 to 6 are public; the draft lives in the job-draft store. Opening a later step with missing earlier data redirects to the first incomplete step." (Tech Spec) The guard runs on the client only after `useJobDraftHydrated()` is true, uses `router.replace`, and shows the step skeleton until then, so nothing redirects or flashes before hydration. Completeness = the schema checks in the Data table. Opening the current or an earlier step is always allowed.
2. "`/services/[category]` and category tiles link to `/post-job/services?category=<id>`, which pre-selects the category and skips step 1." (Tech Spec) "Skipped when the user arrives from a category tile or service page" (PRD). A valid id sets `draft.category`. An invalid id is ignored; with no category in the draft, the guard sends the user to step 1. Changing the category from an existing draft: Open question 5.
3. "A progress bar shows the step out of the total." "Steps 1 to 6 work with no session; the progress bar shows the step out of the total" (PRD, Tech Spec). Total: Open question 1.
4. One role per account: "A logged-in user who clicks the other role's CTA sees a short message explaining the accounts are separate." (PRD) "Post a job" is a customer CTA, so a worker session on any `/post-job/*` step sees `SeparateAccountsNotice` (Open question 4 confirms the scope).
5. Step 5 Continue goes to `/post-job/review` (404 until T7; orchestrator decision 1).
6. Header and Hero "Post a job" go to `/post-job/category` (existing). An existing draft is kept and its values show; there is no auto-jump to `lastStep` (Open question 6).

Draft persistence

7. "The job draft is saved in the browser at every step and attached to the account at sign-up, so nothing typed is lost." "Back never clears entered data." "Progress is saved. A user who leaves mid-flow returns to where they stopped." (PRD)
8. AC: "Reloading or going Back keeps every entered value". Photos are the documented exception: they are kept in memory for the session and dropped on reload, with a note (orchestrator decision 3).
9. To meet rule 8, each step saves its current form values to the draft as the user edits (debounced), on Back (without validating) and on Continue (validated, then `completeStep(n)`). Values that are not valid yet may be saved; the guard treats that step as incomplete.
10. Each step's form takes its default values from the draft when it mounts. Every step view is keyed with `useRevisitKey()` so a client-side revisit (Cache Components keeps routes alive in a hidden Activity) remounts it and reads the latest draft, with no stale values or stuck spinners.
11. "Reset demo data" in the Footer already clears the draft (`clearStores`). After the reload, the guard sends the user to step 1.

Step 1 Category

12. Options: "Outdoor Home Service, House Cleaning, Item Disposal, Custom". Exactly one; error "Choose a category". Select, then Continue (Open question 7).

Step 2 Services

13. "Multi-select sub-services … At least one; 'Other' opens a short text field." Errors: "Choose at least one service" / "Describe the other service" (3–100 characters). Sub-services come from `CATEGORIES` (provisional lists per T3 decision 3). `otherText` is kept only while "Other" is selected. Custom has only "Other" (Open question 8).

Step 3 Where

14. "Address with autocomplete, optional landmark | US addresses only; outside the service area → 'notify me' email capture" (PRD). "`AddressInput` | US-only fields; autocomplete mocked from seed addresses" (Tech Spec).
15. Validation, verbatim: line 1 "Enter the street address" (3–100); city "Enter the city"; state "Choose a state" (one of the 50 states or DC); ZIP "Enter a 5-digit ZIP code". AC: "Non-US or invalid ZIP addresses cannot continue." The state is a select of `US_STATES` only, so non-US input is impossible.
16. Service area: a valid address whose state is not in `SERVED_STATES` (provisional `['TX']`) shows `NotifyMeForm` instead of continuing (Open question 3). The email is validated with `notifyMeSchema` ("Enter a valid email address"). Success shows a confirmation and the user can change the address. The address is not saved as complete.
17. Autocomplete is optional: manual entry always works. Loading, empty and error behaviour of the suggestion list: Open question 10.

Step 4 Details

18. "Description, photos (optional, up to 5), price: Fixed Price, or Hourly with rate and number of hours | Hourly shows the estimated total (rate × hours); jobs are on demand, with no date or time picker" (PRD). AGENTS.md: "Hourly jobs take a rate plus a number of hours."
19. Description: required, 10–500 characters, **live counter**; "Add a few words about the job (at least 10 characters)".
20. Photos (orchestrator decision 3): UI only, object URLs, nothing uploaded. JPG/PNG/HEIC/WebP, max 10 MB each, up to 5. Errors: "You can add up to 5 photos" / "Photos must be under 10 MB" / "Photos must be JPG, PNG, HEIC or WebP". Camera capture on mobile via `accept` / `capture`. Note: `capture` alone opens only the camera on Android, so offer both "Take photo" (`capture="environment"`) and "Choose photos" (`multiple`, no `capture`). Remove is available on every photo, by keyboard too (no hover-only action).
21. Price: Fixed "Enter a price between $5 and $5,000" (whole dollars or cents); Hourly rate "Enter an hourly rate between $10 and $200"; hours "Choose between 1 and 12 hours" in steps of 0.5. "Fixed or Hourly toggle, hours selector, live estimated total" (Tech Spec). AC: "Hourly shows the live estimated total (rate × hours)". The default pricing type is Fixed (schema default). Price limits are "provisional values for the demo".

Step 5 Who

22. "Post to Job Board (default) or Pick a Worker from verified workers serving that area | Job Board is first come, first served; Pick a Worker shows name, rating and ID-Card badges, Favourite Workers first" (PRD). AC: "Pick a Worker lists only verified workers serving that category; empty state switches to Job Board". Error: "Choose a worker or post to the job board".
23. Favourites (orchestrator decision 5): only for a logged-in customer. Guests see verified workers serving the area, without favourites. Favourites are the `listForArea` results whose id is in `favourites.list`, shown first and tagged. A favourite who is not verified or does not serve this area and category is not shown (that is what the AC requires).
24. Screen states, verbatim: "Step 5 Pick a Worker | Skeleton worker cards | 'No verified workers in this area yet — post to the job board instead' (switches match type) | ErrorState with Retry | Worker cards". The list loads when Pick a Worker is chosen, or on mount if the draft already has `matchType: 'direct'`.
25. A saved `workerId` that is not in the fetched list is cleared (the worker no longer qualifies).
26. Responsive: "Pick a Worker | 3-column card grid | 2 columns | List".

Forms, states, layout

27. "Each form has one Zod schema in `lib/validation`; errors show under the field on blur and on submit, and the first invalid field gets focus." Use `focusFirstError` with the fields in DOM order (`shouldFocusError: false`), as T5 does.
28. "Job builder steps | Button spinner on Continue | — | Toast 'Something went wrong. Your job is saved — try again' | Next step". In steps 1–5, Continue writes only to the local store and calls no service, so this state has no trigger in T6 (Open question 11). Service calls inside a step use their own states (rules 17 and 24 and the notify-me inline error). "Errors never clear typed input."
29. `?mockError=1` (one-shot) must show the error state of the first service call on the page: step 3 suggestions or notify-me; step 5 worker list (Retry succeeds).
30. Responsive, verbatim: "Job builder steps | Stepper across the top; form left (~640 px) and a sticky live 'Your job' summary panel right (~360 px) with the price estimate | Form full width; summary collapses into a panel above Continue | Single column; summary as a collapsible bar; sticky Continue footer". No horizontal scroll at 375 px; nothing removed on mobile, only rearranged; touch targets at least 44 px; no hover-only actions.
31. "One question per screen on mobile web; short stepped forms, never one long page." (PRD)
32. Accessibility: "WCAG 2.1 AA: labels on every field, keyboard navigation, sufficient contrast". Single-select card groups are radio groups; multi-select groups are checkbox groups with a group label; the autocomplete follows the ARIA combobox pattern; the live counter and the estimated total are announced politely. On step change, focus moves to the step heading.
33. Copy in `constants.ts`; only design tokens; `CATEGORIES` and `LIMITS` are the only sources for options and limits.

Cache Components and `instant` (orchestrator decision 7)

34. `cacheComponents: true` is on. Each `page.tsx` is a server component that exports `metadata` and renders the client step view. Anything that reads `useSearchParams` (step 2's `?category=`) must sit inside `<Suspense>` with a static fallback, as on `/login`. Nothing uncached (`localStorage`, `Date`, `Math.random`, search params) runs during the server render.
35. The T6 routes are public, so they have no `RequireRole` and do not need `export const instant = false` by default. The content still renders only after the draft hydrates. If the dev instant-navigation check reports a dropped segment, add `export const instant = false` with a comment, as T5 did on `/dashboard`.
36. Routes stay mounted in a hidden Activity after navigation: use `useRevisitKey` (rule 10). Keep object URLs alive while the route is hidden. Revoke them only on remove, replace or `clear()`, never in an unmount cleanup that Activity would trigger.

## Analytics

T6 fires **no** events (orchestrator decision 6). It must keep one clear completion point per step (for example a single `onStepComplete(step, values)` path where `completeStep(n)` is called) so T11 can add `track()` without restructuring. Events, exactly as in the PRD:

| Event | Trigger point in T6 code | Suggested props for T11 (plus role, device, source) |
| --- | --- | --- |
| `job_builder_start` | First render of a builder step after hydration while `isJobDraftEmpty(draft)` is true (step 1, or step 2 entered with `?category=`) | `entry`: `category_param` or `direct` |
| `category_selected` | Valid Continue on step 1, **or** a valid `?category=` applied on step 2 | `category`, `preselected` |
| `services_selected` | Valid Continue on step 2 | `category`, `count`, `hasOther` |
| `address_entered` | Valid Continue on step 3 (served address) | `state`, `zip` (no street line) |
| `details_entered` | Valid Continue on step 4 | `pricingType`, `photoCount`, `estimatedTotal` |
| `match_choice` | Valid Continue on step 5 | `matchType`, `favourite` (direct only) |

Notes for T11: the global AC says "Every PRD funnel event fires once", so de-duplication (for example after Back → Continue) is T11's job. The PRD has no event for notify-me capture or for leaving the flow; do not add one.

## Acceptance criteria

**Customer job builder** (Tech Spec, verbatim; the criteria that apply to steps 1–5)

- [ ] Steps 1 to 6 work with no session; the progress bar shows the step out of the total *(steps 1–5 in T6; step 6 in T7)*
- [ ] Reloading or going Back keeps every entered value *(photos excepted per orchestrator decision 3)*
- [ ] Hourly shows the live estimated total (rate × hours)
- [ ] Non-US or invalid ZIP addresses cannot continue
- [ ] Pick a Worker lists only verified workers serving that category; empty state switches to Job Board

Not in T6 (T7): "Step 6 without a session shows inline sign-up…", "Posting creates a job…", "Save As Template creates a template…".

**Landing and marketing** (verbatim; now testable end to end)

- [ ] Each category tile opens `/post-job/services` with that category pre-selected

**Global (every ticket)** (verbatim)

- [ ] `npm run lint` and `npm run typecheck` pass with no errors
- [ ] No console errors or warnings on the touched pages
- [ ] Loading, empty, error and success states render (error via `?mockError=1`)
- [ ] All interactive elements reachable by keyboard with a visible focus ring
- [ ] Only design tokens used for colour, type and spacing

**T6 checks from the routing rules and orchestrator decisions** (not AC text)

- [ ] Opening `/post-job/details` (or any later step) with an empty draft redirects to `/post-job/category`; with steps 1–2 done it redirects to `/post-job/location`
- [ ] No redirect or flash of step content before the draft has hydrated (hard reload on step 4 with a full draft stays on step 4)
- [ ] `/post-job/services?category=cleaning` with an empty draft shows step 2 with House Cleaning selected; an invalid `?category=` with no draft goes to step 1
- [ ] An address in a non-served state shows "notify me"; the capture succeeds and Continue stays blocked
- [ ] Photos: a 6th photo is refused with "You can add up to 5 photos"; a file over 10 MB and a wrong type show their errors; after a reload the draft has no photos and the note shows
- [ ] A guest on step 5 sees no favourites; `demo.customer` sees qualifying favourites first and tagged
- [ ] A worker session on `/post-job/*` sees the separate accounts notice
- [ ] Revisiting a step by client navigation (step 4 → step 1 → change category → Continue …) shows the current draft, not stale values
- [ ] Step 5 Continue navigates to `/post-job/review` (404 until T7); `src/app/post-job/[step]` is gone
- [ ] Every step checked at 1280, 1024, 768 and 375 px; `npm run build` passes

## Open questions

Each has a proposed default. The default applies unless the orchestrator decides otherwise.

1. **Progress total.** The PRD numbers 8 steps (Category to Confirmation), and the journey map says "5 short steps → Review → Pay + post". *Default:* "Step N of 8" with the PRD step labels; step 1 still counts when it is skipped (the user lands on "Step 2 of 8").
2. **Toast primitive.** The job-builder error state is a toast, and T2 has no toast. *Default:* none in T6 (no Continue service call; rule 28). T7 decides: Radix Toast (allowed, Radix-based) or an inline `FormAlert`.
3. **Out-of-area addresses block Continue?** The PRD says "outside the service area → 'notify me' email capture" but not whether the job can still be posted. *Default:* blocked; step 3 is incomplete until a served address is entered. Served states remain provisional `['TX']` (see the PROGRESS question about Utah).
4. **Worker session in the builder.** *Default:* every `/post-job/*` step shows `SeparateAccountsNotice` ("Log out and create a customer account" / "Go to my dashboard") for a worker session; guests and customers go through.
5. **Category change with an existing draft** (on step 1 or through `?category=`). *Default:* set the new category and clear `subServices`, `otherText` and `workerId` (a selected worker may not serve the new category); keep the address and details. With the same category, change nothing.
6. **Resume on "Post a job".** *Default:* no auto-redirect and no "start over" control; step 1 shows the saved choice and Continue walks forward through saved values. Alternative: a "Continue where you left off" link to the first incomplete step (copy needed).
7. **Step 1 interaction.** The role picker continues on one tap; steps use Back/Continue. *Default:* select, then Continue (consistent StepLayout). Back on step 1 goes to `/`; Back on step 2 goes to step 1 even after `?category=`.
8. **Custom category.** Its only sub-service is "Other". *Default:* pre-select "Other" and open its text field, so the user only types the description.
9. **Changing pricing type.** `amount` means the fixed total or the hourly rate. *Default:* the form keeps both values while on the page; the draft saves only the active type's `amount` (and `hours` only for hourly); hours have no preset ("Choose hours" placeholder).
10. **Autocomplete states and copy.** Not in the Screen states table. *Default:* a small inline loading line in the list; no list when there are no matches; on error a quiet note "Suggestions aren't available — enter the address below" [provisional]; manual entry always works.
11. **"Button spinner on Continue".** Continue is synchronous in steps 1–5. *Default:* no artificial delay or spinner; `StepLayout` still supports `loading` for T7.
12. **Empty state "switches match type".** *Default:* when the list is empty, set `matchType` to `board` automatically and show the empty message under the Pick a Worker option (Pick a Worker can be chosen again, which refetches).
13. **Worker name and badges on `WorkerCard`.** *Default:* first name and last initial ("Jordan M."); a badge for each verified check (Phone when `phoneVerified`, ID, Insurance); rating to one decimal plus jobs completed; initials avatar.
14. **Edit links from Review (T7).** Continue on an edited step could return to Review. *Default:* T6 Continue always goes to the next step; T7 adds a return path (for example `?from=review`) if wanted.
15. **Address or category change after a worker was picked.** *Default:* clear `workerId` whenever the address or category changes (rules 5 and 25), so step 5 must be completed again.
16. **Photo note and HEIC preview.** Chrome and Firefox cannot preview HEIC. *Default:* show a file tile with the name for formats that can't be previewed; the note under the uploader reads "Photos stay until you reload or close this tab" [provisional]. No browser-side compression in the MVP (the PRD's "preview and compression" is deferred until uploads are real).
17. **Object URLs on posted jobs (T7/T8 impact).** `jobs.create` will store object URLs in the persisted mock DB; they break after a reload. *Default:* T7/T8 show a placeholder for broken job photos; T6 changes nothing in the mock layer.
18. **FAQ links in the flow.** The PRD says the FAQ is "also linked from the flow steps where those questions come up". *Default:* none in steps 1–5; T7 links the cancellation and payment FAQ items on Review and Payment.
19. **SEO.** *Default:* every `/post-job/*` page is `noindex` and stays out of the sitemap (same as auth pages); titles such as "Post a job — Category".
20. **Hours selector control.** *Default:* a `select` with the 23 values from 1 to 12 in 0.5 steps (no `slider` in T6).
21. **Provisional copy** for client approval: step headings and helper lines, summary panel labels, the "Estimated total" label, the notify-me heading/body/success, the photo note and button labels, the "Favourite" tag, and page titles.

## Orchestrator decisions (binding)

All 21 open questions above are resolved with their proposed defaults, as written. They were checked against the Tech Spec: hours are 1–12 in 0.5 steps (Validation rules), and an empty Pick a Worker list switches to Job Board (acceptance criteria). Provisional copy goes in `constants.ts` and is logged as a client question.
