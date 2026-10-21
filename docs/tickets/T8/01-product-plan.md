# T8 — Product plan

Ticket row (Tech Spec, Build plan): **T8 Customer dashboard**. Scope: "Home, Job detail (edit, cancel, rate), History, Account, templates Re-post". Depends on: T7. Done when: "Customer dashboard criteria pass".

T8 replaces the placeholder `/dashboard` with the real customer area. It adds the Jobs list (orchestrator decision 1), Job detail with edit, cancel and rate, History, Account, and Re-post from a template or a past job. The orchestrator brief's decisions 1–10 are binding and are called "decision N" below. Open questions follow at the end, each with a proposed default.

## Scope

**In**

- Six guarded customer routes under the existing `src/app/dashboard/layout.tsx` (`RequireRole role="customer"` + `AppShell`):
  - `/dashboard` (Home): replaces `DashboardPlaceholder` for customers only.
  - `/dashboard/jobs`: the active jobs list (decision 1; T2 decision 6).
  - `/dashboard/jobs/[id]`: Job detail.
  - `/dashboard/jobs/[id]/edit`: Edit job. This is the proposed edit approach (decision 3, Open question 1).
  - `/dashboard/history`: completed and cancelled jobs.
  - `/dashboard/account`: profile, payment methods, Favourite Workers, Saved Templates and Support.
- Every page: `export const instant = false` with the T5 comment, `noindex` metadata, and the client view inside `<Suspense>`. Flow, dialog and data views are keyed with `useRevisitKey` (decision 8).
- Job actions: Edit (open jobs only, `jobs.update`), Cancel (open or accepted, through a confirmation dialog that says the fee rule is to be confirmed), Rate (1–5 stars from hand-built radio inputs, completed jobs only, once).
- Re-post: a template or a past job is loaded into the job-draft store, and the builder opens at `/post-job/review` (decision 5).
- Placeholder tiles for photos on posted jobs (decision 6).
- Account: profile edit through `users.update`, with OTP when the mobile changes (Open question 9). Payment methods: list and add. Favourite Workers: list and remove. The Saved Templates list with Re-post. A Support block.
- Shared components the Tech Spec inventory names: `JobCard`, `JobDetail`, `StatusBadge`.
- Small extensions to existing code, with nothing duplicated (see Components and Data): a display variant of `WorkerCard`, a rail for Home through the dashboard shell, one new mock read `workers.getSummaries` (Open question 3), and the new schemas `jobEditSchema`, `profileSchema` and `ratingFormSchema`.
- Copy in `src/lib/constants.ts` (new `DASHBOARD_COPY`; reuse `SCREEN_STATE_COPY`, `JOB_STATUS_LABELS`, `SERVICE_MESSAGES`). Provisional copy is marked as such.

**Out**

- Firing analytics. T11 wires every event; T8 keeps clear trigger points (see Analytics).
- The worker dashboard and its `DashboardPlaceholder` use (T10). The worker side of status changes (start and complete are T10).
- These PRD Account items have no data model or service: Payment Analytics, Ratings (as a separate list), Notifications, Settings, and the notification bell (Open question 14).
- Removing a payment method, setting a default card, and renaming or deleting a template. No service exists for any of them (Open question 13).
- Editing photos, category, match type or worker on a posted job. `JobPatch` has no category, match type or worker field (Open question 2).
- Cancellation fee amounts and charging, refunds and disputes. The PRD keeps these open or out of scope.
- A receipt as a download or PDF (Open question 11).
- Earlier minor issues in PROGRESS.md (T12).

## Screens

| Route | Purpose | Access |
| --- | --- | --- |
| `/dashboard` | Home: greeting, a "Post a job" call to action, up to 3 active jobs with "View all jobs", Saved Templates with Re-post, and the app banner | Customer (`RequireRole`; a worker sees the separate-accounts notice; a guest goes to `/login?next=/dashboard`) |
| `/dashboard/jobs` | All active jobs (open, accepted, in progress), newest first, each linking to Job detail | Customer |
| `/dashboard/jobs/[id]` | Job detail: services, address, posted and completed dates, price, photos, assigned worker or board status, and the actions allowed for this status (Edit, Cancel, Rate, Re-post, Favourite, Receipt) | Customer, own jobs only. Another customer's job or an unknown id shows "We couldn't find this job" |
| `/dashboard/jobs/[id]/edit` | Edit job: services, address and details on one page, saved with `jobs.update` | Customer, own **open** jobs only. Any other status shows "This job can't be changed right now" with a link back to the job |
| `/dashboard/history` | Completed and cancelled jobs with date, worker, amount, status and rating. Actions: View, Re-post, Rate, View receipt | Customer |
| `/dashboard/account` | Profile (view and edit), Payment Details (list and add), Favourite Workers (list and remove), Saved Templates (list and Re-post), Support | Customer |

The side and bottom nav are the existing `NAV_ITEMS.customer`: Home · Jobs · History · Account, with the persistent "Post a job" button in SideNav and in the mobile top bar. Job detail and Edit sit under the "Jobs" prefix match. Job detail shows a back link based on status: "Back to jobs" for active jobs, "Back to history" for completed or cancelled ones (Open question 15).

## Components

| Component | New or existing (path) | Used on | Responsibility |
| --- | --- | --- | --- |
| Six page files | New (`src/app/dashboard/page.tsx` replaced; `jobs/page.tsx`, `jobs/[id]/page.tsx`, `jobs/[id]/edit/page.tsx`, `history/page.tsx`, `account/page.tsx`) | All T8 routes | Server component: `metadata` (title, noindex), `instant = false` with comment, client view in `<Suspense>` with the matching `LoadingState` |
| `CustomerHome` | New (`src/components/dashboard/customer-home.tsx`) | `/dashboard` | Greeting (`AUTH_COPY.dashboard.greeting`), Post a job, active jobs (max 3) plus "View all jobs", templates and app banner in the rail; four states |
| `JobsList` | New (`src/components/dashboard/jobs-list.tsx`) | `/dashboard/jobs` | All active jobs as `JobCard`s; four states |
| `JobCard` | New (`src/components/job/job-card.tsx`, Tech Spec inventory) | Home, Jobs | Category icon and name, services, city and state, price (fixed, or hourly rate × hours with the estimate), `StatusBadge`, and the worker name and rating or "On the job board". The whole card is one link to the detail |
| `StatusBadge` | New (`src/components/job/status-badge.tsx`, Tech Spec inventory) | Cards, detail, History | `JOB_STATUS_LABELS` text, "Status colours from tokens". Never colour alone |
| `JobDetailView` + `JobDetail` | New (`src/components/dashboard/job-detail-view.tsx` loads and guards; `src/components/job/job-detail.tsx`, Tech Spec inventory, renders) | `/dashboard/jobs/[id]` | Loads the job and worker, checks ownership, lays out details and the action card, and holds the action state |
| `JobActions` | New (`src/components/dashboard/job-actions.tsx`) | Job detail (sticky card on desktop, actions at the top on tablet, sticky action bar on mobile) | Shows only the actions this status allows (rules 14–17) |
| `CancelJobDialog` | New (`src/components/dashboard/cancel-job-dialog.tsx`) on the existing `Dialog` | Job detail | Confirmation with the fee-rule-to-be-confirmed note, a FAQ link (`/faq#cancellation-fee`, new tab), "Keep job" and "Cancel job", a submitting state and an inline error |
| `StarRatingField` | New (`src/components/forms/star-rating-field.tsx`) | Job detail | Hand-built: five native `<input type="radio">` in a `fieldset`/`legend`, labelled "1 star"…"5 stars", arrow keys, visible focus, no library (decision 4) |
| `RateJobForm` | New (`src/components/dashboard/rate-job-form.tsx`) | Job detail (`#rate`) | `StarRatingField` + "Submit rating", then a read-only "You rated N stars" |
| `JobPhotosPlaceholder` | New (`src/components/job/job-photos-placeholder.tsx`) | Job detail | N neutral tiles plus "Photos aren't available in the demo" [provisional]. It never renders `<img>` for stored URLs (decision 6) |
| `JobReceipt` | New (`src/components/job/job-receipt.tsx`) | Job detail (`#receipt`) for completed jobs | Reference, completed date, services, total with hourly breakdown, "charged on completion, no refunds" (Open question 11) |
| `EditJobView` | New (`src/components/dashboard/edit-job-view.tsx`) | `/dashboard/jobs/[id]/edit` | One RHF form with `jobEditSchema`: Services, Where, Details sections; read-only Category and "Job board"; Save and Cancel |
| `SubServicesField` | **Extract** from `src/components/post-job/services-step.tsx` into `src/components/forms/sub-services-field.tsx` (no behaviour change to step 2) | Step 2, Edit | Checkbox group of the category's sub-services plus the "Other" text field |
| `DescriptionField` | **Extract** from `src/components/post-job/details-step.tsx` into `src/components/forms/description-field.tsx` (no behaviour change to step 4) | Step 4, Edit | Textarea with the live counter and delayed announcement |
| `AddressInput`, `PriceInput` | Existing (`src/components/forms/address-input.tsx`, `src/components/job/price-input.tsx`) | Edit | Reused as is; both are already generic over the form |
| `HistoryList` | New (`src/components/dashboard/history-list.tsx`) | `/dashboard/history` | Table on desktop and tablet, card list on mobile (Responsive layouts); four states |
| `TemplateList` | New (`src/components/dashboard/template-list.tsx`) | Home rail, Account | Name, category, price and Re-post. States: skeleton rows, section hidden when empty, inline error |
| `useRepost` + `RepostConfirmDialog` | New (`src/components/dashboard/use-repost.ts`, `repost-confirm-dialog.tsx`) | Templates, Job detail, History | Builds the draft (rule 21), asks before replacing a non-empty draft (Open question 6), then `router.push('/post-job/review')` |
| `ProfileSection` | New (`src/components/dashboard/profile-section.tsx`) | Account | View mode, then in-place edit with `profileSchema`. Mobile uses the existing `MobileVerifyField` (OTP) |
| `PaymentMethodsSection` | New (`src/components/dashboard/payment-methods-section.tsx`) | Account | `payments.listMethods` list ("Visa ending 4242") plus "Add a card" panel reusing `CardFields` and `cardSchema` |
| `FavouriteWorkersSection` | New (`src/components/dashboard/favourite-workers-section.tsx`) | Account | `favourites.list`, display `WorkerCard`s with "Remove" (`favourites.toggle`) |
| `SupportSection` | New (`src/components/dashboard/support-section.tsx`) | Account | `SUPPORT_EMAIL`, `SUPPORT_PHONE`, FAQ link (existing constants; T2 decision 7) |
| `WorkerCard` | Existing (`src/components/job/worker-card.tsx`). **Extend** with a non-interactive display variant (it is a radio item today) | Job detail, Favourites | Avatar, name, rating, jobs done and ID-Card badges. In the display variant, action buttons sit beside the card, not inside the radio |
| `AppPrompt` | Existing (`src/components/layout/app-prompt.tsx`) | Home rail (app banner) | `app="customer"`, shares the 7-day dismissal with Confirmation (Open question 12) |
| `AppShell` | Existing (`src/components/layout/app-shell.tsx`) | Every page | Rail only on Home (templates + app banner). The layout renders `AppShell` without a rail today. The lead engineer gives Home a rail without duplicating the shell or breaking the guard's loading shell (for example a rail slot the page fills). Not a product choice |
| `SideNav`, `BottomNav`, `AccountMenu`, `LogoutButton`, `NAV_ITEMS` | Existing | Shell | Unchanged |
| `RequireRole`, `GuardLoading` | Existing (`src/components/auth/*`) | Layout | Unchanged |
| `ReviewSummary`, `JobSummaryPanel` helpers | Existing (`src/components/flow/review-summary.tsx`, `src/components/job/job-summary-panel.tsx`) | Job detail | Reuse `servicesText`, and `estimatedTotal`, `formatUsd`, `findCategory`, `workerDisplayName` from `src/lib/job-builder.ts`. The UI planner decides whether `ReviewSummary` (read-only, `kind: "job"`) is the detail's body or `JobDetail` lays out its own sections |
| `PaymentMethodPicker`, `CardFields` | Existing | Account | Card fields reused. The picker is for choosing, so it is not used in Account |
| `FormField`, `FormAlert`, `focusFirstError`, `useRevisitKey` | Existing | All forms | Labels, inline errors, first-error focus, remount on revisit |
| `Dialog`, `Input`, `Label`, `Checkbox`, `RadioGroup`, `Textarea`, `Select`, `Button`, `Skeleton`, `Separator` | Existing (`src/components/ui/*`) | T8 | `Dialog` is already a centred modal from md and a bottom sheet below md |
| `LoadingState`, `EmptyState`, `ErrorState` | Existing (`src/components/states/*`) | Every data view | Variants: `cards` (Home, Jobs), `rows` (History, templates, Account lists), `detail` (Job detail, Edit) |
| Toast | **Open question 8** | Success feedback | Default: one shared toast built on Radix Toast from the installed `radix-ui` package, so no new dependency |

## Data and services

**Types** (`src/lib/types.ts`, existing; no new domain types): `Job`, `JobStatus`, `JobPatch` (subServices, otherText, address, description, photos, pricingType, amount, hours), `JobDraft`, `Template`, `PaymentMethod`, `CardInput`, `User`, `UserPatch`, `WorkerSummary`, `ServiceErrorCode` (`JOB_NOT_FOUND`, `NOT_ALLOWED`, `ACCOUNT_EXISTS`, `CARD_FAILED`, `MOCK_ERROR`, `INVALID_INPUT`).

**Services** (`src/lib/mock/services.ts`; 400–800 ms delay; one-shot `?mockError=1`):

| Call | Where | Rule in the mock |
| --- | --- | --- |
| `jobs.listForCustomer(customerId)` | Home, Jobs, History | Newest first. Active = open, accepted, in_progress. Past = completed, cancelled |
| `jobs.get(id)` | Job detail, Edit | `JOB_NOT_FOUND` when unknown. **No ownership check:** the UI compares `customerId` with the session user (as T7 Confirmation does) |
| `jobs.update(id, patch)` | Edit | Open jobs only, else `NOT_ALLOWED`. Re-validates the merged job with `jobPostSchema` |
| `jobs.cancel(id)` | Job detail | Open or accepted only, else `NOT_ALLOWED` |
| `jobs.rate(id, stars)` | Job detail | Integer 1–5, completed and not yet rated, else `NOT_ALLOWED`. Updates the worker's running average |
| `templates.list(customerId)` | Home rail, Account | Seed: `demo.customer` has 2; `new.customer` has none |
| `payments.listMethods(userId)`, `payments.addMethod(userId, card)` | Account | Brand and last 4 only |
| `favourites.list(customerId)`, `favourites.toggle(customerId, workerId)` | Account; Job detail (Open question 10) | Seed: `demo.customer` favourites `wrk-002` |
| `users.update(userId, patch)` | Account | Validates each field. An email owned by another account → `ACCOUNT_EXISTS`. A changed mobile sets `phoneVerified: false` unless the patch passes it. Syncs the session user |
| `auth.sendOtp`, `auth.verifyOtp` | Account (mobile change) | Code `123456` |
| **New:** `workers.getSummaries(ids: string[]): Promise<WorkerSummary[]>` | Home, Jobs, Job detail, History | Needs approval (Open question 3). Returns a `WorkerSummary` for every id, any verification status; unknown ids are skipped. No other read gives a worker's name by id (`listForArea` filters by area and verified; `getProfile` has no name) |

**Stores** (`src/lib/store`, existing):

- `useSessionStore` / `selectSessionUser`: the profile shown on Account and the `customerId` for every call. `users.update` keeps it in sync.
- `useJobDraftStore`: `setDraft`, `setTemplateName`, `isJobDraftEmpty`, `useJobDraftHydrated` for Re-post (rule 21). No store changes.

**Schemas** (`src/lib/validation`):

- Existing: `servicesSchema` shape, `addressSchema`, `detailsSchema` shape, `jobPostSchema`, `ratingSchema`, `cardSchema`, `detectCardBrand`, `firstNameSchema`, `lastNameSchema`, `emailSchema`, `mobileSchema`, `dobSchema`, `otpSchema`, `zodResolver`.
- New, in `job.ts`: `jobEditSchema`, built from the existing services, address and details shapes and their refinements, without photos, category, match type or worker.
- New, in `job.ts`: `ratingFormSchema = z.object({ stars: ratingSchema })`, with the message "Choose a star rating" [provisional].
- New, in `auth.ts`: `profileSchema` (first name, last name, email, mobile, DOB), using the existing field schemas and messages verbatim.

**Helpers and constants** (existing): `estimatedTotal`, `formatUsd`, `findCategory`, `workerDisplayName`, `workerInitials`, `isServedState`, `CATEGORY_ICONS`, `JOB_STATUS_LABELS`, `MATCH_TYPE_LABELS`, `PRICING_TYPE_LABELS`, `CARD_BRAND_LABELS`, `SCREEN_STATE_COPY`, `SERVICE_MESSAGES`, `STATE_COPY`, `NAV_ITEMS`, `HEADER_ACTIONS.postJob`, `SUPPORT_EMAIL`, `SUPPORT_PHONE`, `FAQ_HREF`, the FAQ ids `cancellation-fee` and `payment-timing`, and `APP_PROMPT_COPY`. New: `DASHBOARD_COPY` (headings, empty lines, dialog text, labels, page titles; provisional), plus a pure `jobToDraft(job | template)` helper in `src/lib/job-builder.ts` (rule 21).

## Behaviour and rules

Access and routing

1. Route map: "`/dashboard` | Customer Home | Customer"; "`/dashboard/jobs/[id]` | Job detail | Customer"; "`/dashboard/history` | History | Customer"; "`/dashboard/account` | Account | Customer". `/dashboard/jobs` (decision 1) and `/dashboard/jobs/[id]/edit` (Open question 1) are additions with the same access.
2. "guarded routes redirect to `/login?next=<route>` when there is no mock session." "A worker session hitting `/dashboard` … sees the 'separate accounts' notice with a sign-up link for the other role." The existing layout guard does both, and `next` keeps the full path, including `/dashboard/jobs/<id>`.
3. A job whose `customerId` is not the session user's is treated as not found: "We couldn't find this job" + back to dashboard (spec Screen states, Job detail). The same applies on Edit.
4. Every page has `export const instant = false` with the T5 comment (the guard renders the page only after the session loads in the browser). Every flow, dialog and data view is keyed with `useRevisitKey`, so a return visit remounts it. Data views refetch then, so a cancel on Job detail shows on Jobs, Home and History when the user comes back (decision 8).
5. The `[id]` param is read on the client inside the guarded view (`useParams`). Nothing uncached runs during the server render.

Home

6. PRD: "Home | Active jobs (worker, rating, price, status), Saved Templates, app banner | Post a job, Re-post a template, open a job". Up to 3 most recent active jobs, then "View all jobs" to `/dashboard/jobs` (decision 1).
7. Screen states, verbatim: "Customer Home | Skeleton job cards | 'No jobs yet' + Post a job button | ErrorState with Retry | Active jobs + templates". "No jobs yet" shows when the customer has no jobs at all. When they have only past jobs, see Open question 5.
8. Saved Templates, verbatim: "Saved Templates | Skeleton rows | Section hidden | Inline error | Template list with Re-post".
9. Responsive, verbatim: "Dashboards (shell) | Side nav (240 px), main content, right rail for templates and app prompt | Icon-only side nav, no right rail | Bottom nav, single column". Below 1280 px the rail content stacks under the main column. Nothing is removed (AGENTS rule 8; existing `AppShell` behaviour).

Jobs list

10. All open, accepted and in-progress jobs, newest first, as `JobCard`s. Loading: skeleton job cards. Error: `ErrorState` with Retry. Empty: "No active jobs" + Post a job [provisional] (no spec row; Open question 5).

Job detail

11. PRD: "Job detail | Services, address, date and time, price, photos, assigned worker or board status | Edit (before acceptance), cancel (cancellation fee rule to be confirmed), rate after completion". AGENTS: "Jobs are on demand, with no date or time picker", so "date and time" means the posted date and time and, for completed jobs, the completed date and time (Open question 4).
12. Screen states, verbatim: "Job detail | Skeleton detail | — | 'We couldn't find this job' + back to dashboard | Full detail and actions". That copy is for `JOB_NOT_FOUND` and other customers' jobs. `MOCK_ERROR` and other failures show `ErrorState` with Retry (as on T7 Confirmation).
13. Responsive, verbatim: "Job detail | Details left, sticky card right with worker, price and actions | Stacked, actions at top | Stacked, sticky action bar". With no actions (in progress), there is no sticky bar.
14. Actions by status: **open**: Edit, Cancel. **accepted**: Cancel, plus a note that edits close once a worker accepts [provisional]. **in_progress**: none (a note that the job is under way [provisional]). **completed**: Rate (if not rated, otherwise "You rated N stars"), Re-post, Receipt, Favourite toggle. **cancelled**: Re-post.
15. Worker: "assigned worker or board status". With a `workerId`, show the display `WorkerCard` (name, rating, ID-Card badges). An open board job shows "On the job board — the first verified worker to accept gets it" [provisional]. If the worker lookup fails, show "Your worker" [provisional] and keep the rest of the page.
16. Photos: "Photos on posted jobs are placeholders, because their object URLs were revoked" (decision 6; T7 Open question 17). Show one neutral tile per stored photo and a short note. No `<img>` is rendered for a stored URL, which keeps the console clean. With no photos: "No photos added" [provisional].
17. Price: fixed shows the amount; hourly shows "rate × hours" and the estimated total (`estimatedTotal`). The charge note is "You're charged when the job is done. There are no refunds." (reuse the T7 copy; AGENTS: "charged on completion, and there are no refunds").

Cancel (decision 2)

18. AC: "Cancel shows a confirmation dialog noting the fee rule is to be confirmed." PRD: "cancel (cancellation fee rule to be confirmed)". T3 decision 12: "cancel is allowed for `open` and `accepted` only". The dialog says a cancellation fee may apply and that the amount and when it applies are still being confirmed [provisional], with a link to `/faq#cancellation-fee` (new tab). No amount is shown. Buttons: "Keep job" (closes, focus returns to Cancel) and "Cancel job" (spinner, disabled while running). Esc and an overlay click do not close it while the request runs (as in T5).
19. On success, the dialog closes, the status becomes Cancelled, the actions update, and the success message shows (Open question 8). On `NOT_ALLOWED` (the status changed meanwhile), an inline "This job can't be changed right now" shows in the dialog and the job reloads. On `MOCK_ERROR`, an inline error with retry, and the dialog stays open.

Edit (decision 3)

20. PRD: "Edit (before acceptance)". T3 decision 17: "`jobs.update` (only before acceptance)". The mock allows `open` only; direct jobs are created accepted, so in practice only board jobs can be edited. Editable fields are the `JobPatch` fields without photos: sub-services and "Other" text (within the job's category), address and landmark, description, and Fixed or Hourly pricing. Category and "Job board" show read-only. Validation is verbatim from the spec rows (Sub-services, Address line 1, City, State, ZIP, Description, Fixed price, Hourly rate, Hours). Errors show on blur and on submit, and the first invalid field gets focus. An address in a state outside `SERVED_STATES` cannot be saved (Open question 7). Save calls `jobs.update` and returns to Job detail with the success message. Cancel returns without saving. "Errors never clear typed input": `NOT_ALLOWED` shows "This job can't be changed right now" plus "Back to job", with the typed values kept.

Re-post (decision 5)

21. PRD: "Saved Templates and Re-post work on the web exactly as in the app for logged-in customers." AC: "Save As Template creates a template that can be re-posted in one tap." Re-post builds a draft with `jobToDraft`: category, subServices, otherText, address, description, pricingType, amount, hours, matchType, workerId; `photos: []`; `savedAsTemplate: false`; `lastStep: 5`. It sets `setTemplateName(undefined)` and pushes `/post-job/review`. `lastStep: 5` keeps the T7 Payment guard (`lastStep >= 6`), so the customer must pass Review. Unchecking `savedAsTemplate` avoids a duplicate template. The existing Review guard sends the customer to step 5 if a picked worker no longer qualifies (T7 Open question 8), or to the first incomplete step if anything is missing.
22. Re-post is available from templates (Home and Account), from completed and cancelled jobs (Job detail and History; PRD History "Re-post"; Open question 6), and never from active jobs. If a non-empty draft already exists, a confirmation dialog asks before replacing it (Open question 6). "Nothing typed is lost" (PRD).

Rate (decision 4)

23. T3 decision 12: "`stars` is an integer 1–5, only for `completed` jobs, once; it updates the worker's `rating` as a running average." The control is five native radios in a `fieldset` with the legend "Rate <worker name>" [provisional], keyboard operable, at least 44 px targets, and labels that don't rely on colour. Submitting with no choice shows "Choose a star rating" [provisional]. After success, the field becomes read-only text "You rated N stars". On `NOT_ALLOWED` (already rated), the job reloads and shows the stored rating.

History

24. PRD: "History | Past jobs with date, worker, amount | Re-post, rate, view receipt". Past = completed and cancelled (decision 1). Sort: completed by `completedAt`, cancelled by `createdAt`, newest first (Open question 4). Amount = job total (fixed amount, or rate × hours). Cancelled rows show no charge amount (Open question 11). Actions: View (detail), Re-post, Rate (completed and unrated → `/dashboard/jobs/<id>#rate`), View receipt (completed → `/dashboard/jobs/<id>#receipt`).
25. Screen states, verbatim: "History | Skeleton rows | 'Your finished jobs will appear here' | ErrorState with Retry | Past jobs list". Responsive, verbatim: "History, Earnings | Data tables | Data tables | Card lists".

Account (decision 7)

26. PRD: "Account | Profile, Payment Details, Payment Analytics, Favourite Workers, Ratings, Notifications, Settings, Support | Edit details, manage payment method". T8 covers Profile, Payment Details, Favourite Workers, Saved Templates and Support. The rest are listed in Open question 14.
27. Profile: shows name, email, mobile (with "Verified" when `phoneVerified`), date of birth and sign-in method. Edit happens in place with `profileSchema`, using the verbatim spec messages (names, email, mobile, DOB). A changed mobile must be verified with OTP `123456` (`MobileVerifyField`, "Verify your mobile number") before Save, and Save then passes `phoneVerified: true` (Open question 9). `ACCOUNT_EXISTS` on email shows inline (Open question 9 copy). Save shows a submitting state, and on success the view mode shows the new values (the session syncs, so SideNav and the Header show the new name).
28. Payment Details: `payments.listMethods` as "Visa ending 4242" (brand and last 4 only). "Add a card" opens `CardFields` with `cardSchema` (verbatim card, expiry and CVC messages; "Demo only" note reused from T7). `payments.addMethod` → the new method is added to the list, the success message shows, and the fields are cleared. Failure → "We couldn't add this card" inline, typed values kept. "Uploads and payment fields are UI only": card values live in form state only, never in a store, the URL, a log or analytics.
29. Favourite Workers: `favourites.list` as display `WorkerCard`s, each with a "Remove" button (`favourites.toggle`). It is removed immediately with a success message and focus moves to the next card or the section heading (Open question 10). Empty: "No favourite workers yet" [provisional].
30. Saved Templates on Account: the same `TemplateList` and rule 8.
31. Support: the single support email and phone from constants, plus the FAQ link (PRD "Shared: … a Support link with the single support email, phone and text options").
32. Account sections load independently: one failing section shows its own error with Retry and does not block the others.

Forms, states, layout, accessibility

33. "Every data screen ships four states" (AGENTS rule 7). `?mockError=1` is one-shot and hits the first call of the page: Home → `jobs.listForCustomer`; Jobs → `jobs.listForCustomer`; Job detail → `jobs.get`; Edit → `jobs.get`; History → `jobs.listForCustomer`; Account → `payments.listMethods` (call order: methods, favourites, templates). Errors for later calls are checked in code review (as T7 Open question 21).
34. "Skeletons match the final layout; errors never clear typed input; toasts auto-dismiss after 4 s; any action that changes data shows a success toast." See Open question 8.
35. "Dialogs | Centred modal | Centred modal | Bottom sheet" (existing `Dialog`). Focus returns to the trigger on close.
36. No horizontal scroll at 375 px, nothing removed on mobile, touch targets at least 44 px, no hover-only actions. The History table must not scroll sideways at 768 px (Open question 16).
37. "WCAG 2.1 AA: labels on every field, keyboard navigation, sufficient contrast". Status is text, not colour alone. A route change moves focus to the page `h1`. Success and error messages are announced (`role="status"` / `role="alert"`).
38. Copy lives in `constants.ts`. Only design tokens are used. Every page is `noindex` and stays out of the sitemap.

## Analytics

The PRD "Funnel analytics" section lists **no dashboard event**, so T8 fires **none** (decision 9). Trigger points that T11 may wire, with event names exactly as in the PRD:

| Event | T8 trigger point | Note for T11 |
| --- | --- | --- |
| `app_prompt_shown` | `AppPrompt onShown` on the Home rail | `app: 'customer'`, `placement: 'customer_home'`, `variant` |
| `app_prompt_clicked` | `AppPrompt onInstallClick` on the Home rail | Android only |
| `job_posted` | Not in T8. A Re-post ends at the T7 Payment trigger, which already fires it | T11 may add `repostSource: 'template' \| 'past_job'` (T8 can pass it on the draft only if T11 asks; nothing is added now) |
| `job_builder_start` | Not in T8. A Re-post enters the builder at Review | T11 decides whether a Re-post counts as a builder start |
| `payment_added` | Not fired from Account by default | The PRD event is a checkout-funnel step; T11 decides whether an Account card counts |

There are no events for cancel, edit, rate, profile update or favourite removal, and none are added.

## Acceptance criteria

**Dashboards and hand-off** (Tech Spec, verbatim; the parts that apply to T8)

- [ ] Customer and worker navigation match the PRD (Home · Jobs · History · Account / Jobs · My Jobs · Earnings · Account) *(customer side in T8)*
- [ ] Cancel shows a confirmation dialog noting the fee rule is to be confirmed
- [ ] App prompt shows the Play Store button on Android user agents and "We'll email and text you updates" elsewhere; dismiss hides it for 7 days *(Home banner reuse)*

**Customer job builder** (verbatim; criteria T7 deferred to T8)

- [ ] Posting creates a job that appears on the customer dashboard and, for board jobs, on the worker board *(dashboard side in T8; the board is T10)*
- [ ] Save As Template creates a template that can be re-posted in one tap

**Global (every ticket)** (verbatim)

- [ ] `npm run lint` and `npm run typecheck` pass with no errors
- [ ] No console errors or warnings on the touched pages
- [ ] Loading, empty, error and success states render (error via `?mockError=1`)
- [ ] All interactive elements reachable by keyboard with a visible focus ring
- [ ] Only design tokens used for colour, type and spacing

**Ticket done when** (Build plan): "Customer dashboard criteria pass."

**T8 checks from the decisions** (not AC text)

- [ ] `demo.customer`: Home shows 3 active jobs plus "View all jobs", 2 templates and the app banner. Jobs shows the 9 active seed jobs (5 open, 2 accepted, 2 in progress). History shows 3 (2 completed, 1 cancelled)
- [ ] `new.customer`: Home "No jobs yet" + Post a job; no templates section; History "Your finished jobs will appear here"; Account empty lines for cards and favourites
- [ ] Open job: Edit → change the price → Save → the detail shows the new price. Accepted job: no Edit. `/dashboard/jobs/<accepted id>/edit` shows "This job can't be changed right now"
- [ ] Open or accepted job: Cancel → dialog with the fee-rule note → Cancel job → status Cancelled; the job moves from Jobs to History on the next visit. In-progress, completed and cancelled jobs have no Cancel
- [ ] `job-011` (completed, unrated): rate 4 stars by keyboard → "You rated 4 stars"; no second rating is possible; the worker's average changes (`/dev/mock`). `job-010` shows "You rated 5 stars"
- [ ] Re-post a template → `/post-job/review` with every section filled, the Save As Template box unticked, Payment not reachable before Continue. With a draft in progress, the replace dialog shows first
- [ ] Post a job end to end, then "Go to my dashboard": the new job is first on Home and Jobs
- [ ] `/dashboard/jobs/job-unknown` and another customer's job id: "We couldn't find this job" + back to dashboard. `?mockError=1`: `ErrorState`, and Retry succeeds
- [ ] Account: change the mobile → Save is blocked until OTP `123456` verifies; change the name → SideNav shows the new name; add Amex `3782 822463 10005` → "American Express ending 0005"; no card digits appear in localStorage, the URL or the console; remove `wrk-002` from favourites → it no longer shows "Favourite" on step 5
- [ ] Photos: a job posted with photos shows placeholder tiles and no console error
- [ ] Logged out, `/dashboard/history` → `/login?next=/dashboard/history`. As `demo.worker`, any `/dashboard/*` → the separate-accounts notice
- [ ] Leave a page and come back by client navigation: forms and dialogs are fresh, and lists show current data (decision 8)
- [ ] Every page checked at 1280, 1024, 768 and 375 px; `npm run build` passes

## Open questions

Each has a proposed default. The default applies unless the orchestrator decides otherwise.

1. **Edit approach** (decision 3). *Default:* a dedicated route `/dashboard/jobs/[id]/edit`, with one page and three sections (Services, Where, Details). It reuses `AddressInput`, `PriceInput` and two field groups extracted from steps 2 and 4 (`SubServicesField`, `DescriptionField`) with no change to the builder. It does not go back through the builder: that would mix a posted job with the draft store, its step guards and `?from=review`, and would risk overwriting a draft in progress. A dialog is too tall on mobile for the address suggestions. The route is an addition to the route map, like `/dashboard/jobs`. Log it as a client question.
2. **What can be edited.** `JobPatch` has no category, match type or worker field, and `jobs.update` allows open jobs only. *Default:* sub-services, "Other" text, address and landmark, description and pricing. Category and "Job board" are read-only, with the note "To change the category, cancel this job and post a new one" [provisional]. Photos are not editable in T8: new object URLs would die on reload, as the old ones did.
3. **Worker names by id.** No service returns a worker's name and rating by id. *Default:* add the read-only `workers.getSummaries(ids)` to the mock layer (same delay and mockError rules, any verification status, unknown ids skipped). One call per screen after the jobs load. Needs orchestrator approval as a mock-layer change.
4. **"Date and time" on Job detail and History.** Jobs are on demand and `Job` has no `cancelledAt`. *Default:* show "Posted <date, time>" for every job and "Completed <date, time>" when set. Cancelled jobs show their posted date (no type change). Dates are formatted in the browser's locale and time zone.
5. **Home with only past jobs, and the Jobs empty state.** The spec has "No jobs yet" for Home only. *Default:* "No jobs yet" + Post a job when the customer has no jobs at all. With only past jobs, Home and Jobs show "No active jobs right now" [provisional] with Post a job and a link to History.
6. **Re-post sources and an existing draft.** *Default:* Re-post from templates (Home rail, Account) and from completed and cancelled jobs (Job detail, History; the PRD lists "Re-post" under History). If the draft store holds a non-empty draft, a dialog asks "Replace the job you're building?" with "Replace" and "Keep my current job" [provisional]. Keep closes the dialog and changes nothing.
7. **Edited address outside the service area.** `jobs.update` checks only that the address is a US address. *Default:* the edit form blocks a state outside `SERVED_STATES` with the step 3 out-of-area message (no notify-me capture on edit).
8. **Success feedback.** The spec says "any action that changes data shows a success toast" and "toasts auto-dismiss after 4 s". T7 used inline alerts. T8 has six data-changing actions: cancel, edit, rate, profile save, add card and remove favourite. *Default:* add one shared toast primitive on Radix Toast from the already-installed `radix-ui` package (no new dependency, within T2 decision 9). It is used for success only, and T10 reuses it ("Job accepted"). Errors stay inline. Alternative: inline `role="status"` messages only, as in T7.
9. **Profile edit rules** (decision 7). *Default:* first name, last name, email, mobile and DOB are editable with the sign-up rules and messages. A changed mobile needs OTP before Save (T5 decision 1 applies, so a phone change needs OTP). Email: a duplicate shows "This email is already used by another account" [provisional], not the sign-up "log in" message. Social accounts may change their email too (demo). Role can't change ("One role per account").
10. **Adding Favourite Workers.** Today no screen adds a favourite, so the list can only shrink. *Default:* Job detail shows an "Add to Favourite Workers" / "Remove from favourites" toggle for jobs with an assigned worker (accepted, in progress, completed), using `favourites.toggle`. Removing on Account needs no confirmation.
11. **Receipt.** The PRD lists "view receipt"; the specs define no receipt. *Default:* a "Receipt" section on Job detail for completed jobs. It shows the job reference, completed date, services, total (with the hourly breakdown) and "Charged on completion. No refunds." It shows no card, because the method isn't recorded (T7 Open question 10). There is no PDF or print. History's "View receipt" links to `#receipt`. Cancelled jobs show no amount charged, because the fee rule is open.
12. **Home app banner.** The PRD lists an "app banner" on Home, but the hand-off table has no Home row. *Default:* reuse `AppPrompt` (`app="customer"`) with the confirmation copy. It shares the customer dismissal, so dismissing on Confirmation also hides it on Home for 7 days, and the other way round.
13. **Missing management actions.** There is no service to remove a card, set a default card, or rename or delete a template. *Default:* out of T8 and logged for the client. Adding them would need new mock services.
14. **PRD Account items with no data** (Payment Analytics, Ratings, Notifications, Settings) and the notification bell (PRD "Shared"). *Default:* out of T8, with no placeholder rows (no dead UI). The customer's given ratings show on Job detail and in History. Log them as client questions for a later phase.
15. **Nav highlight on Job detail.** `/dashboard/jobs/<id>` highlights "Jobs" even when opened from History. *Default:* keep the prefix rule, and show a back link by status ("Back to jobs" / "Back to history").
16. **History table at 768 px.** The responsive rule says "Data tables" on tablet, but seven columns may not fit at 768 px without sideways scroll. *Default:* the UI planner merges columns at md (for example, job and worker in one cell, actions in a row menu or stacked links) so nothing scrolls sideways. Card lists below md.
17. **Ownership in the mock mutations.** `jobs.get`, `update`, `cancel` and `rate` don't check `customerId`. *Default:* the UI check is enough for the demo (as in T7). No service change.
18. **The "no new job while one is in progress" rule** (T4 open question, from the live FAQ). *Default:* not enforced in T8: Post a job and Re-post are always available.
19. **Provisional copy** for client approval: the page titles and headings, "View all jobs", the Jobs and Home empty lines, the board-status line, the accepted and in-progress notes, the photo placeholder note, the cancel dialog text and buttons, the rating legend, error and result text, the edit notes and buttons, the Re-post replace dialog, the receipt labels, the Account section headings and empty lines, the duplicate-email message, the favourite toggle labels, and the success messages.

## Orchestrator decisions (binding)

1. All 19 open questions above are resolved with their proposed defaults, **except Q8**.
2. **Q8 is overridden:** no toast primitive. Success feedback is an inline status message (`role="status"`, the existing `FormAlert` patterns) near the action, the same pattern as T7. Focus moves to the message or the updated section as the UI plan specifies.
3. **Q3 is approved:** add a read-only `workers.getSummaries(ids)` to the mock layer, with the standard delay and `?mockError` rules.
4. **Home rail:** `AppShell` already accepts a rail. Choose a way for Home (and only Home) to supply rail content without duplicating shell markup. For example, the dashboard layout reads the rail from a parallel route slot (`@rail`), or each page renders through one shared `CustomerShell` wrapper. The UI planner picks one; the lead engineer may adjust it if Next 16 or Cache Components forces a change.
5. Every guarded page gets `export const instant = false` with a comment and `useRevisitKey` on its flows and dialogs.
