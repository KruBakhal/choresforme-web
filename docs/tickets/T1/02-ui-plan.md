# T1 — UI plan

T1 is scaffold only. The only visible UI is a temporary placeholder at `/`, which the Landing page replaces in T4. This plan covers that page, where the token CSS lives, how the tokens map to Tailwind v4 utilities, and the empty component folders.

## Decisions recorded (orchestrator answers to the product plan's open questions)

| # | Question | Decision |
| --- | --- | --- |
| 1 | `@hookform/resolvers` | **Not added.** A small hand-written Zod resolver helper will live in `src/lib/validation`. T1 can skip it because forms arrive later (T5/T6). |
| 2 | `eslint-config-prettier`, `prettier-plugin-tailwindcss` | **Neither is added.** Prettier runs on its own (`format` script). ESLint keeps `eslint-config-next` unchanged. |
| 3 | Where tokens map to Tailwind | Tailwind v4 `@theme inline` in `src/styles/globals.css`. No `tailwind.config.*` file. |
| 4 | shadcn variable collisions | **Keep shadcn's generated variables as they are.** T2 maps them onto our tokens. |
| 5 | Dark mode | Keep shadcn's `.dark` block and `@custom-variant dark` as generated. T2 decides whether to keep or remove them. Remove create-next-app's `@media (prefers-color-scheme: dark)` block (see below). |
| 6 | Fonts | **Left to T2.** Do not change the `next/font` loading in `layout.tsx` in T1. |

---

## Placeholder home — `/`

Server component (`src/app/page.tsx`, no `"use client"`). It has one centred text block and no interactive elements.

### Desktop 1280 px (reference)

- `main` fills the viewport height under the root layout (`body` is already `min-h-full flex flex-col`). `main` is `flex-1` and centres its child both ways.
- One text block, centred, `max-w-xl` (576 px), `text-center`. It contains:
  1. `h1` "Chores For Me"
  2. `p` with the one-line note
- No header, footer, logo, images or CTAs. Those belong to T2/T4.
- Background is the `surface` token. The page has no section bands.

### Tablet 1024 px and 768 px

The layout is the same as desktop. The block is narrower than the viewport at both widths, so nothing changes apart from the side padding (`md:px-8` = 32 px from 768 up).

### Mobile 375 px

- The same single column with 16 px side padding (`px-4`), matching the mobile grid margins.
- `max-w-xl` collapses to the 343 px of available width. Text wraps (`text-balance` on the heading and the line). Nothing uses a fixed width, so there is **no horizontal scroll**.
- There is nothing to stack or hide, and no touch targets, because nothing is interactive.

### Component tree

```
RootLayout (existing, edited: src/app/layout.tsx) — imports "@/styles/globals.css"; metadata title/description; lang="en"; keeps next/font as is
└─ HomePage (existing, replaced: src/app/page.tsx) — no props
   └─ main
      └─ div (text block)
         ├─ h1
         └─ p
```

No new components. No shadcn primitives. Nothing from `src/components` is used, since the folder is empty in T1.

### Styling

Only token-backed or standard-scale Tailwind utilities. No raw hex values, no arbitrary `[...]` values and no inline styles.

| Element | Classes | Token or scale value |
| --- | --- | --- |
| `main` | `flex flex-1 flex-col items-center justify-center bg-surface text-ink font-sans px-4 py-16 md:px-8` | `--surface`, `--ink`, `--font-sans`; spacing 16 / 64 / 32 |
| text block | `flex w-full max-w-xl flex-col gap-3 text-center` | gap 12 |
| `h1` | `text-2xl font-semibold text-ink text-balance` | 24 px (h3 step of the type scale), weight 600 |
| `p` | `text-base font-normal text-ink-muted text-balance` | 16 px body, weight 400, `--ink-muted` |

Notes:
- The heading uses the 24 px step on purpose. The 44/32 px h1 sizes are not standard Tailwind sizes and have no token until T2 adds the type scale. Using them now would mean one-off sizes.
- Do not use `rounded-*`, `border-*` or shadcn colour utilities (`bg-background`, `bg-primary`, …) on this page. Until T2, those resolve to shadcn's values, not ours (see "Known collisions").

### States

Loading, empty, error and success do not apply: the page shows no data and makes no service calls. The page renders statically.

### Interaction details

There are no interactive elements, so there is no focus order, hover state or toast. The page has no transitions. `lang="en"` stays on `<html>`.

### Copy (new strings)

`src/lib/constants.ts` is a T3 file, so in T1 these strings stay inline in `page.tsx` and `layout.tsx`. They are temporary and get replaced in T4. They must not include any starter or "Create Next App" text.

| Where | String |
| --- | --- |
| `h1` | `Chores For Me` |
| `p` | `Our new website is under construction.` |
| `metadata.title` | `Chores For Me` |
| `metadata.description` | `Chores For Me connects customers with verified local workers for home chores.` |

---

## Token CSS — `src/styles/globals.css`

Move `src/app/globals.css` to `src/styles/globals.css`, and point `components.json` → `tailwind.css` at it before running `shadcn init`, so shadcn writes into the right file. Update the import in `layout.tsx` to `@/styles/globals.css`.

The file is ordered like this, top to bottom:

1. `@import "tailwindcss";` plus whatever shadcn init adds (`@import "tw-animate-css";`, `@custom-variant dark …`).
2. **shadcn `:root` and `.dark` blocks, as generated.** Do not edit them in T1.
3. **Our provisional tokens.** Add a separate `:root { … }` block with exactly the names and values from Tech Spec "Design tokens and components": `--brand`, `--brand-foreground`, `--brand-soft`, `--ink`, `--ink-muted`, `--surface`, `--surface-alt`, `--surface-dark`, `--border`, `--success`, `--warning`, `--danger`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--font-sans`. Mark it with a comment saying the values are provisional and T2 replaces them. Because this block comes after shadcn's, our `--border` value wins over shadcn's.
4. **`@theme inline` mapping.** Keep shadcn's generated mapping lines and add these:

   | Utility family | `@theme inline` line | Example utilities |
   | --- | --- | --- |
   | Brand | `--color-brand: var(--brand);` `--color-brand-foreground: var(--brand-foreground);` `--color-brand-soft: var(--brand-soft);` | `bg-brand`, `text-brand-foreground`, `bg-brand-soft` |
   | Ink | `--color-ink: var(--ink);` `--color-ink-muted: var(--ink-muted);` | `text-ink`, `text-ink-muted` |
   | Surface | `--color-surface: var(--surface);` `--color-surface-alt: var(--surface-alt);` `--color-surface-dark: var(--surface-dark);` | `bg-surface`, `bg-surface-alt`, `bg-surface-dark` |
   | Status | `--color-success: var(--success);` `--color-warning: var(--warning);` `--color-danger: var(--danger);` | `text-success`, `bg-warning`, `text-danger` |
   | Border | already generated by shadcn: `--color-border: var(--border);` | `border-border` |

5. shadcn's `@layer base` block, as generated.

**Remove** the create-next-app parts if init leaves them: the `:root { --background; --foreground }` block with hex values, the `@media (prefers-color-scheme: dark)` block, the `--font-sans: var(--font-geist-sans)` / `--font-mono` lines in `@theme inline`, and the `body { font-family: Arial, … }` rule. If these stayed, the page could turn dark from the OS setting and would ignore `--font-sans`.

**Font mapping:** do not add `--font-sans` to `@theme inline`. `--font-sans: var(--font-sans)` refers to itself and is invalid. Tailwind's own `font-sans` utility already reads `var(--font-sans)`, which picks up our `:root` token. Inter is not loaded until T2, so the page falls back to `system-ui`. That is expected.

### Known collisions (left for T2, no action in T1)

- `--radius-sm/md/lg`: shadcn writes `--radius-sm: calc(var(--radius) - 4px)` and similar lines into `@theme inline`. Inline theme values are written straight into the utilities, so `rounded-sm/md/lg` follow shadcn's `--radius`, not our tokens. Our `--radius-*` variables still exist in `:root`, but nothing reads them yet. T2 points them at our tokens. No T1 UI uses radius.
- `--border`: one name in both sets. Ours is declared later, so it wins (see step 3).
- shadcn semantic colours (`--background`, `--foreground`, `--primary`, `--ring`, …) keep shadcn's neutral values until T2 maps them onto `--surface`, `--ink`, `--brand` and the rest.

---

## Component folders

Create these empty folders, each with a `.gitkeep`. They hold no UI in T1.

| Folder | Will hold (ticket) |
| --- | --- |
| `src/components/ui/` | shadcn primitives, added by the first ticket that needs each one (T2+). Keep `.gitkeep` if init adds nothing. |
| `src/components/layout/` | `Header`, `Footer`, `AppShell`, `BottomNav`, `SideNav` (T2/T8) |
| `src/components/marketing/` | `Hero`, `CategoryTile`, `HowItWorks`, `TrustBlock`, `FAQAccordion`, `CTABand` (T4) |
| `src/components/flow/` | `Stepper`, `StepLayout`, `SelectableCard`, `AddressInput`, `PhotoUploader`, `PriceInput`, auth components (T5/T6/T9) |
| `src/components/job/` | `JobCard`, `JobDetail`, `StatusBadge`, `WorkerCard`, `ReviewSummary` (T6–T8) |
| `src/components/states/` | `LoadingState`, `EmptyState`, `ErrorState` (T2) |

Files go in kebab-case (`category-tile.tsx`) and export a PascalCase component, one per file.

---

## QA checks for this plan

- [ ] `/` shows "Chores For Me" and the one-line note, centred, at 1280, 1024, 768 and 375 px.
- [ ] No horizontal scroll at 375 px (`document.documentElement.scrollWidth === clientWidth`).
- [ ] The page stays light when the OS is in dark mode.
- [ ] `page.tsx` contains no raw hex, no arbitrary `[...]` classes and no inline `style`.
- [ ] `src/styles/globals.css` declares all 16 provisional token names with Tech Spec values, plus the `@theme inline` lines listed above. `bg-surface`, `text-ink` and `text-ink-muted` compile.
- [ ] The browser tab title is "Chores For Me". No "Create Next App" text appears anywhere.

## Open questions

1. **Radius tokens vs shadcn:** in T2, should `--radius-sm/md/lg` (8/12/20 px) replace shadcn's `calc(var(--radius) …)` lines in `@theme inline`, so that `rounded-*` reads our tokens? This plan assumes yes, but it does not affect T1.
2. **Meta description copy:** the description string above is a neutral placeholder, because neither spec gives home-page meta copy. T4 replaces it with the final copy. Is that acceptable for now?
