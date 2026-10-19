# T2 — UI plan (Design system)

Input: `01-product-plan.md`, including "Orchestrator decisions" (binding), plus the Tech Spec sections "Design tokens and components", "Responsive layouts" and "Screen states". This plan does not reopen those decisions.

Reference width 1280 px, then 1024, 768 and 375 px. Breakpoints are Tailwind's `sm 640 · md 768 · lg 1024 · xl 1280`. In this plan "mobile" means `< md`, "tablet" means `md` to `< lg`, and "desktop" means `lg` and up. Where 1024 and 1280 differ, the difference is stated.

---

## 0. Foundations (`src/styles/globals.css`, `src/app/layout.tsx`)

### 0.1 Token values (`:root`, declared once)

The values come from the product plan table, with orchestrator decision 2 applied:

| Token | Value |
| --- | --- |
| `--brand` | `#00ABF6` |
| `--brand-foreground` | `#333333` |
| `--brand-soft` | `#C7DAF5` |
| `--ink` | `#333333` |
| `--ink-muted` | `#4D4F52` |
| `--surface` | `#FFFFFF` |
| `--surface-alt` | `#F4F4F4` |
| `--surface-dark` | `#333333` (decision 2) |
| `--border` | `#DDDDDD` (also serves as shadcn's `--border`, declared once) |
| `--success` / `--warning` / `--danger` | `#16A34A` / `#D97706` / `#DC2626` |
| `--radius-sm/md/lg` | `8px / 12px / 20px` |
| `--font-sans` | `var(--font-poppins), system-ui, sans-serif` |

### 0.2 shadcn variable mapping (my choices for the open slots)

| shadcn | Token | Why |
| --- | --- | --- |
| `--background`, `--card`, `--popover` | `var(--surface)` | product plan |
| `--foreground`, `--card-foreground`, `--popover-foreground`, `--secondary-foreground`, `--accent-foreground` | `var(--ink)` | product plan |
| `--primary` / `--primary-foreground` | `var(--brand)` / `var(--brand-foreground)` | 4.9:1 |
| `--secondary` | **`var(--brand-soft)`** | Gives a soft brand tint to secondary buttons and the active nav pill. Ink on it is 8.9:1 |
| `--muted` / `--muted-foreground` | `var(--surface-alt)` / `var(--ink-muted)` | 7.5:1 |
| `--accent` | `var(--surface-alt)` | hover fills |
| `--destructive` | `var(--danger)` | |
| `--input` | **`var(--ink-muted)`** | 8.2:1 on surface, so it meets 1.4.11 |
| `--ring` | **`var(--ink)`** | 12.6:1 on surface, 11.5:1 on surface-alt, 4.9:1 on brand (decision 3) |
| `--radius` | `var(--radius-md)` | |

Delete the `.dark` block, every oklch value, the `--radius-*` calc lines and the `--chart-*` / `--sidebar-*` variables together with their `@theme` lines. **Keep** `@custom-variant dark (&:is(.dark *));`, which stays inert (decision 1).

### 0.3 Contrast-safe pairings (the only allowed foreground/background combinations)

| Surface (bg) | Text | Muted text | Icons / UI boundaries | Focus outline | Notes |
| --- | --- | --- | --- | --- | --- |
| `surface` #FFF | `ink` 12.6:1 | `ink-muted` 8.2:1 | `ink-muted` / `input` 8.2:1. `border` only for decorative dividers | `ring` (= ink) 12.6:1 | Brand never appears as text, icon or sole outline here |
| `surface-alt` #F4F4F4 | `ink` 11.5:1 | `ink-muted` 7.5:1 | `input` 7.5:1 | `ring` 11.5:1 | Dashboard main background, section bands |
| `brand` #00ABF6 (fills: primary button, logo tile, mobile CTA) | `brand-foreground` (#333) 4.9:1 | **none**: `ink-muted` is 3.2:1, so it is not allowed | `brand-foreground` | Outline sits on the surrounding surface with a 2 px offset, so the ring is measured against surface or surface-alt | **Never white text on brand** |
| `brand-soft` #C7DAF5 (secondary button, active nav pill, empty-state icon disc) | `ink` 8.9:1 | `ink-muted` 5.8:1 | `ink` | `ring` 8.9:1 | |
| `surface-dark` #333 (footer band, logo-on-dark preview) | `surface` 12.6:1 | `surface` only (no muted grey on dark) | `surface` | **`surface`** (white) 12.6:1, because an ink ring disappears here | Brand tile on dark is 4.9:1 (decorative) |
| `danger` (destructive button) | `surface` 4.8:1 | — | — | `ring` on the surrounding surface | `danger` as text on white: 4.8:1, allowed |
| `success`, `warning` | Not used as text or as fills under text in T2 | | Icons 16 px or larger only, with a text label beside them | | 3.3:1 and 3.2:1 |
| Disabled controls | `opacity-50` (WCAG exempts disabled controls) | | | | Never the only state signal: `disabled` attribute plus `aria-disabled` |

### 0.4 Type scale (Tailwind v4 `@theme`)

Reset the namespace with `--text-*: initial;`, then add only these steps. Utility names follow the spec's names:

| Utility | px / line-height | Role | Weight |
| --- | --- | --- | --- |
| `text-caption` | 12 / 16 | captions, BottomNav labels, meta | 400 |
| `text-body-sm` | 14 / 20 | secondary copy, small buttons, footer copyright | 400 (600 for labels) |
| `text-body` | 16 / 24 | default body, nav links, buttons | 400 / 600 |
| `text-h4` | 20 / 28 | card titles, state titles, logo wordmark | 600 |
| `text-h3` | 24 / 32 | sub-sections | 600 |
| `text-h2` | 32 / 40 | section headings (all widths) | 600 |
| `text-h1` | 44 / 52 | page title, desktop and tablet | 600 |

- **h1 is responsive:** `text-h2 md:text-h1` gives 32 px below 768 and 44 px from 768 up.
- **Weights:** reset with `--font-weight-*: initial;`, then `--font-weight-normal: 400; --font-weight-semibold: 600;`. Only `font-normal` and `font-semibold` exist. Generated primitives that use `font-medium` change to `font-semibold`.
- **Base layer (`@layer base`):** `html` gets `font-sans antialiased`. `body` gets `bg-surface text-ink text-body`. `h1` gets `text-h2 md:text-h1 font-semibold`, `h2` gets `text-h2 font-semibold`, `h3` gets `text-h3 font-semibold` and `h4` gets `text-h4 font-semibold`, all `text-ink`. Utilities override these where a component needs to.
- **Generated primitives** that use `text-xs`, `text-sm` or `text-base` are rewritten to `text-caption`, `text-body-sm` or `text-body`. After the reset those default classes would emit nothing, so any leftover one becomes a visible bug that QA can catch.
- **Font:** in `layout.tsx`, `Poppins({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-poppins", display: "swap" })`, with `className={poppins.variable}` on `<html>`. Geist and Geist_Mono are removed. No monospace font: token names on the styleguide use `font-sans`.

### 0.5 Spacing scale

Keep Tailwind's default `--spacing: 0.25rem` (4 px). Wiping it would also break `w-`, `h-` and `size-`. The allowed spacing steps for `p-*`, `m-*`, `gap-*`, `space-*`, `inset-*`, `top-*` and `bottom-*` are:

| Utility step | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16 | 24 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| px | 4 | 8 | 12 | 16 | 24 | 32 | 48 | 64 | 96 |

`0` and `px` (1 px borders) are also allowed. Any other step (`5`, `7`, `10` and so on) used for spacing is a QA finding.

**Component sizing allowlist** (`w-`, `h-`, `size-`). These are dimensions, not spacing: `4/5/6` for 16/20/24 px icons, `7` (28, logo mark), `10` (40, logo tile), `11` (**44, minimum touch target**), `12` (48), `14` (56), `16` (64, header and BottomNav height), `20` (80, icon-only SideNav), `24` (96), `60` (240, SideNav), `80` (320, right rail), plus `full`, `dvh` and fractions.

**Other theme values**

- `--container-content: 75rem;` gives `max-w-content` (1200 px).
- `--breakpoint-2xl: initial;` removes the 2xl breakpoint; sm/md/lg/xl are already 640/768/1024/1280.
- Radius uses `@theme inline` so no duplicate variables are emitted: `--radius-sm/md/lg: var(--radius-sm/md/lg)`, and `--radius-xl`, `--radius-2xl`, `--radius-3xl` and `--radius-4xl` all point at `var(--radius-lg)`. `rounded-full` (pills, discs) is allowed.
- One custom utility for iOS safe areas: `@utility pb-safe { padding-bottom: max(0.75rem, env(safe-area-inset-bottom)); }`. It is used by the mobile CTA bar and BottomNav, and it replaces any arbitrary `[...]` value.

### 0.6 Layout grid (`Container`)

The Tech Spec grid is 12 columns with 32 px gutters on desktop, 8 columns with 24 px gutters on tablet, and 4 columns with 16 px side margins on mobile.

- **`Container`:** an outer wrapper with `w-full px-4 md:px-6 lg:px-8` and an inner `mx-auto w-full max-w-content`. At 1280 the content is 1200 px wide with 40 px left on each side.
- **Grids inside it:** `grid grid-cols-4 gap-4 md:grid-cols-8 md:gap-6 lg:grid-cols-12 lg:gap-8`.

### 0.7 Focus-visible (global rule)

- **Base layer:** replace `* { @apply border-border outline-ring/50 }` with `* { @apply border-border }` and add `:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }`. Use an outline rather than a box-shadow ring so it survives Windows High Contrast.
- **Primitives:** remove shadcn's `focus-visible:ring-3 focus-visible:ring-ring/50` and replace it with `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`. **No `/50` alpha on the ring**, because it would drop below 3:1.
- **On `surface-dark`:** add `focus-visible:outline-surface`. This applies to the footer links and the inverse buttons.
- **Edge-to-edge items** (BottomNav cells, sheet menu rows): use `focus-visible:-outline-offset-2` so the outline is not clipped.
- **Mouse users** see no outline; only `:focus-visible` triggers it.

### 0.8 Motion

- Hover and colour changes use `transition-colors duration-150 motion-reduce:transition-none`.
- Spinners and skeleton pulses use `motion-safe:animate-spin` and `motion-safe:animate-pulse`.
- The Sheet keeps the Radix/tw-animate slide (about 200 ms) and loses the animation when reduced motion is set (`motion-reduce:animate-none`).
- Nothing delays the first action.

### 0.9 z-index

| Layer | z-index |
| --- | --- |
| Sticky Header and AppShell mobile top bar | `z-40` |
| Mobile CTA bar and BottomNav | `z-40` |
| Sheet overlay and content (shadcn default) | `z-50` |

---

## 1. Primitives (`src/components/ui/*`, via `shadcn add`)

Only **button, sheet, separator and skeleton** are added. No tooltip (see Open question 2).

### Button (`button.tsx`)

All variants share `inline-flex items-center justify-center gap-2 rounded-md font-semibold whitespace-nowrap transition-colors`, the focus rule from 0.7, `disabled:opacity-50 disabled:pointer-events-none`, and icons at `size-5`.

| Variant | Classes | Contrast |
| --- | --- | --- |
| `default` (brand) | `bg-brand text-brand-foreground hover:bg-brand/90` | 4.9:1. The 90% hover is lighter, so contrast goes up |
| `secondary` | `bg-brand-soft text-ink hover:bg-brand-soft/80` | 8.9:1 |
| `outline` | `border border-input bg-surface text-ink hover:bg-surface-alt` | border 8.2:1 |
| `ghost` | `text-ink hover:bg-surface-alt` | |
| `link` | `text-ink underline underline-offset-4 decoration-1 hover:decoration-2`, no fixed height (`h-auto px-0`), but `min-h-11` when used standalone | decision 3 |
| `destructive` | `bg-danger text-surface hover:bg-danger/90` | 4.8:1 |
| `inverse` (**new variant**, needed for footer app links on `surface-dark`) | `border border-surface bg-transparent text-surface hover:bg-surface hover:text-ink focus-visible:outline-surface` | 12.6:1 |

| Size | Classes | Height |
| --- | --- | --- |
| `sm` | `h-11 px-4 text-body-sm` | 44 |
| `default` | `h-12 px-6 text-body` | 48 |
| `lg` | `h-14 px-8 text-body` | 56 |
| `icon` | `size-11` | 44 |
| `icon-lg` | `size-12` | 48 |

Remove the generated `xs`, `icon-xs` and `icon-sm` sizes, because they are under 44 px.

**`loading` prop:** `loading?: boolean`. When true, it renders `<Loader2 className="size-5 motion-safe:animate-spin" aria-hidden />` before the children, sets `disabled` and `aria-busy="true"`, and keeps the button's width. The caller passes the loading label (for example "Posting your job…"). It is ignored with `asChild`.

### Sheet (`sheet.tsx`)

- Overlay is `bg-ink/50` (replaces `bg-black/*`). Content is `bg-surface text-ink`, side `right`, `w-full sm:max-w-sm`, with `p-4 md:p-6`.
- The close button is `size-11` (ghost icon) at the top right, with sr-only label "Close menu" taken from constants.
- `SheetTitle` uses `text-h4`. Every sheet needs a title, which can be `sr-only`.
- Any `shadow-*` in the primitive is left as generated. No new shadows are introduced anywhere.

### Separator (`separator.tsx`)

- `bg-border` (decorative only, `decorative` prop true).
- On dark it uses `bg-surface/20`, a token with alpha (still decorative).

### Skeleton (`skeleton.tsx`)

- `rounded-md bg-border motion-safe:animate-pulse`.
- Use `bg-border` rather than shadcn's `bg-muted`, because `muted` equals `surface-alt` and would be invisible on the dashboard background.

---

## 2. Logo — sub-part (`src/components/layout/logo.tsx`, server)

**Props**

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `'lockup' \| 'mark' \| 'responsive'` | `'lockup'` |
| `tone` | `'onLight' \| 'onDark'` | `'onLight'` |
| `size` | `'md' \| 'xl'` | `'md'` |
| `href` | `string \| null` | `'/'` |

**Markup:** a `Link` containing a `span` tile and a wordmark `span`.

**Tile**

- `md` size: `size-10 rounded-md bg-brand flex items-center justify-center`, with `next/image` `src="/brand/logo-mark-white.png" width={28} height={28} alt=""` inside a `size-7` box.
- `xl` size (styleguide only): `size-24 rounded-lg` tile with a 64 px mark (`size-16`).
- A styleguide-only `tileTone="dark"` gives a `bg-surface-dark` tile; this is the "mark alone on surface-dark" case.

**Wordmark:** "Chores For Me", `text-h4 font-semibold`. `onLight` uses `text-ink`; `onDark` uses `text-surface`. Gap `gap-3`.

**Variants**

- `mark` gives the wordmark `sr-only`.
- `responsive` gives it `sr-only lg:not-sr-only`, which the SideNav uses.

The accessible name always comes from the real text. The link is `inline-flex items-center min-h-11 rounded-md`, and on dark it adds `focus-visible:outline-surface`. With `href={null}` it renders a `span` instead (for styleguide swatches).

---

## 3. Header — used on marketing pages (wired in T4), shown on `/styleguide`

### Desktop 1280 px (reference), and 1024

- `header` with `sticky top-0 z-40 h-16 bg-surface border-b border-border`, wrapping a `Container` with `flex h-full items-center justify-between gap-8`.
- **Left group** (`flex items-center gap-8`): `Logo` (lockup), then `nav aria-label="Main"` containing a `ul` with `flex gap-2` and the items **Services** (`/#services`), **How it works** and **For workers**.
- **Right group** (`flex items-center gap-2`):
  - **Log in**: `Button variant="ghost" size="sm"`, so it reads as tertiary.
  - **Sign up**: `Button variant="outline" size="sm"` (decision 12).
  - **Post a job**: `Button variant="default" size="sm"`.
- **Width check at 1024:** the content is 960 px wide. The logo is about 190 px, the nav about 360 px, the right group about 330 px, plus the gaps, so it fits.
- **Nav link styling:** `inline-flex h-11 items-center px-3 rounded-md text-body text-ink hover:underline underline-offset-4`. No brand-coloured text. "Download" does not appear in the header.

### Tablet 768 px (`md` to `< lg`)

- `Logo` sits on the left.
- On the right: **Post a job** (`default`, `sm`), which stays visible, then the menu button (`ghost`, `icon`, `size-11`, lucide `Menu`, with accessible name "Open menu").
- Services, How it works, For workers, Log in and Sign up move into the menu **Sheet**.

### Mobile 375 px

- `Logo` (lockup, still fits: about 190 px plus the 44 px button within a 343 px content width) and the menu button. The header Post a job is hidden (`hidden md:inline-flex`) because it moves to the bar below.
- **Sticky "Post a job" bar:** `MobileCtaBar` (section 3a) is fixed to the bottom of the viewport.
- Header height stays at 64 px (`h-16`).

### Menu sheet (tablet and mobile; `header-menu.tsx`, client)

- `SheetTitle` "Menu" (sr-only).
- **Top row:** `Logo` with `href="/"`, plus the close button.
- **Nav list:** `nav aria-label="Main"`, `ul` with `flex flex-col gap-1 mt-6`. Each item is `SheetClose asChild` around a `Link` with `flex h-12 items-center px-4 rounded-md text-body font-semibold text-ink hover:bg-surface-alt focus-visible:-outline-offset-2`.
- `Separator` with `my-6`.
- **Stacked actions** (`flex flex-col gap-3`), each `w-full` and wrapped in `SheetClose`:
  - Log in (`outline`, `default` size)
  - Sign up (`secondary`, `default` size)
  - Post a job (`default`, `default` size)

  Log in uses outline in the sheet because a ghost button at full width loses its affordance.
- **Behaviour:** Radix traps focus, Esc and the overlay click close the sheet, and focus returns to the trigger. Choosing a link closes the sheet.

### 3a. MobileCtaBar (`src/components/layout/mobile-cta-bar.tsx`, server)

- Fixed bar: `fixed inset-x-0 bottom-0 z-40 md:hidden bg-surface border-t border-border px-4 pt-3 pb-safe`.
- Content: `Button asChild variant="default" size="default" className="w-full"` linking to `/post-job/category`, with a `Plus` icon and the label "Post a job". The bar is 72 px tall plus the safe area.
- **Placement decision:** `Footer` renders it as its last child (prop `showMobileCta`, default `true`). This puts the bar last in DOM order, so the focus order stays logical (it is visually and logically the last item), and the bottom clearance stays in the same component. The Footer adds `pb-24 md:pb-12` (96 px on mobile) so the bar never covers the copyright line. T4 needs to do nothing extra.

### Component tree

```
Header (new: src/components/layout/header.tsx, server) — props: preview?: boolean
├─ SkipLink (new: src/components/layout/skip-link.tsx) — targetId="main"
├─ Container (new: src/components/layout/container.tsx)
│  ├─ Logo (new) — variant="lockup"
│  ├─ nav.hidden lg:block — HEADER_NAV from constants (Link × 3)
│  ├─ div.hidden lg:flex — Button ghost "Log in", Button outline "Sign up", Button default "Post a job"
│  ├─ Button default sm "Post a job" — className="hidden md:inline-flex lg:hidden"
│  └─ HeaderMenu (new: src/components/layout/header-menu.tsx, "use client") — lg:hidden
│     └─ Sheet / SheetTrigger (Button ghost icon) / SheetContent (nav + actions)
Footer … └─ MobileCtaBar (new: src/components/layout/mobile-cta-bar.tsx)
```

**`preview` prop** (styleguide only) switches `sticky` to `relative`. It is passed through to `MobileCtaBar` as well, where it switches `fixed` to `static` and drops `md:hidden`.

### Interaction

- **SkipLink:** `sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:z-50 bg-surface text-ink px-4 h-11 inline-flex items-center rounded-md`, with the label "Skip to main content". Pages must give `main` the attribute `id="main"`. T4 is noted for this.
- **Focus order**
  - Desktop: skip link, Logo, Services, How it works, For workers, Log in, Sign up, Post a job.
  - Tablet: skip link, Logo, Post a job, Menu.
  - Mobile: skip link, Logo, Menu, … page …, footer, CTA bar.
- No hover-only actions.

---

## 4. Footer — `src/components/layout/footer.tsx` (server)

Props: `showMobileCta?: boolean` (default `true`) and `preview?: boolean`.

### Desktop 1280 px (reference), and 1024

- `footer` with `bg-surface-dark text-surface`, wrapping a `Container` with `pt-16 pb-12`.
- **Row 1** is a 12-column grid with `gap-8`:
  - **Brand**, `col-span-4`: `Logo tone="onDark"`, then the tagline in `mt-4 text-body-sm text-surface`. The tagline reuses the site description "Chores For Me connects customers with verified local workers for home chores."
  - **Get the app**, `col-span-3`: `h2` "Get the app" (`text-body font-semibold`), then two `Button asChild variant="inverse" size="sm"` links stacked with `flex flex-col gap-3 items-start`: "Customer app on Google Play" and "Worker app on Google Play". The hrefs are placeholders (`#`) from constants (decision 11) and open with `target="_blank" rel="noopener"` once the real URLs exist. Each link has a lucide `Smartphone` icon.
  - **Support**, `col-span-3`: `h2` "Support", then a `mailto:support@choresforme.com` link.
  - **Legal**, `col-span-2`: `h2` "Legal", then **Privacy Policy** (`/privacy`) and **Terms** (`/terms`).
- **Link lists:** a `ul` with `mt-4 flex flex-col gap-1`. Each link is `inline-flex min-h-11 items-center text-body text-surface underline-offset-4 hover:underline focus-visible:outline-surface`. In a nav-list context, links are not underlined at rest.
- **Row 2:** `Separator` (`bg-surface/20`, `my-8`), then "© {year} Chores For Me. All rights reserved." in `text-body-sm text-surface`. The year comes from `new Date().getFullYear()`.
- The column group is wrapped in `nav aria-label="Footer"`.

### Tablet 768 px

- 8-column grid with `gap-6`.
- Brand takes `col-span-8` on the first row.
- Get the app takes `col-span-3`, Support `col-span-3` and Legal `col-span-2`.

### Mobile 375 px

- Single column, `grid-cols-1 gap-8`, `pt-12`, and `pb-24` when `showMobileCta` is true (otherwise `pb-12`).
- The app buttons become full width (`w-full`, `h-11`) and their text fits within 343 px.
- Every link row is `min-h-11`. Nothing is removed.

### Component tree

```
Footer (new, server)
├─ Container
│  ├─ Logo tone="onDark"
│  ├─ nav[aria-label=Footer] > 3 × (h2 + ul of Link / Button inverse)
│  ├─ Separator (ui) — bg-surface/20
│  └─ p copyright
└─ MobileCtaBar (when showMobileCta)
```

---

## 5. AppShell, SideNav and BottomNav — dashboards (wired in T8/T10), shown on `/styleguide`

### AppShell props

| Prop | Type | Notes |
| --- | --- | --- |
| `role` | `Role` | |
| `children` | | |
| `rail` | `ReactNode`, optional | |
| `railLabel` | `string` | Required when `rail` is set (aria-label for the `aside`) |
| `activeHref` | `string`, optional | Override; otherwise `usePathname()` |
| `preview` | `boolean`, optional | |

The nav items are looked up **inside** the client nav components from `NAV_ITEMS[role]`. Lucide icon components cannot be passed as props from a server component to a client component, so AppShell passes only `role`.

### Desktop 1280 px (reference)

```
div.flex min-h-dvh bg-surface-alt
├─ SkipLink
├─ SideNav (full, w-60, sticky top-0 h-dvh, bg-surface border-r border-border)
└─ div.flex-1 min-w-0 flex flex-col
   └─ div.flex flex-1 flex-col xl:flex-row
      ├─ main#main tabIndex=-1 .flex-1 min-w-0 p-8 > div.mx-auto max-w-content
      └─ aside[aria-label=railLabel] (only if rail) .xl:w-80 xl:shrink-0 xl:sticky xl:top-0 xl:h-dvh xl:overflow-y-auto xl:bg-surface xl:border-l xl:border-border xl:p-6
```

- At 1280 the main column is about 720 px wide (1280 − 240 − 320).
- **SideNav (full)**, `flex flex-col`:
  - **Top:** `h-16 px-6 flex items-center`, containing `Logo variant="responsive"`.
  - **Customer only:** `px-4 pt-2`, then **Post a job** as `Button default` with `w-full` and a `Plus` icon. This is the persistent customer CTA.
  - **Nav:** `nav aria-label="Dashboard"` with `px-4 py-4`, then a `ul` with `flex flex-col gap-1`.
- **Nav item**
  - Base: `flex h-12 items-center gap-3 px-3 rounded-md text-body`, icon `size-5`.
  - Inactive: `text-ink-muted hover:bg-surface-alt hover:text-ink`.
  - Active: `bg-brand-soft text-ink font-semibold`, with `aria-current="page"`. The active state is not shown by colour alone: it changes weight and text colour too (ink-muted to ink).
  - Matching: `exact` for `/dashboard` and `/worker/dashboard`, `prefix` for the rest. `/dashboard/jobs/123` marks "Jobs".

### 1024 px (`lg` to `< xl`)

- Full SideNav (240 px). **No rail column**: the `rail` content stacks **below** the main content in the same column (`px-8 pb-8`, inner `mx-auto max-w-content`). The main column is 784 px wide.
- **Why the rail starts at `xl`:** a 240 + 320 px chrome at 1024 would leave a 400 px main column. The Tech Spec defines only 1280 (rail) and 768 (no rail), so I put the switch at `xl`.

### Tablet 768 px (`md` to `< lg`)

- **SideNav icon-only**, `w-20`:
  - The logo becomes the mark only.
  - The item labels become `sr-only`, and each item is `size-12 justify-center mx-auto`.
  - The customer Post a job becomes `Button size="icon-lg"` with a `Plus` icon. Its label is `sr-only`, so the accessible name is still "Post a job".
- Each icon-only item also gets `title={label}` as a hover hint (see Open question 2).
- Responsive mode uses `sr-only lg:not-sr-only` on the labels, so one component covers both widths.
- No rail column; the rail content is below main (`p-6`). Main uses `p-6`.

### Mobile 375 px

- SideNav is `hidden md:flex`.
- **Mobile top bar** (inside AppShell, `md:hidden`): `header` with `sticky top-0 z-40 h-16 bg-surface border-b border-border px-4 flex items-center justify-between`.
  - Left: `Logo` (lockup).
  - Right, customer only: **Post a job** as `Button default sm` with a `Plus` icon. This keeps the persistent CTA reachable.
- **Main:** `px-4 py-6`, with the rail content below it. The wrapper has `pb-24` so the BottomNav never covers the last content.
- **BottomNav** (`bottom-nav.tsx`, client): `nav aria-label="Dashboard"` with `fixed inset-x-0 bottom-0 z-40 md:hidden bg-surface border-t border-border pb-safe`, then a `ul` with `grid grid-cols-4`.
  - Each item is a `Link` with `flex h-16 flex-col items-center justify-center gap-1 text-caption focus-visible:-outline-offset-2`. The cell is about 94 × 64 px, so it meets the 44 px target.
  - The icon sits in a `h-8 w-16 rounded-full flex items-center justify-center` pill. When active, the pill is `bg-brand-soft`, the label is `text-ink font-semibold` and the link has `aria-current="page"`. When inactive, the label is `text-ink-muted`.
  - Labels are always visible.
- **Navigation per role** (decision 6 for Jobs)

  | Role | Label | Icon | Route |
  | --- | --- | --- | --- |
  | Customer | Home | `House` | `/dashboard` |
  | Customer | Jobs | `ClipboardList` | `/dashboard/jobs` |
  | Customer | History | `History` | `/dashboard/history` |
  | Customer | Account | `UserRound` | `/dashboard/account` |
  | Worker | Jobs | `ClipboardList` | `/worker/dashboard` |
  | Worker | My Jobs | `BriefcaseBusiness` | `/worker/dashboard/my-jobs` |
  | Worker | Earnings | `Wallet` | `/worker/dashboard/earnings` |
  | Worker | Account | `UserRound` | `/worker/dashboard/account` |

### Component tree

```
AppShell (new: src/components/layout/app-shell.tsx, server)
├─ SkipLink
├─ SideNav (new: src/components/layout/side-nav.tsx, "use client") — role, mode?: 'responsive'|'full'|'icon', activeHref?, preview?
│  ├─ Logo variant="responsive" (or forced by mode)
│  ├─ Button "Post a job" (customer)
│  └─ nav > ul > Link × 4 (NAV_ITEMS[role])
├─ header (mobile top bar, inline in AppShell) — Logo + Button "Post a job" (customer)
├─ main#main — children
├─ aside — rail
└─ BottomNav (new: src/components/layout/bottom-nav.tsx, "use client") — role, activeHref?, preview?
Helper: src/components/layout/is-nav-active.ts — isNavActive(pathname, item) (shared by SideNav and BottomNav)
```

**`preview` mode:**

- SideNav switches `sticky h-dvh` to `relative self-stretch`.
- BottomNav switches `fixed` to `static` and drops `md:hidden`.
- AppShell switches `min-h-dvh` to `min-h-0`. The mobile top bar stays visible only below `md`, as usual.

### Interaction

- **Focus order:** skip link, logo, Post a job (customer), the 4 nav items, main, rail. On mobile it is: top bar, main, rail, BottomNav.
- Hover fills are desktop only; every action is also a visible link.
- The client components exist only for `usePathname()`.

---

## 6. State components (`src/components/states/*`)

All three render inside whatever container the screen gives them and use `w-full`.

### LoadingState (`loading-state.tsx`, server)

**Props**

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `'cards' \| 'rows' \| 'detail' \| 'summary'` | — |
| `count` | `number` | 3 for cards, 5 for rows |
| `label` | `string` | "Loading…" |

**Wrapper:** `div role="status" aria-live="polite" aria-busy="true"` containing `<span className="sr-only">{label}</span>`. The skeleton blocks are `aria-hidden`.

**Variants** (all match the final layouts from the Responsive table)

- **`cards`** (job cards, worker cards): `grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3`. Each card is `bg-surface border border-border rounded-lg p-6 flex flex-col gap-3` containing `Skeleton h-6 w-2/3`, `h-4 w-1/2`, `h-4 w-full`, and `h-11 w-1/3 mt-3` (the button).
- **`rows`** (History, My Jobs, templates): `bg-surface border border-border rounded-lg divide-y divide-border`. Each row is `flex items-center gap-4 px-4 py-4 md:px-6`, with:
  - `Skeleton size-11 rounded-full`
  - a `flex-1` column of `h-4 w-1/3` and `h-4 w-1/4` (`gap-2`)
  - `h-4 w-16` on the right
- **`detail`** (job detail): `flex flex-col gap-6 lg:flex-row`.
  - Left (`flex-1`): `h-8 w-1/2`, then a `bg-surface rounded-lg border p-6` block of 4 lines.
  - Right (`lg:w-80`): a card with `size-12 rounded-full`, 2 lines and an `h-12 w-full` button. It stacks on top at md (actions at the top, per the Job detail layout) and below on mobile.
- **`summary`** (Earnings): a `grid gap-4 md:grid-cols-3` of 3 tiles (`bg-surface rounded-lg border p-6`: `h-4 w-1/2` and `h-8 w-2/3`), then the `rows` variant with 3 rows (`mt-8`).

### EmptyState (`empty-state.tsx`, server)

**Props**

| Prop | Type | Default |
| --- | --- | --- |
| `icon` | `LucideIcon` | `Inbox` |
| `title` | `string` | — |
| `description` | `string`, optional | — |
| `action` | `ReactNode`, optional | — (a `Button`) |
| `headingLevel` | `2 \| 3` | `2` |

**Layout:** `bg-surface border border-border rounded-lg px-6 py-12 md:py-16`, with an inner `mx-auto max-w-md flex flex-col items-center text-center`.

- Icon disc: `size-12 rounded-full bg-brand-soft text-ink flex items-center justify-center`, with the icon at `size-6` and `aria-hidden`.
- Title: `mt-4 text-h4 font-semibold text-ink`.
- Description: `mt-2 text-body text-ink-muted`.
- Action: `mt-6`, `w-full sm:w-auto`.

**Mobile:** `px-4 py-12`, and the action becomes full width.

### ErrorState (`error-state.tsx`, "use client")

**Props**

| Prop | Type | Default |
| --- | --- | --- |
| `title` | `string`, optional | "Something went wrong" |
| `message` | `string`, optional | "We couldn't load this right now. Please try again." |
| `onRetry` | `() => void` | required |
| `isRetrying` | `boolean`, optional | — |
| `retryLabel` | `string`, optional | "Retry" |
| `secondaryAction` | `ReactNode`, optional | — |
| `headingLevel` | `2 \| 3` | `2` |

**Layout:** the same card as EmptyState, with `role="alert"` on the wrapper.

- Icon disc: `size-12 rounded-full bg-surface-alt`, with `CircleAlert size-6 text-danger`. The icon is non-text at 4.8:1.
- Title: `text-h4 text-ink`. The title is **not** red text.
- Message: `text-ink-muted`.
- Actions row: `mt-6 flex flex-col gap-3 w-full sm:flex-row sm:w-auto sm:justify-center`.
  - **Retry:** `Button default` with a `RotateCw` icon, `loading={isRetrying}` and the label "Retrying…" while it runs.
  - The secondary action (for example "Back to dashboard") uses `Button outline`.
- ErrorState never moves focus; `role="alert"` announces it.

---

## 7. `/styleguide` — `src/app/styleguide/page.tsx`

**Metadata:** `title: "Styleguide · Chores For Me"` and `robots: { index: false, follow: false }`. It is linked from nowhere (decision 10). The page is a server component with small client islands.

### Desktop 1280 px (reference)

- No product Header on the page itself. The Header is shown only inside a preview frame.
- **Page top:** `Container` with `py-12`, containing `Logo` and an `h1` "Styleguide" (`text-h2 md:text-h1`). Under it, a `p text-body text-ink-muted` explains: "Every design token and shared component. Resize the window to check 1024, 768 and 375 px."
- **Body:** a `Container` with `flex gap-12 pb-24`.
  - **TOC** (`styleguide-toc.tsx`, server): `aside` with `hidden lg:block w-60 shrink-0`, containing a `nav aria-label="Styleguide sections"` with `sticky top-8`. Its links are `flex h-11 items-center px-3 rounded-md text-body-sm text-ink hover:bg-surface-alt`. Sections: 1 Brand · 2 Colours · 3 Typography · 4 Spacing and layout · 5 Primitives · 6 Header and Footer · 7 App shell · 8 States.
  - **Content:** `main#main` with `flex-1 min-w-0`. Each section is `section id aria-labelledby`, with an `h2` (`text-h2`) and an intro in `text-body text-ink-muted mt-2`, and its content at `mt-8`. Sections are separated by `Separator my-16`.
- **Frame** (`_components/preview-frame.tsx`): a caption (`text-body-sm font-semibold text-ink`, `mb-3`), then `rounded-lg border border-input overflow-hidden`. A `bg` prop picks `surface` or `surface-alt`. The frame contains only the components passed in `preview` mode.

**Sections**

1. **Brand:** `grid gap-6 md:grid-cols-3`.
   - (a) The lockup on `surface`: a `rounded-lg border border-border p-8` tile.
   - (b) The lockup `tone="onDark"` on a `bg-surface-dark rounded-lg p-8` tile.
   - (c) The mark alone at `size="xl"`, shown twice: on a `brand` tile and on a `surface-dark` tile.
   - Each tile has a `text-body-sm text-ink-muted` caption, except on dark, where the caption sits outside the tile.
2. **Colours:** `grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4`, with 12 `Swatch` cards.
   - Each card is `rounded-lg border border-border overflow-hidden`. A colour block `h-24` uses the token's own `bg-*` class (`bg-brand` … `bg-border`), with `border-b border-border` so white is visible. Below it, the body (`p-4`) shows:
     - the token name (`text-body font-semibold`)
     - the hex value (`text-body-sm text-ink-muted`)
     - its intended use (`text-body-sm`)
     - an "Aa" chip showing the approved foreground pairing from 0.3, with its ratio (for example "Aa 4.9:1" in `text-brand-foreground` on `bg-brand`)
   - Below the swatches: the **shadcn alias list** as a `dl` with `grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2`, each row "`--primary` → `--brand`". This avoids a table and so avoids horizontal scroll at 375.
3. **Typography:** a list with rows of `flex flex-col gap-2 md:flex-row md:items-baseline md:gap-8 py-4 border-b border-border`.
   - Left (`md:w-40 shrink-0`): `text-body-sm text-ink-muted`, showing for example "h1 · 44 px (32 on mobile) · `text-h2 md:text-h1`".
   - Right: a sample sentence in that step.
   - Then the weights row ("Regular 400" and "Semibold 600") and the family ("Poppins").
4. **Spacing and layout**
   - **Spacing:** 9 rows of label "16 px · `4`" (`w-24`) and a bar `h-4 bg-brand rounded-sm` with width `w-1 … w-24`. This is a decorative fill, so brand is allowed.
   - **Radii:** three `size-24 bg-brand-soft border border-input` tiles, `rounded-sm/md/lg`, labelled.
   - **Breakpoints and max width:** a `dl` list.
   - **Live grid demo:** 12 cells of `h-12 rounded-sm bg-brand-soft` in `grid grid-cols-4 gap-4 md:grid-cols-8 md:gap-6 lg:grid-cols-12 lg:gap-8`. Cells 5 to 12 are `hidden md:block` and cells 9 to 12 are `hidden lg:block`. The caption names the current column count per breakpoint.
   - **Touch target:** a `size-11 rounded-md border-2 border-dashed border-input` box labelled "44 × 44 px minimum".
5. **Primitives**
   - **Button matrix:** rows per variant, `flex flex-wrap gap-4 items-center`. For each variant it shows `sm`, `default` and `lg`, plus `icon`, `disabled` and `loading` ("Posting your job…"). The `inverse` row sits on a `bg-surface-dark rounded-lg p-6` panel.
   - Separator: horizontal, and vertical inside an `h-12 flex` row.
   - Skeleton samples.
   - **Sheet demo** (`_components/sheet-demo.tsx`, client): an "Open sheet" outline button that opens a right sheet with a title, body text and a close button.
6. **Header and Footer:** frames containing `<Header preview />` and `<Footer preview />`.
   - With `preview`, Footer renders `MobileCtaBar preview` inside the frame at every width, captioned "Mobile only (< 768 px): sticky Post a job bar". Nothing on the real page is fixed.
   - The Header frame caption says "Resize to see the tablet menu (768–1023) and mobile layout (< 768)".
7. **App shell**
   - Two frames, "Customer" and "Worker", each `<AppShell role preview activeHref={first item}>`, with sample children: a `LoadingState variant="cards" count={2}` and an `EmptyState`. The Customer frame also passes a rail ("Templates" placeholder card) to show the rail and its stacking.
   - Next, `SideNav mode="full"` and `SideNav mode="icon"` side by side (`flex gap-6 flex-wrap`, each in a frame with `bg-surface`).
   - Then `BottomNav preview` for each role, at all widths.
   - **No fixed or sticky element escapes a frame.** Every positioned piece is in preview mode.
8. **States**
   - LoadingState: all 4 variants, each in a `bg-surface-alt p-6` frame.
   - EmptyState: one with an action ("Post a job" `Button` linking to `/post-job/category`) and one without.
   - **ErrorState demo** (`_components/error-state-demo.tsx`, client):
     - Retry sets `isRetrying` for about 800 ms.
     - It then swaps to a `p role="status"` reading "Loaded (demo only — no service call)", with a "Show error again" ghost button.
     - No service call is made.

### Tablet 768 px and 1024 px

- **At 1024:** same as desktop, with the TOC still shown. The content column is about 712 px wide.
- **At 768:** the TOC aside is hidden and replaced by an **inline TOC** under the page intro. It is `nav` with `flex flex-wrap gap-2`; each link is a `h-11 px-4 rounded-full border border-input inline-flex items-center text-body-sm` chip. It wraps, so it never scrolls.
- Brand tiles are 3 columns at md. Swatches are 3 columns. Frames are full width.

### Mobile 375 px

- Everything is a single column: inline TOC chips wrap; the Brand tiles stack; swatches are 2 columns (163 px each); the typography rows stack; the button matrix wraps.
- Long token names use `break-words`.
- No horizontal scroll, because every row is `flex-wrap` or `grid`.
- The shell previews show the mobile top bar plus the BottomNav (static) inside the frame.

### Component tree

```
StyleguidePage (new: src/app/styleguide/page.tsx, server)
├─ Container
│  ├─ Logo, h1, intro
│  ├─ StyleguideToc (new: src/app/styleguide/_components/styleguide-toc.tsx) — variant: 'sidebar' | 'inline'
│  └─ main#main
│     ├─ SgSection (new: _components/sg-section.tsx) — id, title, intro, children
│     ├─ Swatch (new: _components/swatch.tsx) — token data
│     ├─ PreviewFrame (new: _components/preview-frame.tsx) — caption, bg
│     ├─ SheetDemo (new: _components/sheet-demo.tsx, client)
│     ├─ ErrorStateDemo (new: _components/error-state-demo.tsx, client)
│     └─ Header / Footer / AppShell / SideNav / BottomNav / LoadingState / EmptyState / ErrorState / ui/* (preview props)
Data: src/app/styleguide/_data/tokens.ts — swatch list (name, display hex string, use, pairing, ratio), alias list, type-scale list, spacing list
```

The hex values appear here **only as display strings**, never as styles. They document `globals.css`; they are not product copy.

---

## 8. Full new-file list

```
src/styles/globals.css                         (edit)
src/app/layout.tsx                             (edit: Poppins)
src/app/favicon.ico                            (replace with public/brand/favicon.ico)
src/lib/types.ts                               (new: Role only — decision 4)
src/lib/constants.ts                           (new: nav + layout + state copy — decision 4)
src/components/ui/button.tsx | sheet.tsx | separator.tsx | skeleton.tsx
src/components/layout/container.tsx            (new sub-part: the 0.6 wrapper used by Header, Footer, styleguide and every T4 section)
src/components/layout/logo.tsx
src/components/layout/skip-link.tsx            (new sub-part: keyboard skip link for Header and AppShell)
src/components/layout/header.tsx
src/components/layout/header-menu.tsx          ("use client")
src/components/layout/mobile-cta-bar.tsx
src/components/layout/footer.tsx
src/components/layout/app-shell.tsx
src/components/layout/side-nav.tsx             ("use client")
src/components/layout/bottom-nav.tsx           ("use client")
src/components/layout/is-nav-active.ts
src/components/states/loading-state.tsx
src/components/states/empty-state.tsx
src/components/states/error-state.tsx          ("use client")
src/app/styleguide/page.tsx + _components/* + _data/tokens.ts
```

## 9. New strings for `src/lib/constants.ts`

**Brand and accessibility labels**

- `BRAND_NAME`: "Chores For Me"
- `BRAND_TAGLINE`: "Chores For Me connects customers with verified local workers for home chores."
- `A11Y.skipToContent`: "Skip to main content"
- `A11Y.openMenu`: "Open menu"
- `A11Y.closeMenu`: "Close menu"
- `A11Y.menuTitle`: "Menu"
- `A11Y.mainNav`: "Main"
- `A11Y.footerNav`: "Footer"
- `A11Y.dashboardNav`: "Dashboard"

**Header**

- `HEADER_NAV`:
  - Services → `/#services`
  - How it works → `/how-it-works`
  - For workers → `/workers`
- `HEADER_ACTIONS`:
  - Log in → `/login`
  - Sign up → `/signup`
  - Post a job → `/post-job/category`

**Footer**

- `FOOTER.appHeading`: "Get the app"
- `FOOTER.supportHeading`: "Support"
- `FOOTER.legalHeading`: "Legal"
- `FOOTER.customerAppLabel`: "Customer app on Google Play"
- `FOOTER.workerAppLabel`: "Worker app on Google Play"
- `PLAY_STORE_CUSTOMER_URL_PLACEHOLDER`: `#`
- `PLAY_STORE_WORKER_URL_PLACEHOLDER`: `#`
- `SUPPORT_EMAIL`: "support@choresforme.com"
- `FOOTER.privacy`: "Privacy Policy" → `/privacy`
- `FOOTER.terms`: "Terms" → `/terms`
- `FOOTER.copyright(year)`: "© {year} Chores For Me. All rights reserved."

**Dashboard navigation**

- `NAV_ITEMS.customer` and `NAV_ITEMS.worker`: label, href, icon and match, as in the table in section 5.

**State copy**

- `STATE_COPY.loading`: "Loading…"
- `STATE_COPY.errorTitle`: "Something went wrong"
- `STATE_COPY.errorMessage`: "We couldn't load this right now. Please try again."
- `STATE_COPY.retry`: "Retry"
- `STATE_COPY.retrying`: "Retrying…"
- `STATE_COPY.submittingExample`: "Posting your job…" (from the Payment screen state)

**Styleguide**

- `STYLEGUIDE_COPY`: the page title, the intro, the 8 section titles and intros, and the demo strings ("Loaded (demo only — no service call)", "Show error again", "Open sheet").

## 10. QA hooks (design-specific checks)

- Find raw hex values anywhere outside `globals.css` and `styleguide/_data`. The result must be zero.
- Find `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `font-medium` and `font-bold`. The result must be zero.
- Check that every interactive element has `h-11` / `size-11` or larger, or a `min-h-11` hit area.
- Tab through `/styleguide` at 1280 and 375. Every element shows a 2 px ink outline (white on the footer).
- At 375 the BottomNav preview and the CTA bar previews are inside frames, and `document.documentElement.scrollWidth` is 375.
- With the OS in dark mode, the page stays light.

## Open questions

1. **h2 on mobile.** The spec only steps h1 down (44 to 32) on mobile, so h1 and h2 are both 32 px below 768. Should h2 step down to 24 (`text-h3 md:text-h2`) to keep the hierarchy, or stay as the spec says? This plan follows the spec.
2. **Hover labels for the icon-only SideNav (768–1023).** I used `title` plus sr-only labels. A proper tooltip needs shadcn `tooltip` (Radix, already installed; not a new package), which would be a fifth primitive. Approve it for T2, or keep `title`?
3. **Copyright year.** `getFullYear()` in a server component is fixed at build time on statically rendered pages. That is acceptable for the demo; a rebuild in January updates it. Flag only.
