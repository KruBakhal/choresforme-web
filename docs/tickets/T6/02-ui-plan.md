# T6 — UI plan (Job builder steps 1–5)

Input: `01-product-plan.md`, including its "Orchestrator decisions" (binding: all 21 open-question defaults apply). Also used: the T2 UI plan (tokens, type scale, spacing and sizing allowlists, contrast pairs, focus rule, Button, Sheet, state components), the T5 UI plan (`FormField`, `FieldError`, `FormAlert`, `focusFirstError`, field patterns, the `+1` adornment, `SeparateAccountsNotice`), and the Tech Spec sections "Responsive layouts" (Job builder and Pick a Worker rows), "Screen states", "Validation rules" and the component inventory. This plan does not reopen any of those decisions.

Reference width is 1280 px, then 1024, 768 and 375. Breakpoints are `sm 640 · md 768 · lg 1024 · xl 1280`. "Desktop" means `lg` and up, "tablet" means `md` to `< lg`, and "mobile" means `< md`.

---

## 0. Ground rules for every T6 screen

### 0.1 Colour and contrast (T2 §0.3, restated)

| Use in T6 | Classes | Ratio |
| --- | --- | --- |
| Body and labels | `text-ink` on `surface`, `surface-alt` or `brand-soft` | 12.6 / 11.5 / 8.9 |
| Hints, meta, counters, "Not added yet" | `text-ink-muted` on `surface` / `surface-alt` / `brand-soft` | 8.2 / 7.5 / 5.8 |
| Field and group errors | `text-danger` on **`surface` only**. Errors never sit on `surface-alt` (4.4:1 fails), so every error line is placed on a `surface` area. | 4.8 |
| Brand **fills** | Continue button, category icon tiles, the checked indicator box in `SelectableCard` / `WorkerCard`, the checked Fixed/Hourly segment, done and current progress segments. Always with `text-brand-foreground` when they hold text or an icon. | 4.9 |
| Soft tint | Selected card background, category chip, icon discs, Favourite tag: `bg-brand-soft` + `text-ink` | 8.9 |
| Star rating icon | `text-warning fill-warning size-4`, always with the number beside it (T2 rule for warning icons) | 3.2 (non-text) |
| Verified check icon | `text-success size-5`, always with a text label | 3.3 (non-text) |

- **Brand is a fill only.** `text-brand`, `border-brand`, `outline-brand`, `ring-brand` and `text-white` never appear in T6.
- The progress bar is supplementary: "Step N of 8" is always shown as text, so the brand segments (2.6:1 on white) are not the only carrier of the information.

### 0.2 Type, spacing, sizing

- Type steps: `text-caption`, `text-body-sm`, `text-body`, `text-h4`, `text-h3`, `text-h2`. Weights: `font-normal`, `font-semibold` only.
- **Step headings** (`h1`): `text-h3 md:text-h2` (24 / 32), the same override T5 uses for form pages. Group titles inside a step are styled like labels (`text-body-sm font-semibold text-ink`). Section headings inside the summary and the worker list are `h2` at `text-h4`.
- Spacing steps only `1 2 3 4 6 8 12 16 24`, negatives of those steps (for example `-mx-4`) and `0`/`px`.
- Sizes come from the T2 allowlist (`4 5 6 7 10 11 12 14 16 20 24 60 80`, `full`, `dvh`, fractions), plus `aspect-square`. **One addition:** `h-2` (8 px) for the progress segments only (Open question 1).
- Reading widths: `max-w-xs` (320), `max-w-sm` (384), `max-w-md`, `max-w-xl`.
- No arbitrary `[…]` values. The exceptions are the generated Radix selectors and CSS-variable sizes inside the new primitives (`data-[state=…]`, `data-[placeholder]`, `data-[highlighted]`, `w-(--radix-select-trigger-width)`, `max-h-(--radix-select-content-available-height)`), as T4 and T5 allow.

### 0.3 Touch targets, overflow, motion

- Every control is at least 44 px: inputs and select triggers `h-12`, Back/Continue `h-12`, Fixed/Hourly segments `h-11`, service rows `min-h-14`, match and category cards `min-h-24` or taller, photo remove buttons `size-11`, suggestion options `min-h-14`, select items `min-h-11`, link buttons `min-h-11`, summary toggle `min-h-14`.
- At 375 every grid is `grid-cols-1` or `grid-cols-2`/`3` with computed widths below, and every button row is `flex-col` or `flex-1`. `document.documentElement.scrollWidth === 375` on every step, with the suggestion list open and with 5 photos added.
- Motion: hovers use `transition-colors duration-150 motion-reduce:transition-none`. The summary chevron rotates with `transition-transform motion-reduce:transition-none`. No step-transition animation (PRD "light motion only"; the focus move is the transition). Spinners use `motion-safe:animate-spin`.
- No hover-only actions: photo remove, card selection and summary toggle all work by tap and keyboard.

### 0.4 Width map (Container `px-4 md:px-6 lg:px-8`, max 1200)

The step form is a 12-column grid at `lg` (T2 §0.6: `gap-8`).

| Width | Content | Form column | Gap to summary | Summary |
| --- | --- | --- | --- | --- |
| 1280 | 1200 | **687** (`xl:col-span-7`) | 135 (empty column 8 plus 2 gaps) | **379** (`xl:col-start-9 xl:col-span-4`), sticky |
| 1024 | 960 | **629** (`lg:col-span-8`) | 32 | **299** (`lg:col-span-4`), sticky |
| 768 | 720 | 720 (full width) | — | Panel above Back/Continue, always open |
| 375 | 343 | 343 | — | Collapsible bar above the sticky Back/Continue footer |

This matches the spec's "form left (~640 px) and a sticky live 'Your job' summary panel right (~360 px)" at 1280, on the existing 12-column grid, with no arbitrary widths.

### 0.5 Landmarks on `/post-job/*`

```
body
├─ header (banner)        AuthHeader (existing): SkipLink + Logo
├─ main#main tabIndex=-1  Stepper (nav) + one h1 + form (with aside "Your job")
└─ footer (contentinfo)   Footer showMobileCta={false}
```

---

## 1. New primitives (`src/components/ui/*`, via `shadcn add`, re-themed)

Only **`radio-group`**, **`textarea`** and **`select`**. **No `toggle-group`:** Fixed/Hourly is a required single choice, so a radio group gives the right semantics (arrow keys, exactly one checked, no "unpressed" empty state) without a fourth primitive. No `slider`, no `toast`, no `popover`, no `command`.

The same re-theming rules as T5 apply: generated `text-sm`/`text-xs`/`font-medium` become `text-body-sm`/`text-caption`/`font-semibold`; every `focus-visible:ring-*` is removed in favour of the global outline (T2 §0.7); `shadow-*` stays as generated and none is added; `dark:` classes are deleted.

### 1.1 RadioGroup (`radio-group.tsx`)

| Export | Classes / behaviour |
| --- | --- |
| `RadioGroup` (Root) | `grid gap-3` (callers override the layout). Radix gives roving tabindex: one Tab stop per group, arrow keys move **and** check, Space checks. Accepts `aria-labelledby`, `aria-describedby` and `aria-invalid`. |
| `RadioGroupItem` (classic radio) | The same 44/24 build as `Checkbox`: Root `group/radio flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring disabled:opacity-50`. The inner span is `flex size-6 items-center justify-center rounded-full border-2 border-input bg-surface group-data-[state=checked]/radio:bg-brand group-aria-invalid/radio:border-danger`. The indicator is `Check size-4 text-brand-foreground`. T6 does not render it directly; it is themed for T9. |

`SelectableCard`, `WorkerCard` and `PriceInput` use `RadioGroup` as the root and render their own `RadioGroup` item from `radix-ui` (`RadioGroup.Item`) with card or segment classes (§5, §10.3, §11.2). No new package is involved.

### 1.2 Textarea (`textarea.tsx`)

```
w-full min-w-0 rounded-md border border-input bg-surface px-4 py-3 text-body text-ink
placeholder:text-ink-muted resize-y transition-colors duration-150 motion-reduce:transition-none
disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger
```

- Remove the generated `field-sizing-content` and `min-h-16`. Height comes from `rows={5}` (5 × 24 + 24 = 144 px), and the user can resize it vertically.

### 1.3 Select (`select.tsx`)

| Part | Classes |
| --- | --- |
| Trigger | `flex h-12 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-surface px-4 text-left text-body text-ink data-[placeholder]:text-ink-muted aria-invalid:border-danger disabled:cursor-not-allowed disabled:opacity-50`. The value span is `truncate`. The icon is `ChevronDown size-5 text-ink shrink-0` |
| Content | `position="popper"`, `z-50 max-h-(--radix-select-content-available-height) w-(--radix-select-trigger-width) overflow-y-auto rounded-md border border-input bg-surface text-ink`, with a `p-1` viewport. Remove the generated `shadow-md` only if lint flags it; otherwise leave it as generated. Generated fade/zoom animations, plus `motion-reduce:animate-none` |
| Item | `relative flex min-h-11 w-full cursor-default items-center rounded-sm py-2 pr-12 pl-4 text-body text-ink outline-none select-none data-[highlighted]:bg-surface-alt data-[state=checked]:font-semibold data-[disabled]:opacity-50` |
| Item indicator | `absolute right-4 flex items-center`, with `Check size-5 text-ink` |
| Scroll buttons | `flex min-h-11 items-center justify-center text-ink` (`ChevronUp` / `ChevronDown size-5`) |

- `<Label htmlFor>` points at the Trigger `id`.
- RHF `Controller` passes its `ref` to the Trigger so `setFocus` and `focusFirstError` reach it.
- Typeahead ("T" jumps to Tennessee, then Texas) comes from Radix.
- The Radix hidden native `<select>` keeps `name`.

---

## 2. Post-job shell — `src/app/post-job/layout.tsx` (server)

### 2.1 Composition (decision for the product plan's "UI planner confirms")

```
<AuthHeader />                                   existing; skip link + Logo, not sticky
<main id="main" tabIndex={-1} className="flex-1 bg-surface outline-none">
  <Container className="py-8 md:py-12">
    <JobBuilderGate>{children}</JobBuilderGate>
  </Container>
</main>
<Footer showMobileCta={false} />                 no "Post a job" bar over Continue
```

- **The header is reused as is.** `AuthHeader` is already the minimal "skip link + Logo" banner, so a copy would be a duplicate. The logo is the only exit (to `/`); the draft is kept, so leaving is safe.
- **`main` is `bg-surface`,** so every field error sits on white (§0.1). Only the summary panel and small info boxes use `surface-alt`.
- **The Footer is kept** for Reset demo data, Terms/Privacy and support, as on auth pages.
- **Delete** `src/app/post-job/[step]/.gitkeep` and the folder.

### 2.2 `JobBuilderGate` (new: `src/components/post-job/job-builder-gate.tsx`, client)

It waits for **both** `useJobDraftHydrated()` and `useSessionHydrated()`.

| Condition | Renders |
| --- | --- |
| Either store not hydrated | `StepSkeleton` (§2.4) |
| Active session with `role === "worker"` | `RoleMismatchNotice sessionRole="worker"` (existing; §2.3) |
| Guest or customer | `children` |

### 2.3 Separate accounts notice (worker session, every step)

This reuses the existing `RoleMismatchNotice`, which wraps `SeparateAccountsNotice variant="page"` with an `h1` and the T5 decision-6 actions. No new copy is needed: `AUTH_COPY.separate.title`, `AUTH_COPY.separate.body.worker` ("You're logged in with a worker account. To post jobs, create a separate customer account with a different email."), the primary "Log out and create a customer account" (→ logout → `/signup?role=customer`) and the outline "Go to my dashboard" (→ `/worker/dashboard`).

| Width | Layout |
| --- | --- |
| 1280 / 1024 / 768 | Centred `max-w-xl` card (576) inside the Container, `md:px-8 md:py-16`, buttons in a row |
| 375 | Card fills the column (`px-4 py-12`). Buttons are stacked full width, and the primary wraps to two lines (T5 wrap-safe rule) |

- No Stepper, no summary and no Back/Continue: the worker is not in the flow.
- The `h1` receives focus on mount (`focusOnMount` defaults to true). This is a client render after hydration, never on the server.
- **Error:** a logout failure shows `FormAlert tone="error"` under the actions and takes focus (existing behaviour).
- The draft is not touched.

### 2.4 `StepSkeleton` (new: `src/components/flow/step-skeleton.tsx`, server)

This is the Suspense fallback of every step page, the gate's pre-hydration view, and the view shown while the step guard redirects. It mirrors the step layout so nothing jumps:

```
div role="status" aria-busy="true" + span.sr-only STATE_COPY.loading
└─ div aria-hidden
   ├─ Skeleton h-4 w-1/4 ; div.mt-3 grid grid-cols-8 gap-1 > 8 × Skeleton h-2 rounded-full      (Stepper)
   └─ div.mt-8 flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:gap-8
      ├─ div.lg:col-span-8 xl:col-span-7 flex flex-col gap-6
      │  ├─ Skeleton h-8 w-2/3 ; Skeleton h-4 w-1/2
      │  └─ 3 × Skeleton h-12 w-full
      ├─ Skeleton h-14 w-full rounded-lg  lg:h-80 lg:col-span-4 xl:col-start-9 lg:row-span-2   (summary)
      └─ div.flex justify-between gap-3 > Skeleton h-12 w-24 + Skeleton h-12 w-24   (actions; flex-1 on the right below md)
```

---

## 3. `Stepper` (new: `src/components/flow/stepper.tsx`, server-safe; reused by T7 and T9)

Props: `steps: readonly { label: string }[]`, `current: number` (1-based), `ariaLabel: string` ("Job progress"), `statusId: string`. The column count is a static map (`{ 5: "grid-cols-5", 8: "grid-cols-8" }`), because a dynamic class would not be generated.

The progress total is "Step N of 8", with the PRD labels **Category, Services, Where, Details, Who, Review & Post, Payment, Confirmation** (decision 1). On `?category=` arrival the user lands on "Step 2 of 8" with step 1 shown as done.

### Desktop 1280 px (reference), and 1024

```
nav[aria-label="Job progress"].w-full
├─ p#{statusId}.text-body-sm font-semibold text-ink → "Step 2 of 8"
│     + span.sr-only ": Services"   (so the h1's aria-describedby reads "Step 2 of 8: Services")
└─ ol.mt-3 grid grid-cols-8 gap-2
   └─ li.flex min-w-0 flex-col gap-2  [aria-current="step" on the current one]
      ├─ span[aria-hidden].h-2 rounded-full  done/current: bg-brand · upcoming: bg-border
      └─ span.flex items-center gap-1 text-body-sm
           done:     Check size-4 text-ink (aria-hidden) + label text-ink-muted + span.sr-only " (done)"
           current:  label font-semibold text-ink
           upcoming: label text-ink-muted
```

- Width check: at 1200 each column is about 143 px, and at 960 about 113 px. "Review & Post" (about 100 px at 14 px) and "Confirmation" fit on one line.
- Labels are plain text, not links. Back/Continue are the navigation; edit links arrive with Review in T7 (decision 14).
- Spacing: the Stepper sits at the top of the step with `mb-8 lg:mb-12` before the grid.

### Tablet 768 px

- Same structure. Labels drop to `text-caption`, are centred under their segment and may wrap to two lines (`text-center break-words`). The `ol` uses `gap-1`. Each column is about 89 px wide.

### Mobile 375 px (product plan: "Compact on mobile")

```
nav
├─ div.flex items-baseline justify-between gap-4
│  ├─ p#{statusId}.text-body-sm font-semibold → "Step 2 of 8 · Services"
│  └─ p.text-body-sm text-ink-muted → "Next: Where"        (hidden on step 8)
└─ ol.mt-3 grid grid-cols-8 gap-1   segments only; each label is sr-only below md
```

- The visible line names the current and next steps. The full ordered list stays in the DOM for screen readers. Each segment is about 38 px wide.

### Interaction

- The Stepper has no focusable elements. The step change focus rule is in §4.4.
- `aria-current="step"` marks the current item, and done items carry the sr-only " (done)".

---

## 4. `StepLayout` (new: `src/components/flow/step-layout.tsx`, client; reused by T7 and T9)

Props:

| Prop | Type | Notes |
| --- | --- | --- |
| `step` | `number` | Feeds the Stepper |
| `steps` | `readonly { label }[]` | `POST_JOB_STEPS` |
| `titleId` | `string` | |
| `title` | `string` | |
| `description` | `ReactNode`, optional | |
| `onSubmit` | `FormEventHandler` | The RHF `handleSubmit(onValid, focusFirstError(...))` |
| `onBack` | `() => void` | Saves without validating, then navigates |
| `continueLabel` | `string`, optional | Default "Continue" |
| `loading` | `boolean`, optional | Passes `Button loading`; unused in T6 (decision 11), kept for T7 |
| `summary` | `ReactNode` | The `JobSummaryPanel` |
| `children` | | The step's fields |

### 4.1 Desktop 1280 px (reference)

```
div
├─ Stepper (mb-8 lg:mb-12)
└─ form noValidate onSubmit  .flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:gap-y-8
   ├─ div.min-w-0 lg:col-span-8 xl:col-span-7 lg:row-start-1                           (fields)
   │  ├─ h1#{titleId} tabIndex=-1 aria-describedby={statusId}
   │  │     .text-h3 md:text-h2 outline-none focus-visible:outline-2
   │  ├─ p.mt-2 text-body text-ink-muted → description
   │  └─ div.mt-8 flex flex-col gap-8 *:scroll-mb-24 md:*:scroll-mb-0 → children
   ├─ aside (summary)  .min-w-0 lg:col-span-4 xl:col-start-9 lg:row-span-2 lg:row-start-1
   │                    lg:sticky lg:top-8 lg:self-start
   └─ div (actions)    .lg:col-span-8 xl:col-span-7 lg:row-start-2
         flex items-center justify-between gap-4 border-t border-border pt-6
         ├─ Button type="button" variant="outline" onClick={onBack}  ArrowLeft + "Back"
         └─ Button type="submit" loading={loading}  "Continue" + ArrowRight
```

- **DOM order** is fields, summary, actions. That is also the visual order at tablet and mobile ("summary … above Continue"). At desktop the summary moves to the right column through grid placement, and it has no focusable element there, so the focus order is fields, then Back, then Continue.
- **The form is the grid,** so the aside and the actions are inside it, and Continue submits it.
- The summary is sticky from `lg` (`top-8`; the header is not sticky). Its content is about 520 px tall, so it fits an 800 px viewport.

### 4.2 1024 px

The same as 1280, with the form at 629 px and the summary at 299 px (`lg:col-span-8` / `lg:col-span-4`, no empty column).

### 4.3 Tablet 768 px and Mobile 375 px

| | 768 (`md` to `< lg`) | 375 (`< md`) |
| --- | --- | --- |
| Form | `flex flex-col gap-8`, full width (720) | Same, full width (343) |
| Summary | Expanded panel between the fields and the actions (§6) | Collapsible bar in the same place (§6) |
| Actions | Static row: `border-t pt-6`, Back left, Continue right | **Sticky footer:** `sticky bottom-0 z-40 -mx-4 flex gap-3 border-t border-border bg-surface px-4 pt-3 pb-safe`. Back is `variant="outline"` (about 104 px), and Continue is `flex-1` (about 227 px). From `md`: `md:static md:mx-0 md:px-0 md:pt-6 md:pb-0 md:justify-between` |

- **Why `flex` below `lg` and not grid:** a grid item's containing block is its grid area, which would stop `position: sticky` from following the viewport. In a flex column the sticky footer travels with the viewport while the form is on screen, then rests at the end of the form above the site Footer. It never covers the Footer, and no extra padding is needed.
- **Covered focus:** `*:scroll-mb-24` (96 px) on the field stack keeps a field scrolled into view by focus or `setFocus` above the 72 px sticky footer. It is removed from `md`.
- `z-40` follows the T2 z-index table. The Select content and Sheet stay `z-50`, and the suggestion list is `z-30` (§9.2).

### 4.4 Interaction details (all steps)

- **Focus on step change:** Back and Continue call `markStepNavigation()` (a module-level flag in `step-layout.tsx`) before `router.push`. On mount, `StepLayout` checks the flag; if it is set, it focuses the `h1` and clears the flag. The `h1` is described by the Stepper status, so a screen reader hears "Which services do you need?, heading level 1, Step 2 of 8: Services". A hard load, a reload, a guard redirect or a first visit from a marketing link never moves focus, so the skip link still comes first. Next.js scrolls to the top on push.
- **Continue:** validates with the step schema (RHF `mode: "onTouched"`, `shouldFocusError: false`). If invalid, every error shows at once and `focusFirstError(fieldsInDomOrder, setFocus)` focuses the first one (§12). If valid, the step saves, calls `completeStep(n)` and goes to the next route. No spinner and no artificial delay (decision 11).
- **Back:** saves the current values without validating, then navigates (step 1 → `/`; step 2 → step 1, even after `?category=`; decision 7). No confirmation is needed, because nothing is lost.
- **Enter** in a text input submits (Continue), except inside the address combobox while an option is active, and inside the notify-me email field (§9).
- Hover: Back gets `bg-surface-alt`, and Continue gets `bg-brand/90`.

---

## 5. `SelectableCard` (new: `src/components/flow/selectable-card.tsx`, client)

This covers category (single), services (multi) and match type (single). `CategoryTile` is a link card, so it is not reused (product plan); its icon tile styling is copied by class, not by import.

Props:

| Prop | Type | Notes |
| --- | --- | --- |
| `type` | `"radio" \| "checkbox"` | |
| `value` | `string` | |
| `title` | `string` | |
| `description` | `string`, optional | |
| `icon` | `LucideIcon`, optional | |
| `layout` | `"tile" \| "row"` | |
| `checked` | `boolean` | checkbox only |
| `onCheckedChange` | | checkbox only |
| `invalid` | `boolean` | |
| `describedBy` | `string`, optional | The group error id while an error shows |
| `controls` | `string`, optional | For "Other" → the text field id |
| `ref` | | Focus target for `focusFirstError` |

### 5.1 Semantics

| `type` | Element | Keyboard |
| --- | --- | --- |
| `radio` | `RadioGroup.Item` (`button role="radio" aria-checked`) inside the themed `RadioGroup` root, which carries `aria-labelledby` (the step `h1` or a group label) | One Tab stop for the group. Arrow keys move and check; Space checks. Home/End are not provided by Radix and are not required |
| `checkbox` | `Checkbox.Root` from `radix-ui` (`button role="checkbox" aria-checked`) inside `div role="group" aria-labelledby` | Each card is a Tab stop; Space toggles. Enter does **not** toggle (Radix default), so Enter is not hijacked away from the form submit |

The whole card is the control. Its accessible name is the title (`aria-labelledby` → title id) and its description is the description text (`aria-describedby` → description id, plus the group error id while invalid).

### 5.2 Visual anatomy

```
Root (button) .group/card relative flex w-full rounded-lg border-2 bg-surface text-left
              transition-colors duration-150 motion-reduce:transition-none
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring
              disabled:cursor-not-allowed disabled:opacity-50
  unchecked:  border-border hover:border-input hover:bg-surface-alt
  checked:    data-[state=checked]:border-ink data-[state=checked]:bg-brand-soft
  invalid:    border-danger (unchecked cards only; set via the `invalid` prop)
├─ icon tile (tile/row with icon): span.flex size-10 shrink-0 items-center justify-center rounded-md bg-brand md:size-12
│                                   (icon size-5 md:size-6 text-brand-foreground aria-hidden)
├─ text: span.min-w-0 flex-1 flex flex-col gap-1
│   ├─ span#{id}-title .text-body font-semibold text-ink (tile: md:text-h4)
│   └─ span#{id}-desc  .text-body-sm text-ink-muted
└─ indicator span[aria-hidden] .flex size-6 shrink-0 items-center justify-center border-2 border-input bg-surface
       radio: rounded-full · checkbox: rounded-sm
       checked: bg-brand + Check size-4 text-brand-foreground
```

| `layout` | Classes |
| --- | --- |
| `tile` | `min-h-24 flex-col items-start gap-4 p-4 md:p-6`. The indicator is `absolute top-4 right-4 md:top-6 md:right-6`, and the title gets `pr-8` so it never runs under the indicator |
| `row` | `min-h-14 flex-row items-center gap-4 px-4 py-3`. The indicator comes **first** (left), then the text (the checklist look). With an icon, the order is indicator, icon, text |

- **Selected is never colour only:** the indicator fills and shows a check, the border darkens to `ink` (8.9:1 on `brand-soft`) and the background tints.
- `border-2` is constant, so selecting causes no layout shift.

---

## 6. `JobSummaryPanel` — "Your job" (new: `src/components/job/job-summary-panel.tsx`, client; T7 may reuse)

Props: `draft: JobDraft` (the store draft merged with the current step's live values), `currentStep: number`, `workerName?: string`.

### 6.1 Content (all widths; nothing removed on mobile)

```
aside[aria-labelledby="job-summary-title"].rounded-lg bg-surface-alt md:p-6
├─ h2#job-summary-title.text-h4
│  ├─ button.md:hidden (mobile toggle, §6.3)
│  └─ span.hidden md:inline → "Your job"
└─ div#job-summary-body  (mobile: hidden unless open; md+: always block)
   ├─ p.text-body-sm text-ink-muted → "Your answers appear here as you go." (only while every row is empty)
   ├─ dl.mt-4 flex flex-col divide-y divide-border
   │  └─ div.flex flex-col gap-1 py-3 first:pt-0
   │     ├─ dt.text-body-sm font-semibold text-ink → row label
   │     └─ dd.text-body-sm text-ink break-words → value | text-ink-muted "Not added yet"
   └─ div.mt-4 rounded-md bg-surface p-4  (estimate block)
      ├─ p.text-body-sm font-semibold text-ink → "Estimated total"
      ├─ p.text-h3 font-semibold text-ink → "$120" | text-body text-ink-muted "Set a price in Details"
      ├─ p.text-body-sm text-ink-muted → "$40/hr × 3 hours" (hourly) | "Fixed Price" (fixed)
      └─ p.mt-2 text-caption text-ink-muted → "You're charged when the job is done."
```

| Row (`dt`) | Value (`dd`) |
| --- | --- |
| Category | Category name |
| Services | Comma list; "Other" shows as "Other: {otherText}" |
| Where | `line1`, then "City, ST ZIP" on a new line, then the landmark (`text-ink-muted`) |
| Details | The description with `line-clamp-3`, plus "{n} photos" when there are any |
| Who | "Post to Job Board" or "Pick a Worker: Jordan M." (`MATCH_TYPE_LABELS`) |

- The panel is `surface-alt` and holds **no error text** (§0.1).
- **No live region.** The panel updates as the user types, and announcing that would be noise. The price total is announced by `PriceInput` (§10.3).
- **Formatting:** `formatUsd` with no cents for whole dollars ("$120") and two decimals otherwise ("$120.50").

### 6.2 Desktop 1280 / 1024

The right column, sticky, `p-6`. At 1024 the 299 px column wraps long values (`break-words`).

### 6.3 Tablet 768 and Mobile 375

- **768:** the same panel, full width, expanded, between the fields and the actions ("collapses into a panel above Continue"). The toggle is hidden.
- **375:** a collapsible bar in the same DOM position:

```
h2 > button[aria-expanded][aria-controls="job-summary-body"]
     .flex min-h-14 w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left
      focus-visible:-outline-offset-2
     ├─ span.text-body font-semibold text-ink → "Your job"
     └─ span.flex items-center gap-2 text-body-sm text-ink
          "Est. $120" | "No price yet"
          ChevronDown size-5 (rotate-180 when open, motion-reduce:transition-none)
div#job-summary-body.px-4 pb-4 md:p-0  [hidden md:block when closed]
```

- It is closed by default, and the open state is kept in component state for the step. The body's visibility is CSS only (`hidden md:block`), so resizing never leaves the tablet panel closed.
- The bar sits directly above where the sticky footer comes to rest. At 375 a step reads: Stepper, h1, fields, "Your job" bar, Back/Continue.

---

## 7. Step 1 Category — `/post-job/category`

### Desktop 1280 px (reference)

- `h1` "What do you need help with?". Description: "Choose the type of chore. You can add details next."
- `RadioGroup` with `aria-labelledby={titleId}`, `aria-describedby="category-error"` (while invalid) and `aria-invalid`, `className="grid grid-cols-1 gap-4 sm:grid-cols-2"`.
- Four `SelectableCard type="radio" layout="tile"` from `CATEGORIES`, with `CATEGORY_ICONS[id]` and `CATEGORY_DESCRIPTIONS[id]` (reused, not copied). In a 2 × 2 grid each card is about 335 px wide.
- `FieldError id="category-error"` under the grid ("Choose a category").

### Tablet 768 px and 1024 px

- 1024: 2 × 2, about 306 px each.
- 768: 2 × 2, about 352 px each, with the summary panel under the grid.

### Mobile 375 px

- `grid-cols-1 gap-3`. Each card uses the **row** look at this width (`layout` tile classes are written as `flex-row items-start p-4 sm:flex-col sm:p-6`, with the indicator still top-right). The icon, title and description all stay. Each card is about 96 px tall; four cards take about 420 px.

### Component tree

```
src/app/post-job/category/page.tsx (server) — metadata { title: "Post a job — Category", robots noindex }
└─ Suspense fallback={<StepSkeleton/>}
   └─ JobStepRoute (new: src/components/post-job/job-step-route.tsx, client) — step=1
      │   useRevisitKey(); runs firstIncompleteStep guard → StepSkeleton while redirecting
      └─ CategoryStep (new: src/components/post-job/category-step.tsx) key={revisitKey}
         └─ StepLayout step=1
            ├─ RadioGroup (new ui) > SelectableCard ×4 (new)
            ├─ FieldError (existing)
            └─ summary: JobSummaryPanel (new)
```

`JobStepRoute` is shared by all five steps. It takes `step` and `render: () => ReactNode`, so the guard and the revisit key exist once.

### States

| State | What shows |
| --- | --- |
| Loading | `StepSkeleton` until the draft and session hydrate |
| Empty | No card checked (new draft). The summary shows "Your answers appear here as you go." |
| Error | Validation only: "Choose a category" under the grid, the unchecked cards get `border-danger`, and focus goes to the first card. There is no service call, so `?mockError=1` has no effect here |
| Success | The saved choice is pre-checked on return (decision 6). Continue → `/post-job/services` |

### Interaction details

- **Focus order:** skip link, logo, the category group (one Tab stop; arrow keys move and select), Back, Continue.
- Changing the category clears `subServices`, `otherText` and `workerId` (decision 5); there is no confirmation dialog.

---

## 8. Step 2 Services — `/post-job/services` (and `?category=<id>`)

### Desktop 1280 px (reference)

- **Category chip row** (first in the field stack, `flex flex-wrap items-center gap-x-3 gap-y-1`):
  - Chip: `inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-body-sm font-semibold text-ink`, with `CATEGORY_ICONS[id] size-4` and the category name.
  - Then `Button asChild variant="link" size="sm"` "Change", with `aria-label` "Change category", going to `/post-job/category` (this calls `markStepNavigation()`).
- `h1` "Which services do you need?". Description: "Choose all that apply."
- **Group:** `div role="group" aria-labelledby={titleId} aria-describedby="services-error"` (while invalid), `className="grid grid-cols-1 gap-3 sm:grid-cols-2"`. It holds one `SelectableCard type="checkbox" layout="row"` per sub-service, with no icon and no description. At 1280 each card is about 337 px wide.
- **"Other" text field:** rendered **directly after the Other card** in DOM order, `sm:col-span-2`, only while Other is checked:
  - Label: "What's the other service?"
  - Hint: "3 to 100 characters."
  - `Input` with `maxLength={100}`.
  - Error: "Describe the other service".
- The Other card has `aria-controls` pointing at the field.
- `FieldError id="services-error"` under the group ("Choose at least one service").

### Custom category (decision 8)

The only card is "Other", which is pre-checked with its text field shown. The heading stays the same, so the copy is shared. Unchecking it is allowed and gives "Choose at least one service" on Continue.

### Tablet 768 px and 1024 px

Two columns at both widths (about 306 px at 1024 and 354 px at 768). The text field spans both columns.

### Mobile 375 px

One column, each row about 56 px tall (`min-h-14`). Outdoor (5 rows plus the text field) fits in about 400 px. The chip row wraps if needed.

### Component tree

```
services/page.tsx (server) — metadata "Post a job — Services"
└─ Suspense fallback={<StepSkeleton/>}            (useSearchParams inside)
   └─ JobStepRoute step=2 → ServicesStep (new: src/components/post-job/services-step.tsx)
      └─ StepLayout step=2
         ├─ category chip + Button link "Change"
         ├─ div[role=group] > SelectableCard type="checkbox" ×n
         ├─ FormField + Input (existing) — otherText (conditional)
         ├─ FieldError
         └─ JobSummaryPanel
```

### States

| State | What shows |
| --- | --- |
| Loading | `StepSkeleton`, including while `?category=` is applied and while the guard runs |
| Empty | No service checked (except Custom → Other). With an invalid `?category=` and no draft category, the guard redirects to step 1 (no flash) |
| Error | "Choose at least one service" under the group, with focus on the first card. "Describe the other service" under the text field, with focus on the field. Both can show at once; focus follows DOM order. No service call |
| Success | Checked cards are restored from the draft. Continue → `/post-job/location` |

### Interaction details

- **Focus order:** Change, each service card (Tab between cards, Space toggles), Other text field (when shown), Back, Continue.
- Checking Other does **not** move focus. The field is next in Tab order, and Other's `aria-controls` links it.
- Unchecking Other hides the field and drops `otherText` (product plan rule 13). Typed text is kept in form state while the user stays on the page.

---

## 9. Step 3 Where — `/post-job/location`

### Desktop 1280 px (reference)

- `h1` "Where is the job?". Description: "Enter a US street address. Start typing to see suggestions."
- `AddressInput` (§9.1). The fields are stacked in a `flex flex-col gap-6`, with the City/State/ZIP row as a grid:

```
FormField line1 — "Street address"                                   (full width, combobox)
div.grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-6
├─ FormField city  — "City"   .col-span-2 md:col-span-3                (1280: 323 px)
├─ FormField state — "State"  .col-span-1 md:col-span-2   Select       (1280: 218 px)
└─ FormField zip   — "ZIP code" .col-span-1 md:col-span-1               (1280: 101 px)
FormField landmark — "Landmark (optional)"                            (full width)
   hint "Anything that helps the worker find it, like a gate code or a blue fence."
```

- Under the fields, the **out-of-area panel** with `NotifyMeForm` (§9.3) appears only when the address is valid and outside the service area.

### Tablet 768 px and 1024 px

- 1024: the same, with City about 299 px, State about 198 px and ZIP about 91 px (the 5 digits are about 45 px, so they fit inside the `px-4` padding).
- 768: the same 6-column row at 720 px, with City about 344, State about 229 and ZIP about 107.

### Mobile 375 px

- Street address is full width. City takes a full row. State and ZIP sit side by side (about 163 px each). Long state names truncate in the trigger and appear in full in the list. Landmark is full width.
- The suggestion list is full width under the street field. The notify panel stacks its email field and button (§9.3).

### 9.1 `AddressInput` (new: `src/components/forms/address-input.tsx`, client; reused by T9)

Props: `control` / `register` from the step's RHF form, `namePrefix` ("address"), `errors`, `idPrefix` ("address"), `onSuggestionApplied?(address)`. It renders the four FormFields above. Autocomplete settings:

| Field | Input attributes |
| --- | --- |
| Street | `autoComplete="off"` (the custom list replaces browser autofill here), `maxLength={100}` |
| City | `autoComplete="address-level2"` |
| State | `Select` of `US_STATES` (name shown, code stored), with placeholder "Choose a state" |
| ZIP | `inputMode="numeric" autoComplete="postal-code" maxLength={5}` |
| Landmark | `autoComplete="off"` |

US only: the state can only come from the 50 states plus DC (rule 15), so a non-US address cannot be entered.

### 9.2 Street address combobox (hand-built, ARIA 1.2 combobox pattern)

```
div.relative
├─ Input id="address-line1" role="combobox" aria-autocomplete="list"
│        aria-expanded={hasOptions} aria-controls="address-suggestions"
│        aria-activedescendant={activeId} aria-describedby="{hint/error ids} address-suggest-note"
└─ div (popup; only while open) .absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-md border border-input bg-surface
   ├─ (loading) div.flex min-h-11 items-center gap-2 px-4 text-body-sm text-ink-muted
   │            Loader2 size-4 motion-safe:animate-spin + "Searching addresses…"
   └─ ul#address-suggestions role="listbox" aria-label="Address suggestions"
      └─ li#address-option-{i} role="option" aria-selected={active}
           .flex min-h-14 cursor-pointer flex-col justify-center px-4 py-2 data-[active=true]:bg-surface-alt hover:bg-surface-alt
           ├─ span.text-body font-semibold text-ink → line1
           └─ span.text-body-sm text-ink-muted → "Austin, TX 78701"
span#address-suggest-status.sr-only role="status"     (announcements, below)
p#address-suggest-note (only after an error) .mt-2 flex items-start gap-2 text-body-sm text-ink-muted
   Info size-4 + "Suggestions aren't available — enter the address below"
```

- **Requests:** a request goes out after a **300 ms** debounce, only for 2 or more characters. A newer query replaces an older one, and stale responses are ignored. There are at most 5 options (`LIMITS.addressSuggestionsMax`), so the list is at most about 280 px tall and never needs its own scroll.

| Suggestion state | What shows |
| --- | --- |
| Loading | The popup with only the "Searching addresses…" line. `aria-expanded="false"` (no options yet) |
| Empty (no matches) | No popup (decision 10). The sr-only status says "No matching addresses" |
| Error (`?mockError=1`, first call) | No popup. The quiet note "Suggestions aren't available — enter the address below" appears under the street field (ink-muted, info icon, not red: manual entry still works). The note clears on the next successful search |
| Success | The listbox with 1–5 options. The status says "{n} addresses found. Use the up and down arrows to choose." |

- **Keyboard:**
  - Down opens the list and moves to the next option; Up moves to the previous one.
  - Enter on an active option applies it and does not submit the form. With no active option, Enter submits as usual.
  - Esc closes the list and keeps the typed text.
  - Tab closes the list and moves on without applying anything.
  - Typing resets the active option.
- **Pointer:** `onMouseDown` on an option prevents the default (so the input keeps focus), and click applies the option.
- **Applying a suggestion** fills `line1`, `city`, `state` and `zip`, keeps `landmark`, clears those four fields' errors, closes the list and keeps focus on the street field. The status announces "Address filled: 1200 Barton Springs Rd, Austin, TX 78704". The served check (§9.3) runs right away.
- **z-index** is `z-30`. At 375 the street field sits near the top of the form, so the list stays clear of the `z-40` sticky footer. If it does reach under the footer, the page can scroll.

### 9.3 Service area check and `NotifyMeForm` (new: `src/components/job/notify-me-form.tsx`, client)

**When it shows (derived, no extra trigger):** the current address values pass `addressSchema` and `isServedState(state)` is false (`SERVED_STATES` is provisional `['TX']`). It shows as soon as the last missing field is filled, or right after a suggestion is applied. Changing the state to a served one, or making the address invalid, hides it. The address does not complete step 3 (decision 3).

Placement: directly after the Landmark field, `mt-0` (inside the `gap-6` stack).

```
section#out-of-area[aria-labelledby="out-of-area-title"].rounded-lg border border-input bg-surface p-4 md:p-6
├─ div.flex items-start gap-4
│  ├─ span.flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft (MapPinOff size-5 text-ink aria-hidden)
│  └─ div.min-w-0
│     ├─ h2#out-of-area-title tabIndex=-1 .text-h4 outline-none focus-visible:outline-2 → "We're not in {State name} yet"
│     └─ p.mt-1 text-body-sm text-ink-muted → "Chores For Me is available in {served list} for now. Leave your email and we'll let you know when we reach {city}."
├─ (form view) FormField id="notify-email" label="Email" className="mt-6"     (a div, not a nested <form>)
│  └─ div.flex flex-col gap-3 sm:flex-row sm:items-start        (T5 MobileVerifyField row pattern)
│     ├─ Input type="email" autoComplete="email" inputMode="email" autoCapitalize="none" className="min-w-0 flex-1"
│     │    (pre-filled from the session user's email when signed in as a customer)
│     └─ Button type="button" variant="secondary" className="w-full sm:w-auto" → "Notify me" / loading "Saving…"
├─ (service error) p#notify-error role="alert" — FieldError style → SERVICE_MESSAGES.mockError
├─ (success view) p#notify-success tabIndex=-1 role="status" .mt-6 flex items-start gap-2 text-body-sm font-semibold text-ink outline-none
│       CircleCheck size-5 text-success + "Thanks! We'll email {email} when we reach {State name}."
└─ Button variant="link" size="sm" className="mt-2" → "Use a different address"   (focuses the street field)
```

- **The panel is `surface` with a border,** so the red error text keeps 4.8:1.
- **Notify me is `secondary`,** so the step keeps a single brand-filled primary (Continue).
- The served-list text comes from `SERVED_STATES` mapped to names ("Texas").
- Notify-me has its own RHF instance with `notifyMeSchema`. Enter in the email field triggers Notify me, never Continue.

| Notify state | What shows | Focus |
| --- | --- | --- |
| Idle | The panel with the email row | Unchanged when the panel appears while typing. The `h2` text is also announced once through the `address-suggest-status` live region ("We're not in Ohio yet") |
| Validation | "Enter a valid email address" under the email field | The email field |
| Loading | "Saving…" spinner, with the email field `readOnly` | — |
| Error (`?mockError=1`, when this is the first call on the page) | `#notify-error` under the row. The typed email stays | The email field |
| Success | The row is replaced by `#notify-success`. "Use a different address" stays | `#notify-success` |

**Continue with an out-of-area address:** the address fields validate, so no field error shows. Continue stays enabled (submit buttons are never disabled). Pressing it focuses `#out-of-area-title` and does not navigate. The user stays on step 3 until a served address is entered.

### Component tree

```
location/page.tsx (server) — metadata "Post a job — Where"
└─ Suspense → JobStepRoute step=3 → LocationStep (new: src/components/post-job/location-step.tsx)
   └─ StepLayout step=3
      ├─ AddressInput (new)
      │  ├─ FormField + Input role=combobox + suggestion popup (listbox)
      │  ├─ FormField + Input — city
      │  ├─ FormField + Select (new ui) — state (US_STATES)
      │  ├─ FormField + Input — zip
      │  └─ FormField + Input — landmark
      ├─ NotifyMeForm (new) — address, defaultEmail, onUseDifferentAddress  [when out of area]
      └─ JobSummaryPanel
```

### States (step level)

| State | What shows |
| --- | --- |
| Loading | `StepSkeleton` (hydration and guard) |
| Empty | Empty fields (new address). The summary's Where row reads "Not added yet" |
| Error | Field errors under each field on blur and on submit, verbatim: "Enter the street address", "Enter the city", "Choose a state", "Enter a 5-digit ZIP code". The suggestion and notify-me errors are listed above. "Errors never clear typed input." |
| Success | A served, valid address → Continue → `/post-job/details` |

### Interaction details

- **Focus order:** Street address (with its list), City, State, ZIP code, Landmark, [Email, Notify me, Use a different address], Back, Continue.
- **First invalid field** in DOM order is street → city → state (the Select trigger) → zip.

---

## 10. Step 4 Details — `/post-job/details`

### Desktop 1280 px (reference)

- `h1` "Tell us about the job". Description: "Describe the work, add photos if they help, and set your price."
- The field stack has three groups (`flex flex-col gap-8`):
  1. **Description** (§10.1)
  2. **Photos (optional)** (§10.2)
  3. **Price** (§10.3)
- PRD rule: there is no date or time picker anywhere ("Jobs are on demand").

### 10.1 Description with a live counter

```
FormField id="description" label="Describe the job"
          hint="What needs doing, how much of it, and anything the worker should know."
          describedByExtra="description-count"
└─ children:
   ├─ Textarea id rows={5} maxLength={500} aria-required
   └─ p#description-count.text-right text-body-sm text-ink-muted → "42 / 500"
span#description-count-live.sr-only aria-live="polite" → "{n} of 500 characters"
```

- The visible counter updates on every keystroke. It is part of the field description, so it is read on focus.
- The sr-only live region updates **1 s after typing stops**, so screen readers are not flooded.
- `maxLength` stops input past 500, and the counter colour never changes. Below 10 characters, Continue shows "Add a few words about the job (at least 10 characters)".

### 10.2 `PhotoUploader` (new: `src/components/forms/photo-uploader.tsx`, client; reused by T9)

Props:

| Prop | Type | Notes |
| --- | --- | --- |
| `id` | `string` | |
| `label` | `string` | |
| `hint` | `string` | |
| `note` | `string`, optional | |
| `value` | `PhotoItem[]` | `{ url, name, type }` |
| `onChange` | | |
| `max` | `number` | `LIMITS.photosMax` |
| `maxBytes` | `number` | |
| `accept` | | `PHOTO_MIME_TYPES` |
| `allowCamera` | `boolean` | |

```
div role="group" aria-labelledby="photos-label" aria-describedby="photos-hint photos-note [photos-error]"
├─ p#photos-label.text-body-sm font-semibold text-ink → "Photos (optional)"
├─ p#photos-hint.mt-2 text-body-sm text-ink-muted → "Up to 5 photos. JPG, PNG, HEIC or WebP, under 10 MB each."
├─ (0 photos) div.mt-4 flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-input bg-surface p-6 text-center
│     ImagePlus size-6 text-ink-muted + p.text-body-sm text-ink-muted "Photos help workers understand the job."
│     + actions row (below)
├─ (1–5 photos) ul.mt-4 grid grid-cols-3 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5   aria-label="Added photos"
│  └─ li.relative aspect-square overflow-hidden rounded-md border border-border bg-surface-alt
│     ├─ img.size-full object-cover  alt="Photo {i} of {n}: {name}"      (JPG/PNG/WebP)
│     │  or (HEIC, no browser preview) div.flex size-full flex-col items-center justify-center gap-2 p-3
│     │       ImageIcon size-6 text-ink-muted + span.text-caption text-ink break-all line-clamp-2 → name
│     └─ Button type="button" variant="outline" size="icon" .absolute top-1 right-1 rounded-full bg-surface
│          X size-5; aria-label="Remove photo {i}: {name}"
├─ actions row: div.mt-4 flex flex-col gap-3 sm:flex-row (inside the dashed box when there are 0 photos)
│  ├─ Button type="button" variant="outline" → ImagePlus "Choose photos"
│  │     → input#photos-input type="file" multiple accept={PHOTO_MIME_TYPES} .sr-only tabIndex=-1 aria-hidden
│  └─ Button type="button" variant="outline" .hidden pointer-coarse:inline-flex → Camera "Take photo"
│        → input#photos-camera type="file" accept="image/*" capture="environment" .sr-only tabIndex=-1 aria-hidden
├─ p.mt-2 text-body-sm text-ink-muted → "{n} of 5 photos"            (only when n ≥ 1)
├─ p#photos-note.mt-2 text-body-sm text-ink-muted → "Photos stay until you reload or close this tab."   (always)
├─ div#photos-error role="alert" .mt-2 flex flex-col gap-1  → one FieldError line per distinct problem
└─ span.sr-only role="status" → "Photo added. 2 of 5." / "Photo removed. 1 of 5."
```

- **Buttons, not raw inputs:** each visible Button calls `inputRef.click()`. The real file inputs are sr-only and out of the Tab order, so keyboard users get one clearly labelled control each.
- **Camera capture on mobile (rule 20):** "Take photo" shows on coarse-pointer devices (phones and tablets) through Tailwind's built-in `pointer-coarse:` variant. "Choose photos" (`multiple`, no `capture`) is always there, so Android still reaches the gallery. On a desktop window resized to 375 without touch emulation, "Take photo" stays hidden; that is expected (Open question 2).
- **Grid widths:** about 125 px per tile at 1280 (5 columns in 687), 113 px at 1024, 168 px at 768 (4 columns) and 106 px at 375 (3 columns). The 44 px remove button fits in every tile.
- **Limits and errors** (verbatim messages):

| Problem | Behaviour | Message |
| --- | --- | --- |
| More than 5 in total | Valid files are added up to 5; the rest are refused. The buttons stay **enabled** at 5, so a 6th pick is refused with a message (AC) | "You can add up to 5 photos" |
| A file over 10 MB | That file is refused | "Photos must be under 10 MB" |
| Wrong type | That file is refused | "Photos must be JPG, PNG, HEIC or WebP" |

  A mixed batch shows each distinct message once. Errors stay until the next pick or remove, and they never remove photos that were already added.
- **Remove:** revokes the object URL, then focus moves to the next tile's remove button, else the previous one, else "Choose photos". The status line announces the change.

| Photos state | What shows |
| --- | --- |
| Loading | None: object URLs are instant. Each tile shows `bg-surface-alt` until the image decodes |
| Empty | The dashed prompt with both buttons, plus the note. After a reload the draft has no photos (decision 3), so this view and the note show |
| Error | The `#photos-error` lines (`role="alert"`, announced without moving focus) |
| Success | The tile grid, the "{n} of 5 photos" line and the note |

### 10.3 `PriceInput` (new: `src/components/job/price-input.tsx`, client)

```
fieldset.flex flex-col gap-6 (min-w-0, no border, no padding)
├─ legend.text-body-sm font-semibold text-ink → "Price"
├─ RadioGroup (new ui) aria-label="Pricing type" — segmented control
│     .grid w-full grid-cols-2 gap-1 rounded-md border border-input bg-surface p-1 sm:max-w-sm
│  └─ RadioGroup.Item ×2 .flex h-11 items-center justify-center gap-2 rounded-sm text-body font-semibold text-ink
│        hover:bg-surface-alt focus-visible:outline-offset-0
│        data-[state=checked]:bg-brand data-[state=checked]:text-brand-foreground
│        checked: Check size-4 (aria-hidden) before the label
│     labels: PRICING_TYPE_LABELS → "Fixed Price" · "Hourly"
├─ (fixed) FormField id="amount" label="Your price" hint="Between $5 and $5,000." className="sm:max-w-xs"
│     └─ div.flex: span[aria-hidden] "$" adornment + Input inputMode="decimal" className="rounded-l-none"
├─ (hourly) div.grid grid-cols-1 gap-6 sm:grid-cols-2
│  ├─ FormField id="amount" label="Hourly rate" hint="Between $10 and $200 an hour."
│  │     "$" adornment + Input inputMode="decimal"
│  └─ FormField id="hours" label="Hours" hint="Up to 12 hours, in half hours."
│        Select (new ui) placeholder "Choose hours"; items 1, 1.5 … 12 → "1 hour", "1.5 hours" … "12 hours" (23 items)
└─ (hourly) div#estimate.flex flex-col gap-1 rounded-md border border-border bg-surface-alt p-4
                 sm:flex-row sm:items-center sm:justify-between
   ├─ p.text-body font-semibold text-ink → "Estimated total"
   └─ div.sm:text-right
      ├─ p.text-h4 font-semibold text-ink → "$120" | text-body text-ink-muted "Add a rate and hours"
      └─ p.text-body-sm text-ink-muted → "$40/hr × 3 hours"
span.sr-only aria-live="polite" aria-atomic="true" → "Estimated total $120"   (debounced 500 ms; hourly only)
```

- **The `$` adornment** reuses the T5 `+1` pattern: `inline-flex h-12 items-center rounded-l-md border border-r-0 border-input bg-surface-alt px-3 text-body text-ink`. The label says "price" or "rate" in words, so the decorative `$` is not needed by screen readers.
- **Live estimated total (AC):** the visible total updates on every change, once the rate and hours are both valid numbers; until then it shows "Add a rate and hours". `estimatedTotal()` and `formatUsd()` are the helpers (no mock import).
- The estimate box is `surface-alt`; amount and hours errors sit under their fields on `surface`.
- **Switching type** keeps both amounts in form state (decision 9). The `amount` field id stays the same, so `aria-describedby` and the error id stay stable. Hours have no preset.
- **Widths:** fixed amount at most 320 px from `sm`; the hourly row has 2 × about 331 px at 1280, 2 × about 303 at 1024 and 2 × 348 at 768; everything stacks at 375. The segmented control is full width (343) at 375 and 384 px from `sm`.

### Tablet 768 px and 1024 px

- 1024: the same structure; the photo grid has 5 columns of about 113 px.
- 768: full-width form; 4 photo columns of about 168 px; the hourly row stays side by side. The summary panel (with the estimate) sits above Back/Continue.

### Mobile 375 px

- Description is full width (144 px tall).
- Photos: the dashed prompt with stacked full-width buttons ("Choose photos", "Take photo" on touch). Once photos exist, 3 columns of about 106 px.
- Price: the segmented control is full width; the amount is full width; rate and hours stack; the estimate box stacks its label over the value.
- Then the "Your job" bar and the sticky footer.

### Component tree

```
details/page.tsx (server) — metadata "Post a job — Details"
└─ Suspense → JobStepRoute step=4 → DetailsStep (new: src/components/post-job/details-step.tsx)
   └─ StepLayout step=4
      ├─ FormField + Textarea (new ui) + counter
      ├─ PhotoUploader (new) — Controller "photos"
      ├─ PriceInput (new)
      │  ├─ RadioGroup (new ui) — pricingType
      │  ├─ FormField + Input — amount
      │  ├─ FormField + Select (new ui) — hours
      │  └─ estimate box
      └─ JobSummaryPanel
```

### States (step level)

| State | What shows |
| --- | --- |
| Loading | `StepSkeleton` |
| Empty | Empty description, the empty photo prompt, Fixed Price selected (schema default) with an empty amount |
| Error | Validation: description, amount (fixed or hourly message), hours ("Choose between 1 and 12 hours"), plus the photo errors. Focus goes to the first in DOM order: description → amount → hours. Photo errors do not block Continue, because a refused file is never added. No service call, so `?mockError=1` has no effect |
| Success | Continue → `/post-job/match` |

### Interaction details

- **Focus order:** Description, Choose photos, [Take photo], each Remove button (in tile order), the pricing type group (one Tab stop; arrows switch), Amount, [Hours], Back, Continue.
- Switching to Hourly does not move focus. The new fields follow in Tab order.

---

## 11. Step 5 Who — `/post-job/match`

### Desktop 1280 px (reference)

- `h1` "Who should do the job?". Description: "Post it to the job board, or pick a verified worker yourself."
- **Match type:** a `RadioGroup` (`aria-labelledby={titleId}`) with `grid grid-cols-1 gap-4 md:grid-cols-2`, holding two `SelectableCard type="radio" layout="tile"`:
  - **"Post to Job Board"** (`MATCH_TYPE_LABELS.board`, default), icon `ClipboardList`. Description: "Verified workers near you see the job. The first to accept gets it."
  - **"Pick a Worker"** (`MATCH_TYPE_LABELS.direct`), icon `UserRoundCheck`. Description: "Choose from verified workers who serve your area."
- **Worker list section** (only when Pick a Worker is checked), right under the match cards:

```
section[aria-labelledby="workers-title"].flex flex-col gap-4
├─ div
│  ├─ h2#workers-title.text-h4 → "Choose a verified worker"
│  └─ p role="status" .mt-1 text-body-sm text-ink-muted
│       → "3 verified workers serve Austin. Your favourite workers are shown first."  (second sentence only when a favourite is present)
├─ RadioGroup (new ui) aria-labelledby="workers-title" aria-describedby="workerId-error"(while invalid)
│     .grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3
│  └─ WorkerCard ×n (§11.2)
└─ FieldError id="workerId-error" → "Choose a worker or post to the job board"
```

At 1280 the worker grid has 3 columns of about 218 px ("3-column card grid").

### 11.1 Worker list states (Tech Spec "Screen states", verbatim)

The list loads when Pick a Worker is checked, or on mount when the draft already has `matchType: "direct"`. It calls `workers.listForArea(address, category)` first and, only for an active customer session, `favourites.list(customerId)`. Favourites are the list items whose id is in the favourites result; they come first in rating order, then the rest in rating order.

| State | What shows | Focus / announcement |
| --- | --- | --- |
| Loading | `LoadingState variant="workers" count={3} label="Loading workers…"` in place of the RadioGroup (the heading stays). Skeleton worker cards in the same grid (§11.3) | Focus stays on the Pick a Worker card. The `role="status"` wrapper announces "Loading workers…" |
| Empty | `matchType` switches to `board` automatically (decision 12). The worker section is removed and, under the match cards, `EmptyState` (`headingLevel={2}`, icon `UsersRound`) shows: title **"No verified workers in this area yet — post to the job board instead"** (verbatim), description "We've switched you to the job board. Choose Pick a Worker again to check for new workers." It sits in a `div role="status"`, so it is announced | Focus stays on the Pick a Worker card, which is now unchecked; the Job Board card is checked. Choosing Pick a Worker again hides the empty card and refetches |
| Error (`?mockError=1`) | `ErrorState headingLevel={3}` (default title and message) in place of the grid, `onRetry` refetches, `isRetrying` → "Retrying…". The match type stays `direct` | `role="alert"` announces it, and focus does not move (T2 rule). Retry succeeds (one-shot) |
| Success | The worker cards. A saved `workerId` that is no longer in the list is cleared silently (rule 25). The saved worker is pre-checked if present | The status line announces the count |

`LoadingState` gains one variant, `workers` (an edit to the T2 component, Open question 4). It renders the same `role="status"` wrapper around `grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3` of `WorkerCardSkeleton`. This keeps "Use LoadingState" true while the skeleton matches the final layout.

### 11.2 `WorkerCard` (new: `src/components/job/worker-card.tsx`, client)

Props: `worker: WorkerSummary`, `favourite: boolean`, `selectable?: boolean` (default true; T8 can render it read-only), `invalid?`, `describedBy?`.

```
RadioGroup.Item value={worker.id} aria-labelledby="worker-{id}-name" aria-describedby="worker-{id}-meta [workerId-error]"
  .group/card relative flex w-full gap-4 rounded-lg border-2 bg-surface p-4 text-left md:flex-col md:p-6
   (same unchecked / checked / invalid / hover / focus classes as SelectableCard §5.2)
├─ span[aria-hidden].flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-body font-semibold text-ink → "JM"
├─ div.min-w-0 flex-1 flex flex-col gap-2 (pr-8 so text never runs under the indicator)
│  ├─ (favourite) span.inline-flex w-fit items-center gap-1 rounded-full border border-input bg-surface px-2 py-1 text-caption font-semibold text-ink
│  │     Heart size-4 (aria-hidden) + "Favourite"
│  ├─ span#worker-{id}-name.text-body font-semibold text-ink → "Jordan M."            (decision 13)
│  └─ div#worker-{id}-meta.flex flex-col gap-2
│     ├─ span.flex flex-wrap items-center gap-x-2 text-body-sm text-ink
│     │     Star size-4 text-warning fill-warning (aria-hidden) + "4.8" + span.sr-only " out of 5"
│     │     + span.text-ink-muted "· 32 jobs done"
│     └─ ul[aria-label="Verified checks"].flex flex-wrap gap-2
│        └─ li.inline-flex items-center gap-1 rounded-full border border-input bg-surface px-2 py-1 text-caption text-ink
│              Phone (Smartphone) · ID (IdCard) · Insurance (ShieldCheck), icons size-4 from ID_CARD_PREVIEW_SAMPLE.rows
└─ indicator (radio circle) .absolute top-4 right-4 md:top-6 md:right-6
```

- **Badges:** one per verified check: Phone when `phoneVerified`, ID when `idStatus === "verified"`, and Insurance when `insuranceStatus === "verified"`. `listForArea` returns only verified workers, so ID and Insurance always show.
- **Favourite** shows as text plus an icon, never colour only. The `sr-only` text in the meta ("Favourite worker") is read through `aria-describedby`.
- **No photos:** the initials avatar is used even when `photoUrl` exists (no photo files in the MVP).
- **Width check at 1280** (218 px card, 154 px text column): the name, the rating line and the three badges (Phone, ID and Insurance are about 70, 46 and 92 px) wrap onto two badge lines.

`WorkerCardSkeleton` (same file, server-safe markup): the card frame with `Skeleton size-12 rounded-full`, `h-4 w-2/3`, `h-4 w-1/2`, and three `h-6 w-1/4 rounded-full` badges in a `flex flex-wrap gap-2`, using the same `md:flex-col` switch.

### Tablet 768 px and 1024 px

- 1024: match cards side by side (about 306 px each); the worker grid has 2 columns of about 306 px (`md:grid-cols-2`; the spec only fixes 1280 = 3 and 768 = 2, Open question 3).
- 768: match cards side by side (352 px); the worker grid has 2 columns of 352 px ("2 columns"); the summary panel is above Back/Continue.

### Mobile 375 px

- The match cards stack (`grid-cols-1`), each about 96 px tall in the row look (as in step 1).
- The worker grid becomes a **list**: one column, each card in the **row** layout (avatar left, details right, indicator top-right), about 140 px tall.
- Empty and error cards are full width (`px-4 py-12`).
- Then the "Your job" bar (Who row: "Pick a Worker: Jordan M.") and the sticky footer.

### Component tree

```
match/page.tsx (server) — metadata "Post a job — Who"
└─ Suspense → JobStepRoute step=5 → MatchStep (new: src/components/post-job/match-step.tsx)
   └─ StepLayout step=5 (Continue → /post-job/review; 404 until T7)
      ├─ RadioGroup (new ui) > SelectableCard ×2 (new) — matchType
      ├─ EmptyState (existing) [empty → switched to board]
      ├─ section workers [direct]
      │  ├─ LoadingState variant="workers" (existing, + new variant)
      │  ├─ ErrorState (existing) onRetry
      │  ├─ RadioGroup > WorkerCard ×n (new)
      │  └─ FieldError
      └─ JobSummaryPanel (workerName from the fetched list)
```

### States (step level)

| State | What shows |
| --- | --- |
| Loading | `StepSkeleton` (hydration), then the worker list states above |
| Empty | Job Board checked (the default), and no worker section |
| Error | "Choose a worker or post to the job board" under the worker grid when Pick a Worker is checked with no worker selected. Focus goes to the first worker card; if the list is in its error state, focus goes to the Pick a Worker card and the message shows under the match group instead |
| Success | Continue → `/post-job/review` |

### Interaction details

- **Focus order:** the match type group (one Tab stop), the worker group (one Tab stop; arrows move through workers), [Retry], Back, Continue.
- **Selecting a worker** checks it and fills the summary's Who row. No other action happens on selection.
- **Guests** never see the Favourite tag or the favourites sentence (decision 5).

---

## 12. Form-state rules (all T6 steps; same as T5 §14 unless stated)

| Concern | Rule |
| --- | --- |
| Field errors | Shown under the control as `FieldError` `p#{id}-error` with a `CircleAlert` icon, on `surface`. The control gets `aria-invalid="true"` and `aria-describedby` = hint + error (+ extras such as `description-count`) through `FormField`. Shown on blur and on submit, then live on change (`mode: "onTouched"`) |
| Group errors (category, services, match, worker, photos) | `FieldError` under the group, with its id in the group's `aria-describedby` **and** in each option's `aria-describedby` while it shows (some screen readers skip group descriptions). Options get `aria-invalid`, and unchecked cards show `border-danger`. Photos use a `role="alert"` container, because their errors come from a file pick, not from a submit |
| Messages | Verbatim from `VALIDATION_MESSAGES` (`category`, `subServices`, `otherText`, `addressLine1`, `city`, `state`, `zip`, `description`, `photosMax`, `photoSize`, `photoType`, `fixedPrice`, `hourlyRate`, `hours`, `matchType`, `email`). No new wording for existing rules |
| First invalid field | `focusFirstError` with DOM-order lists: step 1 `["category"]` · step 2 `["subServices","otherText"]` · step 3 `["address.line1","address.city","address.state","address.zip"]` · step 4 `["description","amount","hours"]` · step 5 `["matchType","workerId"]`. Focus targets: radio groups → the checked option or the first one; checkbox groups → the first card; Select → its Trigger; worker → the first worker card |
| Service errors | Inline and local, never a toast and never focus-stealing: suggestions → the quiet note; notify-me → `#notify-error` (focus to the email field); worker list → `ErrorState` with Retry. `?mockError=1` is one-shot: step 3 fails the first of suggest/notify, and step 5 fails `listForArea`. Steps 1, 2 and 4 make no service call |
| Continue | Synchronous: no spinner and no toast in T6 (decisions 2 and 11). `StepLayout` keeps `loading` for T7 |
| Step change | Focus goes to the new step's `h1` (described by "Step N of 8: Label") after Back/Continue/Change only (§4.4) |
| Hydration | Nothing renders, redirects or flashes before both stores hydrate: `StepSkeleton` shows instead |
| Typed input | Never cleared by an error, a failed service call, a pricing-type switch or a Back |

---

## 13. Files

```
src/components/ui/radio-group.tsx | textarea.tsx | select.tsx                    (new, shadcn, re-themed)
src/components/flow/stepper.tsx | step-layout.tsx | step-skeleton.tsx | selectable-card.tsx   (new)
src/components/forms/address-input.tsx | photo-uploader.tsx                       (new)
src/components/job/job-summary-panel.tsx | notify-me-form.tsx | price-input.tsx | worker-card.tsx (new; worker-card exports WorkerCardSkeleton)
src/components/post-job/job-builder-gate.tsx | job-step-route.tsx                 (new)
src/components/post-job/category-step.tsx | services-step.tsx | location-step.tsx | details-step.tsx | match-step.tsx (new)
src/components/states/loading-state.tsx                                           (edit: add variant "workers")
src/app/post-job/layout.tsx                                                       (new)
src/app/post-job/{category,services,location,details,match}/page.tsx              (new)
src/app/post-job/[step]/                                                          (delete)
src/lib/constants.ts                                                              (POST_JOB_STEPS, JOB_BUILDER_COPY)
src/lib/validation/job.ts                                                         (notifyMeSchema)
src/lib/store/job-draft-store.ts                                                  (partialize drops photos; decision 3)
helpers (engineer picks the path, e.g. src/lib/job-builder.ts): isServedState, firstIncompleteStep, estimatedTotal, formatUsd
```

Not touched: `AuthHeader`, `Footer`, `RoleMismatchNotice`, `SeparateAccountsNotice`, `FormField`, `FormAlert`, `focusFirstError`, `Button`, `Input`, `Label`, `Checkbox`, `EmptyState`, `ErrorState` (all imported, not edited). The `CategoryTile` classes are mirrored, not imported.

---

## 14. New strings (`src/lib/constants.ts`; all [provisional] unless marked verbatim)

**`POST_JOB_STEPS`** (number, route, label): 1 `/post-job/category` "Category" · 2 `/post-job/services` "Services" · 3 `/post-job/location` "Where" · 4 `/post-job/details` "Details" · 5 `/post-job/match` "Who" · 6 `/post-job/review` "Review & Post" · 7 `/post-job/payment` "Payment" · 8 `/post-job/confirmation` "Confirmation" (labels from the PRD).

**`JOB_BUILDER_COPY.meta`**: titles "Post a job — Category" / "— Services" / "— Where" / "— Details" / "— Who" (all `noindex`).

**`JOB_BUILDER_COPY.stepper`**: ariaLabel "Job progress" · status(n, total) "Step {n} of {total}" · next(label) "Next: {label}" · done " (done)".

**`JOB_BUILDER_COPY.actions`**: back "Back" · continue "Continue".

**`JOB_BUILDER_COPY.summary`**:

- Title and intro: title "Your job" · emptyIntro "Your answers appear here as you go." · notAdded "Not added yet".
- Row labels: rows { category "Category", services "Services", where "Where", details "Details", who "Who" } · otherPrefix "Other: " · photoCount(n) "{n} photo(s)".
- Estimate: estimateLabel "Estimated total" · estimateEmpty "Set a price in Details" · hourlyBreakdown(rate, hours) "{rate}/hr × {hours} hours" · chargeNote "You're charged when the job is done." · barEstimate(v) "Est. {v}" · barNoPrice "No price yet" · whoDirect(name) "Pick a Worker: {name}".

**`JOB_BUILDER_COPY.category`**: title "What do you need help with?" · description "Choose the type of chore. You can add details next." (cards reuse `CATEGORIES`, `CATEGORY_DESCRIPTIONS`).

**`JOB_BUILDER_COPY.services`**: title "Which services do you need?" · description "Choose all that apply." · change "Change" · changeLabel "Change category" · otherLabel "What's the other service?" · otherHint "3 to 100 characters."

**`JOB_BUILDER_COPY.location`**:

- Step: title "Where is the job?" · description "Enter a US street address. Start typing to see suggestions."
- Fields: line1 "Street address" · city "City" · state "State" · statePlaceholder "Choose a state" · zip "ZIP code" · landmark "Landmark (optional)" · landmarkHint "Anything that helps the worker find it, like a gate code or a blue fence."
- Suggestions: suggestionsLabel "Address suggestions" · searching "Searching addresses…" · found(n) "{n} addresses found. Use the up and down arrows to choose." · noMatches "No matching addresses" · suggestError "Suggestions aren't available — enter the address below" (decision 10 wording) · filled(address) "Address filled: {address}".

**`JOB_BUILDER_COPY.notify`**: title(state) "We're not in {state} yet" · body(served, city) "Chores For Me is available in {served} for now. Leave your email and we'll let you know when we reach {city}." · email "Email" · submit "Notify me" · submitting "Saving…" · success(email, state) "Thanks! We'll email {email} when we reach {state}." · changeAddress "Use a different address".

**`JOB_BUILDER_COPY.details`**:

- Step: title "Tell us about the job" · description "Describe the work, add photos if they help, and set your price."
- Description field: descriptionLabel "Describe the job" · descriptionHint "What needs doing, how much of it, and anything the worker should know." · counter(n, max) "{n} / {max}" · counterLive(n, max) "{n} of {max} characters".
- Photos: photosLabel "Photos (optional)" · photosHint "Up to 5 photos. JPG, PNG, HEIC or WebP, under 10 MB each." · photosEmpty "Photos help workers understand the job." · choosePhotos "Choose photos" · takePhoto "Take photo" · photoCount(n, max) "{n} of {max} photos" · photoNote "Photos stay until you reload or close this tab." (decision 16 wording) · photoAlt(i, n, name) "Photo {i} of {n}: {name}" · removePhoto(i, name) "Remove photo {i}: {name}" · photoAdded(n, max) "Photo added. {n} of {max}." · photoRemoved(n, max) "Photo removed. {n} of {max}." · addedPhotosLabel "Added photos".
- Price: priceLegend "Price" · pricingTypeLabel "Pricing type" (options reuse `PRICING_TYPE_LABELS`) · fixedLabel "Your price" · fixedHint "Between $5 and $5,000." · rateLabel "Hourly rate" · rateHint "Between $10 and $200 an hour." · hoursLabel "Hours" · hoursHint "Up to 12 hours, in half hours." · hoursPlaceholder "Choose hours" · hoursOption(h) "{h} hour(s)" · estimateLabel "Estimated total" · estimateEmpty "Add a rate and hours" · estimateLive(v) "Estimated total {v}".

  The hint numbers are built from `LIMITS`.

**`JOB_BUILDER_COPY.match`**:

- Step: title "Who should do the job?" · description "Post it to the job board, or pick a verified worker yourself." · boardDescription "Verified workers near you see the job. The first to accept gets it." · directDescription "Choose from verified workers who serve your area." (titles reuse `MATCH_TYPE_LABELS`)
- Worker list: workersTitle "Choose a verified worker" · workersCount(n, city) "{n} verified workers serve {city}." · favouritesFirst "Your favourite workers are shown first." · loadingWorkers "Loading workers…" · emptyDescription "We've switched you to the job board. Choose Pick a Worker again to check for new workers." (the empty title is `SCREEN_STATE_COPY.pickWorkerEmpty`, verbatim)
- Worker card: favourite "Favourite" · favouriteSr "Favourite worker" · ratingSr " out of 5" · jobsDone(n) "{n} jobs done" · badgesLabel "Verified checks" · badges { phone "Phone", id "ID", insurance "Insurance" } (the labels match `ID_CARD_PREVIEW_SAMPLE.rows`).

---

## 15. QA hooks (design-specific)

- **Forbidden classes:** `grep` the T6 files for raw hex, `text-white`, `text-brand`, `border-brand`, `ring-`, `text-sm|xs|base|lg`, `font-medium|bold` and arbitrary `[…]` sizes (the generated Radix selectors and CSS-variable sizes in `select.tsx` are excepted). The result must be zero.
- **No horizontal scroll:** at 375 × 812 on every step, `scrollWidth === 375`, including with the suggestion list open, 5 photos added, Hourly selected and the worker list loaded.
- **Layout at 1280:** the form column is about 687 px and the summary about 379 px, with the summary sticky while scrolling step 4.
- **Layout at 1024:** 629 / 299.
- **Layout at 768:** the summary is an expanded panel above Back/Continue.
- **Layout at 375:** the summary is a closed bar, and Back/Continue stay pinned to the bottom until the end of the form, then rest above the Footer without covering it.
- **Keyboard (radio groups):** step 1 and step 5 match type are one Tab stop each; arrow keys select; Space selects.
- **Keyboard (checkbox group):** step 2 cards are separate Tab stops; Space toggles; Enter submits the form.
- **Keyboard (whole flow):** every control shows the 2 px ink outline.
- **Step change:** Continue from step 1 puts focus on the step 2 `h1`, and a screen reader reads "Step 2 of 8: Services". A hard reload on step 4 does not move focus.
- **Empty submit:** Continue on an empty step 3 shows all four messages at once, with focus on Street address, and each message is reachable through `aria-describedby`.
- **`?mockError=1`, step 3:** typing "ma" shows the quiet suggestion note (no red); entering a full Ohio address manually and pressing Notify me later succeeds.
- **`?mockError=1`, step 5:** with Pick a Worker checked, ErrorState appears and Retry loads the cards.
- **Empty worker list:** an address with no qualifying workers, then Pick a Worker, gives the verbatim empty message and Job Board checked.
- **Photos:** a 6th photo is refused with "You can add up to 5 photos". "Take photo" appears with touch emulation at 375 and is hidden on a desktop pointer. The remove buttons are 44 px and visible without hover.
- **Price:** Hourly with $40 and 3 hours shows "$120" in the estimate box and in the summary. A screen reader hears "Estimated total $120" once after input pauses.
- **Worker session:** `demo.worker` on any `/post-job/*` page sees the separate accounts notice (h1 focused), with no Stepper.
- **Touch targets:** every control is at least 44 px (photo remove 44, segments 44, select items 44, suggestion options 56, summary toggle 56).

---

## Open questions

Each has a proposed default, which applies unless the orchestrator decides otherwise.

1. **One new size value, `h-2` (8 px), for the progress segments.** It is not on the T2 sizing allowlist; the alternative is a 4 px `h-1`, which is also off the list. *Default:* allow `h-2` for the Stepper segments only, and add it to the allowlist note in PROGRESS.md.
2. **"Take photo" only on touch devices.** The plan shows it through `pointer-coarse:` (phones and tablets, including a 768 px iPad) and hides it on mouse-only desktops, where `capture` does nothing but open the file picker. QA must use touch emulation to see it at 375. *Default:* as planned. Alternative: show it below `md` regardless of pointer.
3. **Worker grid at 1024.** The spec fixes 3 columns at 1280 and 2 at 768 but says nothing about 1024, where 3 columns would be about 193 px each in the 629 px form. *Default:* 2 columns from `md`, 3 from `xl` (this also matches the existing `LoadingState` card grid).
4. **`LoadingState` gets a `workers` variant** (an edit to a T2 component) so the Step 5 skeleton matches the worker card layout while still using `LoadingState`. *Default:* add the variant. Alternative: use the existing `cards` variant, whose skeleton does not match the avatar layout.
5. **Out-of-area panel timing.** The plan shows the notify-me panel as soon as the address is complete and outside the service area (live, without moving focus), and Continue then focuses it. *Default:* live. Alternative: show it only after Continue is pressed.
6. **Mobile summary position.** The collapsible "Your job" bar sits above the sticky Continue (end of the form, the same DOM position as the tablet panel), not at the top of the step. This keeps DOM order equal to visual and focus order. *Default:* as planned.
7. **Photo buttons at the limit.** The buttons stay enabled at 5 photos so a 6th pick shows "You can add up to 5 photos" (the T6 check). *Default:* enabled. Alternative: disable them at 5 with a "5 of 5 photos — remove one to add another" hint, which would make that message reachable only through a multi-file pick.
