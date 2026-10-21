# T8 — UI plan (Customer dashboard)

Input: `01-product-plan.md`, including its "Orchestrator decisions" (binding: all open-question defaults apply except Q8; **no toast**, success is an inline `role="status"` message; `workers.getSummaries` is approved; the Home rail mechanism is chosen here). Also used: the T2 UI plan (tokens, contrast pairs, focus rule, Button sizes, AppShell / SideNav / BottomNav, state components), the T6 UI plan (`SelectableCard`, `AddressInput`, description counter, `PriceInput`, `WorkerCard`, form-state rules), the T7 UI plan (`CardFields`, `AppPrompt`, `FormAlert` use, Confirmation fallback pattern), the Tech Spec sections "Responsive layouts" (Dashboards, Job detail, History, Dialogs), "Screen states", "Validation rules" and the component inventory (`JobCard`, `JobDetail`, `StatusBadge`: "Status colours from tokens"), and the existing code in `src/components`. This plan does not reopen any of those decisions.

Reference width is 1280 px, then 1024, 768 and 375. Breakpoints are `sm 640 · md 768 · lg 1024 · xl 1280`. "Desktop" means `lg` and up, "tablet" means `md` to `< lg`, "mobile" means `< md`. All widths below are content widths without a scrollbar; a 15–17 px Windows scrollbar takes that much from each figure and changes no layout decision.

---

## 0. Ground rules for every T8 screen

### 0.1 Inherited unchanged

- **Colour and contrast:** T2 §0.3 and T6 §0.1. Text is `text-ink` / `text-ink-muted` on `surface`, `surface-alt` or `brand-soft`. **Brand is a fill only** (primary buttons, category icon tiles, the in-progress status badge, the AppPrompt disc), always with `text-brand-foreground` on it. `text-brand`, `border-brand`, `ring-*` and `text-white` never appear.
- **Errors sit on `surface` only.** `text-danger` on `surface-alt` is 4.4:1 and fails. The dashboard background is `surface-alt`, so **every form field, inline error and section-level message in T8 lives inside a `bg-surface` card**. No error text is ever placed directly on the page background or in the `surface-alt` rail below `xl`.
- **Non-text colour:** star icons `text-warning fill-warning` (3.2:1 on `surface` only), success icons `text-success` (3.3:1 on `surface` only), always with a text label beside them.
- **Type:** `text-caption`, `text-body-sm`, `text-body`, `text-h4`, `text-h3`, `text-h2`. Weights `font-normal` / `font-semibold`. **Page `h1` is `text-h3 md:text-h2`** (the T5–T7 app-page override; the 44 px marketing h1 is not used in the dashboard). Section titles are `h2 text-h4`. Card titles and sub-sections are `h3 text-body font-semibold` or `text-body-sm font-semibold`.
- **Spacing** steps `1 2 3 4 6 8 12 16 24` (and negatives, `0`, `px`). **Sizes** from the T2 allowlist (`4 5 6 7 10 11 12 14 16 20 24 60 80`, `full`, `dvh`, fractions) plus `aspect-square`. **Reading widths** `max-w-sm`, `max-w-md`, `max-w-xl`, `max-w-2xl`. No arbitrary `[…]` values, except the generated Radix data selectors already in the primitives.
- **Touch targets:** buttons `sm` (44) and up, link buttons `min-h-11`, icon buttons `size-11`, star radios `size-11`, list rows `min-h-14`, inputs `h-12`.
- **Focus:** the global 2 px `ring` outline with a 2 px offset (T2 §0.7). Cards that are one big link draw the outline on the card (§3.2).
- **Motion:** `transition-colors duration-150 motion-reduce:transition-none` on hovers; `motion-safe:animate-spin` / `animate-pulse`. Dialogs keep the existing `Dialog` animation (`motion-reduce:animate-none`). No other animation.
- **Feedback:** no toast (orchestrator decision 2). Success is an inline `FormAlert tone="success"` (§1.4) or a `p role="status"` near the action. Errors are inline `FormAlert tone="error"`, `FieldError` or `ErrorState`. Messages stay until the next action on that area or until the page is left (the `useRevisitKey` remount clears them); nothing auto-dismisses.

### 0.2 Shell and width map

The shell is the existing `AppShell` (T2 §5), unchanged except that Home fills its rail (§2). `SideNav` (240 px full from `lg`, 80 px icon-only at `md`), the mobile top bar (`Logo` mark, **Post a job**, `AccountMenu`) and `BottomNav` (mobile) are untouched. `NAV_ITEMS.customer` uses `prefix` matching, so `/dashboard/jobs/<id>` and `/dashboard/jobs/<id>/edit` highlight **Jobs** in both navs with `aria-current="page"`.

| Width | Nav | Main content, Home (rail at `xl`) | Main content, every other T8 page |
| --- | --- | --- | --- |
| 1280 | SideNav 240 (full) | **656** (1280 − 240 − 320 rail − 64 padding). Rail 320, inner 272 | **976** (1280 − 240 − 64) |
| 1024 | SideNav 240 (full) | 720; rail content stacks below main | 720 |
| 768 | SideNav 80 (icons, sr-only labels, `title` hints) | 640; rail below | 640 |
| 375 | Top bar 64 + BottomNav 64 (+ safe area) | 343; rail below, above BottomNav | 343 |

### 0.3 Two layout utilities (`src/styles/globals.css`, next to `pb-safe`)

The Tech Spec wants a sticky action bar on mobile Job detail, and the BottomNav already owns the bottom of the screen. The bar must sit exactly on top of it, and the BottomNav height includes the safe area, so no spacing step can express the offset (Open question 2).

```
@utility bottom-above-nav  { bottom: calc(4rem + max(0.75rem, env(safe-area-inset-bottom))); }
@utility scroll-mb-bars    { scroll-margin-bottom: calc(9rem + max(0.75rem, env(safe-area-inset-bottom))); }
```

- `bottom-above-nav` = BottomNav link height (`h-16`) plus its `pb-safe` padding. It is used by the **mobile action bar** (Job detail §5 and Edit job §6) only.
- `scroll-mb-bars` = BottomNav plus the 68 px action bar plus a 12 px margin. It goes on the focusable children of a page that shows the bar (`*:scroll-mb-bars md:*:scroll-mb-0` on the content stack), so a field focused by Tab or by `focusFirstError` never ends up behind the two fixed bars.

### 0.4 Page header pattern (every T8 page)

```
div.flex flex-col gap-2                                                  (mb-8)
├─ (detail and edit only) Button asChild variant="link" size="sm" className="min-h-11 self-start"
│     → Link "Back to jobs" | "Back to history" | "Back to job"  + ArrowLeft size-4 (before the text)
├─ h1#page-title tabIndex=-1 .text-h3 md:text-h2 outline-none focus-visible:outline-2
└─ p.text-body text-ink-muted → one-line description
```

- **Route-change focus** (product plan rule 37): after a **client-side** navigation into a T8 page, focus moves to `#page-title` once it renders. A hard load or reload never moves focus, so the skip link stays first (the T6/T7 rule). On Job detail the `h1` renders only after the job loads, so focus moves then.
- **Hash targets** (`#rate`, `#receipt` from History): native anchor jumps fail because the content loads async. Once the job has rendered, the view scrolls the target section into view and focuses its `h2` (`tabIndex={-1}`). Sections with a hash target get `scroll-mt-24 md:scroll-mt-8` (clear of the 64 px mobile top bar).

---

## 1. Shared pieces: new components and small extensions

### 1.1 `StatusBadge` (new: `src/components/job/status-badge.tsx`, server-safe)

Props: `status: JobStatus`, `className?`. The classes come from a **static map** (no computed class strings). Labels come from `JOB_STATUS_LABELS`.

```
span.inline-flex w-fit shrink-0 items-center gap-1 rounded-full px-3 py-1 text-body-sm font-semibold whitespace-nowrap {map[status]}
├─ Icon size-4 shrink-0 (aria-hidden) {map[status].icon colour}
├─ span.sr-only → "Status: "
└─ JOB_STATUS_LABELS[status]
```

| Status | Label | Fill / text (token pair) | Border | Icon | Text contrast | Icon contrast |
| --- | --- | --- | --- | --- | --- | --- |
| `open` | Open | `bg-brand-soft text-ink` | none | `CircleDashed` `text-ink` | 8.9:1 | 8.9:1 |
| `accepted` | Accepted | `bg-surface-dark text-surface` | none | `UserRoundCheck` `text-surface` | 12.6:1 | 12.6:1 |
| `in_progress` | In progress | `bg-brand text-brand-foreground` | none | `Clock` `text-brand-foreground` | 4.9:1 | 4.9:1 |
| `completed` | Completed | `bg-surface text-ink` | `border border-input` (8.2:1) | `CircleCheck` `text-success` | 12.6:1 | 3.3:1 (non-text, ≥ 3) |
| `cancelled` | Cancelled | `bg-surface-alt text-ink-muted` | none | `Ban` `text-ink-muted` | 7.5:1 | 7.5:1 |

- **Never colour alone:** every badge carries the text label and a distinct icon shape (dashed circle, person-check, clock, check, ban), plus the sr-only "Status: " prefix. Two badges that look alike in greyscale (`completed` and `accepted` are both high-contrast) still differ in text, icon and border.
- Every pair is an approved T2 pairing; none puts text on `success`, `warning` or `danger`.
- Badges always sit on `surface` (cards, table, detail card). `completed`'s green icon therefore stays at 3.3:1.
- Width: "In progress" with icon is about 120 px; it never wraps (`whitespace-nowrap`).

### 1.2 `WorkerCard` display variant (edit: `src/components/job/worker-card.tsx`)

New props: `variant?: "radio" | "display"` (default `"radio"`, today's behaviour unchanged), `bordered?: boolean` (display only, default `true`), `action?: React.ReactNode` (display only).

```
(display) div.flex w-full items-start gap-4 [bordered: rounded-lg border border-border bg-surface p-4]
├─ initials disc (same classes as today, without the checked-state class)
└─ div.min-w-0 flex-1 flex flex-col gap-2
   ├─ (favourite) Favourite tag (same as today)
   ├─ p#worker-{id}-name.text-body font-semibold text-ink → "Jordan M."
   ├─ rating line + badges (same markup as today)
   └─ (action) div.mt-2 → the caller's button(s)
```

- **Always a row** (avatar left, text right) at every width: no `md:flex-col`, no indicator, no `pr-8`, no hover, no radio semantics. It is a plain `div`, so a button inside it is valid ("action buttons … not inside the radio").
- `bordered={false}` is used inside the Job detail card (§5.3), where the card already has a frame.
- Ids stay `worker-{id}-name` / `-meta`. On a page where one worker can appear twice (it can't in T8) the caller would pass a prefix; not needed now.

### 1.3 `JobCard` (new: `src/components/job/job-card.tsx`)

See §3.2 (anatomy and widths). Props: `job: Job`, `worker: { state: "ready"; summary: WorkerSummary } | { state: "fallback" } | undefined` (undefined = no worker yet), `headingLevel: 2 | 3`.

### 1.4 `FormAlert` `tone="success"` (edit: `src/components/forms/form-alert.tsx`)

| Tone | Frame | Icon | Role |
| --- | --- | --- | --- |
| `error` (today) | `border-danger bg-surface` | `CircleAlert text-danger` | `alert` |
| `info` (today) | `border-input bg-brand-soft` | `Info text-ink` | `status` |
| **`success` (new)** | `border-input bg-surface` | `CircleCheck text-success` (3.3:1 on surface) | `status` |

The text stays `text-ink`. `autoFocus` keeps today's behaviour. The success frame is `surface`, because the success icon fails on `brand-soft` (2.3:1). This is the single place T8 success messages come from (Open question 6).

### 1.5 `AppPrompt` `layout` prop (edit: `src/components/layout/app-prompt.tsx`)

`layout?: "row" | "rail"` (default `"row"`, unchanged). With `"rail"` the inner wrapper is `flex items-start gap-4 pr-12 xl:flex-col xl:pr-0`, and the text block gets `xl:w-full`. Reason: in the 272 px rail column the row layout leaves a 112 px text column for a `text-h4` title. In the rail layout at `xl` the disc sits on the first line with the dismiss button at its right (48 + 44 px in 224 px, no overlap) and the title runs the full 224 px below it. Below `xl` the rail stacks under main and the row layout is used.

### 1.6 `MobileVerifyField` `initiallyVerified` prop (edit: `src/components/auth/mobile-verify-field.tsx`)

`initiallyVerified?: boolean` (default `false`). When true the field starts in the `verified` phase: read-only input, "Change number" (outline) and the "Mobile number verified" status line. "Change number" returns it to `idle` and calls `onVerifiedChange(false)`, exactly as today. Used only by Account (§9.1); sign-up is unchanged.

### 1.7 `LoadingState` (edit: `src/components/states/loading-state.tsx`)

| Variant | Change | Why |
| --- | --- | --- |
| `cards` | New prop `columns?: 1 \| 3` (default `3`, today's grid). `1` renders `flex flex-col gap-4` and the card skeleton in the JobCard shape (badge line, title, two lines, footer line) | Home lists 3 cards in one column (§3) |
| `detail` | Restructured to the real Job detail layout: header bars (`h-4 w-24`, `h-8 w-1/2`, `h-6 w-24 rounded-full`), then `flex flex-col gap-6 lg:flex-row-reverse lg:items-start lg:gap-8` with the card skeleton **first** (`lg:w-80 lg:shrink-0`) and the detail column second. The `order-*` classes are removed | "Skeletons match the final layout": the real DOM order is card first, details second (§5). `detail` has no other user |
| **`form` (new)** | `mx-auto w-full max-w-2xl flex flex-col gap-8`: 3 × `rounded-lg border border-border bg-surface p-4 md:p-6` blocks, each with `Skeleton h-6 w-1/3`, then 2 × (`h-4 w-1/4` label + `h-12 w-full` input) | Edit job (§6) |

### 1.8 Mock-layer, copy and helpers used by the views (not UI files)

`workers.getSummaries(ids)` (approved), the `DASHBOARD_COPY` strings (§10), `jobToDraft()` (rule 21) and a date formatter (`Intl.DateTimeFormat(undefined, …)`: cards and tables use `{ dateStyle: "medium" }` → "Oct 20, 2026"; Job detail uses `{ dateStyle: "medium", timeStyle: "short" }` → "Oct 20, 2026, 9:14 AM"; always inside `<time dateTime={iso}>`).

---

## 2. Home rail mechanism (orchestrator decision 4)

**Chosen: a rail slot the page fills through a portal.** Two small client components, no shell markup duplicated:

```
src/app/dashboard/layout.tsx (server, edit)
└─ RequireRole role="customer" loading={<AppShell role="customer"><GuardLoading/></AppShell>}   (loading branch unchanged)
   └─ CustomerShell (new: src/components/dashboard/customer-shell.tsx, "use client")
      ├─ ShellRailContext.Provider value={{ register(label) → unregister, target }}
      └─ AppShell role="customer"
            rail={railLabel ? <div ref={setTarget} className="flex flex-col gap-6" /> : undefined}
            railLabel={railLabel}
         └─ {children}

ShellRail (new: src/components/dashboard/shell-rail.tsx, "use client") — props: label, children
  useLayoutEffect: register(label) on mount, unregister on unmount
  render: target ? createPortal(children, target) : null
```

- Only `CustomerHome` renders `<ShellRail>`. Every other page renders none, so `AppShell` gets no `rail` and draws no `aside`. Leaving Home unmounts `ShellRail`, which removes the rail on the same render.
- `useLayoutEffect` registers before paint, so the rail column never flashes in after the first frame.
- The portal keeps the rail content in `CustomerHome`'s React tree: one component owns both data calls (jobs first, so `?mockError=1` always hits `jobs.listForCustomer`; templates second), and the rail's buttons share Home's Re-post dialog.
- **Why not `@rail`:** a parallel-route slot is always a truthy element (so `AppShell` would draw an empty `aside` on every page unless the shell is changed), and on soft navigation Next keeps the last matched slot unless every route gets a catch-all `default`/page, which is fragile with Cache Components. **Why not a per-page `CustomerShell` wrapper:** the shell would remount on every navigation (SideNav state, scroll), and the guard's loading shell would still live in the layout.
- `AppShell` itself is unchanged; importing it from a client component is fine (it has no server-only code).
- The lead engineer may switch mechanism if Next 16 forces it (decision 4); the visible result in §3 must stay the same.

---

## 3. Home — `/dashboard`

### Desktop 1280 px (reference)

```
main (656)                                                         aside rail (320, xl:sticky top-0 h-dvh, bg-surface border-l, p-6)
├─ header (§0.4)                                                   ├─ TemplateList variant="rail" (§3.3)
│  ├─ h1#page-title "Hi, Sam"                                      └─ AppPrompt app="customer" layout="rail" headingLevel={2}
│  └─ p "Here's what's happening with your jobs."
└─ section[aria-labelledby="home-active-title"]
   ├─ div.flex flex-wrap items-center justify-between gap-x-4 gap-y-1
   │  ├─ h2#home-active-title.text-h4 tabIndex=-1 → "Active jobs"
   │  └─ (≥ 1 active job) Button asChild variant="link" size="sm" min-h-11 → Link /dashboard/jobs "View all jobs" + ArrowRight size-4
   └─ ul.mt-4 flex flex-col gap-4  → li × ≤ 3  JobCard headingLevel={3}
```

- **One column of cards** at every width: Home shows at most three jobs, and a single column reads as a feed (the app's Home). At 656 px the cards are wide; the card's footer spreads worker left and price right (§3.2).
- **The persistent "Post a job"** is the SideNav button (and the mobile top bar). Home adds no third copy in its header; the empty states carry their own Post a job button (Open question 1).
- **Rail order:** Saved Templates, then the app banner ("right rail for templates and app prompt"). The `aside` label is "Templates and app".

### Tablet 768 px and 1024 px

- **1024:** full SideNav; main 720. **No rail column** (T2: the rail column starts at `xl`); the rail content stacks **below** the active jobs, full width, in the same order (`AppShell` already does this). The AppPrompt uses the row layout.
- **768:** icon-only SideNav; main 640; the rail content below main. Card list unchanged.

### Mobile 375 px

- Top bar (Logo mark, Post a job, Account menu), then h1, the description, Active jobs (cards stacked, 343 px), then Saved Templates, then the app banner, then the BottomNav. Nothing is removed.
- The "View all jobs" link wraps under the `h2` if needed (`flex-wrap`).

### 3.2 `JobCard` anatomy (used on Home and Jobs)

```
article.relative flex h-full flex-col gap-4 rounded-lg border border-border bg-surface p-4 md:p-6
        transition-colors duration-150 hover:border-input motion-reduce:transition-none
├─ div.flex flex-wrap items-center justify-between gap-2
│  ├─ StatusBadge status
│  └─ p.text-body-sm text-ink-muted → "Posted " + <time> "Oct 20, 2026"
├─ div.flex items-start gap-4
│  ├─ span[aria-hidden].flex size-10 shrink-0 items-center justify-center rounded-md bg-brand md:size-12
│  │     CATEGORY_ICONS[category] size-5 md:size-6 text-brand-foreground
│  └─ div.min-w-0 flex-1
│     ├─ h{2|3}.text-body font-semibold text-ink
│     │  └─ Link href="/dashboard/jobs/{id}"
│     │       .outline-none after:absolute after:inset-0 after:rounded-lg
│     │        focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring
│     │       → "Cleaning" + span.sr-only " — {servicesText}, {City, ST}"
│     ├─ p.mt-1 text-body-sm text-ink line-clamp-2 break-words → servicesText ("Deep clean, Windows, Other: garage")
│     └─ p.mt-1 flex items-center gap-1 text-body-sm text-ink-muted → MapPin size-4 (aria-hidden) "Austin, TX"
└─ div.mt-auto flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-t border-border pt-4
   ├─ worker block (below)
   └─ div.text-right
      ├─ p.text-h4 font-semibold text-ink → "$120"                (fixed amount, or the hourly estimated total)
      └─ p.text-body-sm text-ink-muted → "Fixed Price" | "$40/hr × 3 hours"
```

| Worker block | Markup |
| --- | --- |
| Worker known (`getSummaries`) | `div.flex items-center gap-3`: initials disc `size-10 rounded-full bg-brand-soft text-body-sm font-semibold text-ink` (aria-hidden), then `p.text-body-sm font-semibold text-ink` "Jordan M." and `p.flex items-center gap-1 text-body-sm text-ink` `Star size-4 fill-warning text-warning` + "4.8" + sr-only " out of 5" |
| Board job, no worker | Disc `bg-surface-alt` with `ClipboardList size-5 text-ink`, then `p.text-body-sm font-semibold text-ink` "On the job board" |
| Lookup failed or id unknown | Disc with `UserRound`, then "Your worker" (no rating) |

- **The whole card is clickable** through the stretched `after:` overlay on the title link; the accessible name stays short ("Cleaning — Deep clean, Windows, Austin, TX"), and the focus outline is drawn around the whole card by the overlay. Hover darkens the border only (no background change, so every contrast stays as on `surface`). There is no other interactive element in the card.
- `h-full` + `mt-auto` keep footers aligned in the Jobs grid.
- **Widths:** 656 (Home, xl) · 720 (Home and Jobs at 1024 in one column on Home; 348 in the Jobs grid) · 309 (Jobs grid, xl) · 308 (Jobs grid, 768) · 343 (375). At 309 px the inner width is 261: worker block (about 130) and the price (about 70) share one footer line; an hourly breakdown wraps under the price.

### 3.3 `TemplateList` (new: `src/components/dashboard/template-list.tsx`, client)

Presentational: the parent loads `templates.list` and passes the state. Props: `state: { status: "loading" } | { status: "error" } | { status: "ready"; templates: Template[] }`, `onRetry`, `onRepost(template)`, `repostingId?`, `variant: "rail" | "section"`.

```
(variant="rail")
section[aria-labelledby="templates-title"]
├─ h2#templates-title tabIndex=-1 .text-h4 → "Saved Templates"
└─ div.mt-4 rounded-lg border border-border bg-surface            (every state sits inside this surface card)
   └─ ul.divide-y divide-border
      └─ li.flex items-start gap-4 px-4 py-4
         ├─ div.min-w-0 flex-1
         │  ├─ p.text-body font-semibold text-ink break-words → "Weekly lawn care"
         │  └─ p.mt-1 flex flex-wrap items-center gap-x-2 text-body-sm text-ink-muted
         │        CATEGORY_ICONS[cat] size-4 (aria-hidden) + "Outdoor" + "· $120" | "· $40/hr × 3 hours"
         └─ Button variant="secondary" size="sm" className="shrink-0" loading={repostingId===t.id}
              Repeat size-5 (aria-hidden) + "Re-post" + span.sr-only " {template name}"  | loading "Opening…"

(variant="section", Account) the same list inside an Account section card (§9): the h2 is inside the card header,
the ul has no own border (the section card frames it).
```

| State (Tech Spec "Saved Templates", verbatim) | What shows |
| --- | --- |
| Loading | `LoadingState variant="rows" count={2} label="Loading your templates…"` inside the surface card |
| Empty | **Section hidden**: the component renders `null` (heading included) |
| Error | **Inline error** inside the surface card: `div.flex flex-col gap-2 p-4` with `FieldError` "We couldn't load your templates." (`role="alert"` on the wrapper) and `Button variant="link" size="sm"` "Try again" (`onRetry`, `loading` "Retrying…") |
| Success | The rows with Re-post |

Widths: rail 272 (text column about 128 px; names wrap, never truncate), 720 / 640 below `xl`, 343 at 375.

### Component tree

```
src/app/dashboard/page.tsx (server, replaced) — metadata AUTH_COPY.meta.dashboard, noindex, instant = false (+ T5 comment)
└─ Suspense fallback={<LoadingState variant="cards" columns={1} />}
   └─ CustomerHome (new: src/components/dashboard/customer-home.tsx, "use client") key={revisitKey}
      ├─ jobs.listForCustomer → active (≤ 3) / past counts; then workers.getSummaries(workerIds of the 3)
      ├─ templates.list (started after the jobs call)
      ├─ useAppPromptState("customer") — to know whether the rail has anything to show
      ├─ header: h1 (AUTH_COPY.dashboard.greeting), p
      ├─ section Active jobs
      │  ├─ LoadingState variant="cards" columns={1} count={3} | ErrorState headingLevel={3} | EmptyState headingLevel={3}
      │  └─ ul > JobCard (new) × ≤ 3 → StatusBadge (new)
      ├─ ShellRail (new) label="Templates and app"
      │  ├─ TemplateList (new) variant="rail"
      │  └─ AppPrompt (existing, + layout) app="customer" layout="rail" (APP_PROMPT_COPY.customer)
      └─ RepostConfirmDialog (new, §8) via useRepost (new)
```

### Styling

| Element | Classes |
| --- | --- |
| Page stack | `flex flex-col gap-8` |
| Section header row | `flex flex-wrap items-center justify-between gap-x-4 gap-y-1`; `h2 text-h4` |
| Card list | `ul.mt-4 flex flex-col gap-4` |
| Rail stack | the portal target `flex flex-col gap-6` (inside `AppShell`'s `aside`) |
| Template row | `flex items-start gap-4 px-4 py-4`; Re-post `secondary sm` (brand-soft, ink 8.9:1) |

### States

| Area | Loading | Empty | Error (`?mockError=1` hits `jobs.listForCustomer`) | Success |
| --- | --- | --- | --- | --- |
| Active jobs | `LoadingState variant="cards" columns={1} count={3} label="Loading your jobs…"` under the h2 (stays until jobs **and** worker summaries resolve, so cards render once) | **No jobs at all:** `EmptyState headingLevel={3} icon={ClipboardList}` "No jobs yet" (verbatim) · "Post your first job and verified workers near you can accept it." · action `Button` (default) `Plus` "Post a job" → `/post-job/category`. **Only past jobs:** "No active jobs right now" · "Your finished jobs are in History." · action `div.flex w-full flex-col gap-3 sm:flex-row sm:justify-center`: Post a job (default) + "View history" (outline) → `/dashboard/history` | `ErrorState headingLevel={3}` (default title and message), Retry refetches jobs then summaries ("Retrying…"). Focus does not move; `role="alert"` announces it | Up to 3 `JobCard`s, newest first, + "View all jobs" |
| Worker names | (inside the jobs loading) | — | `getSummaries` fails: cards show "Your worker" (quiet, no error UI) | Names and ratings |
| Saved Templates (rail) | Skeleton rows | Section hidden | Inline error + Try again | Rows with Re-post |
| App banner | Renders nothing until mounted | Dismissed within 7 days: nothing | — | Android install or "We'll email and text you updates" |
| Rail as a whole | Shown while templates load | **Removed** (no `ShellRail`) when templates are empty **and** the prompt is hidden; the main column then widens at `xl` | — | Shown |

### Interaction details

- **Focus order (1280):** skip link, Logo, Post a job, Home/Jobs/History/Account, Log out (SideNav), [main] View all jobs, card 1, card 2, card 3, [rail] Re-post × n, [Get it on Google Play], Dismiss. **375:** top bar (Logo, Post a job, Account), main, rail, BottomNav.
- **Dismiss the app banner:** focus moves to `#templates-title` if the templates section is shown, else to `#page-title` (never to `body`). An sr-only `p role="status"` in `CustomerHome` says "Hidden for 7 days." (reuses `JOB_BUILDER_COPY.confirmation.promptHidden`).
- **Re-post** (§8): button loading "Opening…" until the route changes; with a non-empty draft the replace dialog opens first.
- AppPrompt trigger points (`onShown`, `onInstallClick`) are passed as no-ops for T11; nothing is tracked in T8.

---

## 4. Jobs list — `/dashboard/jobs`

### Desktop 1280 px (reference)

```
main (976)
├─ header: h1 "Active jobs" · p "Open, accepted and in-progress jobs, newest first."
│          + Button asChild variant="link" size="sm" min-h-11 → /dashboard/history "Finished jobs are in History" + ArrowRight
└─ section[aria-labelledby="page-title"]
   ├─ p role="status" .text-body-sm text-ink-muted → "9 active jobs"
   └─ ul.mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 → li > JobCard headingLevel={2}
```

The grid is the existing `LoadingState variant="cards"` grid, so the skeleton matches exactly. 3 columns of 309 px.

### Tablet 768 px and 1024 px

2 columns: 348 px at 1024, 308 px at 768.

### Mobile 375 px

1 column, 343 px cards, the History link wraps under the description.

### Component tree

```
src/app/dashboard/jobs/page.tsx (server, new) — metadata "Jobs · Chores For Me", noindex, instant = false
└─ Suspense fallback={<LoadingState variant="cards" />}
   └─ JobsList (new: src/components/dashboard/jobs-list.tsx, "use client") key={revisitKey}
      ├─ jobs.listForCustomer → active; workers.getSummaries
      └─ LoadingState | ErrorState | EmptyState | ul > JobCard × n
```

### States

| Loading | Empty | Error (`?mockError=1`) | Success |
| --- | --- | --- | --- |
| `LoadingState variant="cards" count={3} label="Loading your jobs…"` | No jobs at all: "No jobs yet" + Post a job (as Home). Only past jobs: "No active jobs right now" + Post a job + View history (as Home). `headingLevel={2}` | `ErrorState headingLevel={2}`, Retry | Count line + grid |

### Interaction details

Focus order: (shell), History link, card 1 … card n. Each card is one Tab stop.

---

## 5. Job detail — `/dashboard/jobs/[id]`

### Desktop 1280 px (reference)

"Details left, sticky card right with worker, price and actions."

```
main (976)
├─ header (§0.4)
│  ├─ Back link: "Back to jobs" (open, accepted, in progress) | "Back to history" (completed, cancelled)
│  ├─ div.flex flex-wrap items-center gap-3 → StatusBadge · p.text-body-sm text-ink-muted "Reference job-011"
│  ├─ h1#page-title tabIndex=-1 → "Cleaning job"
│  └─ p.text-body-sm text-ink-muted → "Posted Oct 20, 2026, 9:14 AM" [· "Completed Oct 21, 2026, 3:00 PM"]
├─ div#detail-status (status slot, empty unless a success message shows) → FormAlert tone="success" (mt-6)
└─ div.mt-8 flex flex-col gap-6 lg:flex-row-reverse lg:items-start lg:gap-8
   ├─ aside[aria-labelledby="job-card-title"] (DOM first)  .lg:w-80 lg:shrink-0 lg:sticky lg:top-8     320 px
   │  └─ JobSideCard (§5.3)
   └─ div.min-w-0 flex-1 flex flex-col gap-6                                                           624 px
      ├─ (completed) RateJobForm #rate (§5.6)  — or the read-only "You rated N stars" block
      ├─ JobDetail sections: "Job details" (§5.4) · "Photos" (§5.5)
      └─ (completed) JobReceipt #receipt (§5.7)
```

- **DOM order is card first, details second** at every width; `lg:flex-row-reverse` places the card on the right at `lg` without CSS `order`. Keyboard order is therefore header → worker / price / actions → details, which matches tablet and mobile ("actions at top") and puts the job's actions one Tab stop after the header on desktop too.
- The card is sticky (`lg:top-8`; the shell has no sticky header from `md`). Its tallest content (worker card with badges, favourite toggle, price, two buttons) is about 470 px, so it fits a 720 px-tall viewport.
- **Rate is the first detail section for completed jobs** (it is the next action), then the job details, photos and the receipt last.

### Tablet 768 px and 1024 px

- **1024:** the desktop layout, card 320 px on the right (sticky), details 368 px. The `dl` rows use `sm:` (viewport ≥ 640), so they stay two-column here: label 1/3, value 2/3, about 104 / 216 px inside the card padding. The labels are single short words, so this fits.
- **768:** **stacked, actions at top.** The card is full width (640) directly under the header. Inside it, worker and price sit side by side (`md:grid md:grid-cols-2 md:gap-6 lg:block`), with the status note and the action buttons in a row below (`md:col-span-2`, buttons `md:w-auto`). Then the detail sections, full width.

### Mobile 375 px

- **Stacked, sticky action bar.** Order: header, status slot, the card (worker, favourite toggle, price, status note), then Rate, Job details, Photos, Receipt.
- **The card's action group becomes the sticky bar** (§5.3 `JobActions`): one element, `fixed inset-x-0 bottom-above-nav z-40 border-t border-border bg-surface px-4 py-3 md:static md:z-auto md:border-0 md:bg-transparent md:p-0`, with `flex gap-3`, each button `flex-1 md:flex-none` (`lg:w-full lg:flex-col`). It sits on top of the BottomNav; both stay visible. Nothing is removed: the buttons moved, they were not duplicated.
- When the status has **no** action (`in_progress`), there is no bar.
- The page content stack gets `pb-24 md:pb-0` (in addition to the shell's `pb-24`) and `*:scroll-mb-bars md:*:scroll-mb-0`, so the last section and any focused control stay clear of both fixed bars.

### 5.3 `JobSideCard` (inside `job-detail.tsx`) and `JobActions` (new: `src/components/dashboard/job-actions.tsx`)

```
div.rounded-lg border border-border bg-surface p-4 md:p-6 flex flex-col gap-6
├─ h2#job-card-title.sr-only → "Worker, price and actions"
├─ section[aria-labelledby="job-worker-title"]
│  ├─ h3#job-worker-title.text-body-sm font-semibold text-ink → "Your worker" | "Who"
│  └─ div.mt-3 → one of:
│     ├─ WorkerCard variant="display" bordered={false} favourite={isFavourite} action={FavouriteToggle}
│     ├─ board line: div.flex items-start gap-3 → disc size-10 bg-surface-alt ClipboardList size-5
│     │     + p.text-body font-semibold "On the job board" + p.text-body-sm text-ink-muted "The first verified worker to accept gets it."
│     ├─ loading: Skeleton size-12 rounded-full + Skeleton h-4 w-2/3 + h-4 w-1/2 (role="status" sr "Loading worker…")
│     └─ lookup failed: disc UserRound + "Your worker"
├─ section[aria-labelledby="job-price-title"] .border-t border-border pt-6 md:border-t-0 md:pt-0 lg:border-t lg:pt-6
│  ├─ h3#job-price-title.text-body-sm font-semibold text-ink → "Price" (fixed) | "Estimated total" (hourly) | "Total" (completed)
│  ├─ p.mt-1 text-h3 font-semibold text-ink → "$120"
│  ├─ p.text-body-sm text-ink-muted → "Fixed Price" | "$40/hr × 3 hours"
│  └─ p.mt-2 text-caption text-ink-muted → charge note (below)
├─ (accepted | in_progress) p.flex items-start gap-2 text-body-sm text-ink → Info size-4 (aria-hidden) + status note
└─ JobActions (div role="group" aria-label="Job actions") — the mobile sticky bar (§ Mobile)
```

| Status | Charge note | Status note | `JobActions` (in order) |
| --- | --- | --- | --- |
| `open` | "You're charged when the job is done. There are no refunds." (T7 copy) | — | **Edit job** (`secondary`, `Pencil`, Link → `/dashboard/jobs/{id}/edit`) · **Cancel job** (`outline`, `CircleX`, opens §5.8) |
| `accepted` | same | "A worker has accepted this job, so it can't be edited. You can still cancel it." | **Cancel job** (`outline`) |
| `in_progress` | same | "This job is under way. You can rate it once it's done." | none (no bar on mobile) |
| `completed` | "Charged on completion. No refunds." | — | (unrated) **Rate this job** (`default`, `Star`, `<a href="#rate">`, focuses `#rate-title`) · **Re-post** (`secondary`, `Repeat`) — (rated) **Re-post** only |
| `cancelled` | "This job was cancelled before it was done." | — | **Re-post** (`secondary`) |

- At most **two** buttons, so the mobile bar always fits: two `flex-1` buttons of 155 px at 375 ("Edit job", "Cancel job", "Rate this job", "Re-post").
- The Receipt has no button in the card: it is a section of the page (§5.7). History links straight to `#receipt`.
- **FavouriteToggle** (inside the worker card's `action` slot; accepted, in progress and completed only):
  `Button variant="outline" size="sm" className="w-full sm:w-auto lg:w-full"` with `Heart size-5` → "Add to Favourite Workers" | `HeartOff size-5` → "Remove from Favourite Workers"; `loading` "Saving…". Below it, `p role="status" .mt-2 flex items-start gap-2 text-body-sm text-ink` (`CircleCheck size-4 text-success`) → "Jordan M. is now a favourite worker." | "Jordan M. removed from your Favourite Workers." The WorkerCard's "Favourite" tag updates with it. The label changes rather than using `aria-pressed`, so the button always says what it will do.
  - `favourites.list` still loading: the toggle shows as a `Skeleton h-11 w-full`. **Failed:** the toggle is not shown (toggling blind could remove a favourite); instead `p.flex items-start gap-2 text-body-sm text-ink-muted` with `Info size-4` "We couldn't load your favourites." + `Button variant="link" size="sm"` "Try again" (T7 quiet-note pattern). Toggle failed: `FieldError` (wrapper `role="alert"`) "We couldn't update your favourites. Try again." under the button; focus stays on the button.

### 5.4 `JobDetail` "Job details" section (new: `src/components/job/job-detail.tsx`)

`JobDetail` lays out its own sections instead of reusing `ReviewSummary`: the detail needs dates, photo placeholders and the side card, and `ReviewSummary`'s Who row and estimate band would repeat the card. It reuses the helpers (`servicesText`, `estimatedTotal`, `formatUsd`, `findCategory`, `workerDisplayName`, `MATCH_TYPE_LABELS`, `PRICING_TYPE_LABELS`).

```
section[aria-labelledby="job-details-title"].rounded-lg border border-border bg-surface p-4 md:p-6
├─ h2#job-details-title.text-h4 → "Job details"
└─ dl.mt-4 divide-y divide-border
   └─ div.grid grid-cols-1 gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-3 sm:gap-4
      ├─ dt.text-body-sm font-semibold text-ink
      └─ dd.text-body text-ink break-words sm:col-span-2
```

| `dt` | `dd` |
| --- | --- |
| Category | `CATEGORY_ICONS` size-5 (aria-hidden) + name |
| Services | `servicesText` ("Other: {text}") |
| Where | `line1`; "City, ST ZIP" on a new line; landmark on a new line `text-ink-muted` |
| Description | full text, `whitespace-pre-line` |
| Price | "Fixed Price · $120" or "Hourly · $40/hr × 3 hours (est. $120)" |
| Who | "Post to Job Board" or "Pick a Worker" |
| Posted | `<time>` "Oct 20, 2026, 9:14 AM" |
| Completed | (completed only) `<time>` |

### 5.5 `JobPhotosPlaceholder` (new: `src/components/job/job-photos-placeholder.tsx`, server-safe)

```
section[aria-labelledby="job-photos-title"].rounded-lg border border-border bg-surface p-4 md:p-6
├─ h2#job-photos-title.text-h4 → "Photos"
├─ (n ≥ 1) ul[aria-label="Photo placeholders"].mt-4 grid grid-cols-3 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-3 xl:grid-cols-5
│  └─ li.flex aspect-square flex-col items-center justify-center gap-2 rounded-md border border-border bg-surface-alt p-2 text-center
│        ImageOff size-6 text-ink-muted (aria-hidden) + span.text-caption text-ink-muted → "Photo 1 of 3"
├─ (n ≥ 1) p.mt-3 text-body-sm text-ink-muted → "Photos aren't available in the demo."
└─ (n = 0) p.mt-2 text-body-sm text-ink-muted → "No photos added."
```

No `<img>` is rendered for a stored URL (decision 6). Tile widths: 112 px (xl, 5 columns in 576 inner), 101 px (1024, 3 in 320 inner), 140 px (768, 4 in 592), 92 px (375, 3 in 309).

### 5.6 `RateJobForm` (new: `src/components/dashboard/rate-job-form.tsx`) + `StarRatingField` (new: `src/components/forms/star-rating-field.tsx`)

```
section#rate[aria-labelledby="rate-title"].scroll-mt-24 md:scroll-mt-8 rounded-lg border border-border bg-surface p-4 md:p-6
├─ h2#rate-title tabIndex=-1 .text-h4 outline-none focus-visible:outline-2 → "Rate this job"
├─ (service error) FormAlert tone="error" className="mt-4"
└─ form noValidate .mt-4 flex flex-col gap-6
   ├─ StarRatingField name="stars" legend="Rate Jordan M." error
   │  fieldset.min-w-0 [aria-describedby="stars-readout {stars-error}"]
   │  ├─ legend.text-body-sm font-semibold text-ink → "Rate Jordan M." | "Rate your worker" (no name)
   │  ├─ div.mt-3 flex flex-wrap items-center gap-x-4 gap-y-2
   │  │  ├─ div.flex gap-1                                           (5 × 44 + 4 × 4 = 236 px)
   │  │  │  └─ label.relative cursor-pointer (× 5, n = 1…5)
   │  │  │     ├─ input#stars-{n} type="radio" name="stars" value={n} .peer sr-only aria-invalid={!!error}
   │  │  │     └─ span.flex size-11 items-center justify-center rounded-md transition-colors hover:bg-surface-alt
   │  │  │          peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring
   │  │  │        ├─ Star size-6 (aria-hidden): n ≤ value → "fill-warning text-warning" ; else "text-ink-muted"
   │  │  │        └─ span.sr-only → "1 star" | "2 stars" … "5 stars"
   │  │  └─ p#stars-readout.text-body-sm font-semibold text-ink → "4 out of 5" | span.text-ink-muted "No rating chosen"
   │  └─ FieldError id="stars-error" → "Choose a star rating"
   └─ Button type="submit" className="w-full sm:w-auto" loading → "Submit rating" | "Submitting…"
```

- **Hand-built, no library** (decision 4): five native radios with one `name`. The browser gives one Tab stop, arrow keys move **and** check, and Space checks. The visible focus ring sits on the 44 px star box through `peer-focus-visible:`. The `fieldset`/`legend` names the group.
- **Not colour alone:** a chosen star is filled (shape change) as well as coloured, and the visible read-out "4 out of 5" states the value in text.
- The stars sit on `surface` (warning is 3.2:1 there; it would fail on `surface-alt`). Hover tints only the box behind the star.
- **Submit "Submit rating"** is `default` (brand); on mobile the bar's "Rate this job" scrolls here, so the page shows one brand button in view at a time.
- **Rated / after success** the form is replaced by:
  `p#rate-result tabIndex=-1 role="status" .mt-4 flex flex-wrap items-center gap-3 text-body font-semibold text-ink outline-none focus-visible:outline-2` → five `Star size-5` icons (aria-hidden; filled up to N) + "You rated 4 stars". On success it takes focus.
- Errors: no choice → "Choose a star rating" under the stars, focus on the first radio. `NOT_ALLOWED` (already rated): the job reloads, the rated block shows and takes focus. Other failures: `FormAlert tone="error"` (`SERVICE_MESSAGES.mockError`) above the form, focused; the chosen star stays.

### 5.7 `JobReceipt` (new: `src/components/job/job-receipt.tsx`, server-safe) — completed jobs only

```
section#receipt[aria-labelledby="receipt-title"].scroll-mt-24 md:scroll-mt-8 rounded-lg border border-border bg-surface p-4 md:p-6
├─ div.flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1
│  ├─ h2#receipt-title tabIndex=-1 .text-h4 outline-none focus-visible:outline-2 → "Receipt"
│  └─ p.text-body-sm text-ink-muted → "Reference job-011"
├─ dl.mt-4 divide-y divide-border (same row classes as §5.4)
│  ├─ Completed → <time>
│  ├─ Services → servicesText
│  ├─ Worker → "Jordan M." | "Your worker"
│  └─ (hourly) Rate → "$40/hr × 3 hours"
├─ div.mt-4 flex flex-wrap items-baseline justify-between gap-x-4 border-t border-border pt-4
│  ├─ p.text-body font-semibold text-ink → "Total charged"
│  └─ p.text-h3 font-semibold text-ink → "$120"
└─ p.mt-2 text-caption text-ink-muted → "Charged on completion. No refunds."
```

No card details (the method used is not recorded), no download or print (Open question 11 default).

### 5.8 `CancelJobDialog` (new: `src/components/dashboard/cancel-job-dialog.tsx`)

On the existing `Dialog` (centred modal from `md`, bottom sheet below `md`).

```
Dialog open onOpenChange={pending ? noop : setOpen}
└─ DialogContent closeDisabled={pending}
     onEscapeKeyDown / onPointerDownOutside / onInteractOutside → preventDefault while pending
     onOpenAutoFocus → preventDefault, focus "Keep job"
   ├─ DialogHeader
   │  ├─ DialogTitle → "Cancel this job?"
   │  └─ DialogDescription → open: "Your Cleaning job will be taken off the job board."
   │                         accepted: "Jordan M. will no longer do this job."  ("your worker" without a name)
   ├─ div.flex items-start gap-3 rounded-md bg-brand-soft p-4 text-body-sm text-ink        (fee note)
   │  ├─ Info size-5 shrink-0 (aria-hidden)
   │  └─ div.flex flex-col gap-1
   │     ├─ p → "A cancellation fee may apply. The amount and when it applies are still being confirmed."
   │     └─ ExternalLink href="/faq#cancellation-fee" .inline-flex min-h-11 items-center gap-2 text-body-sm text-ink underline underline-offset-4
   │          → "Is there a fee to cancel a job?"   (the FAQ question text; new tab)
   ├─ (error) FormAlert tone="error"
   │     NOT_ALLOWED → "This job can't be changed right now" (SERVICE_MESSAGES.notAllowed)
   │     other       → SERVICE_MESSAGES.mockError
   └─ DialogFooter (flex-col gap-3 sm:flex-row sm:justify-end)
      ├─ DialogClose asChild → Button variant="outline" disabled={pending} → "Keep job"
      └─ Button variant="destructive" loading={pending} → "Cancel job" | "Cancelling…"
         (after NOT_ALLOWED this button is removed and "Keep job" reads "Close")
```

- **No amount is shown.** The fee note is on `brand-soft` (ink 8.9:1, link 8.9:1, focus ring 8.9:1).
- **Widths:** modal `md:max-w-md` (448 px); at 375 a full-width bottom sheet with the footer buttons stacked full width, "Keep job" on top.
- **Focus:** opening focuses "Keep job" (least harmful). Closing with Keep or the X returns focus to the Cancel job trigger (Radix). **On success** the dialog closes, `onCloseAutoFocus` is prevented, and focus goes to the success message in `#detail-status` ("Job cancelled."); the trigger no longer exists, because the actions are now Re-post. **After `NOT_ALLOWED`** the job reloads behind the dialog; closing it focuses `#page-title`.

### Component tree

```
src/app/dashboard/jobs/[id]/page.tsx (server, new) — metadata "Job details · Chores For Me", noindex, instant = false
└─ Suspense fallback={<LoadingState variant="detail" />}
   └─ JobDetailView (new: src/components/dashboard/job-detail-view.tsx, "use client") key={revisitKey}
      ├─ useParams → id; jobs.get; ownership check (customerId); then workers.getSummaries([workerId]) + favourites.list
      ├─ LoadingState variant="detail" | ErrorState headingLevel={1} | EmptyState headingLevel={1}
      └─ JobDetail (new: src/components/job/job-detail.tsx)
         ├─ header: Back link, StatusBadge (new), h1, dates
         ├─ #detail-status → FormAlert tone="success" (existing, + tone)
         ├─ aside → JobSideCard
         │  ├─ WorkerCard (existing, + display variant) + FavouriteToggle
         │  ├─ price block
         │  └─ JobActions (new) → Button / Link; CancelJobDialog (new); useRepost (new) → RepostConfirmDialog (new)
         ├─ RateJobForm (new) → StarRatingField (new), FormAlert, Button
         ├─ "Job details" section
         ├─ JobPhotosPlaceholder (new)
         └─ JobReceipt (new)
```

### Styling

| Element | Classes |
| --- | --- |
| Two-column wrapper | `mt-8 flex flex-col gap-6 lg:flex-row-reverse lg:items-start lg:gap-8` |
| Side card | `rounded-lg border border-border bg-surface p-4 md:p-6 flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-6 lg:flex`; aside `lg:sticky lg:top-8 lg:w-80 lg:shrink-0` |
| Detail sections | `rounded-lg border border-border bg-surface p-4 md:p-6`; `h2 text-h4` |
| Price | `text-h3 font-semibold text-ink`; breakdown `text-body-sm text-ink-muted`; note `text-caption text-ink-muted` |
| Status note | `flex items-start gap-2 text-body-sm text-ink`, `Info size-4` |
| Mobile action bar | `fixed inset-x-0 bottom-above-nav z-40 flex gap-3 border-t border-border bg-surface px-4 py-3 md:static md:z-auto md:border-0 md:bg-transparent md:p-0 lg:flex-col`; buttons `flex-1 md:flex-none lg:w-full`, default size (48) |

### States

| Area | Loading | Empty | Error | Success |
| --- | --- | --- | --- | --- |
| Job (`jobs.get`) | `LoadingState variant="detail" label="Loading your job…"` | — (spec). `JOB_NOT_FOUND`, or `customerId` ≠ session user: `EmptyState headingLevel={1} icon={SearchX}` "We couldn't find this job" (verbatim) · "The link may be wrong, or the job belongs to another account." · action `Button` → `/dashboard` "Back to dashboard" | `?mockError=1` (or any other failure): `ErrorState headingLevel={1}` with Retry and `secondaryAction` "Back to dashboard" (outline). Retry succeeds | Header, status slot, card and sections |
| Worker (`getSummaries`) | Inline skeleton in the card | Board job: the board line | "Your worker" fallback; the rest of the page stays | `WorkerCard` display |
| Favourites (`favourites.list`) | Toggle skeleton | — | Quiet note + Try again (§5.3) | Toggle with the right label |
| Cancel / Rate / Favourite / Re-post | Button spinners ("Cancelling…", "Submitting…", "Saving…", "Opening…") | — | Inline: dialog `FormAlert`, rate `FormAlert` / `FieldError`, favourite `FieldError` | "Job cancelled." in `#detail-status`, focused · "You rated N stars", focused · favourite status line · route to `/post-job/review` |
| Arrival after Edit | — | — | — | `#detail-status` shows "Your changes are saved." (one-shot in-memory flag set by Edit before `router.push`, like `post-job-memory.ts`; a reload does not show it), focused |

### Interaction details

- **Focus order (1280, open board job):** shell, Back to jobs, [status message], Edit job, Cancel job, (details have no controls). **Completed, unrated:** Back to history, Remove/Add favourite, Rate this job, Re-post, the 5 stars (one stop), Submit rating. **375:** the same DOM order; the action buttons are visually in the bottom bar.
- **Rate this job** (`<a href="#rate">`) scrolls to the section and focuses `#rate-title`; the next Tab enters the stars.
- **Status changes in place:** after cancel the badge reads "Cancelled", the back link reads "Back to history", the card shows Re-post, and the mobile bar shows Re-post. After rating, the bar drops "Rate this job".
- No hover-only actions; the side card does not change on hover.

---

## 6. Edit job — `/dashboard/jobs/[id]/edit`

### Desktop 1280 px (reference)

One centred-left form column, `max-w-2xl` (672 of 976). The form is short enough that a side summary would only repeat it; `PriceInput` already shows the live estimate.

```
div.max-w-2xl
├─ header: Back link "Back to job" → /dashboard/jobs/{id}; h1 "Edit job"; p "Change what workers see. You can edit until a worker accepts."
└─ form noValidate .mt-8 flex flex-col gap-6 *:scroll-mb-bars md:*:scroll-mb-0
   ├─ (save error) FormAlert tone="error" (focused)
   │     NOT_ALLOWED → "This job can't be changed right now" + action Link "Back to job"
   │     other       → SERVICE_MESSAGES.mockError
   ├─ section (read-only facts) .rounded-lg border border-border bg-surface p-4 md:p-6
   │  ├─ dl.grid grid-cols-1 gap-4 sm:grid-cols-2
   │  │  ├─ Category → CATEGORY_ICONS size-5 + "Cleaning"
   │  │  └─ Who → "Post to Job Board"
   │  └─ p.mt-4 flex items-start gap-2 text-body-sm text-ink-muted → Info size-4 + "To change the category, cancel this job and post a new one."
   ├─ section[aria-labelledby="edit-services-title"] .rounded-lg border bg-surface p-4 md:p-6
   │  ├─ h2#edit-services-title.text-h4 → "Services"
   │  └─ SubServicesField (extracted from step 2; same grid-cols-1 sm:grid-cols-2 SelectableCard rows + "Other" field)
   ├─ section "Where" → h2 + AddressInput idPrefix="edit-address" + (out of area) OutOfAreaNote
   ├─ section "Details" → h2 + DescriptionField (extracted from step 4; live counter) + PriceInput (existing)
   └─ EditActions: div.flex gap-3 border-t border-border pt-6 sm:justify-end
      ├─ Button asChild variant="outline" → Link /dashboard/jobs/{id} "Cancel"
      └─ Button type="submit" loading → "Save changes" | "Saving…"
```

- **OutOfAreaNote** (inside the Where card, after Landmark): `div#edit-out-of-area.rounded-md border border-input bg-surface p-4` with `span.flex size-10 rounded-full bg-brand-soft` (`MapPinOff size-5 text-ink`) and `h3#edit-out-of-area-title tabIndex=-1 .text-body font-semibold` "We're not in Ohio yet" (step 3 title, reused) + `p.text-body-sm text-ink-muted` "Choose an address in Texas to save this job." (no notify-me form). Shown when the address is valid and outside `SERVED_STATES`. Save with it showing focuses `#edit-out-of-area-title` and does not submit.
- Field rules and messages are verbatim from the spec rows (Sub-services, Other, Address line 1, City, State, ZIP, Description, Fixed price, Hourly rate, Hours). Errors show on blur and submit (`mode: "onTouched"`); `focusFirstError` order: `subServices, otherText, address.line1, address.city, address.state, address.zip, description, amount, hours`.
- "Errors never clear typed input", including after `NOT_ALLOWED`.

### Tablet 768 px and 1024 px

720 / 640 content; the form is 672 / 640 wide. Inner card width 624 / 592: services 2 columns, the City/State/ZIP row 6 columns (T6 widths), hourly rate and hours side by side.

### Mobile 375 px

- Cards 343 (inner 309); services 1 column; City full row, State + ZIP side by side; rate and hours stacked (T6).
- **EditActions become the sticky bar** (the same element): `fixed inset-x-0 bottom-above-nav z-40 border-t border-border bg-surface px-4 py-3 md:static md:z-auto md:border-x-0 md:border-b-0 md:bg-transparent md:px-0 md:pb-0 md:pt-6`; "Cancel" at natural width, "Save changes" `flex-1`. The actions are DOM-last in the form, so visual and focus order agree. The form gets `pb-24 md:pb-0`.

### Component tree

```
src/app/dashboard/jobs/[id]/edit/page.tsx (server, new) — metadata "Edit job · Chores For Me", noindex, instant = false
└─ Suspense fallback={<LoadingState variant="form" />}
   └─ EditJobView (new: src/components/dashboard/edit-job-view.tsx, "use client") key={revisitKey}
      ├─ useParams; jobs.get; ownership; status check
      ├─ useForm(jobEditSchema), defaults from the job
      ├─ LoadingState variant="form" | ErrorState headingLevel={1} | EmptyState headingLevel={1}
      └─ form
         ├─ FormAlert (existing)
         ├─ SubServicesField (extracted: src/components/forms/sub-services-field.tsx) → SelectableCard, FormField + Input
         ├─ AddressInput (existing) + OutOfAreaNote (inside edit-job-view.tsx)
         ├─ DescriptionField (extracted: src/components/forms/description-field.tsx) → FormField + Textarea + counter
         ├─ PriceInput (existing)
         └─ Button × 2
```

### States

| Loading | Empty | Error | Success |
| --- | --- | --- | --- |
| `LoadingState variant="form" label="Loading your job…"` | Not found / not owned: `EmptyState h1` "We couldn't find this job" + "Back to dashboard". **Status ≠ open:** `EmptyState headingLevel={1} icon={Lock}` "This job can't be changed right now" (`SERVICE_MESSAGES.notAllowed`) · "Edits close once a worker accepts the job." · action `Button` → `/dashboard/jobs/{id}` "Back to job" | `?mockError=1` hits `jobs.get`: `ErrorState headingLevel={1}` + Retry + "Back to dashboard". Save failures: `FormAlert` at the top of the form, focused, values kept | `router.push('/dashboard/jobs/{id}')` with the one-shot "Your changes are saved." flag; Save keeps its spinner until the route changes |

### Interaction details

- **Focus order:** Back to job, service cards, [Other text], Street, City, State, ZIP, Landmark, Description, pricing type (one stop), Amount, [Hours], Cancel, Save changes.
- Enter in a text field submits (Save); Enter in the street combobox picks a suggestion (existing `AddressInput` behaviour).

---

## 7. History — `/dashboard/history`

"History | Data tables | Data tables | Card lists". The table never scrolls sideways (Open question 16 default).

### Desktop 1280 px (reference) — table, 976 px

```
header: h1 "History" · p "Completed and cancelled jobs, newest first."
div.rounded-lg border border-border bg-surface   (no overflow-x; nothing scrolls)
└─ table.w-full table-auto text-left
   ├─ caption.sr-only → "Past jobs, newest first"
   ├─ thead > tr.border-b border-border
   │  └─ th[scope=col].px-4 py-3 text-body-sm font-semibold text-ink
   │       Job | Worker | Amount (text-right) | Status (hidden xl:table-cell) | Actions
   └─ tbody.divide-y divide-border > tr > td.px-4 py-4 align-top
      ├─ Job: h2.text-body font-semibold → Link (min-h-11 inline-flex items-center underline-offset-4 hover:underline) "Cleaning"
      │        + span.sr-only " — completed Oct 21, 2026"
      │       p.text-body-sm text-ink line-clamp-2 → servicesText
      │       p.text-body-sm text-ink-muted → "Completed Oct 21, 2026" | "Posted Oct 2, 2026"
      │       div.mt-2 xl:hidden → StatusBadge                          (below xl the status lives here)
      ├─ Worker: p.text-body-sm font-semibold text-ink "Jordan M." | "Your worker" | text-ink-muted "No worker"
      │          p.text-body-sm text-ink-muted → "You rated 4 stars" | "Not rated yet" (completed only)
      ├─ Amount: td.text-right → p.text-body font-semibold "$120"  | cancelled: span[aria-hidden] "—" + span.sr-only "No amount shown"
      ├─ Status: td.hidden xl:table-cell → StatusBadge
      └─ Actions: div.flex flex-col items-start xl:flex-row xl:flex-wrap xl:gap-x-4
            Button variant="link" size="sm" min-h-11 (each with an sr-only " {category} job, {date}" suffix):
            "Re-post" (always; onClick → useRepost) · "Rate" (completed, unrated → Link /dashboard/jobs/{id}#rate)
            · "View receipt" (completed → Link /dashboard/jobs/{id}#receipt)
```

- **View** is the job title link in the Job cell (one link per row instead of a fourth action), so the row has at most three action links.
- Row headers: the Job cell's title is an `h2` (the table sits under the page `h1`); screen-reader users can jump between rows by heading.
- **Column widths are automatic** (`table-auto`, `w-full`). Sum of min-content widths: Job ≈ 120 (badge, `nowrap`), Worker ≈ 70, Amount ≈ 70, Status ≈ 120 (xl only), Actions ≈ 100 ("View receipt", `nowrap`), plus 32 px padding per cell → about 640 at xl and 520 below xl. The container is 976 / 720 / 640, so the table always fits and never scrolls.

### Tablet 768 px and 1024 px — table, 720 / 640 px

The same table with **four columns**: the Status column is `hidden` and the `StatusBadge` shows inside the Job cell (`xl:hidden`). Actions are stacked vertically (3 × 44 px). At 640 px: Job ≈ 260, Worker ≈ 120, Amount ≈ 70, Actions ≈ 110, plus 128 px padding = 688 → the browser shrinks Job (it wraps), still above its 120 px minimum. Only one of the two badge copies is ever displayed (`display: none` on the other, so assistive tech reads one).

### Mobile 375 px — card list

```
ul.flex flex-col gap-4 (md:hidden; the table wrapper is hidden md:block)
└─ li > article.rounded-lg border border-border bg-surface p-4 flex flex-col gap-3
   ├─ div.flex flex-wrap items-center justify-between gap-2 → StatusBadge · p.text-body-sm text-ink-muted <time>
   ├─ h2.text-body font-semibold → Link "Cleaning" (min-h-11, underline on hover) ; p services (line-clamp-2)
   ├─ div.flex flex-wrap items-end justify-between gap-x-6 gap-y-2
   │  ├─ div → worker name + "You rated 4 stars" | "Not rated yet"
   │  └─ p.text-h4 font-semibold "$120" | "—" + sr-only "No amount shown"
   └─ div.flex flex-wrap gap-2 border-t border-border pt-3
        Button variant="outline" size="sm": "Re-post" (Repeat) · "Rate" (Star) · "View receipt" (ReceiptText)
```

At 375 (inner 309): the three buttons are about 104 + 82 + 140 + 16 = 342 → "View receipt" wraps to a second line (`flex-wrap`); nothing overflows.

Both renderings come from one `HistoryList` and one data set. Element ids are prefixed per rendering (`history-table-…`, `history-card-…`) so no id repeats.

### Component tree

```
src/app/dashboard/history/page.tsx (server, new) — metadata "History · Chores For Me", noindex, instant = false
└─ Suspense fallback={<LoadingState variant="rows" />}
   └─ HistoryList (new: src/components/dashboard/history-list.tsx, "use client") key={revisitKey}
      ├─ jobs.listForCustomer → past (sorted: completedAt / createdAt, newest first); workers.getSummaries
      ├─ LoadingState | ErrorState | EmptyState
      ├─ table (hidden md:block) → StatusBadge, Button link × 3
      ├─ ul (md:hidden) → article cards → StatusBadge, Button outline × 3
      └─ useRepost → RepostConfirmDialog
```

### States

| Loading | Empty | Error (`?mockError=1`) | Success |
| --- | --- | --- | --- |
| `LoadingState variant="rows" count={5} label="Loading your history…"` | `EmptyState headingLevel={2} icon={History}` "Your finished jobs will appear here" (verbatim) · "Completed and cancelled jobs show here." · action `Button variant="outline"` → `/dashboard/jobs` "View active jobs" | `ErrorState headingLevel={2}`, Retry | Table (md+) / cards (< md) |

### Interaction details

- **Focus order per row:** title link, Re-post, [Rate], [View receipt].
- Re-post: button loading "Opening…"; the replace dialog returns focus to the row's Re-post on Keep.
- Rate / View receipt land on Job detail and focus `#rate-title` / `#receipt-title` (§0.4).

---

## 8. Re-post and the "replace draft?" dialog

`useRepost()` (new: `src/components/dashboard/use-repost.ts`) returns `{ repost(source), pendingId, dialog }`. `repost`:

1. Waits for `useJobDraftHydrated()`.
2. If `isJobDraftEmpty(draft)`: `setDraft(jobToDraft(source))`, `setTemplateName(undefined)`, `router.push('/post-job/review')`. The trigger shows `loading` "Opening…" until the route changes (a double click does nothing).
3. Otherwise opens `RepostConfirmDialog`.

`RepostConfirmDialog` (new: `src/components/dashboard/repost-confirm-dialog.tsx`, on `Dialog`):

```
DialogContent onOpenAutoFocus → focus "Keep my current job"
├─ DialogHeader
│  ├─ DialogTitle → "Replace the job you're building?"
│  └─ DialogDescription → "You have a job in progress. Re-posting “Weekly lawn care” replaces it."
│                          (job source: "Re-posting this Cleaning job replaces it.")
└─ DialogFooter
   ├─ DialogClose asChild → Button variant="outline" → "Keep my current job"
   └─ Button (default) loading → "Replace" | "Opening…"
```

- **Keep** closes the dialog, changes nothing, and focus returns to the Re-post trigger.
- **Replace** runs step 2; the dialog stays open with the spinner until the route changes (Esc and overlay are ignored while it runs).
- Modal `max-w-md` from `md`; bottom sheet at 375 with the buttons stacked, Keep on top.
- One dialog instance per view (Home: shared by the rail rows; Account: shared by template rows; Job detail; History).

---

## 9. Account — `/dashboard/account`

### Desktop 1280 px (reference)

Sections load independently (rule 32). Two stacks at `xl`:

```
header: h1 "Account" · p "Your profile, payment details and favourite workers."
div.grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start xl:gap-8
├─ div.flex flex-col gap-6 xl:col-span-7                                              556 px
│  ├─ ProfileSection #profile
│  └─ PaymentMethodsSection #payment
└─ div.flex flex-col gap-6 xl:col-span-5                                              388 px
   ├─ FavouriteWorkersSection #favourites
   ├─ TemplateList variant="section" #templates (hidden when empty)
   └─ SupportSection #support
```

Every section is a card: `section[aria-labelledby].rounded-lg border border-border bg-surface p-4 md:p-6`, header `div.flex flex-wrap items-center justify-between gap-3` with `h2 tabIndex=-1 .text-h4` and an optional header button.

### Tablet 768 px and 1024 px

One column (720 / 640) in DOM order: Profile, Payment details, Favourite Workers, Saved Templates, Support. Favourite cards 2 per row (`sm:grid-cols-2 xl:grid-cols-1`).

### Mobile 375 px

One column, 343 px cards (inner 309). Favourite cards 1 per row. Every form row stacks (T5/T7 field patterns). Nothing removed.

### 9.1 `ProfileSection` (new: `src/components/dashboard/profile-section.tsx`)

**View mode**

```
header: h2#profile-title "Profile" + Button variant="outline" size="sm" Pencil "Edit profile"
(success) FormAlert tone="success" "Profile saved." (focused)
div.mt-4 flex items-center gap-4
├─ span[aria-hidden].flex size-12 rounded-full bg-brand-soft text-body font-semibold text-ink → "SC"
└─ div.min-w-0 → p.text-body font-semibold "Sam Carter" · p.text-body-sm text-ink-muted "Customer account"
dl.mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2
└─ div → dt.text-body-sm font-semibold text-ink · dd.mt-1 text-body text-ink break-all
   Email · Mobile "(555) 123-4567" + chip · Date of birth "Mar 4, 1990" · Signed in with "Email" | "Google" | "Facebook"
   chip: span.ml-2 inline-flex items-center gap-1 rounded-full border border-input bg-surface px-2 py-1 text-caption font-semibold text-ink
         → CircleCheck size-4 text-success + "Verified" | CircleDashed size-4 text-ink-muted + "Not verified"
```

**Edit mode** (in place, same card; `form noValidate .mt-4 flex flex-col gap-6`, `mobileVerifiedResolver(profileSchema)`):

```
(service error) FormAlert tone="error" (focused) — ACCOUNT_EXISTS shows under Email instead
div.grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 → FormField First name · FormField Last name  (autoComplete given-name / family-name)
FormField Email → Input type="email" autoComplete="email"; error "Enter a valid email address" | "This email is already used by another account"
MobileVerifyField initiallyVerified={user.phoneVerified} (existing, + prop) — "Verify your mobile number" when changed and not verified
DobField role="customer" (existing)
div.flex flex-col gap-3 sm:flex-row sm:justify-end
├─ Button type="button" variant="outline" → "Cancel"
└─ Button type="submit" loading → "Save changes" | "Saving…"
```

- `mobileVerified` = OTP verified in this edit **or** the number equals the saved one. An unchanged unverified number can be saved without OTP (Open question 9).
- **Widths:** inner 508 at 1280 (names 2 × 246; the mobile row keeps "Send code" beside the input; the OTP panel 338 px fits), 672 / 592 at 1024 / 768, 309 at 375 (everything stacks; the OTP row is 304 px, T5's 375 layout).
- Focus: Edit profile → First name. Cancel → view mode, focus on "Edit profile". Save success → view mode with the new values, focus on "Profile saved." The SideNav name updates through the session store.

### 9.2 `PaymentMethodsSection` (new: `src/components/dashboard/payment-methods-section.tsx`)

```
header: h2#payment-title "Payment details" + (list loaded, panel closed) Button variant="outline" size="sm" Plus "Add a card"
          aria-expanded aria-controls="add-card-form"
(success) FormAlert tone="success" "American Express ending 0005 added." (focused)
ul.mt-4 divide-y divide-border rounded-md border border-border
└─ li.flex min-h-14 items-center gap-4 px-4 py-3
   ├─ span[aria-hidden].flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-alt → CreditCard size-5 text-ink
   └─ p.text-body font-semibold text-ink → "Visa ending 4242"      (CARD_BRAND_LABELS + last4 only)
(empty) p.mt-4 text-body-sm text-ink-muted → "No saved cards yet."
(panel open) form#add-card-form noValidate .mt-6 flex flex-col gap-6
├─ CardFields (existing) fields errors numberValue panelId="add-card-panel"
│     alert={failure ? FormAlert tone="error" "We couldn't add this card" : undefined}
└─ div.flex flex-col gap-3 sm:flex-row sm:justify-end
   ├─ Button type="button" variant="outline" → "Cancel"
   └─ Button type="submit" loading → "Save card" | "Adding card…"
```

- Card values live in form state only (no store, URL, log or analytics). On success the panel closes, the fields reset, the new row appears and the success message takes focus. Cancel closes the panel and focuses "Add a card". Failure keeps the typed values and focuses the `FormAlert`.
- Widths: inside the 508 px section the `CardFields` panel is 508 (inner 458; expiry/CVC/ZIP 3 × 142). At 375 the panel is 309 (inner 275); the number field leaves 179 px for 19 characters beside the brand label.

### 9.3 `FavouriteWorkersSection` (new: `src/components/dashboard/favourite-workers-section.tsx`)

```
header: h2#favourites-title tabIndex=-1 "Favourite Workers"
p.mt-1 text-body-sm text-ink-muted → "Favourite workers are shown first when you pick a worker."
p#favourites-status role="status" .mt-4 flex items-start gap-2 text-body-sm text-ink   (after a removal)
   → CircleCheck size-4 text-success + "Jordan M. removed from your Favourite Workers."
ul.mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1
└─ li → WorkerCard variant="display" favourite
          action={Button variant="outline" size="sm" HeartOff "Remove" + span.sr-only " Jordan M." loading "Removing…"}
        + (failure) FieldError (wrapper role="alert") "We couldn't update your favourites. Try again."
```

- Removed immediately on success (no confirmation, Open question 10). **Focus** moves to the next card's Remove button, else the previous one, else `#favourites-title`; the status line announces the removal.
- Widths: 388 → inner 340, one column; 720 / 640 → 2 columns of 328 / 288; 375 → 309.

### 9.4 Saved Templates on Account

`TemplateList variant="section"` (§3.3) as its own section card; hidden when empty; same Re-post and replace dialog.

### 9.5 `SupportSection` (new: `src/components/dashboard/support-section.tsx`, server-safe)

```
h2 "Support" · p.mt-1 text-body-sm text-ink-muted "Questions about a job or a payment? We're here to help."
ul.mt-4 flex flex-col gap-1
├─ a href="mailto:{SUPPORT_EMAIL}" → Mail size-5 + SupportEmailText (existing; breaks after "@")
├─ a href={SUPPORT_PHONE_HREF} → Phone size-5 + "Call or text {SUPPORT_PHONE}"
└─ Link href="/faq" → CircleHelp size-5 + "Read the FAQ"
   each: inline-flex min-h-11 items-center gap-2 text-body text-ink underline underline-offset-4 decoration-1 hover:decoration-2
```

### Component tree

```
src/app/dashboard/account/page.tsx (server, new) — metadata "Account · Chores For Me", noindex, instant = false
└─ Suspense fallback={<LoadingState variant="rows" count={3} />}
   └─ AccountView (new: src/components/dashboard/account-view.tsx, "use client") key={revisitKey}
      ├─ calls in order: payments.listMethods, favourites.list (then workers.getSummaries), templates.list
      ├─ ProfileSection (new) → FormField, Input, MobileVerifyField (+ prop), DobField, FormAlert, Button
      ├─ PaymentMethodsSection (new) → CardFields (existing), FormAlert, LoadingState, ErrorState
      ├─ FavouriteWorkersSection (new) → WorkerCard display (existing, extended), LoadingState, ErrorState, EmptyState
      ├─ TemplateList (new) variant="section" → useRepost → RepostConfirmDialog
      └─ SupportSection (new) → SupportEmailText (existing)
```

### States

Section-level states render **inside** the section card body. The state components get `className="border-0 px-0 py-8 md:px-0 md:py-8"` there (no card inside a card) and `headingLevel={3}`.

| Section | Loading | Empty | Error | Success |
| --- | --- | --- | --- | --- |
| Profile | — (session, already loaded by the guard) | — | Save: `FormAlert` / field errors | View mode |
| Payment details | `LoadingState variant="rows" count={2} label="Loading your payment methods…"` | "No saved cards yet." + Add a card | **`?mockError=1` lands here** (first call): `ErrorState headingLevel={3}` + Retry; the other sections still load | Card rows |
| Favourite Workers | `LoadingState variant="rows" count={2}` | `EmptyState headingLevel={3} icon={Heart}` "No favourite workers yet" · "Add a worker from a job they did for you." | `ErrorState headingLevel={3}` + Retry | Display cards with Remove |
| Saved Templates | Skeleton rows | Section hidden | Inline error + Try again | Rows with Re-post |
| Support | — | — | — | Links |

### Interaction details

- **Focus order (1280 and 375 alike, DOM order):** Edit profile, Add a card, Remove × n, Re-post × n, email, phone, FAQ.
- Opening "Add a card" moves focus to the card number. Opening "Edit profile" moves focus to First name.
- Each section keeps its own form; Profile edit and the Add a card panel can be open at the same time.

---

## 10. New strings (`src/lib/constants.ts`, `DASHBOARD_COPY`; all [provisional] unless marked)

**meta:** jobs "Jobs · Chores For Me" · detail "Job details · Chores For Me" · edit "Edit job · Chores For Me" · history "History · Chores For Me" · account "Account · Chores For Me" (Home reuses `AUTH_COPY.meta.dashboard`).

**home:** description "Here's what's happening with your jobs." · activeTitle "Active jobs" · viewAll "View all jobs" · loading "Loading your jobs…" · emptyDescription "Post your first job and verified workers near you can accept it." (title `SCREEN_STATE_COPY.customerHomeEmpty`, verbatim) · noActiveTitle "No active jobs right now" · noActiveDescription "Your finished jobs are in History." · viewHistory "View history" · railLabel "Templates and app" (greeting reuses `AUTH_COPY.dashboard.greeting`; "Hidden for 7 days." reuses `JOB_BUILDER_COPY.confirmation.promptHidden`).

**jobs:** title "Active jobs" · description "Open, accepted and in-progress jobs, newest first." · historyLink "Finished jobs are in History" · count(n) "{n} active job(s)".

**card:** posted(date) "Posted {date}" · board "On the job board" · workerFallback "Your worker" · ratingSr " out of 5" (reuse `JOB_BUILDER_COPY.match.ratingSr` if equal).

**status:** statusSr "Status: " (labels reuse `JOB_STATUS_LABELS`).

**detail:** title(category) "{Category} job" · backToJobs "Back to jobs" · backToHistory "Back to history" · reference(id) "Reference {id}" · posted(dt) "Posted {date, time}" · completed(dt) "Completed {date, time}" · cardTitle "Worker, price and actions" (sr) · workerTitle "Your worker" · whoTitle "Who" · boardTitle "On the job board" · boardLine "The first verified worker to accept gets it." · loadingWorker "Loading worker…" · priceFixed "Price" · priceHourly "Estimated total" · priceTotal "Total" · chargeNote (reuse T7 "You're charged when the job is done. There are no refunds.") · chargedNote "Charged on completion. No refunds." · cancelledNote "This job was cancelled before it was done." · acceptedNote "A worker has accepted this job, so it can't be edited. You can still cancel it." · inProgressNote "This job is under way. You can rate it once it's done." · actionsLabel "Job actions" · edit "Edit job" · cancel "Cancel job" · rate "Rate this job" · repost "Re-post" · reposting "Opening…" · detailsTitle "Job details" · rows (Category, Services, Where, Description, Price, Who, Posted, Completed) · photosTitle "Photos" · photoTile(i, n) "Photo {i} of {n}" · photosLabel "Photo placeholders" · photosNote "Photos aren't available in the demo." · noPhotos "No photos added." · loading "Loading your job…" · notFoundDescription (reuse `JOB_BUILDER_COPY.confirmation.notFoundDescription`) · backToDashboard "Back to dashboard" · savedFlash "Your changes are saved." · cancelledFlash "Job cancelled."

**favourite:** add "Add to Favourite Workers" · remove "Remove from Favourite Workers" · saving "Saving…" · added(name) "{name} is now a favourite worker." · removed(name) "{name} removed from your Favourite Workers." · error "We couldn't update your favourites. Try again." · loadError "We couldn't load your favourites." · retry "Try again".

**cancel dialog:** title "Cancel this job?" · descriptionOpen(category) "Your {category} job will be taken off the job board." · descriptionAccepted(name) "{name} will no longer do this job." · feeNote "A cancellation fee may apply. The amount and when it applies are still being confirmed." · faqLink = FAQ `cancellation-fee` question · keep "Keep job" · confirm "Cancel job" · cancelling "Cancelling…" · close "Close".

**rate:** title "Rate this job" · legend(name) "Rate {name}" · legendFallback "Rate your worker" · star(n) "{n} star" / "{n} stars" · readout(n) "{n} out of 5" · readoutEmpty "No rating chosen" · submit "Submit rating" · submitting "Submitting…" · result(n) "You rated {n} star(s)" · `VALIDATION_MESSAGES.rating` "Choose a star rating".

**receipt:** title "Receipt" · completed "Completed" · services "Services" · worker "Worker" · rate "Rate" · total "Total charged" · note "Charged on completion. No refunds."

**edit:** title "Edit job" · description "Change what workers see. You can edit until a worker accepts." · backToJob "Back to job" · factsCategory "Category" · factsWho "Who" · categoryNote "To change the category, cancel this job and post a new one." · servicesTitle "Services" · whereTitle "Where" · detailsTitle "Details" · outOfAreaBody(served) "Choose an address in {served} to save this job." · cancel "Cancel" · save "Save changes" · saving "Saving…" · lockedDescription "Edits close once a worker accepts the job." (title `SERVICE_MESSAGES.notAllowed`).

**history:** title "History" · description "Completed and cancelled jobs, newest first." · caption "Past jobs, newest first" · columns Job / Worker / Amount / Status / Actions · completedOn(date) "Completed {date}" · postedOn(date) "Posted {date}" · noWorker "No worker" · rated(n) "You rated {n} star(s)" · notRated "Not rated yet" · noAmountSr "No amount shown" · rate "Rate" · viewReceipt "View receipt" · rowSr(category, date) " {category} job, {date}" · loading "Loading your history…" · emptyDescription "Completed and cancelled jobs show here." · viewActive "View active jobs" (title `SCREEN_STATE_COPY.historyEmpty`, verbatim).

**repost dialog:** title "Replace the job you're building?" · descriptionTemplate(name) "You have a job in progress. Re-posting “{name}” replaces it." · descriptionJob(category) "You have a job in progress. Re-posting this {category} job replaces it." · keep "Keep my current job" · replace "Replace".

**templates:** title "Saved Templates" · loading "Loading your templates…" · error "We couldn't load your templates." · retry "Try again" · repostSr(name) " {name}".

**account:** title "Account" · description "Your profile, payment details and favourite workers." · profileTitle "Profile" · editProfile "Edit profile" · roleLine "Customer account" · labels Email / Mobile / Date of birth / Signed in with · providers { email: "Email", google: "Google", facebook: "Facebook" } · verified "Verified" · notVerified "Not verified" · save "Save changes" · saving "Saving…" · cancel "Cancel" · profileSaved "Profile saved." · emailTaken "This email is already used by another account" · paymentTitle "Payment details" · addCard "Add a card" · noCards "No saved cards yet." · saveCard "Save card" · addingCard "Adding card…" · cardAdded(label) "{label} added." · paymentsLoading "Loading your payment methods…" · favouritesTitle "Favourite Workers" · favouritesHint "Favourite workers are shown first when you pick a worker." · favouritesEmpty "No favourite workers yet" · favouritesEmptyHint "Add a worker from a job they did for you." · remove "Remove" · removing "Removing…" · supportTitle "Support" · supportIntro "Questions about a job or a payment? We're here to help." · callOrText(phone) "Call or text {phone}" · faq "Read the FAQ".

---

## 11. Files

```
src/styles/globals.css                                    (edit: bottom-above-nav, scroll-mb-bars utilities)
src/app/dashboard/layout.tsx                              (edit: CustomerShell around the authed branch)
src/app/dashboard/page.tsx                                (replace)
src/app/dashboard/jobs/page.tsx | jobs/[id]/page.tsx | jobs/[id]/edit/page.tsx | history/page.tsx | account/page.tsx (new)
src/components/dashboard/customer-shell.tsx | shell-rail.tsx                  (new, §2)
src/components/dashboard/customer-home.tsx | jobs-list.tsx | job-detail-view.tsx | job-actions.tsx
src/components/dashboard/cancel-job-dialog.tsx | rate-job-form.tsx | edit-job-view.tsx | history-list.tsx
src/components/dashboard/template-list.tsx | use-repost.ts | repost-confirm-dialog.tsx
src/components/dashboard/account-view.tsx | profile-section.tsx | payment-methods-section.tsx
src/components/dashboard/favourite-workers-section.tsx | support-section.tsx       (new)
src/components/job/job-card.tsx | status-badge.tsx | job-detail.tsx | job-photos-placeholder.tsx | job-receipt.tsx (new)
src/components/forms/star-rating-field.tsx                                    (new)
src/components/forms/sub-services-field.tsx | description-field.tsx           (extracted, no behaviour change to steps 2 and 4)
src/components/job/worker-card.tsx                                            (edit: display variant)
src/components/forms/form-alert.tsx                                           (edit: tone "success")
src/components/layout/app-prompt.tsx                                          (edit: layout "rail")
src/components/auth/mobile-verify-field.tsx                                   (edit: initiallyVerified)
src/components/states/loading-state.tsx                                       (edit: cards columns, detail order, form variant)
src/components/flow/review-summary.tsx                                        (edit, Open question 5: status chip → StatusBadge)
src/lib/constants.ts                                                          (DASHBOARD_COPY, §10)
```

Not touched (imported only): `AppShell`, `SideNav`, `BottomNav`, `AccountMenu`, `RequireRole`, `GuardLoading`, `Dialog`, `Button`, `Input`, `Label`, `Checkbox`, `RadioGroup`, `Textarea`, `Select`, `Skeleton`, `Separator`, `SelectableCard`, `CardIndicator`, `AddressInput`, `PriceInput`, `CardFields`, `DobField`, `FormField`, `ExternalLink`, `SupportEmailText`, `EmptyState`, `ErrorState`. **No new `ui/*` primitive.**

---

## 12. QA hooks (design-specific)

- **Forbidden classes** in T8 files: raw hex, `text-white`, `text-brand`, `border-brand`, `ring-`, `text-sm|xs|base|lg`, `font-medium|bold`, arbitrary `[…]`. Zero results. `bottom-above-nav` and `scroll-mb-bars` are the only new utilities.
- **No horizontal scroll** (`document.documentElement.scrollWidth` equals the viewport) at 375 on: Home (3 cards, templates, Android prompt), Jobs, Job detail for each status (with the mobile bar, the cancel sheet open, the rate error showing), Edit (all errors showing, out-of-area note), History cards, Account (profile edit with the OTP panel open, the add-card panel with four errors). **At 768 and 1024 the History table does not scroll sideways**; at 1280 it shows five columns.
- **StatusBadge:** each status shows its label and icon; in a greyscale screenshot every status is still identifiable by text and icon.
- **Rail:** at 1280 Home has a 320 px rail (templates, then the banner); Jobs, Job detail, History and Account have none. At 1024 and below, the rail content sits under the active jobs. Soft-navigating Home → Jobs removes the rail at once.
- **Nav:** `/dashboard/jobs/<id>` and `/edit` mark Jobs as current in SideNav and BottomNav.
- **Mobile action bar** sits directly on top of the BottomNav (no gap, no overlap) on an iPhone-sized emulation with a safe area; the last section of Job detail scrolls fully clear of both bars.
- **Keyboard:** stars work with arrows; the focus ring shows on the star box. The cancel dialog opens on "Keep job", ignores Esc while cancelling, and after success focus is on "Job cancelled.". Favourite removal on Account moves focus to the next Remove button.
- **Touch targets:** star boxes, link buttons in the History table, Back links and Re-post buttons are at least 44 px.
- **Contrast spot checks:** completed badge icon on white; star icons on white only; every error line on a white card.

---

## Open questions

Each has a proposed default, which applies unless the orchestrator decides otherwise.

1. **Home "Post a job" call to action.** The product plan lists one on Home, but the persistent SideNav / top-bar button is already on screen at every width. *Default:* no third copy in the Home header; the empty states carry their own Post a job button. Alternative: a `secondary` "Post a job" button beside the greeting.
2. **Two layout utilities** (`bottom-above-nav`, `scroll-mb-bars`) in `globals.css`, the same kind of token-level utility as T2's `pb-safe`. They let the mobile action bar sit exactly on the BottomNav including the safe area. *Default:* add them. Alternative: a sticky action bar at the top (`sticky top-16`, under the mobile top bar), which needs no utility but is less conventional for actions.
3. **StatusBadge colour mapping** (§1.1: open brand-soft, accepted surface-dark, in progress brand, completed white with a green check, cancelled surface-alt). *Default:* as planned. All are approved T2 pairs; no status colour token is added.
4. **Rail mechanism:** `CustomerShell` + `ShellRail` portal (§2). *Default:* as planned; the lead engineer may switch if Next 16 forces it (decision 4).
5. **T7 Confirmation status chip.** `ReviewSummary` draws its own brand-soft chip ("Open" and "Accepted" look the same). *Default:* swap it for `StatusBadge` (a one-line change) so a job's status looks the same on Confirmation and in the dashboard.
6. **Small extensions instead of new components:** `FormAlert tone="success"`, `AppPrompt layout="rail"`, `MobileVerifyField initiallyVerified`, `WorkerCard variant="display"`, and `LoadingState` (`cards` `columns`, reordered `detail`, new `form`). *Default:* approve all; each keeps today's behaviour as the default.
7. **Receipt access from Job detail.** The card has no "View receipt" button; the Receipt is a section of the page, and History links to `#receipt`. *Default:* as planned (keeps the mobile bar to two buttons).
8. **History "View" action** is the job-title link rather than a separate "View" link. *Default:* as planned (three action links per row at most, so the table fits at 768).
9. **Unchanged, unverified mobile on Profile save.** *Default:* allowed without OTP; OTP is required only when the number changes (product plan rule 27).
10. **Success messages persist** until the next action in that area or until the page is left (no auto-dismiss, since they are not toasts). *Default:* as planned.
