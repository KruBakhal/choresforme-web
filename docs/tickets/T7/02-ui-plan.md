# T7 — UI plan (Job builder steps 6–8)

Input: `01-product-plan.md`, including its "Orchestrator decisions" (binding: all 25 open-question defaults apply). Also used: the T6 UI plan (post-job shell, `Stepper`, `StepLayout`, `StepSkeleton`, `SelectableCard`, `JobSummaryPanel`, `JobBuilderGate`, form-state rules), the T5 UI plan (`AuthCard`, `FormField`, `FormAlert`, `SocialButtons`, `SignUpForm`, `LoginForm`, `CompleteProfileForm`, `MobileVerifyField`/`OtpInput` widths, identity block, `LogoutButton`), the T2 UI plan (tokens, contrast pairs, focus rule, Button sizes, state components), and the Tech Spec sections "Responsive layouts" (Review & Post and Payment rows), "Screen states" (Payment, Job builder steps, Job detail), "Validation rules" (template name and card fields) and the component inventory (`ReviewSummary`, `AppPrompt`). This plan does not reopen any of those decisions.

Reference width is 1280 px, then 1024, 768 and 375. Breakpoints are `sm 640 · md 768 · lg 1024 · xl 1280`. "Desktop" means `lg` and up, "tablet" means `md` to `< lg`, and "mobile" means `< md`.

---

## 0. Ground rules for every T7 screen

### 0.1 Inherited unchanged

- **Colour and contrast:** T6 §0.1. Text is `text-ink` / `text-ink-muted` on `surface`, `surface-alt` or `brand-soft`. Error text (`text-danger`) sits on `surface` only. **Brand is a fill only:** primary buttons, the checked indicator in `SelectableCard`, the checked checkbox box, Stepper segments, and the `AppPrompt` icon disc, always with `text-brand-foreground` on top. `text-brand`, `border-brand`, `ring-*` and `text-white` never appear.
- **Success icons:** `text-success size-5` with a text label beside it, on `surface` only.
- **Type:** `text-caption`, `text-body-sm`, `text-body`, `text-h4`, `text-h3`, `text-h2`. Weights are `font-normal` and `font-semibold`. Page `h1` is `text-h3 md:text-h2` (the T5/T6 form-page override). Card and section titles are `h2 text-h4`, and sub-sections are `h3 text-body-sm font-semibold`.
- **Spacing** uses steps `1 2 3 4 6 8 12 16 24` (and their negatives, `0`, `px`). **Sizes** come from the T2 allowlist plus T6's `h-2`. **Reading widths** are `max-w-sm`, `max-w-md`, `max-w-xl` and `max-w-2xl`. No arbitrary `[…]` values.
- **Touch targets:** inputs `h-12`, buttons `sm` (44) and up, link buttons `min-h-11`, checkbox and radio hit areas `size-11`, `SelectableCard` rows `min-h-14`, icon buttons `size-11`.
- **Overflow:** `document.documentElement.scrollWidth === 375` on every T7 view (§7 lists the checks).
- **Motion:** hovers use `transition-colors duration-150 motion-reduce:transition-none` and spinners use `motion-safe:animate-spin`. There is no step-transition animation; the focus move is the transition.
- **Shell:** the existing `src/app/post-job/layout.tsx`: `AuthHeader`, `main#main.bg-surface`, `Container py-8 md:py-12`, `JobBuilderGate`, and `Footer showMobileCta={false}`. A worker session on any of the three routes sees the existing `RoleMismatchNotice` (T6 §2.3) instead of the page, with its `h1` focused. Nothing in T7 changes that view.
- **Feedback** is an inline `FormAlert` (decision 7). No toast anywhere.

### 0.2 Width maps

The Container is `px-4 md:px-6 lg:px-8`, with a 1200 px maximum and a 12-column `gap-8` grid at `lg`.

| Width | Review: summary / auth column | Payment: form / order summary | Confirmation column |
| --- | --- | --- | --- |
| 1280 | **687** (`xl:col-span-7`) / **481** (`xl:col-start-8 xl:col-span-5`) | 687 / 379 (T6 map, unchanged) | **672** (`max-w-2xl`, centred) |
| 1024 | **464** / **464** (`lg:col-span-6` each) | 629 / 299 | 672 |
| 768 | 720 stacked (summary, then auth) | 720 stacked (**summary first**) | 672 |
| 375 | 343 stacked | 343 stacked (summary bar first) | 343 |

**Why Review is wider on the right than the T6 summary column.** The embedded T5 sign-up form needs about 340 px of inner width. The OTP panel holds six 44 px boxes with `gap-2` (304 px) inside a `p-4` bordered box (34 px). The mobile row is `+1`, the input and "Send code" side by side from `sm`, and the name row has two columns from `sm`. With a 299 or 381 px column the OTP row would overflow at 1024. At 464 px (`p-8` gives 398 inner) and at 481 px (`xl:p-8` gives 415 inner) every T5 sub-layout fits as designed, so **no T5 form needs a layout change**.

### 0.3 Small extensions to existing components (no duplicates)

| Component | Change | Why |
| --- | --- | --- |
| `StepLayout` (`flow/step-layout.tsx`) | New optional props. `as?: "form" \| "div"` (default `"form"`). `hideContinue?: boolean`. `asideWidth?: "summary" \| "wide"` (default `"summary"`). `asideSticky?: boolean` (default `true`). `summaryFirst?: boolean` (default `false`). `onSubmit` becomes optional when `as="div"`. Column classes come from **static maps** (no computed class strings) | Review embeds forms in its aside, and `<form>` cannot nest. Review needs the wide aside, a non-sticky tall aside and Back only. Payment needs "summary first" below `lg` |
| `StepLayout` Continue button | Always `h-auto min-h-12 py-3 whitespace-normal text-center` (wrap-safe). Short labels look identical | "Save and return to review" (about 290 px with the arrow) does not fit the 227 px `flex-1` slot at 375; it wraps to two lines instead of overflowing |
| `AuthCard` (`auth/auth-card.tsx`) | `headingLevel?: 1 \| 2` (default 1). The `h2` is `text-h3` (24 px at every width), with the same `tabIndex={-1}` and focus classes | The inline auth and Post cards sit under the page `h1` |
| `LoginForm`, `SignUpForm` | `onSignUpInstead?` / `onLogInInstead?` (approved). When set, the alert action renders as `Button type="button" variant="link" size="sm"` that calls the callback, instead of a `Link`. `FormAlertData.action` becomes `{ label, href } \| { label, onClick }` | Product plan OQ 4 |
| `EmptyState`, `ErrorState` | `headingLevel` also accepts `1` (same `text-h4` styling) | The Confirmation fallback and load error must still give the page an `h1` |
| `LoadingState` | New variant `confirmation` (§5.6) | The skeleton matches the centred Confirmation column. This follows the T6 `workers` precedent |

No new `ui/*` primitive is needed. The plan uses the existing `Button`, `Input`, `Label`, `Checkbox`, `RadioGroup`, `Separator`, `Skeleton` and `Dialog` (the latter only through `SocialSignInDialog`).

---

## 1. `ReviewSummary` (new: `src/components/flow/review-summary.tsx`, client)

This is shared by step 6 (editable) and step 8 (read-only).

Props:

| Prop | Type | Notes |
| --- | --- | --- |
| `source` | `{ kind: "draft"; draft: JobDraft } \| { kind: "job"; job: Job }` | |
| `editable` | `boolean` | Shows Edit links (step 6) |
| `titleId` | `string` | |
| `title` | `string` | "Your job" on step 6, "Job summary" on step 8 |
| `status` | `JobStatus`, optional | Step 8 status chip |
| `worker` | `{ state: "loading" \| "ready" \| "error"; name?: string }`, optional | Direct jobs only |
| `onRetryWorker` | `() => void`, optional | Step 6 only |

### 1.1 Anatomy

```
section[aria-labelledby={titleId}].rounded-lg border border-border bg-surface
├─ header.flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 pt-4 md:px-6 md:pt-6
│  ├─ h2#{titleId}.text-h4 → "Your job" | "Job summary"
│  └─ (step 8) span.inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-body-sm font-semibold text-ink
│        → span.sr-only "Status: " + JOB_STATUS_LABELS[status] ("Open" / "Accepted")
├─ div.mt-2 divide-y divide-border                      (5 sections, in step order)
│  └─ section[aria-labelledby="review-{key}-title"].px-4 py-3 md:px-6 md:py-4
│     ├─ div.flex min-h-11 items-center justify-between gap-4
│     │  ├─ h3#review-{key}-title.text-body-sm font-semibold text-ink → "Category"
│     │  └─ (editable) Button asChild variant="link" size="sm"
│     │        → Link href="/post-job/{step}?from=review" onClick={markStepNavigation}
│     │          "Edit" + span.sr-only " category"            (accessible name "Edit category")
│     └─ div.mt-1 text-body text-ink break-words → value (below)
└─ footer.rounded-b-lg bg-surface-alt px-4 py-4 md:px-6                 (estimate band; no error text here)
   ├─ div.flex flex-wrap items-baseline justify-between gap-x-4
   │  ├─ p.text-body-sm font-semibold text-ink → "Estimated total"
   │  └─ p.text-h3 font-semibold text-ink → "$120"
   ├─ p.text-body-sm text-ink-muted → "$40/hr × 3 hours" | "Fixed Price"
   └─ p.mt-2 text-caption text-ink-muted → "You're charged when the job is done."
```

| Section (`h3`) | Edit target | Value |
| --- | --- | --- |
| Category | `/post-job/category?from=review` | `span.inline-flex items-center gap-2`: `CATEGORY_ICONS[id] size-5 text-ink` (aria-hidden) and the name |
| Services | `/post-job/services?from=review` | Comma list. "Other" shows as "Other: {text}" (same helper as `JobSummaryPanel`) |
| Where | `/post-job/location?from=review` | `line1`; "City, ST ZIP" on a new line; the landmark on a new line in `text-ink-muted` |
| Details | `/post-job/details?from=review` | The description in full (`whitespace-pre-line`, not clamped); then "{n} photos" in `text-body-sm text-ink-muted` (count only, OQ 17); then the price line, `text-body-sm`: "Fixed Price · $120" or "Hourly · $40/hr × 3 hours" |
| Who | `/post-job/match?from=review` | "Post to Job Board" plus `text-body-sm text-ink-muted` "Verified workers near you see the job. The first to accept gets it." (reuses `JOB_BUILDER_COPY.match.boardDescription`), **or** "Pick a Worker: Jordan M." (worker states in §1.2) |

- **Edit links** are visible text (no hover-only action), and the accessible name starts with the visible label. `markStepNavigation()` focuses the target step's `h1`.
- The estimate band uses `estimatedTotal()` / `formatUsd()`, as `JobSummaryPanel` does. The band is `surface-alt` and holds no error text.
- **No `WorkerCard`** in the Who section. A card inside a summary row would double the row's height and bring radio semantics. The name as text is enough (product plan: "UI planner decides").

### 1.2 Who section worker states (direct jobs; `workers.listForArea`)

| State | Value shown |
| --- | --- |
| Loading | "Pick a Worker:" followed by `Skeleton h-4 w-24` (inline-block). The whole value sits in a `span role="status"` with the sr-only "Loading worker…" |
| Empty (worker no longer qualifies) | Step 6: the existing guard sends the user to step 5 (`StepSkeleton` during the redirect). Step 8: the fallback "your chosen worker" |
| Error (`?mockError=1`, step 6 when the job is direct) | "Pick a Worker: your chosen worker", then a quiet note `p.mt-2 flex items-start gap-2 text-body-sm text-ink-muted` with `Info size-4` and "We couldn't load the worker's details." plus `Button variant="link" size="sm"` "Try again" (`onRetryWorker`). It is not red, because posting still works. On step 8 the fallback name shows with no note (OQ 8) |
| Success | "Pick a Worker: Jordan M." |

### 1.3 Widths

- **1280:** 687 px card, `md:px-6`.
- **1024:** 464 px. "Edit" (about 32 px) plus the gap leaves about 370 px for the heading.
- **768:** 720 px.
- **375:** 343 px, `px-4`. Values wrap (`break-words`), so the longest address and services lines never overflow.

---

## 2. Step 6 Review & Post — `/post-job/review`

### Desktop 1280 px (reference)

`StepLayout as="div" step={6} hideContinue asideWidth="wide" asideSticky={variant === "customer"}`:

```
Stepper "Step 6 of 8"                                          (mb-8 lg:mb-12, unchanged)
div.flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:gap-y-8
├─ main column  .min-w-0 lg:col-span-6 xl:col-span-7 lg:row-start-1                    687 px
│  ├─ h1#review-title "Review your job" (tabIndex -1, described by the Stepper status)
│  ├─ p.mt-2 text-body text-ink-muted → guest: "Check the details, then create an account or log in to post it."
│  │                                  customer: "Check the details, then continue to payment."
│  ├─ (guest, below lg) Button asChild variant="link" size="sm" className="mt-2 lg:hidden"
│  │     → a href="#review-auth" "Create an account to continue" + ArrowDown size-4
│  └─ form#review-form noValidate .mt-8 flex flex-col gap-8
│     ├─ ReviewSummary editable (§1)
│     └─ SaveTemplateField (§2a)
├─ aside column .min-w-0 lg:col-span-6 lg:row-span-2 lg:row-start-1 lg:self-start
│               xl:col-start-8 xl:col-span-5                                            481 px
│               [+ lg:sticky lg:top-8 only for the Post card variant]
│  └─ div.flex flex-col gap-6
│     ├─ ReviewAuthPanel (§2b) — guest / incomplete / customer variants
│     └─ ReviewHelpLinks (§2c)
└─ actions .lg:col-span-6 xl:col-span-7 lg:row-start-2
     Back only (outline, ArrowLeft) → /post-job/match; static row border-t pt-6
```

- **The aside is sticky only for the Post card variant** (about 520 px with the help links, so it fits an 800 px viewport). The guest sign-up card is about 1,250 px tall. A sticky element taller than the viewport would hide its own submit button, so the guest aside scrolls with the page.
- **The main column has no "Your job" panel.** `ReviewSummary` already carries every row plus the estimate.
- **"Continue to payment" lives only on the Post card** (rule 11, OQ 2). It is `Button type="submit" form="review-form"`, so it submits the template field's form from outside it, with no nested form.

### Tablet 768 px and 1024 px

- **1024:** the same grid at 6/6: summary 464 px and auth column 464 px (`AuthCard` `md:p-8` gives 398 px inner). Name fields 2 × 190 px; the mobile row stays side by side; OTP fits.
- **768:** stacked, full width (720), in DOM order: h1, jump link, summary, template field, auth card (bordered, `p-8`, 654 px inner), help links, then the Back row (static, `md:justify-between`). "Stacked" per the spec row.

### Mobile 375 px

- Stacked in the same order. The `ReviewSummary` card is 343 px with `px-4`.
- **The auth card has no card chrome** (T5 rule: "Full-width form"). It is separated by `border-t border-border pt-8` on the aside wrapper (`md:border-t-0 md:pt-0`). The OTP panel keeps its 309 px inner width.
- **The jump link** "Create an account to continue" (guest only, below `lg`) sits under the description. The auth card starts about 900 px down at 375, and the sticky footer holds Back only (OQ 2), so the link keeps the call to action one tap away. It is an in-page anchor to `#review-auth` (`scroll-mt-4`). Its click handler then focuses `#review-auth-title`.
- **Sticky footer:** Back only, `sticky bottom-0 z-40 -mx-4 border-t bg-surface px-4 pt-3 pb-safe`, with Back at natural width on the left. That is StepLayout's existing footer with `hideContinue`.
- Nothing is removed: summary, Edit links, template field, social buttons, both auth modes and the FAQ links are all present.

### 2a. `SaveTemplateField` (new: `src/components/post-job/save-template-field.tsx`, client)

Props: `checked`, `onCheckedChange`, `nameProps` (RHF `register` result), `nameError?`, `variant: "checkbox" | "nameOnly"` (`nameOnly` is used on step 8, §5.4).

```
div.rounded-lg border border-border bg-surface p-4 md:p-6         (surface, so the error text keeps 4.8:1)
├─ div.flex items-start gap-1                                      (T5 Terms pattern)
│  ├─ Checkbox id="save-template" aria-describedby="save-template-hint" aria-controls="templateName-field"
│  └─ div.min-w-0 flex-1 pt-2
│     ├─ Label htmlFor="save-template" className="text-body" → "Save as template"
│     └─ p#save-template-hint.mt-1 text-body-sm text-ink-muted → "Post this job again later from your dashboard."
└─ (ticked) div#templateName-field.mt-4 pl-12                       (48 px = 44 hit area + gap-1: aligns with the label)
   └─ FormField id="templateName" label="Template name" hint="3 to 40 characters." error → "Name this template"
        Input maxLength={40} autoComplete="off" aria-required className="sm:max-w-sm"
```

- Ticking does not move focus. The name field is next in Tab order, and the checkbox's `aria-controls` points at it.
- Unticking hides the field. The typed name stays in the draft store (`templateName`) and comes back if the box is ticked again.
- The checkbox and the name are saved to the draft store on change ("Reloading or going Back keeps every entered value"). Validation runs on blur (`mode: "onTouched"`) and on submit.
- **Width:** at 375 the name field is 343 − 32 (padding) − 2 (border) − 48 = 261 px. From `sm` it is at most 384 px.

### 2b. `ReviewAuthPanel` (new: `src/components/post-job/review-auth-panel.tsx`, client)

The wrapper is `section#review-auth.scroll-mt-4`, with the T5 widths from §0.2. It has three variants, chosen from the hydrated session.

**Guest: Sign up mode (default, OQ 3)**

```
p#review-auth-lead.flex items-start gap-3 text-body font-semibold text-ink        (above the card, OQ 2)
   UserRoundPlus size-5 shrink-0 (aria-hidden) + "Create an account or log in to post your job"
AuthCard headingLevel={2} titleId="review-auth-title" className="xl:p-8"
├─ eyebrow: RoleChip role="customer" (no Change link: the role is fixed here)
├─ title: "Create your account"                                    (AUTH_COPY.signUp.title.customer)
├─ description: div.flex flex-wrap items-center gap-x-1 text-body-sm text-ink
│     "Already have an account?" + Button type="button" variant="link" size="sm" "Log in"   → mode switch
├─ alert: FormAlert (from onAlertChange; error or ACCOUNT_EXISTS info with "Log in" → switch, OQ 4)
└─ body:
   ├─ SocialButtons role="customer" onSuccess onIncompleteProfile
   └─ SignUpForm role="customer" onSuccess onLogInInstead onAlertChange
```

**Guest: Log in mode**

The card keeps the same id and frame:

- Title "Log in" (`AUTH_COPY.login.title`).
- Description "New to Chores For Me?" + link button "Sign up" (switches back).
- Body: `SocialButtons role="customer"`, then `LoginForm` with `onSignUpInstead` and `forgotPasswordHref="/forgot-password?next=/post-job/review"` (it leaves the page; the draft is persisted).
- No `DemoAccountsPanel`. The demo accounts stay on `/login`. The Footer still has Reset demo data, and AGENTS.md lists the demo emails.

**Incomplete social customer** (a new Google/Facebook customer, after the dialog)

```
AuthCard headingLevel={2} titleId="review-auth-title"
├─ eyebrow: RoleChip role="customer" (fixed)
├─ title "Finish setting up your account"; description "You signed in with Google. Add your mobile number and date of birth to finish."
├─ identity block (T5 §6): initials disc, name, email (break-all), LogoutButton appearance="link" "Not you? Log out"
└─ CompleteProfileForm user onSuccess onAlertChange
```

**Customer: Post card**

```
AuthCard headingLevel={2} titleId="post-card-title" className="xl:p-8"
├─ title "Ready to post your job"
├─ description "Next, choose how to pay. You're charged when the job is done."
├─ alert: FormAlert tone="error" (only when log out fails)
└─ body .flex flex-col gap-6
   ├─ identity block  div.flex flex-wrap items-center gap-4 rounded-md border border-border bg-surface-alt p-4
   │  ├─ span[aria-hidden].flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-body font-semibold text-ink → "SC"
   │  ├─ div.min-w-0 flex-1
   │  │  ├─ p.text-body-sm text-ink-muted → "Signed in as"
   │  │  ├─ p.text-body font-semibold text-ink → "Sam Carter"
   │  │  └─ p.text-body-sm text-ink-muted break-all → "demo.customer@choresforme.test"
   │  └─ LogoutButton appearance="link" label="Not you? Log out" redirectTo={null}
   │        onLoggedOut → focus #review-auth-title ; onError → card alert
   │        className="basis-full sm:basis-auto"          (own line below sm)
   └─ Button type="submit" form="review-form" className="w-full" → "Continue to payment" + ArrowRight
```

- **"Not you? Log out"** stays on `/post-job/review`. That matches OQ 6's destination without a route replace, because the page is already there. The draft is kept, the panel turns back into the guest Sign up card, and focus moves to its `h2`. The label shows "Logging out…" while the call runs.
- The identity block is `surface-alt` and holds no error text. A logout error shows in the card's alert slot, which sits on `surface`.

**Card widths:** 1280 is 481 px (415 inner with `xl:p-8`). 1024 is 464 px (398 inner). 768 is 720 px (654 inner). 375 is 343 px with no chrome.

### 2c. `ReviewHelpLinks` (inside `review-step.tsx`, not its own file)

```
section[aria-labelledby="review-help-title"].flex flex-col gap-1 px-0 md:px-2
├─ h2#review-help-title.text-body-sm font-semibold text-ink → "Questions?"
└─ ul.flex flex-col
   └─ li → ExternalLink .inline-flex min-h-11 items-center gap-2 text-body-sm text-ink underline underline-offset-4
            "When am I charged?" (/faq#payment-timing) · "Is there a fee to cancel a job?" (/faq#cancellation-fee)
```

The labels reuse the FAQ items' `question` text. The links open in a new tab, so the typed sign-up form is not lost (decision 18).

### Component tree

```
src/app/post-job/review/page.tsx (server) — metadata "Post a job — Review" (noindex), instant = false
└─ Suspense fallback={<StepSkeleton/>}
   └─ JobStepRoute step={6} (existing)                     guard + revisit key
      └─ ReviewStep (new: src/components/post-job/review-step.tsx)
         ├─ useForm(reviewSchema) — savedAsTemplate, templateName (synced to useJobDraftStore)
         ├─ workers.listForArea (direct jobs only) → worker state
         └─ StepLayout (existing, extended) as="div" step={6} hideContinue asideWidth="wide" asideSticky
            ├─ Button link "Create an account to continue" (guest, lg:hidden)
            ├─ form#review-form
            │  ├─ ReviewSummary (new) editable source=draft worker onRetryWorker
            │  └─ SaveTemplateField (new) variant="checkbox"
            │     ├─ Checkbox (existing ui) + Label
            │     └─ FormField + Input (existing)
            └─ aside
               ├─ ReviewAuthPanel (new) — session variant, mode, onAuthed
               │  ├─ AuthCard (existing, + headingLevel)
               │  ├─ RoleChip (existing, from sign-up-form.tsx)
               │  ├─ SocialButtons → SocialSignInDialog (existing)
               │  ├─ SignUpForm | LoginForm (existing, + switch callbacks)
               │  ├─ CompleteProfileForm (existing)
               │  ├─ LogoutButton (existing)
               │  └─ FormAlert / FormAlertFromData (existing)
               └─ ReviewHelpLinks → ExternalLink (existing) ×2
```

### Styling

| Element | Classes |
| --- | --- |
| Main column stack | `form#review-form.mt-8 flex flex-col gap-8` |
| Aside stack | `flex flex-col gap-6`; below md `border-t border-border pt-8`; `md:border-t-0 md:pt-0` |
| Auth lead line | `flex items-start gap-3 text-body font-semibold text-ink`, icon `size-5` |
| Mode switch line | `flex flex-wrap items-center gap-x-1 text-body-sm text-ink` + `Button variant="link" size="sm"` (`min-h-11`) |
| Post card primary | `Button` default size (48 px), `w-full`, brand fill + `text-brand-foreground` |
| Identity block | `rounded-md border border-border bg-surface-alt p-4`; initials `size-12 rounded-full bg-brand-soft` |
| Help links | `text-body-sm text-ink underline underline-offset-4 min-h-11` |

### States

| Area | Loading | Empty | Error (`?mockError=1` hits the first service call) | Success |
| --- | --- | --- | --- | --- |
| Page (draft and session) | `StepSkeleton` until both stores hydrate and while the guard runs | Draft incomplete: the guard redirects to the first incomplete step (`StepSkeleton`, no flash) | — (local data) | The summary, template field and the right auth variant |
| Worker name (direct jobs) | Inline skeleton (§1.2) | Worker no longer qualifies: redirect to step 5 | Quiet note + "Try again" (§1.2) | Name shown |
| Sign up / Log in / Social / Complete profile | Submit spinner ("Creating your account…", "Logging in…", "Signing in…", "Saving…"); the form's `fieldset` is disabled; the mode switch link is `disabled` while pending | — | `FormAlert` in the card's alert slot (`SERVICE_MESSAGES.mockError`), focused; values kept; the second try succeeds. `ACCOUNT_EXISTS` → info alert, whose "Log in" action switches mode. `NO_ACCOUNT` → error alert, whose "Sign up" action switches mode | The panel turns into the Post card and focus moves to `#post-card-title` (§2 Interaction). A worker login → the gate shows the separate-accounts notice (focus on its `h1`); the draft is kept |
| Template field | — | Unticked (default) | "Name this template" under the field on blur / submit; focus to the field | Saved to the draft store as typed |
| Continue to payment | No spinner (synchronous, T6 decision 11) | — | Template invalid: the error shows and focus goes to the name field | `completeStep(6)`, `markStepNavigation()`, push `/post-job/payment` |

### Interaction details

- **Focus order, guest (1280 and 375 alike):** skip link, logo, [jump link], Edit × 5, [worker "Try again"], Save as template, [Template name], Log in (switch), Continue with Google, Continue with Facebook, sign-up fields (T5 §5 order), Create account, When am I charged?, Is there a fee…?, Back.
- **Focus order, customer:** …Edit × 5, Save as template, [Template name], Not you? Log out, Continue to payment, FAQ links, Back.
- **Mode switch:** clears the alert, swaps the form, and moves focus to `#review-auth-title` (whose text changed). Typed values are not carried between modes.
- **Focus after inline auth:** when the panel changes from guest or incomplete to **customer during this view**, an effect focuses `#post-card-title` (`tabIndex={-1}`, `focus-visible:outline-2`). Focusing it also scrolls the Post card into view, which matters at 375, where it replaces a 1,250 px form. The heading's text ("Ready to post your job") plus the identity block that follows tell a screen-reader user that they are signed in. Rules:
  - **Social sign-in:** the dialog closes after success. Its `onCloseAutoFocus` must `preventDefault()`, because the trigger button no longer exists. Focus then goes to `#post-card-title`, or to `#review-auth-title` of the complete-profile card for a new social user.
  - **A customer who arrives already signed in**, or a reload, never moves focus. This is the T6 hard-load rule: the skip link stays first.
- **Enter in the Template name field** submits `#review-form`. A guest gets the template validated, then focus moves to `#review-auth-title` and nothing navigates. A customer gets the same result as "Continue to payment".
- **Edit link → change → Continue on that step:** the step's Continue reads "Save and return to review" when steps 1–5 are complete (wrap-safe at 375, §0.3). Focus lands on the Review `h1`.
- Hover: link buttons thicken their underline; outline buttons get `bg-surface-alt`. No hover-only actions.

---

## 3. Step 7 Payment — `/post-job/payment`

### Desktop 1280 px (reference)

`StepLayout step={7} summaryFirst continueLabel={posting ? "Posting your job…" : "Post job"} loading={posting}` with `summary={<JobSummaryPanel draft currentStep={7} />}`:

```
Stepper "Step 7 of 8"
form noValidate (StepLayout) .lg:grid lg:grid-cols-12
├─ aside (DOM first; at lg grid-placed right, sticky)  xl:col-start-9 xl:col-span-4  379 px   JobSummaryPanel
├─ fields  xl:col-span-7  687 px
│  ├─ h1#payment-title "How would you like to pay?"; p "Choose a saved card or add a new one."
│  └─ fieldset.contents [disabled while posting] → div.mt-8 flex flex-col gap-8
│     ├─ PaymentMethodPicker (§3a)  — section "Payment method"
│     │  └─ (Add a new card checked, or no saved card) CardFields panel (§3b)
│     ├─ ChargeNote (§3c)
│     └─ (jobs.create failed) FormAlert tone="error" "Something went wrong. Your job is saved — try again"
└─ actions: Back (→ Review) · Post job (brand, loading "Posting your job…")
span.sr-only role="status" aria-live="polite" → "Posting your job…" while posting, empty otherwise
```

- **The summary is first in the DOM** but has no focusable element from `md` (its toggle is `md:hidden`). The keyboard order at desktop is therefore fields, then Back, then Post job.
- The JobSummaryPanel Who row reads "Pick a Worker" without a name on this step, because Payment makes no worker call. If `ReviewStep` already resolved the name, it can be passed in memory; there is no new service call.
- **Enter** in a card field, or on a method card (the existing `SelectableCard` Enter rule), submits the form, which is Post job. That is normal form behaviour on the final step, and validation still runs.

### Tablet 768 px and 1024 px

- **1024:** the T6 map, with the form at 629 px and the summary at 299 px (sticky). In the card fields, the expiry/CVC/ZIP row has 3 columns of about 182 px.
- **768:** stacked, **summary first** (the expanded "Your job" panel), then the fields, then the static Back / Post job row. The spec row says only "Stacked" for tablet. The DOM order is shared with mobile so that visual order equals focus order (OQ 4).

### Mobile 375 px

- Order: Stepper, the **"Your job" bar** (collapsed; it shows "Est. $120", so the price is visible before the card form), h1, payment method rows, card panel, charge note, [error alert], then the sticky footer.
- Sticky footer: Back (outline, about 104 px) and **Post job** (`flex-1`, about 227 px). "Posting your job…" with the spinner is about 216 px, so it fits on one line.
- Card fields: the number is full width. Expiry and CVC sit side by side (146 px each inside the panel). Billing ZIP is on the next row at half width.

### 3a. `PaymentMethodPicker` (new: `src/components/job/payment-method-picker.tsx`, client)

Props: `methods: PaymentMethod[]`, `value: string` (a method id or `"new"`), `onValueChange`, `cardPanelId`, `children` (the CardFields panel, rendered right after the "Add a new card" row).

```
section[aria-labelledby="payment-methods-title"].flex flex-col gap-4
├─ h2#payment-methods-title.text-h4 → "Payment method"           ("Add a card" when there are no saved methods)
├─ (saved methods) RadioGroup (existing ui) aria-labelledby="payment-methods-title" .grid grid-cols-1 gap-3
│  ├─ SelectableCard type="radio" layout="row" icon={CreditCard} value={m.id}
│  │     title "Visa ending 4242"                 (CARD_BRAND_LABELS[brand] + last4; never more digits)
│  └─ SelectableCard type="radio" layout="row" icon={Plus} value="new" controls={cardPanelId}
│        title "Add a new card" · description "Visa, Mastercard or American Express"
├─ (value === "new" or no saved methods) children → CardFields panel (directly after the "Add a new card" row)
```

- The first saved method is preselected, so no "choose a method" error exists (product plan schema note). With no saved methods there is no radio group: the `h2` reads "Add a card", the line `p.text-body-sm text-ink-muted` "You don't have a saved card yet." follows, and the panel shows directly.
- Choosing "Add a new card" does not move focus (as with T6's "Other"). The card number is next in Tab order.
- Choosing a saved card hides the panel. Typed card values are dropped from form state (`shouldUnregister` for the `card.*` fields), so a hidden card can't be submitted by mistake.
- A row is about 56 px tall (`min-h-14`) and full column width (687 / 629 / 720 / 343).

### 3b. `CardFields` (new: `src/components/forms/card-fields.tsx`, client)

Props: `register`, `errors`, `control`, `idPrefix` ("card"), `alert?: ReactNode` (the addMethod error).

```
div#card-panel.rounded-lg border border-border bg-surface p-4 md:p-6        (surface: error text stays 4.8:1)
└─ div.flex w-full max-w-xl flex-col gap-6
   ├─ alert slot (addMethod failed) → FormAlert tone="error" "We couldn't add this card"   (focused on appear)
   ├─ p#card-demo-note.flex items-start gap-2 rounded-md bg-brand-soft p-3 text-body-sm text-ink
   │     Info size-4 shrink-0 (aria-hidden) + "Demo only — don't enter a real card. Try 4242 4242 4242 4242."
   ├─ FormField id="card-number" label="Card number" describedByExtra="card-demo-note [card-number-brand]"
   │  └─ div.relative
   │     ├─ Input type="text" inputMode="numeric" autoComplete="cc-number" maxLength={19}
   │     │        autoCorrect="off" spellCheck={false} aria-required className="pr-24"
   │     │        (formats as typed: "4242 4242 4242 4242", Amex "3782 822463 10005")
   │     └─ span#card-number-brand.pointer-events-none absolute inset-y-0 right-4 flex items-center
   │              text-body-sm font-semibold text-ink → "Visa" | "Mastercard" | "American Express"
   │              (rendered only once a brand is detected; detectCardBrand)
   └─ div.grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3
      ├─ FormField id="card-expiry" label="Expiry date" hint="MM/YY"
      │     Input inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" maxLength={5}   (auto-inserts "/")
      ├─ FormField id="card-cvc" label="Security code" hint="3 digits (4 for Amex)"
      │     Input inputMode="numeric" autoComplete="cc-csc" maxLength={4}
      └─ FormField id="card-zip" label="Billing ZIP code"
            Input inputMode="numeric" autoComplete="billing postal-code" maxLength={5}
```

- **Validation** (verbatim, from `cardSchema`; on blur and on submit, then live on change):

  | Field | Error |
  | --- | --- |
  | Card number | "Enter a valid card number" (16 digits, 15 for Amex) |
  | Expiry | "Enter a valid expiry date" (MM/YY, not in the past) |
  | CVC | "Enter the security code" (3, or 4 for Amex) |
  | Billing ZIP | "Enter a 5-digit ZIP code" (the existing `zipSchema`; OQ 1) |

- **Error linking:** each error is `p#{id}-error` under its control (`FieldError`, `CircleAlert` icon). It is linked through the control's `aria-describedby` (`FormField` builds "hint error extras" from the ids that exist), and the control gets `aria-invalid="true"` while the error shows.
- **Brand label:** visible text inside the field (not colour, not a logo). It is part of the number's description, so it is read on focus. It is not a live region (it changes once per typing burst). `pr-24` (96 px) keeps typed digits clear of "American Express" up to about 90 px. At 375 the number field is 309 px, which leaves 197 px for the 19 formatted characters (about 170 px).
- **Privacy (AGENTS rule 9):** values live in RHF form state only: never in the store, the URL, `defaultValues`, a log or analytics props. `payments.addMethod` gets the number, expiry and CVC, and keeps `{ brand, last4 }` only. The billing ZIP is validated and then discarded.
- **Widths:** 1280 is `max-w-xl` 576 px inside a 637 px panel; 1024 is 576 px (inner 579); 768 is 576 px; 375 is 309 px.

### 3c. Charge note (inside `payment-step.tsx`)

```
section[aria-labelledby="charge-title"].rounded-lg border border-border bg-surface p-4 md:p-6
├─ div.flex flex-wrap items-baseline justify-between gap-x-4
│  ├─ h2#charge-title.text-body font-semibold text-ink → "Estimated total"
│  └─ p.text-h3 font-semibold text-ink → "$120"
├─ p.text-body-sm text-ink-muted → "$40/hr × 3 hours" | "Fixed Price"
├─ ul.mt-4 flex flex-col gap-2 text-body-sm text-ink
│  ├─ li.flex items-start gap-2 → CalendarCheck size-5 (aria-hidden) "You're charged when the job is done."
│  └─ li.flex items-start gap-2 → Ban size-5 (aria-hidden) "There are no refunds."
└─ ExternalLink "When am I charged?" (/faq#payment-timing) .mt-2 inline-flex min-h-11 items-center gap-2 text-body-sm text-ink underline underline-offset-4
```

This is decision 2: the rule is stated next to the button that commits to it. At desktop the same total also sits in the sticky summary. At 375 this block is the last thing above the sticky Post job button.

### Component tree

```
src/app/post-job/payment/page.tsx (server) — metadata "Post a job — Payment", instant = false
└─ Suspense fallback={<StepSkeleton/>}
   └─ RequireRole role="customer" loading={<StepSkeleton/>} (existing)     session guard first
      └─ JobStepRoute step={7} (existing; + lastStep >= 6 rule)            draft guard
         └─ PaymentStep (new: src/components/post-job/payment-step.tsx)
            ├─ payments.listMethods → methods state
            ├─ useForm(paymentSchema)
            └─ StepLayout (existing, extended) step={7} summaryFirst loading continueLabel
               ├─ summary: JobSummaryPanel (existing) currentStep={7}
               ├─ PaymentMethodPicker (new)
               │  ├─ RadioGroup (existing ui) > SelectableCard ×n (existing)
               │  ├─ LoadingState variant="rows" | ErrorState (existing)
               │  └─ CardFields (new) > FormField + Input ×4, FormAlert
               ├─ charge note > ExternalLink (existing)
               ├─ FormAlert (existing) — jobs.create error
               └─ span.sr-only role="status" — posting announcement
```

### Styling

| Element | Classes |
| --- | --- |
| Fields stack | StepLayout children `flex flex-col gap-8` (`*:scroll-mb-24 md:*:scroll-mb-0`, unchanged) |
| Method section title | `h2 text-h4` |
| Card panel | `rounded-lg border border-border bg-surface p-4 md:p-6`; inner `max-w-xl flex flex-col gap-6` |
| Demo note | `rounded-md bg-brand-soft p-3 text-body-sm text-ink` (ink on brand-soft 8.9:1) |
| Brand label | `text-body-sm font-semibold text-ink` inside the input's right padding |
| Expiry/CVC/ZIP row | `grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3` |
| Charge note | `rounded-lg border border-border bg-surface p-4 md:p-6`; total `text-h3 font-semibold` |
| Post job | StepLayout Continue: brand fill, `flex-1 md:flex-none`, wrap-safe |

### States

| Area | Loading | Empty | Error | Success |
| --- | --- | --- | --- | --- |
| Guards | `StepSkeleton` (`RequireRole` loading, then the draft guard) | Guest → `/login?next=/post-job/payment`. Incomplete draft → first incomplete step. Review not passed → Review | — | The page |
| Saved methods (`payments.listMethods`) | `LoadingState variant="rows" count={2} label="Loading your payment methods…"` in place of the radio group; the `h2` stays; Post job is `disabled` (nothing to submit yet) | No saved card: the "Add a card" heading, the intro line and the card panel shown directly | `?mockError=1`: `ErrorState headingLevel={3}` (default title and message) in place of the group, `onRetry` refetches ("Retrying…"). `role="alert"` announces it, focus does not move, and Post job stays `disabled` until a retry succeeds | Radio rows with the first saved method checked |
| Card form | — | — | Validation messages under each field; on Post, focus goes to the first invalid field (number → expiry → CVC → ZIP) | — |
| Posting sequence (addMethod → jobs.create → templates.save) | Post job shows the spinner and "Posting your job…" (`aria-busy`), disabled for the whole sequence; the `fieldset` disables the method rows, card fields and Back; the sr-only status announces "Posting your job…" | — | **addMethod fails:** `FormAlert` "We couldn't add this card" at the top of the card panel, focused; the typed card stays; nothing is posted. **jobs.create fails:** `FormAlert` "Something went wrong. Your job is saved — try again" as the last field-stack item (directly above the actions), focused. If the card was already added, it becomes a checked saved row and the panel closes, so Retry doesn't add it twice. **SIGN_IN_REQUIRED:** redirect to `/login?next=/post-job/payment`. **templates.save fails:** not shown here (Confirmation offers it again) | `router.replace('/post-job/confirmation?job=<id>')` after `markStepNavigation()`. The button keeps its spinner until the route changes (no step-1 flash, rule 27) |

`?mockError=1` is used up by `listMethods`, so the card error path is checked in code review (OQ 21).

### Interaction details

- **Focus order (1280):** method group (one Tab stop; arrows move and select), [card number, expiry, security code, billing ZIP], When am I charged?, Back, Post job. At 375 the "Your job" toggle comes first.
- **Expiry input:** typing "12" gives "12/"; Backspace over "/" removes it. Paste "12/28" or "1228" both work. The caret is never moved to the end mid-edit.
- **Card number input:** spaces are inserted as typed; paste with spaces or dashes is accepted. `maxLength={19}` stops extra digits.
- **Errors never clear typed input,** including after a failed `addMethod`.
- **Back** goes to Review without validating. Card values are dropped deliberately; the method choice is not stored.

---

## 4. `AppPrompt` (new: `src/components/layout/app-prompt.tsx`, client; reused by T11)

Props: `app: "customer" | "worker"`, `androidTitle`, `androidBody?`, `installLabel`, `updatesText`, `headingLevel?: 2 | 3` (default 2), `onShown?(variant)`, `onInstallClick?()`, `onDismissed?()`.

### 4.1 Variants

**Android** (`isAndroidUserAgent(navigator.userAgent)`, read after mount):

```
section[aria-labelledby="app-prompt-{app}-title"].relative rounded-lg border border-border bg-surface p-4 md:p-6
├─ div.flex items-start gap-4 pr-12                                       (keeps text clear of the dismiss button)
│  ├─ span[aria-hidden].flex size-10 shrink-0 items-center justify-center rounded-full bg-brand md:size-12
│  │     Smartphone size-5 md:size-6 text-brand-foreground
│  └─ div.min-w-0 flex-1
│     ├─ h2#…-title.text-h4 → "Get notified the moment a worker accepts — install the app"   (PRD, verbatim)
│     ├─ p.mt-1 text-body-sm text-ink-muted → "The Chores For Me app is free on Google Play."
│     └─ Button asChild className="mt-4 w-full sm:w-auto"
│          → ExternalLink href={PLAY_STORE_CUSTOMER_URL} onClick={onInstallClick} "Get it on Google Play"
└─ Button variant="ghost" size="icon" .absolute top-2 right-2 md:top-4 md:right-4
     X size-5 · aria-label "Dismiss for 7 days"
```

**Every other device:**

```
section (same frame)
├─ div.flex items-start gap-4 pr-12
│  ├─ icon disc (same) → Mail size-5 md:size-6 text-brand-foreground
│  └─ h2#…-title.text-h4 self-center → "We'll email and text you updates"                       (PRD, verbatim)
└─ dismiss button (same)
```

- No install text and no Play Store link outside Android (PRD: "instead of a dead link").
- The frame is `surface` with a decorative `border-border`. The only brand pieces are the icon disc (a fill) and the Play button (a fill with `text-brand-foreground`, 4.9:1).
- **Before mount, or when dismissed, it renders `null`.** On Confirmation it only renders with the loaded job, after a 400–800 ms load, so it appears together with the page content and causes no visible shift and no hydration mismatch.
- **Dismiss** stores `now + 7 days` (per `app`), hides the prompt and calls `onDismissed`. Storage errors mean "not dismissed".

### 4.2 Widths

| Width | Result |
| --- | --- |
| 1280 / 1024 / 768 | 672 px (the Confirmation column), `p-6`, 48 px disc, button at natural width ("Get it on Google Play" about 230 px) |
| 375 | 343 px, `p-4`, 40 px disc, the title wraps to about 3 lines in the 227 px text column, button full width (wraps under the text, `w-full`) |

---

## 5. Step 8 Confirmation — `/post-job/confirmation?job=<id>`

### Desktop 1280 px (reference)

There is no `StepLayout` (no form, no Back, no summary panel).

```
div
├─ Stepper "Step 8 of 8" (full container width, mb-8 lg:mb-12 — same position as steps 1–7, no jump)
└─ div.mx-auto w-full max-w-2xl flex flex-col gap-8                                  672 px, centred
   ├─ header
   │  ├─ span[aria-hidden].flex size-12 items-center justify-center rounded-full bg-brand-soft (CircleCheck size-6 text-ink)
   │  ├─ h1#confirmation-title.mt-4 tabIndex=-1 aria-describedby={statusId} .text-h3 md:text-h2 outline-none focus-visible:outline-2
   │  │     → "Job posted"
   │  └─ p.mt-2 text-body text-ink-muted → "You can follow it from your dashboard."
   ├─ section "What happens next" (§5.2)
   ├─ ReviewSummary source=job editable={false} title="Job summary" status worker (§1)
   ├─ Template status or offer (§5.4)
   ├─ AppPrompt app="customer" (§4)
   └─ div.flex flex-col gap-3 sm:flex-row                                       (actions)
      ├─ Button asChild className="w-full sm:w-auto" → Link /dashboard "Go to my dashboard"         (primary)
      └─ Button asChild variant="outline" className="w-full sm:w-auto" → Link /post-job/category "Post another job"
```

- The order follows OQ 23 and is the same at every width. The left-aligned column reads better than centred text for the list and the summary.
- The page has two brand fills (the Play button on Android, and Go to my dashboard). They sit in separate sections, and the dashboard action keeps its primary position at the end (OQ 6).

### Tablet 768 px and 1024 px

Identical: the 672 px column is centred, with 24 px (768) or 144 px (1024) spare on each side. The Stepper spans the container.

### Mobile 375 px

- The column is 343 px, in the same order. Actions are stacked full width, with the primary first.
- The Stepper is in its compact form ("Step 8 of 8 · Confirmation", no "Next:" line).

### 5.2 What happens next

```
section[aria-labelledby="next-title"].rounded-lg bg-surface-alt p-4 md:p-6
├─ h2#next-title.text-h4 → "What happens next"
└─ ul.mt-4 flex flex-col gap-4
   └─ li.flex items-start gap-3 text-body text-ink
        span[aria-hidden].flex size-10 shrink-0 items-center justify-center rounded-full bg-surface (icon size-5 text-ink)
        + p.pt-2 → text
```

| Match type | Items (OQ 24 copy, [provisional]) |
| --- | --- |
| Board | `ClipboardList` "Your job is on the job board. Verified workers near you can see it, and the first to accept gets it." · `Mail` "We'll email and text you updates." · `CreditCard` "You're charged when the job is done. There are no refunds." |
| Direct | `UserRoundCheck` "We've sent your job to Jordan M. It shows as Accepted in your dashboard." (the name falls back to "your chosen worker") · `Mail` … · `CreditCard` … |

The section is `surface-alt` and holds no error text.

### 5.3 Summary

`ReviewSummary` is read-only and built from the posted `Job`. It has the status chip ("Open" for board jobs, "Accepted" for direct), the photo count only (OQ 17), and the worker name from `workers.listForArea` with the "your chosen worker" fallback.

### 5.4 Template status or offer

**Saved** (`templates.save` succeeded in this session, or `job.savedAsTemplate`):

```
p#template-status tabIndex=-1 .flex items-start gap-2 rounded-lg border border-border bg-surface p-4 text-body text-ink outline-none focus-visible:outline-2
  CircleCheck size-5 text-success (aria-hidden) + span → "Saved as template “Weekly lawn care”" + span.block text-body-sm text-ink-muted "You'll find it in your dashboard."
```

**Offer** (box not ticked, or saving failed, or after a reload without `savedAsTemplate`):

```
section[aria-labelledby="template-offer-title"].rounded-lg border border-border bg-surface p-4 md:p-6
├─ h2#template-offer-title.text-h4 → "Save this job as a template"
├─ p.mt-1 text-body-sm text-ink-muted → "Post it again later from your dashboard."
├─ (save failed during posting) p.mt-4 flex items-start gap-2 text-body-sm text-ink-muted
│     Info size-4 + "We couldn't save your template. You can try again here."          (quiet, not red)
├─ (service error) FormAlert tone="error" className="mt-4" → SERVICE_MESSAGES.mockError (focused)
└─ form noValidate .mt-4  (SaveTemplateField variant="nameOnly", saveTemplateSchema)
   └─ div.flex flex-col gap-3 sm:flex-row sm:items-start          (T5 MobileVerifyField row pattern)
      ├─ FormField id="confirm-template-name" label="Template name" hint="3 to 40 characters." className="min-w-0 flex-1"
      │     Input maxLength={40} autoComplete="off"; error "Name this template"
      └─ Button type="submit" variant="secondary" className="w-full sm:mt-8 sm:w-auto"
            → "Save template" / loading "Saving…"
```

- `sm:mt-8` (32 px) aligns the button with the input under the 20 px label and 8 px gap. If a hint or error shows, the input stays put and the button stays aligned with it.
- **Save as Template is `secondary`** (brand-soft), so the page keeps the dashboard action as the main brand primary.
- **On success,** the offer is replaced by the Saved line, which takes focus (`#template-status`).

### 5.5 Not-found fallback (unknown id, or another customer's job)

```
Stepper is not shown (the flow is not in progress)
div.mx-auto w-full max-w-2xl
└─ EmptyState headingLevel={1} icon={SearchX}
     title "We couldn't find this job"                           (SCREEN_STATE_COPY.jobNotFound, verbatim)
     description "The link may be wrong, or the job belongs to another account."
     action: div.flex w-full flex-col gap-3 sm:flex-row sm:justify-center
       ├─ Button asChild → /dashboard "Go to my dashboard"
       └─ Button asChild variant="outline" → /post-job/category "Post a job"
```

At 375 the card is `px-4 py-12` and the buttons are stacked full width. With no `?job=`, the page shows the loading view while it `router.replace`s (to the draft's first incomplete step or Review, or to `/dashboard`; OQ 14).

### 5.6 `LoadingState variant="confirmation"` (edit to `states/loading-state.tsx`)

```
div.mx-auto w-full max-w-2xl flex flex-col gap-8
├─ div: Skeleton size-12 rounded-full ; Skeleton mt-4 h-8 w-1/2 ; Skeleton mt-2 h-4 w-2/3
├─ div.rounded-lg bg-surface-alt p-4 md:p-6 flex flex-col gap-4: Skeleton h-6 w-1/3 + 3 × (Skeleton h-4 w-full)
├─ div.rounded-lg border border-border p-4 md:p-6 flex flex-col gap-4: Skeleton h-6 w-1/3 + 5 × (Skeleton h-4 w-2/3)
└─ div.flex flex-col gap-3 sm:flex-row: Skeleton h-12 w-full sm:w-1/3 ×2
```

It sits inside the standard `role="status" aria-busy` wrapper with the label "Loading your job…". The real Stepper renders above it.

### Component tree

```
src/app/post-job/confirmation/page.tsx (server) — metadata "Post a job — Confirmation", instant = false
└─ Suspense fallback={<StepSkeleton/>}
   └─ RequireRole role="customer" loading={<StepSkeleton/>} (existing)
      └─ ConfirmationStep (new: src/components/post-job/confirmation-step.tsx) key={revisitKey}
         ├─ useSearchParams → job id; jobs.get; ownership check; workers.listForArea (direct)
         ├─ Stepper (existing) step 8
         ├─ LoadingState variant="confirmation" | ErrorState headingLevel={1} | EmptyState headingLevel={1}
         └─ success column
            ├─ header (icon disc, h1, lead)
            ├─ what happens next (section)
            ├─ ReviewSummary (new) source=job
            ├─ template status | offer → SaveTemplateField variant="nameOnly" (new) + FormAlert
            ├─ AppPrompt (new) app="customer" onDismissed
            └─ Button ×2 (existing)
```

### Styling

| Element | Classes |
| --- | --- |
| Column | `mx-auto w-full max-w-2xl flex flex-col gap-8` |
| Success disc | `size-12 rounded-full bg-brand-soft`, `CircleCheck size-6 text-ink` |
| What happens next | `rounded-lg bg-surface-alt p-4 md:p-6`; icon discs `size-10 rounded-full bg-surface` |
| Status chip | `rounded-full bg-brand-soft px-3 py-1 text-body-sm font-semibold text-ink` |
| Template card | `rounded-lg border border-border bg-surface p-4 md:p-6` |
| Actions | `flex flex-col gap-3 sm:flex-row`; buttons default size (48 px) |

### States

| Area | Loading | Empty | Error | Success |
| --- | --- | --- | --- | --- |
| Session | `StepSkeleton` (`RequireRole`) | Guest → `/login?next=…` | — | — |
| Job (`jobs.get(?job)`) | Stepper + `LoadingState variant="confirmation"` | No `?job=` → loading view while redirecting (OQ 14). `JOB_NOT_FOUND` or another customer's job → the §5.5 fallback | `?mockError=1`: Stepper + `ErrorState headingLevel={1}` (default title and message) with `onRetry` ("Retrying…") and `secondaryAction` "Go to my dashboard" (outline). Focus does not move; `role="alert"` announces it; Retry succeeds | The column (§5) |
| Worker name (direct) | Inline skeleton in the Who row and the "We've sent your job to …" item | — | Fallback "your chosen worker", with no note (OQ 8) | Name |
| Template offer (`templates.save`) | "Saving…" on the button; the name field is `readOnly` | Shown when there is nothing to report as saved | Validation "Name this template" under the field (focus to it); service error `FormAlert` above the form (focused); the typed name is kept | The Saved line, focused |
| AppPrompt | Renders nothing until mounted | Dismissed within 7 days: renders nothing | — (no service) | Android or updates variant |

### Interaction details

- **Arrival from Payment:** `markStepNavigation()` was called before `router.replace`, so once the job loads, `#confirmation-title` takes focus. The screen reader hears "Job posted, heading level 1, Step 8 of 8: Confirmation". A reload or a direct link never moves focus.
- **Focus order (all widths):** skip link, logo, [Template name, Save template], [Get it on Google Play (Android)], Dismiss, Go to my dashboard, Post another job. The summary has no focusable elements in read-only mode.
- **Dismiss:** the prompt disappears, and focus moves to "Go to my dashboard" (`onDismissed`, so focus is never lost to `body`). An sr-only `role="status"` in `ConfirmationStep` says "Hidden for 7 days."
- **Play Store link** opens in a new tab (`ExternalLink` adds the sr-only "(opens in a new tab)").
- **Browser Back** after Confirmation lands on Review, whose guard sends the empty draft to step 1 (OQ 15). There is no UI on this page for it.

---

## 6. Form-state rules (all T7 forms; T5 §14 and T6 §12 unless stated)

| Concern | Rule |
| --- | --- |
| Field errors | `FieldError` under the control on `surface`, linked with `aria-describedby`, plus `aria-invalid`. Shown on blur and on submit, then live on change (`mode: "onTouched"`, `shouldFocusError: false`, `focusFirstError`) |
| First invalid field | Review: `["templateName"]`. Payment: `["card.number","card.expiry","card.cvc","card.zip"]`. Confirmation offer: `["name"]`. The T5 forms keep their own lists |
| Messages | Verbatim from `VALIDATION_MESSAGES` (`templateName`, `cardNumber`, `expiry`, `cvc`, `zip`), `SERVICE_MESSAGES` and `SCREEN_STATE_COPY` (`postingJob`, `cardError`, `jobBuilderError`, `jobNotFound`). No new wording for existing rules |
| Service errors | Inline `FormAlert`, focused on appear and cleared when the next submit starts. Typed values are never cleared |
| Submit loading | `Button loading` with the action label; the form's `fieldset` is disabled for the whole call |
| Card data | Form state only; see §3b |
| Toasts | None (decision 7) |

---

## 7. Files

```
src/components/flow/review-summary.tsx                                   (new)
src/components/post-job/review-step.tsx | review-auth-panel.tsx | save-template-field.tsx
src/components/post-job/payment-step.tsx | confirmation-step.tsx       (new)
src/components/job/payment-method-picker.tsx                            (new)
src/components/forms/card-fields.tsx                                    (new)
src/components/layout/app-prompt.tsx                                    (new)
src/components/flow/step-layout.tsx                                     (edit: as, hideContinue, asideWidth, asideSticky, summaryFirst, wrap-safe Continue)
src/components/auth/auth-card.tsx                                       (edit: headingLevel)
src/components/auth/login-form.tsx | sign-up-form.tsx | forms/form-alert.tsx (edit: switch callbacks, onClick action)
src/components/states/empty-state.tsx | error-state.tsx                 (edit: headingLevel 1)
src/components/states/loading-state.tsx                                 (edit: variant "confirmation")
src/components/post-job/{category,services,location,details,match}-step.tsx (edit: "Save and return to review" label with ?from=review)
src/app/post-job/{review,payment,confirmation}/page.tsx                 (new)
src/lib/constants.ts                                                    (strings below)
```

Not touched (imported only): `Stepper`, `StepSkeleton`, `SelectableCard`, `JobSummaryPanel`, `JobBuilderGate`, `JobStepRoute`, `RequireRole`, `SocialButtons`, `SocialSignInDialog`, `CompleteProfileForm`, `LogoutButton`, `RoleChip`, `FormField`, `ExternalLink`, and every `ui/*` primitive.

---

## 8. New strings (`src/lib/constants.ts`; all [provisional] unless marked verbatim or reused)

**`JOB_BUILDER_COPY.meta`**: review "Post a job — Review" · payment "Post a job — Payment" · confirmation "Post a job — Confirmation".

**`JOB_BUILDER_COPY.actions`**: returnToReview "Save and return to review".

**`JOB_BUILDER_COPY.review`**:

- Page: title "Review your job" · descriptionGuest "Check the details, then create an account or log in to post it." · descriptionCustomer "Check the details, then continue to payment." · jumpToAuth "Create an account to continue".
- Summary: summaryTitle "Your job" (= `summary.title`) · edit "Edit" · editSr(section) " {section, lowercase}" · priceFixed(v) "Fixed Price · {v}" · priceHourly(breakdown) "Hourly · {breakdown}".
- Worker: workerLoading "Loading worker…" · workerFallback "your chosen worker" · workerError "We couldn't load the worker's details." · workerRetry "Try again".
- Template: templateLabel "Save as template" · templateHint "Post this job again later from your dashboard." · templateNameLabel "Template name" · templateNameHint(min, max) "{min} to {max} characters."
- Auth: authLead "Create an account or log in to post your job". The titles, switch lines and complete-profile copy reuse `AUTH_COPY` (`signUp.title.customer`, `signUp.haveAccount`, `signUp.logIn`, `login.title`, `login.noAccount`, `login.signUpLink`, `completeProfile.*`).
- Post card: postTitle "Ready to post your job" · postDescription "Next, choose how to pay. You're charged when the job is done." · signedInAs "Signed in as" · continue "Continue to payment" (notYou reuses `AUTH_COPY.completeProfile.notYou`).
- Help: helpTitle "Questions?" (the link labels reuse the FAQ `question` text).

**`JOB_BUILDER_COPY.payment`**:

- Page: title "How would you like to pay?" · description "Choose a saved card or add a new one."
- Methods: methodsTitle "Payment method" · methodsLoading "Loading your payment methods…" · savedCard(brand, last4) "{brand} ending {last4}" · addNew "Add a new card" · addNewDescription "Visa, Mastercard or American Express" · noSavedTitle "Add a card" · noSavedIntro "You don't have a saved card yet."
- Card fields: demoNote "Demo only — don't enter a real card. Try 4242 4242 4242 4242." (OQ 11) · numberLabel "Card number" · expiryLabel "Expiry date" · expiryHint "MM/YY" · cvcLabel "Security code" · cvcHint "3 digits (4 for Amex)" · zipLabel "Billing ZIP code".
- Charge note: charged "You're charged when the job is done." · noRefunds "There are no refunds." · faqLink = FAQ `payment-timing` question.
- Submit: submit "Post job" · submitting = `SCREEN_STATE_COPY.postingJob` (verbatim).

**`CARD_BRAND_LABELS`**: visa "Visa" · mastercard "Mastercard" · amex "American Express".

**`JOB_BUILDER_COPY.confirmation`**:

- Page: title "Job posted" · description "You can follow it from your dashboard." · loading "Loading your job…".
- What happens next: nextTitle "What happens next" · nextBoard "Your job is on the job board. Verified workers near you can see it, and the first to accept gets it." · nextDirect(name) "We've sent your job to {name}. It shows as Accepted in your dashboard." · nextUpdates "We'll email and text you updates." · nextCharge "You're charged when the job is done. There are no refunds."
- Summary: summaryTitle "Job summary" · statusSr "Status: ".
- Template: templateSaved(name) "Saved as template “{name}”" · templateSavedHint "You'll find it in your dashboard." · templateOfferTitle "Save this job as a template" · templateOfferHint "Post it again later from your dashboard." · templateSaveFailed "We couldn't save your template. You can try again here." · templateSave "Save template" · templateSaving "Saving…".
- Actions: postAnother "Post another job" (dashboard reuses `AUTH_COPY.separate.goToDashboard`).
- Not found: notFoundDescription "The link may be wrong, or the job belongs to another account." · postJob "Post a job" (the title is `SCREEN_STATE_COPY.jobNotFound`, verbatim).
- Prompt: promptHidden "Hidden for 7 days."

**`APP_PROMPT_COPY.customer`**: androidTitle "Get notified the moment a worker accepts — install the app" (PRD, verbatim) · androidBody "The Chores For Me app is free on Google Play." · install "Get it on Google Play" · updates "We'll email and text you updates" (PRD, verbatim). **`APP_PROMPT_COPY.dismiss`**: "Dismiss for 7 days". The worker entry is left to T11.

---

## 9. QA hooks (design-specific)

- **Forbidden classes:** grep the T7 files for raw hex, `text-white`, `text-brand`, `border-brand`, `ring-`, `text-sm|xs|base|lg`, `font-medium|bold` and arbitrary `[…]` values. The result must be zero.
- **No horizontal scroll at 375 × 812** (`scrollWidth === 375`) on:
  - Review as a guest in Sign up mode with the OTP panel open, in Log in mode, in the complete-profile variant and with the Post card.
  - Payment with "Add a new card" open and all four card errors showing, and with the methods ErrorState.
  - Confirmation with the Android prompt, the template offer showing an error, and the not-found fallback.
- **OTP at 1024:** on Review in Sign up mode, the six boxes sit in one row inside the bordered panel with none clipped (the 464 px column).
- **Layout at 1280:** Review is 687 / 481 with the Post card sticky only for a customer. Payment is 687 / 379 with the summary sticky. Confirmation's column is 672 px and centred.
- **Layout at 768:** Review is summary then auth card. Payment is the expanded summary first.
- **Layout at 375:** Payment shows the "Your job" bar (with "Est. $…") between the Stepper and the h1. The sticky footer holds Back and Post job, and "Posting your job…" fits on one line. Review's sticky footer holds Back only.
- **Focus after inline auth:** sign up with OTP `123456` → focus is on "Ready to post your job". Social sign-in as a new user → focus is on "Finish setting up your account". After finishing → focus is on the Post card heading. A hard reload as `demo.customer` → no focus move.
- **Card fields:** each input has its `autocomplete` (`cc-number`, `cc-exp`, `cc-csc`, `billing postal-code`) and `inputmode="numeric"`. Each error id appears in its input's `aria-describedby`, and the demo note id is in the card number's.
- **Posting:** double-clicking Post job creates one job. The spinner stays until Confirmation renders, and no step-1 skeleton flashes.
- **AppPrompt:** an Android UA shows the Play button. A desktop UA shows the updates line only. Dismiss → focus is on "Go to my dashboard"; after a reload the prompt stays hidden.
- **Touch targets:** Edit links, mode switch, help links, "Not you? Log out", the dismiss button, method rows, inputs and all buttons are at least 44 px.
- **Covered focus at 375:** submitting an empty sign-up form on Review leaves the first invalid field visible above the Back footer.

---

## Open questions

Each has a proposed default, which applies unless the orchestrator decides otherwise.

1. **Billing ZIP on the card form.** The brief asks for it, but `cardSchema`, `CardInput`, the Tech Spec validation table and the product plan's `CardFields` have card number, expiry and CVC only. *Default:* include "Billing ZIP code", validated with the existing `zipSchema` ("Enter a 5-digit ZIP code") inside the approved `paymentSchema` new-card branch. It is form state only, so it is not passed to `payments.addMethod` and `CardInput` is unchanged. Alternative: drop the field.
2. **`StepLayout` extensions** (`as="div"`, `hideContinue`, `asideWidth="wide"`, `asideSticky`, `summaryFirst`, and a wrap-safe Continue) instead of a separate Review layout. *Default:* extend, so steps 6–7 keep the same Stepper, heading, focus rule and sticky footer as steps 1–5.
3. **Review column split:** 6/6 at 1024 and 7/5 at 1280, wider than the T6 summary column, so that the embedded sign-up form and OTP row fit without changing any T5 form. *Default:* as planned.
4. **Payment "summary first" at tablet too.** The spec sets it only for mobile, and tablet is just "Stacked". Mobile and tablet share the DOM order, so visual order equals focus order. *Default:* summary first below `lg`.
5. **Guest jump link** "Create an account to continue" below `lg`, because the auth card sits about 900 px down and the sticky footer holds Back only (OQ 2). *Default:* include it (the T5 "Use a demo account" pattern).
6. **Two brand fills on Confirmation** (Android "Get it on Google Play" and "Go to my dashboard"). *Default:* keep both, because the install is the hand-off goal and T11 reuses `AppPrompt` as a card's main action. Alternative: make the Play button `secondary`.
7. **Post job while the methods list is loading or failed.** *Default:* the button is `disabled` (`opacity-50`), because no method can be chosen yet. The ErrorState beside it explains why. This is the only disabled submit in the builder.
8. **`h1` on the Confirmation fallback and error.** *Default:* `EmptyState` and `ErrorState` accept `headingLevel={1}` (same look), and `LoadingState` gains a `confirmation` variant, following T6's `workers` precedent.
