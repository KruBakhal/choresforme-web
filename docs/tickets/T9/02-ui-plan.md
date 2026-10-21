# T9 — UI plan (Worker onboarding)

Input: `01-product-plan.md`, including its "Orchestrator decisions" (binding: every open-question default applies except Q6; the mock flips `idStatus` to `under_review` only once **both** ID sides are uploaded; the `AuthHeader` actions slot and the Stepper 4-column option are approved edits; the shadcn `slider` and `progress` primitives are approved). Also used: the T2 UI plan (tokens, contrast pairs, focus rule, Button sizes, state components), the T5 UI plan (`AuthHeader`, `FormField`, `FieldError`, `FormAlert`, form-state rules), the T6 UI plan (`Stepper`, `StepLayout`, `StepSkeleton`, `SelectableCard`, `AddressInput`, `PhotoUploader`, form-state rules), the T8 UI plan (`StatusBadge` token approach, `FormAlert tone="success"`, no toast), the Tech Spec sections "Responsive layouts" (Worker onboarding row), "Screen states" (Document upload row) and "Validation rules", and the existing code in `src/components`. This plan does not reopen any of those decisions.

Reference width is 1280 px, then 1024, 768 and 375. Breakpoints are `sm 640 · md 768 · lg 1024 · xl 1280`. "Desktop" means `lg` and up, "tablet" means `md` to `< lg`, "mobile" means `< md`.

---

## 0. Ground rules for every T9 screen

### 0.1 Inherited unchanged

- **Colour and contrast:** T2 §0.3, T6 §0.1 and T8 §0.1. Text is `text-ink` / `text-ink-muted` on `surface`, `surface-alt` or `brand-soft`. **Brand is a fill only** (Continue, the map pin disc, slider range, progress indicator, Stepper segments), always with `text-brand-foreground` when it holds text or an icon. `text-brand`, `border-brand`, `ring-*` and `text-white` never appear.
- **Errors sit on `surface` only** (`text-danger` on `surface-alt` is 4.4:1 and fails). `main` is `bg-surface` (as in the job builder), so every field error, upload error and alert is on white. Only the progress panel's outer frame and the map illustration use `surface-alt`, and neither holds error text.
- **Status icons:** `text-success` (3.3:1) and `text-danger` (4.8:1) icons sit on `surface` only, always next to a text label.
- **Type:** `text-caption`, `text-body-sm`, `text-body`, `text-h4`, `text-h3`, `text-h2`; `font-normal` / `font-semibold`. Step `h1` is `text-h3 md:text-h2` (StepLayout already does this). Section titles inside a step are `h2 text-h4`.
- **Spacing** steps `1 2 3 4 6 8 12 16 24` (negatives, `0`, `px`). **Sizes** from the T2 allowlist (`4 5 6 7 10 11 12 14 16 20 24 60 80`, `full`, `dvh`, fractions) plus `aspect-square`, and `h-2` (T6 Stepper segments; extended here to the slider track and progress bar, Open question 5). No arbitrary `[…]` values except the generated Radix selectors in the primitives.
- **Touch targets:** inputs `h-12`, Back/Continue `h-12`, `sm` buttons and link buttons `min-h-11`, icon buttons `size-11`, checklist rows and the mobile progress toggle `min-h-14`, slider root `h-11`.
- **Focus:** the global 2 px `ring` outline with a 2 px offset (T2 §0.7); edge-to-edge rows use `focus-visible:-outline-offset-2`.
- **Motion:** `transition-colors duration-150 motion-reduce:transition-none` on hovers; the map ring and the progress indicator animate their size with `duration-150` and `motion-reduce:transition-none`; spinners `motion-safe:animate-spin`. No step-transition animation.
- **Feedback:** no toast (T8 decision 2). Success is an inline `FormAlert tone="success"`; save errors are an inline `FormAlert tone="error"`; field errors are `FieldError`; the step-load failure is `ErrorState`.

### 0.2 Width map (StepLayout `asideWidth="summary"`, Container `px-4 md:px-6 lg:px-8`)

| Width | Form column | "Your progress" panel | Position |
| --- | --- | --- | --- |
| 1280 | **687** (`xl:col-span-7`) | **379** (`xl:col-start-9 xl:col-span-4`) | Right column, top-aligned with the `h1`, **not sticky** (Open question 4) |
| 1024 | **629** (`lg:col-span-8`) | **299** (`lg:col-span-4`) | Right column, not sticky |
| 768 | 720 | 720, expanded, two inner columns | **Above the form** (between the Stepper and the `h1`) |
| 375 | 343 | 343, collapsed disclosure bar | **At the top** (between the Stepper and the `h1`) |

This is StepLayout's existing grid with `summaryFirst` (aside before the fields below `lg`), which is exactly the Tech Spec row: "Form left, 'Your progress' checklist and ID-Card preview right · Checklist above the form · Checklist collapsed at top".

### 0.3 Landmarks on `/worker/onboarding/*`

```
body
├─ header (banner)        AuthHeader + actions: SkipLink · Logo · Finish later · Log out
├─ main#main tabIndex=-1  Stepper (nav "Onboarding progress") · aside "Your progress" · h1 · form
└─ footer (contentinfo)   Footer showMobileCta={false}
```

No SideNav, no BottomNav, no AppShell (product plan Q13).

---

## 1. Edits to existing components

### 1.1 `AuthHeader` — optional `actions` slot (approved, decision 3)

```
header.min-h-16 border-b border-border bg-surface            (h-16 → min-h-16: identical unless an error line appears)
├─ SkipLink
└─ Container className="h-full" innerClassName="flex min-h-16 items-center justify-between gap-4"
   ├─ (no actions) Logo                                          ← today's markup, unchanged
   ├─ (actions)    Logo variant="mark" className="sm:hidden"     ← < 640: mark only
   │               Logo className="hidden sm:inline-flex"         ← ≥ 640: lockup
   └─ (actions)    div.flex items-center gap-2 → {actions}
```

- Two `Logo` links, one `display:none` at each width, so only one is ever in the tab order and the accessibility tree. No change to `Logo`.
- **Width check at 375:** mark 40 + gap 16 + "Finish later" (`outline sm`, about 112) + gap 8 + "Log out" (link, about 52; "Logging out…" about 88) = 228 to 264 px of 343. At 640 the lockup (about 195) fits with the actions in 608.
- `min-h-16`: the `LogoutButton` failure line (`p role="alert"` under the button, its existing behaviour) makes the header grow instead of overlapping the page.

### 1.2 `Stepper` — `GRID_COLS[4]` (approved) and two optional props (Open question 1)

| Change | Why |
| --- | --- |
| `GRID_COLS` gets `4: "grid-cols-4"` | Approved |
| `doneSteps?: readonly number[]` — when set, a non-current step is "done" only if listed, else "upcoming" | ID, insurance and payout can be done in any order (PRD); positional "done" would mark a skipped ID as done, and the sr-only " (done)" would be false |
| `statusText?: string` — replaces "Step N of total" (and the mobile "· label" / "Next: …" lines); `current={0}` then marks no item current | Payout is "not counted in 'of 4'" |

At 1280 each of the 4 columns is about 294 px, at 1024 about 234, at 768 about 177. Labels ("Your area", "Your services", "Verify ID", "Insurance") never wrap above `md`. At 375: "Step 2 of 4 · Your services" (about 190) + "Next: Verify ID" (about 105) fits in 343.

### 1.3 `StepLayout` — three optional props (Open question 1)

| Prop | Default | T9 use |
| --- | --- | --- |
| `stepperLabel?: string` | `JOB_BUILDER_COPY.stepper.ariaLabel` ("Job progress") | "Onboarding progress" |
| `onBack?` becomes optional | — | Omitted on Area ("Area has no Back"): no Back button; Continue sits at the right from `md` (`md:justify-end`) and fills the sticky footer below `md` |
| `stepperDoneSteps?`, `stepperStatusText?` | — | Passed through to `Stepper` (§1.2) |

T9 also uses the existing props `summaryFirst`, `asideSticky={false}`, `loading`, `continueLabel`, `backDisabled` and `afterDescription`. T6/T7 behaviour is unchanged.

### 1.4 `StepSkeleton` — `segments` gains `4`; new `asideFirst?: boolean` (Open question 1)

With `asideFirst` the panel block comes first in the DOM (`h-14 w-full rounded-lg` below `md`, `md:h-80`, and at `lg` the same right-column placement as today), so the skeleton matches the final layout at every width.

---

## 2. New primitives (`src/components/ui/*`, via `shadcn add`, re-themed)

Re-theming as in T5/T6: `text-sm`/`text-xs`/`font-medium` → `text-body-sm`/`text-caption`/`font-semibold`; every `ring-*` / `focus-visible:ring-*` removed in favour of the global outline; `dark:` deleted; `shadow-*` left as generated, none added. Both come from the installed `radix-ui` package (stop and report if `shadcn add` pulls in anything else; decision 4).

### 2.1 Slider (`slider.tsx`)

| Part | Classes |
| --- | --- |
| Root | `relative flex h-11 w-full touch-none items-center select-none data-[disabled]:opacity-50` (44 px tall: the whole row is the pointer target; a press anywhere on it moves the thumb) |
| Track | `relative h-2 w-full grow overflow-hidden rounded-full bg-border` |
| Range | `absolute h-full bg-brand` |
| Thumb | `block size-6 rounded-full border-2 border-ink bg-surface transition-colors duration-150 hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:border-danger motion-reduce:transition-none` |

- The thumb (ink border 12.6:1) is the perceivable control; the track and range are supplementary because the value is always shown as text.
- Horizontal only: remove the generated `data-[orientation=vertical]` classes.

### 2.2 Progress (`progress.tsx`)

| Part | Classes |
| --- | --- |
| Root | `relative h-2 w-full overflow-hidden rounded-full bg-border` |
| Indicator | `h-full w-full flex-1 bg-brand transition-transform duration-150 motion-reduce:transition-none` + the generated `style={{ transform: translateX(-(100 - value)%) }}` |

Supplementary: the row always shows "Uploading…" and the percentage as text (§4.7).

---

## 3. Onboarding shell — `src/app/worker/onboarding/layout.tsx` (server)

### Desktop 1280 px (reference)

```
<RequireRole role="worker"
  loading={<><AuthHeader /><OnboardingMain><StepSkeleton segments={4} asideFirst /></OnboardingMain></>}>
  <AuthHeader actions={<OnboardingHeaderActions />} />
  <main id="main" tabIndex={-1} className="flex-1 bg-surface outline-none">
    <Container className="py-8 md:py-12">{children}</Container>
  </main>
</RequireRole>
<Footer showMobileCta={false} />                      outside the guard: also under the separate-accounts notice
```

- Header row: Logo left; right group `Finish later` (`Button asChild variant="outline" size="sm"` → `Link /worker/dashboard`) then `LogoutButton appearance="link"` (default redirect `/login`). The header is not sticky (same as the job builder).
- The loading frame shows the plain `AuthHeader` (the session is not known yet); the actions appear once the guard passes.
- Delete the empty `src/app/worker/onboarding/[step]/` folder (fixed folders per step, as T6).

### Tablet 768 px and 1024 px

Same header (lockup + actions). Content per the width map (§0.2).

### Mobile 375 px

Mark-only logo, "Finish later", "Log out" on one 64 px row. Nothing is removed.

### Component tree

```
src/app/worker/onboarding/layout.tsx (new, server)
├─ RequireRole (existing) role="worker"
│  ├─ loading → AuthHeader (existing) + main > Container > StepSkeleton (existing, + segments 4, asideFirst)
│  ├─ mismatch → its own AuthHeader + RoleMismatchNotice (existing, unchanged; customer sees the separate-accounts notice)
│  └─ AuthHeader (existing, + actions)
│     └─ OnboardingHeaderActions (new: src/components/worker-onboarding/onboarding-header-actions.tsx, "use client")
│        ├─ Button asChild outline sm → Link "Finish later"
│        └─ LogoutButton (existing) appearance="link"
└─ Footer (existing) showMobileCta={false}
```

### States

| Area | Loading | Empty | Error | Success |
| --- | --- | --- | --- | --- |
| Session guard | `StepSkeleton` in the frame | — | — (no service call) | The step |
| Log out | "Logging out…" spinner on the link | — | `LogoutButton`'s own `role="alert"` line under it (header grows) | Redirect to `/login` |

### Interaction details

- Focus order: skip link, Logo, Finish later, Log out, then `main`.
- "Finish later" is a plain navigation (what is saved stays saved; unsaved edits on the current step are not kept, product plan rule 7).

---

## 4. Shared new components

### 4.1 `VerificationBadge` (new: `src/components/worker/verification-badge.tsx`, server-safe)

Props: `status: VerificationStatus | "done"`, `size?: "sm" | "md"` (default `"sm"`), `className?`. Same build as T8 `StatusBadge`: a static class map, a label, a distinct icon shape and the sr-only "Status: " prefix (`DASHBOARD_COPY.status.statusSr`).

```
span.inline-flex w-fit shrink-0 items-center gap-1 rounded-full font-semibold whitespace-nowrap {map[status].frame}
     sm: px-2 py-1 text-caption · md: px-3 py-1 text-body-sm
├─ Icon size-4 shrink-0 (aria-hidden) {map[status].icon}
├─ span.sr-only → "Status: "
└─ label
```

| Status | Label | Frame (token pair) | Icon | Text contrast | Icon contrast |
| --- | --- | --- | --- | --- | --- |
| `not_started` | Not started | `border border-input bg-surface text-ink-muted` | `Circle` `text-ink-muted` | 8.2:1 | 8.2:1 |
| `under_review` | Under review | `bg-brand-soft text-ink` | `Clock` `text-ink` | 8.9:1 | 8.9:1 |
| `verified` | Verified | `border border-input bg-surface text-ink` | `BadgeCheck` `text-success` | 12.6:1 | 3.3:1 (non-text) |
| `rejected` | Rejected | `border border-danger bg-surface text-ink` | `CircleX` `text-danger` | 12.6:1 | 4.8:1 |
| `done` (area, services, payout rows) | Done | `border border-input bg-surface text-ink` | `CircleCheck` `text-success` | 12.6:1 | 3.3:1 |

- Labels from `VERIFICATION_STATUS_LABELS` (verbatim spec statuses) plus `WORKER_ONBOARDING_COPY.status.done`.
- **Never colour alone:** each status has its own word and icon shape (empty circle, clock, badge-check, circle-x, circle-check). `not_started` and `verified` are both white pills but differ in text weight/colour, icon and word.
- Badges always sit on `surface` (inside the checklist card, the IdCard, upload rows and status panels), so the green and red icons keep their ratios.
- Widths (`sm`): "Under review" about 124 px, "Not started" about 115 px. Never wraps.

### 4.2 `VerificationChecklist` (new: `src/components/worker/verification-checklist.tsx`, client)

Props: `items: { key: OnboardingStep; label: string; href: string; icon: LucideIcon; status: VerificationStatus | "done"; note?: string }[]`, `currentKey?: OnboardingStep`, `onNavigate?: () => void` (T9 passes `markStepNavigation`), `ariaLabelledBy: string`. Pure presentation: no data calls. T10 passes only ID, Insurance and Payout and no `currentKey`.

```
ul[aria-labelledby].flex flex-col gap-1 rounded-lg border border-border bg-surface p-2
└─ li
   ├─ (not current) Link href onClick={onNavigate}
   │     .flex min-h-14 items-center gap-3 rounded-md border-2 border-transparent px-3 py-3
   │      transition-colors duration-150 hover:border-input focus-visible:-outline-offset-2 motion-reduce:transition-none
   └─ (current)     div[aria-current="step"] .same classes but border-ink (not a link: it would reload the same step)
      ├─ Icon size-5 shrink-0 text-ink (aria-hidden)          MapPin · ListChecks · IdCard · ShieldCheck · Landmark
      ├─ span.min-w-0 flex-1 flex flex-col items-start gap-1
      │  ├─ span.flex flex-wrap items-baseline gap-x-2
      │  │  ├─ span.text-body-sm font-semibold text-ink → "Verify ID"
      │  │  └─ (current) span.text-caption text-ink-muted → "You're here"
      │  ├─ VerificationBadge size="sm" status
      │  └─ (note) span.text-caption text-ink-muted → "Required before your first payout"   (payout row)
      └─ (link) ChevronRight size-5 shrink-0 text-ink-muted (aria-hidden)
```

| Row (T9) | Status shown |
| --- | --- |
| Your area | `done` if area complete, else `not_started` |
| Your services | `done` / `not_started` |
| Verify ID | `idStatus` |
| Insurance | `insuranceStatus` |
| Payout account | `done` if `payoutAdded`, else `not_started`; note "Required before your first payout" |

- Completion is read from the profile exactly as product plan rule 8; `rejected` shows "Rejected" (counts as not done).
- **Hover** changes the border only, never the background, so badges stay on `surface`.
- **The current row is not colour-only:** 2 px ink border (shape), "You're here" text and `aria-current="step"`.
- Accessible name of a link row: "Verify ID Status: Under review".
- Label and badge are stacked so a row fits the narrowest column (235 px inner at 1024).

### 4.3 `IdCard` (new: `src/components/worker/id-card.tsx`, server-safe)

Props: `name: string` ("First L."), `initials: string`, `photoUrl?: string`, `phoneStatus`, `idStatus`, `insuranceStatus` (all `VerificationStatus`), `showPhotoNote?: boolean`, `titleId: string`. The T4 `IdCardPreview` stays unchanged.

```
figure[aria-labelledby={titleId}].w-full min-w-0 rounded-lg border border-border bg-surface p-4
├─ div.flex items-center gap-2 → Logo variant="mark" href={null} + p#{titleId}.text-body-sm font-semibold text-ink "Chores ID-Card"
├─ div.mt-4 flex items-center gap-4
│  ├─ photo: span.relative size-14 shrink-0 overflow-hidden rounded-full bg-surface-alt > img.size-full object-cover alt=""
│  │  or initials: span.flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-soft text-h4 font-semibold text-ink (aria-hidden) "AR"
│  └─ div.min-w-0
│     ├─ p.text-h4 font-semibold text-ink break-words → "Alex R."
│     └─ (no photo && showPhotoNote) p.text-caption text-ink-muted → "Add a profile photo to complete your ID-Card"
├─ Separator.my-4
└─ ul.flex flex-col gap-3
   └─ li.flex flex-wrap items-center justify-between gap-x-3 gap-y-1
      ├─ span.flex min-w-0 items-center gap-2 → Icon size-5 text-ink (Smartphone / IdCard / ShieldCheck) + span.text-body-sm font-semibold text-ink "Phone"
      └─ VerificationBadge size="sm" status
```

- Phone: `verified` when `user.phoneVerified`, else `not_started`. ID and insurance from the profile. No rating or job count (Q16).
- Row labels reuse `JOB_BUILDER_COPY.match.badges` ("Phone", "ID", "Insurance").
- The photo is the in-tab preview chosen on Verify ID (Q5); after a reload the initials and the note show.

### 4.4 `OnboardingProgressPanel` (new: `src/components/worker-onboarding/onboarding-progress-panel.tsx`, client)

Props: `profile: WorkerProfile`, `user` (name, phoneVerified), `photoUrl?`, `currentStep: OnboardingStep`.

```
aside[aria-labelledby="progress-title"].rounded-lg bg-surface-alt md:p-6 lg:p-4 xl:p-6
├─ h2#progress-title.text-h4
│  ├─ button.md:hidden  (mobile toggle, below)
│  └─ span.hidden md:flex md:flex-wrap md:items-baseline md:justify-between md:gap-x-4
│        "Your progress" + span.text-body-sm font-normal text-ink-muted "2 of 5 done"
└─ div#progress-body  — mobile: hidden unless open (px-4 pb-4 flex flex-col gap-4)
       md: md:mt-4 md:grid md:grid-cols-2 md:gap-6 md:p-0      lg: lg:flex lg:flex-col lg:gap-4
   ├─ VerificationChecklist items={5 rows} currentKey ariaLabelledBy="progress-title"
   └─ IdCard showPhotoNote
```

| Width | Layout |
| --- | --- |
| 1280 / 1024 | Right column (379 / 299). Heading row, checklist card, then the IdCard, stacked. Not sticky (about 720 px tall; Open question 4) |
| 768 | Full width (720), above the `h1`, always expanded: heading row, then checklist (left, about 324) and IdCard (right, about 324) side by side. About 400 px tall |
| 375 | **Collapsed disclosure at the top**, closed by default. The IdCard is inside it: rearranged, not removed |

Mobile toggle (the T6 `JobSummaryPanel` pattern):

```
h2 > button[aria-expanded][aria-controls="progress-body"]
     .flex min-h-14 w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left focus-visible:-outline-offset-2
     ├─ span.text-body font-semibold text-ink → "Your progress"
     └─ span.flex items-center gap-2 text-body-sm text-ink → "2 of 5 done" + ChevronDown size-5 (rotate-180 when open, transition-transform motion-reduce:transition-none)
```

- The body's visibility is CSS only (`hidden md:grid` when closed), so resizing never leaves the tablet panel closed. Open state lives in component state for the visit.
- Error and status text never live in this panel (its frame is `surface-alt`; the cards inside are `surface`).
- **Updates in place:** after a save or upload the panel re-renders from the updated profile (ID and Insurance turn "Under review", the count goes up). No live region here; the step's own success message announces the change.

### 4.5 `RadiusField` (new: `src/components/worker/radius-field.tsx`, client)

Props: `id` ("radius"), `value`, `onChange`, `onBlur`, `error?`, `ref` (to the Thumb, for `focusFirstError`). Min, max and step from `LIMITS` (5 / 200) and step 5 (Q9).

```
div.flex flex-col gap-2
├─ div.flex items-baseline justify-between gap-4
│  ├─ Label#radius-label (for display only; the Thumb uses aria-labelledby) → "Service radius"
│  └─ p[aria-hidden].text-h4 font-semibold text-ink tabular-nums → "25 miles"
├─ Slider (new ui) min=5 max=200 step=5 value=[v] onValueChange onKeyDown={pageKeys}
│  └─ Thumb ref aria-labelledby="radius-label" aria-valuetext="25 miles"
│           aria-describedby="radius-hint [radius-error]" aria-invalid={!!error}
├─ div[aria-hidden].flex justify-between text-caption text-ink-muted → "5 mi" · "200 mi"
├─ p#radius-hint.text-body-sm text-ink-muted → "You'll see jobs within this distance of your base address."
└─ (error) FieldError id="radius-error" → "Choose a radius between 5 and 200 miles"
```

**Keyboard** (Radix `role="slider"`; one Tab stop):

| Key | Result |
| --- | --- |
| Right / Up | +5 miles |
| Left / Down | −5 miles |
| Page Up / Page Down | ±25 miles (Q9). Radix's built-in big step is step × 10 (±50), so `onKeyDown` on the Root intercepts PageUp/PageDown and Shift+Arrow, prevents the default and sets the clamped value ±25 |
| Home / End | 5 / 200 |

- The screen reader hears "Service radius, slider, 25 miles" and each new value as it changes (`aria-valuetext`). The visible read-out is `aria-hidden` (it duplicates the value text) and is **not** a live region.
- Pointer: press or drag anywhere on the 44 px row. Focus ring on the thumb.
- Default 25 for a new profile (from `getProfile`).

### 4.6 `AreaMapPlaceholder` (new: `src/components/worker/area-map-placeholder.tsx`, server-safe)

Props: `address?: Address` (only when it passes `addressSchema`), `radiusMiles: number`. No image file, no map SDK (decision 1).

```
figure[aria-labelledby="area-map-caption"].overflow-hidden rounded-lg border border-border
├─ div[aria-hidden].relative h-60 overflow-hidden bg-surface-alt
│  ├─ span.absolute inset-x-0 top-1/2 h-px bg-border  +  span.absolute inset-y-0 left-1/2 w-px bg-border        (decorative "roads")
│  ├─ span ring .absolute top-1/2 left-1/2 aspect-square h-(--ring-size) -translate-x-1/2 -translate-y-1/2
│  │        rounded-full border-2 border-dashed border-ink-muted bg-brand-soft/60 transition-all duration-150 motion-reduce:transition-none
│  │        style={{ "--ring-size": ringSize(radiusMiles) }}            ← "20%" … "100%" of the 240 px height
│  ├─ pin  .absolute top-1/2 left-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full
│  │        with address: bg-brand + MapPin size-5 text-brand-foreground
│  │        no address:   border-2 border-dashed border-input bg-surface + MapPin size-5 text-ink-muted
│  └─ span.absolute top-3 left-3 rounded-full bg-surface px-3 py-1 text-caption text-ink → "Preview — not to scale"
└─ figcaption#area-map-caption.border-t border-border bg-surface px-4 py-3
   ├─ with address: p.text-body font-semibold text-ink "Within 25 miles" + p.text-body-sm text-ink-muted break-words "of 1200 Barton Springs Rd, Austin, TX 78704"
   └─ no address:   p.text-body font-semibold text-ink "Add your base address to place your area" + p.text-body-sm text-ink-muted "Radius: 25 miles"
```

- `ringSize(r)` is a pure helper in `src/lib/worker-onboarding.ts`: `20 + 80 × √((r − 5) / 195)` percent, clamped, so small radii stay visible (25 miles ≈ 46 %, 110 px). The **only** inline style in T9 is this CSS variable (data-driven, not a design value; Open question 6). At 100 % the ring is 240 px, inside 343 at 375.
- The caption updates from the live form values (`watch`); it is not a live region (the slider already announces).
- The ring scales with the border kept at 2 px (height change, not `scale`).

### 4.7 `DocumentUploadField` (new: `src/components/forms/document-upload-field.tsx`, client)

One file per field. Holds the `File` (PhotoUploader only holds URLs). The step owns the upload state and runs the calls; the field is presentational.

| Prop | Type | Notes |
| --- | --- | --- |
| `id` | `string` | `id-front`, `id-back`, `profile-photo`, `insurance` |
| `label`, `hint`, `prompt` | `string` | |
| `icon` | `LucideIcon` | `IdCard` (front), `CreditCard` (back), `UserRound` (photo), `FileText` (insurance) |
| `accept` | `readonly string[]` | `PHOTO_MIME_TYPES` / `DOCUMENT_MIME_TYPES` |
| `fileSchema` | Zod | Pick-time check (`documentFileSchemas[kind]` / `photoFileSchema`) |
| `allowCamera` | `boolean` | "Take photo" on touch devices |
| `optional` | `boolean` | Profile photo |
| `value` / `onChange` | `File \| null` | |
| `error` | `string` | Submit validation (verbatim messages) |
| `upload` | `{ state: "idle" \| "uploading" \| "failed" \| "done"; progress: number; onRetry: () => void }`, optional | Omitted = **local mode** (profile photo: preview only, never uploaded) |
| `disabled` | `boolean` | While the step uploads |
| `ref` | | The "Choose file" button (focus target) |

```
div role="group" aria-labelledby="{id}-label" aria-describedby="{id}-hint [{id}-error] [{id}-pick-error]"
├─ p#{id}-label.text-body-sm font-semibold text-ink → "Front of your ID"
├─ p#{id}-hint.mt-1 text-body-sm text-ink-muted → "JPG, PNG, HEIC or WebP, under 10 MB."
├─ input type=file accept .sr-only tabIndex=-1 aria-hidden   (+ camera input: accept="image/*" capture="environment")
│
├─ EMPTY (upload prompt)
│  div.mt-3 flex flex-col items-center gap-4 rounded-lg border-2 border-dashed bg-surface p-6 text-center
│      border-input | (error) border-danger
│  ├─ Icon size-6 text-ink-muted (aria-hidden)
│  ├─ p.text-body-sm text-ink-muted → "Add a clear photo of the front"
│  └─ div.flex w-full flex-col gap-3
│     ├─ Button outline ref aria-describedby="{id}-error" aria-invalid → Upload "Choose file" + sr " for the front of your ID"
│     └─ Button outline .hidden pointer-coarse:inline-flex → Camera "Take photo" + sr " of the front of your ID"
│
├─ CHOSEN
│  div.mt-3 flex flex-col gap-3 rounded-lg border border-border bg-surface p-4
│  ├─ div.flex items-start gap-3
│  │  ├─ preview span.relative h-16 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-surface-alt
│  │  │     JPG/PNG/WebP: img object-cover alt="Front of your ID: {name}"
│  │  │     HEIC / PDF:   flex size-full flex-col items-center justify-center gap-1 → ImageIcon|FileText size-5 text-ink-muted + span.text-caption font-semibold text-ink "HEIC"|"PDF"
│  │  ├─ div.min-w-0 flex-1
│  │  │  ├─ p.text-body-sm font-semibold text-ink break-all line-clamp-2 → file name
│  │  │  └─ p.text-caption text-ink-muted → "2.4 MB"
│  │  └─ (idle | failed) Button outline size="icon" aria-label="Remove front of your ID: {name}" → X
│  └─ (upload set) status block, below
│
├─ (error) FieldError id="{id}-error" className="mt-2" → "Upload the front of your ID"
└─ div#{id}-pick-error role="alert" .mt-2 flex flex-col gap-1 empty:hidden → FieldError per refused pick
```

**Status block** (the Tech Spec "Document upload" row):

```
div.flex flex-col gap-2
├─ (uploading) Progress value={progress} aria-labelledby="{id}-label" aria-valuetext="{n}%"
└─ div.flex flex-wrap items-center justify-between gap-x-4 gap-y-2
   ├─ div#{id}-status role="status" .text-body-sm
   │    idle:      span.text-ink-muted "Ready to submit"
   │    uploading: span.text-ink "Uploading…"
   │    failed:    span.flex items-start gap-2 text-danger → CircleAlert size-4 + "Upload failed"
   │    done:      VerificationBadge size="md" status="under_review"
   ├─ (uploading) span[aria-hidden].text-body-sm text-ink-muted tabular-nums → "45%"
   └─ (failed) Button outline size="sm" aria-describedby="{id}-status" → RotateCw size-5 "Retry" + sr " upload: Front of your ID"
```

| State (spec verbatim) | What shows |
| --- | --- |
| Loading — "Progress bar per file" | Progress bar, "Uploading…", the percentage. The percentage is outside the live region, so only "Uploading…" is announced. Remove is hidden; the field is disabled |
| Empty — "Upload prompt" | The dashed prompt with Choose file (and Take photo on touch) |
| Error — "'Upload failed' + retry per file" | Red "Upload failed" with its icon, Retry, and Remove. The chosen file stays (errors never clear it) |
| Success — "Status 'Under review'" | The "Under review" badge. No Remove (the file was received) |

- **Local mode** (profile photo): the chosen card has the preview, name, size and Remove, and no status block. The preview URL is passed up so the IdCard shows it.
- **Simulated progress:** while `uploadDocument` runs (400–800 ms), progress rises towards 90 % on a short interval, jumps to 100 % on success, and the bar is replaced by the failure line on error. Reduced motion: no transition, same numbers.
- **Pick refusals** (wrong type, over 10 MB): the file is not taken; the message (from the schema, verbatim `VALIDATION_MESSAGES`) appears in `#{id}-pick-error` (`role="alert"`, announced without moving focus) and clears on the next pick or remove.
- Widths: in the ID step's two-column grid each field is about 335 px at 1280, 306 at 1024, 348 at 768; full width (343) at 375. The file-name column is at least 110 px (two lines, `break-all`); the status block always has the full card width.

### 4.8 `DocumentStatusPanel` (new: `src/components/worker-onboarding/document-status-panel.tsx`, server-safe)

Shown at the top of Verify ID and Insurance when the saved status is not `not_started`, and on Payout when `payoutAdded`. New because the same panel serves three steps; nothing existing shows a status with a reason.

```
section[aria-labelledby="{id}-title"].rounded-lg border bg-surface p-4 md:p-6      border-input | (rejected) border-danger
├─ div.flex flex-wrap items-center justify-between gap-3
│  ├─ h2#{id}-title.text-h4 → "Your ID" | "Your insurance" | "Payout account"
│  └─ VerificationBadge size="md" status
├─ p.mt-2 text-body-sm text-ink → status line (table)
└─ (action) div.mt-4 → e.g. Payout's "Update payout account"
```

| Status | Line |
| --- | --- |
| `under_review` | "We've received both sides of your ID. It shows as Under review until it's approved." · Insurance: "We've received your insurance document. It shows as Under review until it's approved." |
| `verified` | "Your ID is verified." · "Your insurance is verified." |
| `rejected` | `span.font-semibold` "Reason:" + `rejectionReason` (fallback "It couldn't be approved."), then on a new line "Upload new photos of the front and back below." · Insurance: "Upload a new document below." |
| Payout `done` | "Payout account added. For your security, the numbers aren't shown." |

No review time is shown (PRD open item).

### 4.9 `OnboardingStepRoute` (new: `src/components/worker-onboarding/onboarding-step-route.tsx`, client) — load states for every step

| State | What shows |
| --- | --- |
| Loading (`getProfile`, store hydration, guard redirect) | `StepSkeleton segments={4} asideFirst` |
| Error (`?mockError=1` on any step URL, or any failure) | `div.mx-auto max-w-xl` → `ErrorState headingLevel={1}` title "Something went wrong" (default), message "We couldn't load your onboarding progress. Please try again." Retry → "Retrying…", refetch, then the step. No Stepper or panel (nothing loaded). Focus does not move; `role="alert"` announces |
| Empty | Not a state of the load: a new profile renders the step with empty fields |
| Success | The step |

---

## 5. Your area — `/worker/onboarding/area` (Step 1 of 4)

### Desktop 1280 px (reference)

```
Stepper "Step 1 of 4" (Your area current)                                         full width, mb-12
form (StepLayout summaryFirst asideSticky={false}, no onBack)
├─ [right, 379] OnboardingProgressPanel currentStep="area"
└─ [left, 687]
   ├─ h1 "Where do you want to work?"  ·  p "Set your base address and how far you'll travel. US addresses only."
   ├─ section[aria-labelledby="area-address-title"] flex flex-col gap-6
   │  ├─ h2#area-address-title.text-h4 → "Base address"
   │  ├─ AddressInput (existing) — street (combobox), City / State / ZIP row (323 / 218 / 101), Landmark (optional)
   │  └─ (valid address, state not in SERVED_STATES) FormAlert tone="info" autoFocus={false}
   │        title "Jobs may be limited in Ohio" · message "Chores For Me is live in Texas for now. You can still finish setting up — jobs will show here as we grow."
   ├─ section[aria-labelledby="area-radius-title"] flex flex-col gap-4
   │  ├─ h2#area-radius-title.text-h4 → "How far you'll travel"
   │  ├─ AreaMapPlaceholder (687 × 240 + caption)
   │  └─ RadiusField
   ├─ (save failed) FormAlert tone="error" → "Something went wrong. Your progress is saved — try again"
   └─ actions: Continue (right) — loading "Saving…"
```

- The map sits **above** the slider so a finger on the thumb (mobile) never covers it; the slider label sits directly on the slider.
- The out-of-area note is non-blocking (Q7): Continue still saves. It appears live when the address becomes complete and out of area; as an info `FormAlert` (`role="status"`) it is announced once without moving focus.
- `AddressInput` works on a form field called `address`; the step maps it to `baseAddress` when saving (engineer note, no component change).

### Tablet 768 px and 1024 px

- **1024:** as desktop; form 629 (City / State / ZIP about 299 / 198 / 91), map 629 × 240, panel 299 on the right.
- **768:** panel above the `h1` (expanded, checklist and IdCard side by side). Form 720 full width; map 720 × 240.

### Mobile 375 px

Stepper ("Step 1 of 4 · Your area", "Next: Your services"), the closed "Your progress · 0 of 5 done" bar, `h1`, address fields (City full row, State + ZIP side by side, as T6), the note, the map (343 × 240), the radius field, then the sticky footer with a full-width **Continue** (no Back).

### Component tree

```
area/page.tsx (new, server) — metadata "Your area · Chores For Me", noindex, instant = false (+ comment)
└─ Suspense fallback={<StepSkeleton segments={4} asideFirst />}
   └─ OnboardingStepRoute (new) step="area" key={revisitKey}
      └─ AreaStep (new: src/components/worker-onboarding/area-step.tsx) — RHF + workerAreaSchema
         └─ StepLayout (existing, + §1.3) step=1 stepperLabel summaryFirst asideSticky={false} (no onBack)
            ├─ summary → OnboardingProgressPanel (new) → VerificationChecklist (new), IdCard (new) → VerificationBadge (new)
            ├─ AddressInput (existing)
            ├─ FormAlert (existing) tone="info" — out of area
            ├─ AreaMapPlaceholder (new)
            ├─ RadiusField (new) → Slider (new ui)
            └─ FormAlert (existing) tone="error" — save failed
```

### Styling

| Element | Classes |
| --- | --- |
| Field stack | StepLayout's `mt-8 flex flex-col gap-8` (sections) |
| Section | `flex flex-col gap-6` (address) / `gap-4` (radius); `h2 text-h4` |
| Info note | `FormAlert tone="info"`: `border-input bg-brand-soft`, ink 8.9:1 |
| Map | §4.6 (`h-60`, `surface-alt` frame, `surface` caption) |
| Read-out | `text-h4 font-semibold text-ink tabular-nums` |

### States

| Area | Loading | Empty | Error | Success |
| --- | --- | --- | --- | --- |
| Step load | `StepSkeleton` | New profile: empty address, radius 25, map prompt "Add your base address to place your area" | `ErrorState` + Retry (`?mockError=1`) | Pre-filled form, map with pin and ring |
| Suggestions | "Searching addresses…" (T6) | No popup | Quiet note "Suggestions aren't available — enter the address below" | Listbox |
| Validation | — | — | Verbatim under each field: "Enter the street address", "Enter the city", "Choose a state", "Enter a 5-digit ZIP code", "Choose a radius between 5 and 200 miles" | — |
| Save (`updateOnboarding`) | Continue spinner "Saving…"; fields `fieldset disabled` | — | `FormAlert tone="error"` above the actions, focused; typed values kept | `/worker/onboarding/services`; checklist row "Your area" → Done |

### Interaction details

- **Focus order:** header → [mobile toggle | checklist links] → (h1) → Street, City, State, ZIP, Landmark → slider thumb → [alert] → Continue → Footer.
- **First invalid field** (`focusFirstError`): `address.line1 → address.city → address.state → address.zip → radiusMiles` (the thumb).
- The pin and caption switch to the address as soon as the five fields validate (live `watch`).

---

## 6. Your services — `/worker/onboarding/services` (Step 2 of 4)

### Desktop 1280 px (reference)

- `h1` "Which services do you offer?" · description "Choose all that apply. You'll see jobs in these categories."
- `div role="group" aria-labelledby={titleId} aria-describedby="categories-error"` (while invalid) `.grid grid-cols-1 gap-4 sm:grid-cols-2` → four `SelectableCard type="checkbox" layout="tile"` from `CATEGORIES`, with `CATEGORY_ICONS` and `CATEGORY_DESCRIPTIONS` (reused). 2 × 2 at about 335 px each.
- `FieldError id="categories-error"` under the grid: "Choose at least one service you offer".
- Save error `FormAlert` above the actions. Actions: Back (→ area) and Continue ("Saving…").

### Tablet 768 px and 1024 px

1024: 2 × 2 at about 306 px. 768: panel above, 2 × 2 at about 352 px.

### Mobile 375 px

One column of four tiles (343, icon left of the text: the existing `SelectableCard` tile is a row below `sm`), then the sticky footer Back + Continue.

### Component tree

```
services/page.tsx (new) → OnboardingStepRoute step="services" → ServicesStep (new) — workerServicesSchema
└─ StepLayout step=2 onBack → OnboardingProgressPanel · SelectableCard (existing) × 4 · FieldError · FormAlert
```

### Styling

Cards as T6 §5 (checked: `border-ink bg-brand-soft`, indicator filled with a check; invalid: `border-danger` on unchecked cards).

### States

| Loading | Empty | Error | Success |
| --- | --- | --- | --- |
| `StepSkeleton`; then Continue "Saving…" | No card checked | Load: `ErrorState` (`?mockError=1`). Validation: the group error, focus on the first card. Save: `FormAlert` | `/worker/onboarding/id`; "Your services" → Done |

### Interaction details

Each card is a Tab stop; Space toggles; Enter submits (existing). First invalid target: the first card.

---

## 7. Verify ID — `/worker/onboarding/id` (Step 3 of 4)

### Desktop 1280 px (reference)

```
h1 "Verify your ID" · p "Upload the front and back of a government photo ID. It's used for identity verification only."
afterDescription → Button asChild variant="link" size="sm" className="mt-2" → Link /worker/dashboard "See jobs near you first" + ArrowRight
field stack
├─ (idStatus ≠ not_started) DocumentStatusPanel                  under review / verified / rejected + reason
├─ (not_started | rejected) section[aria-labelledby="id-photo-title"]
│  ├─ h2.text-h4 "Photo ID" · p.mt-1 text-body-sm text-ink-muted "Both sides, clearly readable."
│  ├─ div.mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2
│  │  ├─ DocumentUploadField id="id-front" label "Front of your ID" (IdCard icon) upload={front}
│  │  └─ DocumentUploadField id="id-back"  label "Back of your ID"  (CreditCard icon) upload={back}
│  └─ (exactly one side done) p.mt-4 flex items-start gap-2 text-body-sm text-ink → Info size-4 + "Your ID goes for review once both sides are uploaded."
├─ section[aria-labelledby="profile-photo-title"]                 (always; optional)
│  ├─ h2.text-h4 "Profile photo (optional)" · p.mt-1 text-body-sm text-ink-muted "Shown on your Chores ID-Card. It stays on this device until you reload."
│  └─ div.mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 → DocumentUploadField id="profile-photo" local mode (UserRound icon)
├─ (all rows done) FormAlert tone="success" title "Under review" message "Thanks — we've received both sides of your ID. It shows as Under review until it's approved."
├─ (not complete) div.flex flex-wrap items-center gap-x-2 gap-y-1
│     p.text-body-sm text-ink-muted "Not ready? You can verify your ID later — you'll need it before you can accept jobs."
│     Button variant="link" size="sm" → "Skip for now" + ArrowRight     (→ insurance)
└─ actions: Back (→ services) · primary
```

| Situation | Primary | Loading label |
| --- | --- | --- |
| Upload controls shown, not all sent | "Submit for review" | "Uploading…" (spinner; Back and Skip disabled) |
| All rows done in this visit, or saved status `under_review` / `verified` | "Continue" (→ insurance) | — |

- The profile photo is a `DocumentUploadField` in local mode, not `PhotoUploader` (Open question 3).
- Front and back always carry their own labels and icons; the grid order is front then back ("labelled correctly").
- On `rejected` the panel (red border, reason) sits above fresh, empty upload fields.

### Tablet 768 px and 1024 px

1024: the two ID fields side by side (306 each), the photo field in the left half. 768: panel above; fields 348 each.

### Mobile 375 px

Everything stacks: status panel, front, back, the partial note, profile photo, success alert, the Skip row, then the sticky Back + "Submit for review". The dashed prompts stack Choose file and Take photo full width.

### Component tree

```
id/page.tsx (new) → OnboardingStepRoute step="id" → IdStep (new) — idDocumentsSchema; per-row upload state; Promise.allSettled
└─ StepLayout step=3 onBack loading continueLabel afterDescription backDisabled
   ├─ OnboardingProgressPanel (photoUrl from the local field)
   ├─ DocumentStatusPanel (new) → VerificationBadge
   ├─ DocumentUploadField (new) × 3 → Progress (new ui), VerificationBadge, Button, FieldError
   ├─ FormAlert (existing) tone="success" | "error"
   └─ Button link "Skip for now", Link "See jobs near you first"
```

### Styling

| Element | Classes |
| --- | --- |
| Section | `h2 text-h4`; hint `mt-1 text-body-sm text-ink-muted`; grid `mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2` |
| Partial note | `flex items-start gap-2 text-body-sm text-ink`, `Info size-4` (ink, not red: nothing is wrong yet) |
| Skip row | `flex flex-wrap items-center gap-x-2 gap-y-1`; note `text-body-sm text-ink-muted`; `Button variant="link" size="sm"` (`min-h-11`) |

### States

| Area | Loading | Empty | Error | Success |
| --- | --- | --- | --- | --- |
| Step load | `StepSkeleton` | — | `ErrorState` + Retry (`?mockError=1`) | Form or status panel |
| Each ID side | Progress bar + "Uploading…" + % | Dashed upload prompt | "Upload failed" + Retry (re-sends only that file; the file stays) | "Under review" badge on the row |
| Validation | — | — | "Upload the front of your ID" / "Upload the back of your ID" under the empty field (dashed border red); refused picks in the pick-error line | — |
| Step result | "Submit for review" spinner | — | Partial: the failed row(s) + the partial note; the checklist ID row stays "Not started" (decision 2: the mock flips ID only after both sides) | Success `FormAlert`, primary becomes Continue, checklist and IdCard show ID "Under review" |
| Revisit | — | — | `rejected`: panel with the reason + upload fields | `under_review` / `verified`: panel only, Continue |

Note on testing errors: `?mockError=1` is one-shot and the first call on the page is `getProfile`, so it shows the step `ErrorState`; after Retry, uploads succeed. See Open question 2 for reaching "Upload failed".

### Interaction details

- **Focus order:** (h1) → See jobs near you first → front: Choose file, [Take photo] | Remove, [Retry] → back: same → profile photo: Choose file, [Take photo] | Remove → [success alert] → Skip for now → Back → primary.
- **Submit with a side missing:** both errors show; focus goes to the first empty field's Choose file (`focusFirstError` order `idFront → idBack`), whose `aria-describedby` reads the error.
- **After the upload round:** any failure → focus to the first failed row's Retry (its description reads "Upload failed"). All done → focus to the success `FormAlert`.
- **Retry:** the row goes back to uploading; on success focus moves to the next failed row's Retry, else to the success alert.
- **Remove:** focus returns to that field's Choose file.
- Skip for now and See jobs near you first call `markStepNavigation()` (Skip) so the next step's `h1` takes focus; the dashboard link does not.

---

## 8. Insurance — `/worker/onboarding/insurance` (Step 4 of 4)

### Desktop 1280 px (reference)

- `h1` "Add your insurance" · description "Upload your insurance document. A photo or a PDF works." · afterDescription "See jobs near you first".
- `(insuranceStatus ≠ not_started)` `DocumentStatusPanel` ("Your insurance").
- `(not_started | rejected)` one `DocumentUploadField id="insurance"` label "Insurance document", hint "JPG, PNG, HEIC, WebP or PDF, under 10 MB.", prompt "Add your insurance document", `FileText` icon, `accept={DOCUMENT_MIME_TYPES}`, camera on touch. Full form width (687); a PDF shows the file tile.
- Success `FormAlert` title "Under review" message "Thanks — we've received your insurance document. It shows as Under review until it's approved."
- Skip row: "Not ready? You can add insurance later — you'll need it before you can accept jobs." + "Skip for now" (→ payout).
- Actions: Back (→ ID), "Submit for review" / "Uploading…" → then "Continue" (→ payout).

### Tablet 768 px and 1024 px

As desktop at 629 / 720 px wide; panel right at 1024, above at 768.

### Mobile 375 px

Stacked; the dashed prompt's buttons full width; sticky Back + primary.

### Component tree

```
insurance/page.tsx (new) → OnboardingStepRoute step="insurance" → InsuranceStep (new) — insuranceSchema
└─ StepLayout step=4 → OnboardingProgressPanel · DocumentStatusPanel · DocumentUploadField · FormAlert · Skip / See jobs links
```

### Styling

As Verify ID (§7).

### States

| Area | Loading | Empty | Error | Success |
| --- | --- | --- | --- | --- |
| Step load | `StepSkeleton` | — | `ErrorState` + Retry (`?mockError=1`) | Form or status panel |
| The document | Progress bar per file | Upload prompt | "Upload failed" + Retry; "Upload your insurance document" on submit when empty | "Under review" badge, success alert, checklist and IdCard Insurance "Under review" |

**Done when:** after this step with ID done, both rows read "Under review" in the checklist and the IdCard.

### Interaction details

Focus order: See jobs → Choose file, [Take photo] | Remove, [Retry] → [alert] → Skip for now → Back → primary. Same focus rules as §7 (single row).

---

## 9. Payout account — `/worker/onboarding/payout` (not counted in "of 4")

### Desktop 1280 px (reference)

```
Stepper statusText "Payout account · Needed before your first payout", current={0}, 4 segments with doneSteps
h1 "Add a payout account" · p "Where your earnings are sent. Required before your first payout, not before you apply."
afterDescription → "See jobs near you first"
field stack
├─ (payoutAdded && !editing) DocumentStatusPanel title "Payout account" badge done + action Button outline sm "Update payout account"
├─ (fields shown)
│  ├─ FormAlert tone="info" autoFocus={false} title "Demo only"
│  │     message "Don't enter real bank details. Try routing number 110000000 and account number 000123456789."
│  └─ div.grid grid-cols-1 gap-6 sm:grid-cols-2
│     ├─ FormField id="routingNumber" "Routing number" hint "9 digits" → Input inputMode="numeric" autoComplete="off" maxLength={9} tabular-nums
│     └─ FormField id="accountNumber" "Account number" hint "4 to 17 digits" → Input inputMode="numeric" autoComplete="off" maxLength={17} tabular-nums
├─ (save failed) FormAlert tone="error"
├─ Skip row: "Required before your first payout, not before you apply." + "Skip for now" (→ /worker/dashboard)
└─ actions: Back (→ insurance) · primary "Add payout account" / "Saving…"   |   panel view: "Continue" (→ /worker/dashboard)
```

- Fields at 1280: 2 × 335 px; 1024: 2 × 306; 768: 2 × 348; 375 stacked.
- The numbers are validated, then discarded; only `payoutAdded: true` is saved. The fields never pre-fill ("Update payout account" reopens them empty).

### Tablet 768 px and 1024 px

As desktop; panel right at 1024, above at 768.

### Mobile 375 px

Stepper line "Payout account · Needed before your first payout" (wraps to two lines, no "Next"), the closed progress bar, `h1`, the demo note, fields stacked, Skip row, sticky Back + "Add payout account".

### Component tree

```
payout/page.tsx (new) → OnboardingStepRoute step="payout" → PayoutStep (new) — payoutSchema
└─ StepLayout step={0} stepperStatusText stepperDoneSteps → OnboardingProgressPanel · DocumentStatusPanel · FormAlert (info, error) · FormField + Input × 2
```

### Styling

Demo note: `FormAlert tone="info"` (`bg-brand-soft`, ink 8.9:1; static on mount, so it is not announced). Inputs as T5 (`h-12`).

### States

| Loading | Empty | Error | Success |
| --- | --- | --- | --- |
| `StepSkeleton`; "Saving…" on the primary | Empty fields + demo note | Load: `ErrorState` (`?mockError=1`). Validation: "Enter a 9-digit routing number" / "Enter a valid account number" under the fields. Save: `FormAlert` (fields keep their values) | → `/worker/dashboard`. Revisit: the "Payout account added" panel |

### Interaction details

- Focus order: See jobs → [Update payout account] | Routing number → Account number → [alert] → Skip for now → Back → primary.
- First invalid: `routingNumber → accountNumber`.
- "Update payout account" reveals the fields and focuses Routing number; the panel stays above them.

---

## 10. Form-state and focus rules (all T9 steps; T5 §14 / T6 §12 unless stated)

| Concern | Rule |
| --- | --- |
| Field errors | `FieldError` `p#{id}-error` under the control, linked with `aria-describedby` (hint + error) through `FormField`, `aria-invalid` while shown; on blur and on submit, then live (`mode: "onTouched"`) |
| Group / custom controls | Services group error id in the group's and every card's `aria-describedby`. Document fields: error id on the group and on Choose file. Slider: on the Thumb |
| Messages | Verbatim `VALIDATION_MESSAGES` (address, radius, categories, idFront, idBack, insurance, routing, account, photo type/size); "Upload failed" from `SCREEN_STATE_COPY.uploadFailed`; "Under review" from `VERIFICATION_STATUS_LABELS` |
| First invalid field | `focusFirstError` lists: area `address.line1, address.city, address.state, address.zip, radiusMiles` · services `categories` · id `idFront, idBack` · insurance `document` · payout `routingNumber, accountNumber` |
| Step change | Continue, Back, Skip for now and checklist links call `markStepNavigation()`; the new step's `h1` (described by the Stepper status, e.g. "Step 3 of 4: Verify ID") takes focus. Hard loads, reloads and guard redirects never move focus |
| Submitting | Primary `loading` ("Saving…" / "Uploading…"), fields disabled, Back disabled while uploading |
| Save errors | `FormAlert tone="error"` as the last item of the field stack (just above the actions), focused, cleared when the next submit starts. Typed input and chosen files are never cleared |
| Upload errors | Per row, focus to the first failed Retry |
| Success | Area / services / payout: navigation is the success. ID / insurance: `FormAlert tone="success"` focused, then Continue |
| Toasts | None |

---

## 11. Files

```
src/components/ui/slider.tsx | progress.tsx                                       (new, shadcn, re-themed)
src/components/auth/auth-header.tsx                                               (edit: actions slot, approved)
src/components/flow/stepper.tsx                                                   (edit: GRID_COLS 4 approved; doneSteps, statusText — OQ1)
src/components/flow/step-layout.tsx | step-skeleton.tsx                           (edit — OQ1)
src/components/worker/verification-badge.tsx | verification-checklist.tsx | id-card.tsx | radius-field.tsx | area-map-placeholder.tsx   (new)
src/components/forms/document-upload-field.tsx                                    (new)
src/components/worker-onboarding/onboarding-header-actions.tsx | onboarding-progress-panel.tsx | onboarding-step-route.tsx
  | document-status-panel.tsx | area-step.tsx | services-step.tsx | id-step.tsx | insurance-step.tsx | payout-step.tsx   (new)
src/app/worker/onboarding/layout.tsx + {area,services,id,insurance,payout}/page.tsx   (new); [step]/ (delete)
src/lib/worker-onboarding.ts                                                      (new: helpers + ringSize)
src/lib/constants.ts                                                              (WORKER_ONBOARDING_COPY; POST_SIGN_UP_ROUTE.worker)
```

Not touched: `Logo`, `AddressInput`, `SelectableCard`, `PhotoUploader`, `FormField`, `FormAlert`, `LogoutButton`, `RequireRole`, `ErrorState`, `Footer`, `IdCardPreview`.

---

## 12. New strings (`WORKER_ONBOARDING_COPY` in `src/lib/constants.ts`; all [provisional] unless marked verbatim)

- **meta:** "Your area · Chores For Me" · "Your services · Chores For Me" · "Verify ID · Chores For Me" · "Insurance · Chores For Me" · "Payout account · Chores For Me".
- **header:** finishLater "Finish later".
- **stepper:** ariaLabel "Onboarding progress" · steps "Your area", "Your services", "Verify ID", "Insurance" · payoutStatus "Payout account · Needed before your first payout" (status / next / done strings reuse `JOB_BUILDER_COPY.stepper`).
- **actions:** saving "Saving…" · submitForReview "Submit for review" · uploading "Uploading…" · skip "Skip for now" · seeJobs "See jobs near you first" · addPayout "Add payout account" (Back / Continue reuse `JOB_BUILDER_COPY.actions`).
- **load / save:** loadError "We couldn't load your onboarding progress. Please try again." · saveError "Something went wrong. Your progress is saved — try again".
- **progress:** title "Your progress" · count(n, total) "{n} of {total} done" · youAreHere "You're here" · rows "Your area", "Your services", "Verify ID", "Insurance", "Payout account" · payoutNote "Required before your first payout" · statusDone "Done".
- **idCard:** title "Chores ID-Card" · photoNeeded "Add a profile photo to complete your ID-Card" (row labels reuse `JOB_BUILDER_COPY.match.badges`).
- **area:** title "Where do you want to work?" · description "Set your base address and how far you'll travel. US addresses only." · addressHeading "Base address" · radiusHeading "How far you'll travel" · radiusLabel "Service radius" · radiusValue(n) / radiusValueText(n) "{n} miles" · radiusHint "You'll see jobs within this distance of your base address." · scaleMin / scaleMax "{n} mi" (from `LIMITS`) · mapChip "Preview — not to scale" · mapWithin(n) "Within {n} miles" · mapOf(address) "of {address}" · mapPrompt "Add your base address to place your area" · mapRadius(n) "Radius: {n} miles" · outOfAreaTitle(state) "Jobs may be limited in {state}" · outOfAreaBody(served) "Chores For Me is live in {served} for now. You can still finish setting up — jobs will show here as we grow."
- **services:** title "Which services do you offer?" · description "Choose all that apply. You'll see jobs in these categories."
- **id:** title "Verify your ID" · description "Upload the front and back of a government photo ID. It's used for identity verification only." · photoIdHeading "Photo ID" · photoIdHint "Both sides, clearly readable." · front "Front of your ID" · back "Back of your ID" · frontPrompt "Add a clear photo of the front" · backPrompt "Add a clear photo of the back" · fileHint "JPG, PNG, HEIC or WebP, under 10 MB." · profileHeading "Profile photo (optional)" · profileHint "Shown on your Chores ID-Card. It stays on this device until you reload." · profileLabel "Your photo" · profilePrompt "Add a clear photo of your face" · partialNote "Your ID goes for review once both sides are uploaded." · success "Thanks — we've received both sides of your ID. It shows as Under review until it's approved." · skipNote "Not ready? You can verify your ID later — you'll need it before you can accept jobs."
- **insurance:** title "Add your insurance" · description "Upload your insurance document. A photo or a PDF works." · label "Insurance document" · hint "JPG, PNG, HEIC, WebP or PDF, under 10 MB." · prompt "Add your insurance document" · success "Thanks — we've received your insurance document. It shows as Under review until it's approved." · skipNote "Not ready? You can add insurance later — you'll need it before you can accept jobs."
- **upload field:** chooseFile "Choose file" · takePhoto "Take photo" · forSr(label) " for {label}" (lower-cased) · ready "Ready to submit" · uploading "Uploading…" · percent(n) "{n}%" · retry "Retry" · retrySr(label) " upload: {label}" · remove(label, name) "Remove {label}: {name}" · alt(label, name) "{label}: {name}" · size(bytes) "{n} MB" · failed = `SCREEN_STATE_COPY.uploadFailed` (verbatim).
- **status panel:** idTitle "Your ID" · insuranceTitle "Your insurance" · payoutTitle "Payout account" · idUnderReview "We've received both sides of your ID. It shows as Under review until it's approved." · insuranceUnderReview "We've received your insurance document. It shows as Under review until it's approved." · idVerified "Your ID is verified." · insuranceVerified "Your insurance is verified." · reasonLabel "Reason:" · reasonFallback "It couldn't be approved." · idReupload "Upload new photos of the front and back below." · insuranceReupload "Upload a new document below." · payoutAdded "Payout account added. For your security, the numbers aren't shown." · updatePayout "Update payout account".
- **payout:** title "Add a payout account" · description "Where your earnings are sent. Required before your first payout, not before you apply." · demoTitle "Demo only" · demoNote "Don't enter real bank details. Try routing number 110000000 and account number 000123456789." · routingLabel "Routing number" · routingHint "9 digits" · accountLabel "Account number" · accountHint "4 to 17 digits" · skipNote "Required before your first payout, not before you apply."

---

## 13. QA hooks (design-specific)

- **Forbidden classes:** grep the T9 files for raw hex, `text-white`, `text-brand`, `border-brand`, `ring-`, `text-sm|xs|base|lg`, `font-medium|bold` and arbitrary `[…]` values. Zero, except the generated Radix selectors and the Progress `translateX` style. The only hand-written inline style is `--ring-size` in `AreaMapPlaceholder`.
- **Layout:** 1280 → form about 687, panel about 379 on the right; 1024 → 629 / 299; 768 → panel above the `h1`, checklist and IdCard side by side; 375 → closed "Your progress" bar at the top, IdCard inside it.
- **No horizontal scroll** at 375 on all five steps, with the suggestion list open, a long file name chosen, a PDF tile, the out-of-area note and the progress panel open. Header fits on one row.
- **Badges:** each of Not started, Under review, Verified, Rejected and Done shows a word and its own icon; check in greyscale. Badges sit on white only.
- **Slider:** Tab reaches the thumb; arrows ±5, Page Up/Down ±25, Home 5, End 200; a screen reader hears "N miles"; the ring and caption follow; reduced motion removes the ring transition.
- **Upload rows:** progress bar and percentage while uploading; "Upload failed" + Retry keeps the file; success shows "Under review"; Retry re-sends only that row.
- **ID labelling:** "Front of your ID" and "Back of your ID" each have their own label, icon, prompt, error and accessible button names.
- **Done when:** a new worker completes area, services, ID and insurance; the checklist and IdCard show "Under review" for ID and Insurance at all four widths.
- **Focus:** Continue from area puts focus on the services `h1` ("Step 2 of 4: Your services"); an empty ID submit focuses the front's Choose file and reads "Upload the front of your ID"; a reload never moves focus.
- **`?mockError=1`** on each step URL shows `ErrorState`; Retry loads the step.
- **Touch targets:** checklist rows and the toggle 56, slider row 44, Remove / Retry / Choose file ≥ 44, header buttons 44.

---

## Open questions

Each has a proposed default, which applies unless the orchestrator decides otherwise.

1. **Small additive edits beyond decision 3.** The onboarding needs: `Stepper` `doneSteps` and `statusText` (truthful "done" marks for any-order steps; payout's own status line); `StepLayout` `stepperLabel`, optional `onBack` and the Stepper pass-through (today it always says "Job progress" and always draws Back); `StepSkeleton` `segments={4}` and `asideFirst`. All optional, T6/T7 unchanged. *Default:* approve. Without them, Area shows a disabled Back, the stepper is named "Job progress", a skipped ID reads "(done)", and payout has no correct status.
2. **Reaching "Upload failed" in the demo.** `?mockError=1` is one-shot and `getProfile` is always the first call on a step, so it can only show the step `ErrorState`; the per-file failure and the save `FormAlert` are never reached (product plan Q3 assumed they would be). *Default:* add a mock-only one-shot `?mockUploadError=1` that fails the first `workers.uploadDocument` call after load (a `src/lib/mock` change, needs approval). Alternative: accept that QA checks the failure UI by code review only.
3. **Profile photo: `DocumentUploadField` in local mode instead of `PhotoUploader`.** `PhotoUploader`'s copy is hard-wired to job photos ("Choose photos", "Photos help workers understand the job.", "1 of 1 photos") and it lays out a 5-photo grid. *Default:* use the new field in local mode (same look as the ID sides, no edit to `PhotoUploader`). Alternative: add a `copy` prop to `PhotoUploader`.
4. **Progress panel not sticky on desktop.** It is about 720 px tall at 1024, so a sticky panel would cut off the IdCard on shorter screens. *Default:* `asideSticky={false}`.
5. **`h-2` for the slider track and upload progress bar** (T6 allowed it for Stepper segments only). *Default:* allow it for these two primitives as well.
6. **One data-driven inline style** (`--ring-size` on the map ring). *Default:* allow it in `AreaMapPlaceholder` only. Alternative: a static map of 8 ring sizes by radius band (coarser animation).
7. **Landmark hint on the worker address** reads "Anything that helps the worker find it…", which is customer copy. Q10 says no component change. *Default:* leave it in T9 and log it for the T12 copy pass.
8. **"Skip for now" sits at the end of the form, not in the action bar,** because the 375 px sticky footer cannot fit three buttons. *Default:* as planned at every width, for one consistent place.
9. **Per-row "Under review" before the ID status flips** (decision 2). After one side succeeds and the other fails, that row says "Under review" while the checklist says "Not started"; the partial note explains it. *Default:* as planned.
10. **Header with "Finish later" and "See jobs near you first"** both go to `/worker/dashboard` from the ID step on. *Default:* keep both (header exit vs. in-content invitation, as the product plan decided); revisit in T12 if it reads as duplicated.
