# T3 — UI plan (Data + mock layer)

Input: `01-product-plan.md`, including its "Orchestrator decisions" (binding), plus `T2/02-ui-plan.md` for the tokens, type scale, spacing allowlist, focus rules and components. This plan does not reopen any of those.

T3 has two small pieces of UI:

1. the dev-only `/dev/mock` page
2. `ResetDemoDataButton` in the T2 `Footer` (decision 20)

Breakpoints and terms are the same as in T2: mobile is `< md`, tablet is `md` to `< lg`, desktop is `lg` and up. The only spacing steps used are those T2 allows (1, 2, 3, 4, 6, 8, 12, 16, 24). Every size is on the T2 sizing allowlist.

**No new primitives.** Everything uses `Button`, `Separator` and `Skeleton` (`src/components/ui`), plus `Container`, `LoadingState`, `EmptyState` and `ErrorState`. `Sheet` isn't needed.

**One additive change to T2 components:** `EmptyState` and `ErrorState` take `headingLevel?: 2 | 3 | 4` instead of `2 | 3`. It's a one-line type change plus `h4` in the `Heading` switch. Default rendering stays the same. The reason is the heading outline on `/dev/mock`: h1 is the page, h2 is a service group, h3 is a call, and h4 is the state card inside a call's result area.

---

## 1. Dev mock page — `/dev/mock`

`src/app/dev/mock/page.tsx` is a server component. It exports only this metadata and renders `<DevMockPanel />`:

```ts
title: DEV_MOCK_COPY.metaTitle
robots: { index: false, follow: false }
```

It is linked from nowhere, like `/styleguide`. There is no product `Header` or `Footer` on this page, and the page has its own reset button.

**Nothing runs on mount.** The seed check and every service call run only when their button is pressed. With `?mockError=1`, the one-shot error (decision 15) then lands on whichever call the developer presses first, not on an automatic load.

### Desktop 1280 px (reference)

The page is wrapped in `main#main`, then `Container` with `py-12`, so content is 1200 px wide. It has three bands, top to bottom:

**A. Page head** (`flex flex-col gap-4`)

- `h1` "Mock services". The T2 base gives it `text-h2 md:text-h1`.
- Intro: `p text-body text-ink-muted max-w-3xl`.
- **mockError hint:** `p text-body-sm text-ink-muted`, explaining `?mockError=1`.
- **Armed notice:** shown only when `window.location.search` contains `mockError=1`. It is read in a `useEffect` after mount, with no search-param hook.
  - Box: `flex items-start gap-3 rounded-lg border border-input bg-brand-soft p-4 text-body-sm text-ink`.
  - Icon: lucide `Info`, `size-5 shrink-0`, `aria-hidden`.
  - Text: "Error mode is on: the first service call on this page will fail. Retry then succeeds."
- **Toolbar:** `flex flex-wrap items-center gap-3`, holding three items:
  - **"Load with ?mockError=1":** a plain `<a href="/dev/mock?mockError=1">`. It must be a full page load so the one-shot error re-arms; don't use `next/link`. Styled as `Button asChild variant="outline" size="sm"` with a `Bug` icon.
  - **"Load without ?mockError":** an `<a href="/dev/mock">`, styled as `Button asChild variant="ghost" size="sm"`. Shown only while the notice is armed.
  - **`ResetDemoDataButton appearance="button"`:** see §2.
- **Jump chips:** `nav aria-label="Page sections"`, holding `ul flex flex-wrap gap-2`.
  - Each chip is an `a` styled `inline-flex h-11 items-center rounded-full border border-input px-4 text-body-sm text-ink hover:bg-surface-alt transition-colors duration-150 motion-reduce:transition-none`. This is the same pattern as the T2 inline styleguide table of contents.
  - Chips: Seed check · Auth · Jobs · Workers · Templates · Payments · Earnings · Users · Addresses · Notify · Favourites · Stores.
  - The chips wrap, so they never scroll sideways.

**B. Seed check** (full width, `mt-12`)

- `section#seed aria-labelledby`, styled as a card: `rounded-lg border border-border bg-surface p-6`.
- **Head row:** `flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between`.
  - Left: `h2` "Seed check" (`text-h3`), then `p mt-1 text-body-sm text-ink-muted`: "Counts from `getSeedSummary()` compared with the seed."
  - Right: **Run** as `Button variant="outline" size="sm" className="w-full sm:w-auto"` with a `Play` icon.
- **Result:** `mt-6`, holding `grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6` with 6 tiles: Categories, Customers, Workers, Jobs, Templates, Payment methods.
  - Tile: `min-w-0 rounded-lg border border-border bg-surface-alt p-4 flex flex-col gap-1`.
  - Label: `text-body-sm text-ink-muted`.
  - Value: `text-h3 font-semibold text-ink`.
  - Expected value: `text-caption text-ink-muted`, for example "Seed: 12".
  - Match row: `mt-1 flex items-center gap-1 text-caption text-ink`. A match shows `CircleCheck size-4 text-success` and "Matches seed". A difference shows `CircleAlert size-4 text-warning` and "Changed". The icon is never the only signal, per T2 0.3.
  - Breakdown: `text-caption text-ink-muted` below the match row, on the Workers tile ("4 verified · 1 under review · 1 rejected") and the Jobs tile (count per status, using `JOB_STATUS_LABELS`).

**C. Services and stores** (`mt-12`)

The layout is `grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8`, with two columns:

- **Services column:** `lg:col-span-8 min-w-0 flex flex-col gap-12`. It holds one `ServiceGroup` per group, in this order: Auth, Jobs, Workers, Templates, Payments, Earnings, Users, Addresses, Notify, Favourites. The last five are the decision 17 additions.
  - Group: `section aria-labelledby`, with an `h2` (`text-h3`) such as "Auth", an optional intro (`p mt-1 text-body-sm text-ink-muted`), and `ul mt-4 flex flex-col gap-4` holding one `ServiceCall` per call.
- **Stores column:** `aside` with `lg:col-span-4 min-w-0 lg:sticky lg:top-8 lg:self-start`, holding the `StoreViewer` card (see below).
  - It is short enough to stay sticky in an 800 px viewport: 3 blocks × `max-h-60` JSON is about 720 px. **If the viewer turns out taller than the viewport, drop `lg:sticky`; never clip it.**
  - **DOM order equals visual order:** services first, then stores. On narrow widths the "Stores" jump chip reaches it.

`min-w-0` on both grid columns, every card and every tile is required. Without it, long JSON lines widen the grid track and cause page scroll.

### Tablet 768 px and 1024 px

- **1024:** same as desktop. The services column is about 632 px and stores about 296 px. Store Clear buttons stay on their heading row; long store names wrap. The seed tiles stay 6-up and each tile is about 140 px wide. Tile labels wrap (`break-words`), and "Payment methods" may take 2 lines.
- **768:** one column. Order: head, chips, seed (3 × 2 tiles), services, then Stores (not sticky). Container gutters are 24 px. `ServiceCall` keeps its side-by-side head row (`sm` and up).

### Mobile 375 px

- Content is 343 px wide (Container `px-4`). Cards use `p-4` (`p-4 md:p-6`).
- Seed tiles are 2-up, about 163 px each.
- The toolbar wraps. The reset button becomes `w-full`, and so do the two `a` buttons (`w-full sm:w-auto`).
- `ServiceCall`: the head stacks, and Run is full width below the name and args.
- Every JSON box scrolls inside itself on both axes. `document.documentElement.scrollWidth` must be 375.
- Nothing is removed. Every chip, call and store is still there.

### `ServiceCall` card

```
li > article.min-w-0 rounded-lg border border-border bg-surface p-4 md:p-6
├─ div.flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4
│  ├─ div.min-w-0
│  │  ├─ h3.text-body font-semibold text-ink break-all          "jobs.accept"
│  │  ├─ p.mt-1 text-body-sm text-ink-muted break-words        args label, e.g. "Open Austin job · demo worker"
│  │  └─ p.mt-1 text-caption text-ink-muted (optional)         expect label, e.g. "Run twice: the second run is rejected with 'This job was just taken'"
│  └─ Button outline sm w-full sm:w-auto shrink-0  [Play] "Run" + <span class="sr-only"> jobs.accept</span>
└─ div.mt-4 (result area: idle | loading | success | empty | error)
```

- **Run button:** `loading` while the call is pending, with the label "Running…". The sr-only suffix gives each of the ~40 Run buttons a unique accessible name.
- **Calls and arguments:** fixed sample arguments. They live in `src/app/dev/mock/_data/service-calls.ts`, and each entry is `{ id, name, argsLabel, expectLabel?, run: () => Promise<unknown> }`, with labels from `DEV_MOCK_COPY`. The list follows product plan §4 and decision 17. It includes paired calls that show the business errors and the empty state:
  - `auth.login` with an unknown email
  - `auth.signUp` with the demo email
  - `auth.verifyOtp` with `000000`
  - `jobs.get` with a missing id
  - `jobs.accept`, run twice
  - `jobs.listForCustomer`, `templates.list`, `payments.listMethods` and `favourites.list` for `new.customer@…`, which return empty

### `JsonBlock` (page-local; used by results and stores)

```
pre tabIndex={0} role="region" aria-label="{label}"
  className="max-h-80 overflow-auto rounded-md border border-border bg-surface-alt p-4 font-sans text-body-sm text-ink whitespace-pre"
```

- The value is `JSON.stringify(value, null, 2)`.
- `whitespace-pre` plus `overflow-auto` makes long JSON scroll **inside its own box** on both axes. It never wraps the page.
- `tabIndex={0}` makes the scroll region reachable by keyboard; `role="region"` gives it a name.
- Font: `font-sans` overrides Preflight's monospace on `pre`, because T2 0.4 defines no monospace family. See Open question 1.
- Stores use `max-h-60` instead of `max-h-80`.

### `StoreViewer`

The card is `rounded-lg border border-border bg-surface p-4 md:p-6`, containing:

- `h2#stores` "Stores" (`text-h3`)
- `p mt-1 text-body-sm text-ink-muted`: "Live values from the persisted stores in this browser."
- `div mt-6 flex flex-col gap-6`, holding 3 `StoreBlock`s separated by `Separator`: Session, Job draft and Worker onboarding.

Each `StoreBlock`:

- **Head row:** `flex items-center justify-between gap-3`.
  - `h3 text-body font-semibold text-ink`, with an optional `text-caption text-ink-muted` "Empty" next to it when the value is `null`, `{}` or has no steps.
  - **Clear:** `Button variant="ghost" size="sm"` with the label "Clear" and an sr-only store name. It calls that store's clear or reset action, not `auth.logout`. No confirm, since this is a dev tool.
- **Value:** `JsonBlock` at `mt-3`.

Stores are read with their Zustand hooks, so the viewer updates live after a login, `jobs.create` or a Clear. Until the component has mounted (client-only `localStorage`), each block shows `Skeleton h-24 w-full` instead of the JSON, which avoids a hydration mismatch. The block is wrapped in `div role="status"` with an sr-only "Loading…".

### Component tree

```
DevMockPage (new: src/app/dev/mock/page.tsx, server) — metadata only
└─ DevMockPanel (new: _components/dev-mock-panel.tsx, "use client")
   └─ main#main > Container (existing) className="py-12"
      ├─ h1 + intro + hint
      ├─ MockErrorNotice (new, page-local) — reads window.location.search after mount
      ├─ toolbar: a × 2 (Button asChild), ResetDemoDataButton (new: src/components/layout/reset-demo-data-button.tsx) appearance="button"
      ├─ JumpNav (new, page-local) — items from DEV_MOCK_COPY.sections
      ├─ SeedCheck (new, page-local) — LoadingState / EmptyState / ErrorState (existing)
      └─ grid
         ├─ ServiceGroup × 10 (new, page-local) — id, title, intro?, calls
         │  └─ ServiceCall (new, page-local) — call: ServiceCallDef
         │     └─ ResultView (new, page-local) — state from useServiceCall
         │        └─ LoadingState | EmptyState | ErrorState | JsonBlock (new, page-local)
         └─ StoreViewer (new, page-local) — StoreBlock × 3 → JsonBlock, Skeleton (ui), Separator (ui)
Hook: _components/use-service-call.ts — run(), state: idle | loading | success{value, ms} | empty{ms} | error{message, code, isMock, ms}
Data: _data/service-calls.ts — SERVICE_GROUPS
```

### States (per result area; `SeedCheck` follows the same rules)

| State | What shows |
| --- | --- |
| Idle (not one of the four) | `p text-body-sm text-ink-muted` "Not run yet." Seed check: "Run the seed check to load the counts." |
| **Loading** | `LoadingState variant="rows" count={2} label="Running {name}…"`, plus the Run button's spinner. The seed check uses `LoadingState variant="summary"`. |
| **Success** | A status line, then a `JsonBlock` at `mt-3`. The status line is `p role="status" text-body-sm text-ink-muted`, for example "Resolved in 612 ms". QA uses it to check the 400–800 ms delay. A void result shows only "Resolved in 612 ms · no value". The seed check shows the tile grid instead of JSON. |
| **Empty** | Rule: the result is `[]` or `null`. Shows the status line, then `EmptyState headingLevel={4} icon={Inbox} className="py-8 md:py-8"` with the title "Empty result" and the description "The service resolved with an empty list." The seed check is empty when every count is 0: the title is "The mock database is empty" and the action is `ResetDemoDataButton appearance="button"`. |
| **Error** | Shows the status line, for example "Rejected in 540 ms · code NO_ACCOUNT". Then `ErrorState headingLevel={4} className="py-8 md:py-8" onRetry={run} isRetrying={loading}`. **Mock error:** title "Simulated error (?mockError=1)", with the default message. **Service rejection:** title "Service rejected", and the message is the service's own text, for example "No account found" or "This job was just taken". |

The compact `py-8 md:py-8` override (through `cn`/tailwind-merge) keeps a state card from towering over a single call. Each new run replaces the previous result.

### Interaction details

- **Focus order:** mockError links, Reset, jump chips, seed Run, then each call in order (Run → its JsonBlock or Retry), then each store (Clear → JsonBlock).
- **Focus kept on Run:** while running, `Button loading` sets `disabled`, which can drop focus to `body`. When the call settles, if `document.activeElement === document.body`, focus goes back to that call's Run button. ErrorState's Retry button works the same way.
- **Focus ring:** everything uses the T2 global `:focus-visible` rule (2 px `ring` outline, 2 px offset). JsonBlocks get the ring too, because they are focusable.
- **Announcements:** LoadingState is `role="status"`, ErrorState is `role="alert"` and the success status line is `role="status"`. Nothing moves focus on its own.
- **Parallel calls:** calls may run at the same time, and each card keeps its own state.
- **Hover and motion:** T2 Button hovers, chip `hover:bg-surface-alt`, `transition-colors duration-150 motion-reduce:transition-none`. No toasts; they come in a later ticket.
- **Reset:** see §2. It confirms, then reloads, so every result clears.

---

## 2. `ResetDemoDataButton` — `src/components/layout/reset-demo-data-button.tsx` ("use client")

**Props**

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `appearance` | `'footer-link' \| 'button'` | `'footer-link'` | |
| `className` | `string` | — | Footer passes its own `linkClass` (below), so the button matches the footer links exactly without importing from the server `footer.tsx` |

**Behaviour** (decision 20, same for both appearances)

1. On click it calls `window.confirm(RESET_DEMO_COPY.confirm)`. Cancel does nothing.
2. On OK it sets the pending state and awaits `resetDemoData()`, which restores the mock DB and clears the session, draft and onboarding stores (decision 14).
3. Then it calls `window.location.reload()`.
4. If it rejects, the pending state ends and an inline `p role="alert"` appears next to the button: "Couldn't reset demo data. Try again." See Open question 2.

**`footer-link` appearance** (Footer, on `surface-dark`)

- Element: `<button type="button">`, not a link, because it is an action.
- Classes: the footer's `linkClass` plus the button extras, `cn(linkClass, "min-w-11 cursor-pointer gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-default disabled:opacity-50")`. The full set:
  - `linkClass`: `inline-flex min-h-11 items-center rounded-md text-body text-surface underline-offset-4 hover:underline focus-visible:outline-surface`
  - **Touch target:** `min-h-11 min-w-11`, which is at least 44 × 44 px. The label "Reset demo data" makes it about 130 × 44.
  - **Focus:** a 2 px **`surface` (white) outline** with a 2 px offset (12.6:1 on `surface-dark`) and `rounded-md` corners, the same as the other footer links. The width and offset are set explicitly here as well as by the global rule, so the button doesn't depend on base-layer order.
  - **Rest:** `text-surface`, no underline. **Hover:** underline. **Pending:** `disabled`, `aria-busy="true"`, label "Resetting…", `opacity-50` (WCAG exempts disabled controls).
- **Placement in `Footer`:** in the bottom row after the `Separator`. The copyright `p` becomes part of a row:
  ```
  div.flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between
  ├─ p.text-body-sm text-surface   © {year} Chores For Me…
  └─ div.flex flex-col items-start gap-1 md:items-end
     ├─ ResetDemoDataButton className={linkClass}
     └─ p role="alert" text-body-sm text-surface (only on failure)
  ```
  - **1280 / 1024:** copyright on the left, Reset on the right, on one line.
  - **768:** the same.
  - **375:** stacked, copyright first, then Reset left-aligned. The footer's existing `pb-24` keeps it clear of the fixed `MobileCtaBar`.
  - **DOM and focus order:** Legal links, then Reset, then the mobile CTA bar. The error text is `text-surface` (white), because no danger or muted text is allowed on dark (T2 0.3).
  - The T2 `/styleguide` Footer preview shows it automatically. Clicking it there really resets, which is fine.

**`button` appearance** (`/dev/mock` toolbar and the seed empty state)

- `Button variant="outline" size="sm" className="w-full sm:w-auto"` with a `RotateCcw` icon and the label "Reset demo data".
- Uses `loading` while pending, with the label "Resetting…". The error `p role="alert"` is `text-body-sm text-danger` (4.8:1 on white), shown below the button.

---

## 3. New strings for `src/lib/constants.ts`

**`RESET_DEMO_COPY`**

- `label`: "Reset demo data" (Tech Spec wording)
- `resetting`: "Resetting…"
- `confirm`: "Reset demo data? This restores the sample jobs and accounts and signs you out."
- `error`: "Couldn't reset demo data. Try again."

**`DEV_MOCK_COPY`**

- **Page:** `metaTitle` "Mock services · Chores For Me"; `title` "Mock services"; `intro` "Calls every mock service with fixed sample arguments. Data persists in this browser until you reset it."
- **Error mode:** `mockErrorHint` "Add ?mockError=1 to the URL to make the first service call after the page loads fail. Retry then succeeds."; `armedNotice` "Error mode is on: the first service call on this page will fail. Retry then succeeds."; `loadWithError` "Load with ?mockError=1"; `loadWithoutError` "Load without ?mockError"
- **Navigation:** `jumpNavLabel` "Page sections"; `sections`: the 12 chip labels from §1A
- **Seed check:** `seed.title` "Seed check"; `seed.intro` "Counts from getSeedSummary() compared with the seed."; `seed.idle` "Run the seed check to load the counts."; `seed.expected(n)` "Seed: {n}"; `seed.matches` "Matches seed"; `seed.changed` "Changed"; `seed.emptyTitle` "The mock database is empty"; tile labels Categories · Customers · Workers · Jobs · Templates · Payment methods
- **Calls:** `run` "Run"; `running` "Running…"; `runningLabel(name)` "Running {name}…"; `idle` "Not run yet."; `resolvedIn(ms)` "Resolved in {ms} ms"; `noValue` "no value"; `rejectedIn(ms, code)` "Rejected in {ms} ms · code {code}"; `emptyTitle` "Empty result"; `emptyDescription` "The service resolved with an empty list."; `mockErrorTitle` "Simulated error (?mockError=1)"; `serviceErrorTitle` "Service rejected"
- **Groups and calls:** group titles and intros, plus each call's `argsLabel` and `expectLabel`
- **Stores:** `stores.title` "Stores"; `stores.intro` "Live values from the persisted stores in this browser."; `stores.session` "Session"; `stores.draft` "Job draft"; `stores.onboarding` "Worker onboarding"; `stores.empty` "Empty"; `stores.clear` "Clear"

## 4. QA hooks

- At 375, with the longest JSON open (`jobs.listBoard` and `jobs.listForCustomer`), `document.documentElement.scrollWidth === 375`.
- Every JsonBlock scrolls on its own and can be focused with Tab.
- Every Run, Retry, Clear, chip and Reset control is at least 44 px tall.
- The footer Reset shows a white outline on keyboard focus and none on mouse click.
- With `?mockError=1`, the first Run pressed shows "Simulated error"; its Retry then succeeds.
- `/dev/mock` has `noindex, nofollow`, and no link to it exists.
- No hex colours, `text-sm`, `text-xs` or `font-medium` appear in the new files.

## Open questions

1. **Monospace for JSON.** T2 defines no monospace family, so this plan sets `font-sans` on `pre`, and indentation still reads correctly with `whitespace-pre`. Is adding `--font-mono: ui-monospace, monospace` (a system stack, no new font file) acceptable for this dev page only, or keep `font-sans`?
2. **mockError and the utility calls.** Should `resetDemoData()` and `getSeedSummary()` be exempt from the one-shot `?mockError=1` rejection? I recommend exempting at least `resetDemoData()`, so the recovery action can't be the call that eats the error. The plan still handles a rejection with the inline alert in case they are not exempt.
3. **Expected seed counts.** The "Seed: n" values need the seed counts, but UI may not import `seed.ts`. Should `getSeedSummary()` return `{ current, expected }`, or should the expected counts live in `DEV_MOCK_COPY`? I prefer the service returning both.
