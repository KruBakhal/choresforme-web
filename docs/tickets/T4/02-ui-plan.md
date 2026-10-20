# T4 — UI plan (Marketing pages)

Input: `01-product-plan.md` with its "Orchestrator decisions" (binding), the T2 UI plan (tokens, type scale, spacing, contrast pairs, Header, Footer, MobileCtaBar), the Tech Spec "Responsive layouts" table, and the PRD "Design direction" and "Landing / home page" sections. This plan does not reopen any of those decisions.

Reference width is 1280 px, then 1024, 768 and 375. Breakpoints: `sm 640 · md 768 · lg 1024 · xl 1280`. "Desktop" means `lg` and up, so 1024 uses the desktop layout with a 960 px content column. Where 1024 and 1280 differ, the difference is stated. "Tablet" means `md` to `< lg`, and "mobile" means `< md`.

---

## 0. Ground rules for every T4 page

### 0.1 Colour and contrast (T2 §0.3, restated for T4)

| Use | Classes | Ratio |
| --- | --- | --- |
| Body text on light bands | `text-ink` on `bg-surface` / `bg-surface-alt` | 12.6 / 11.5 |
| Secondary text on light bands | `text-ink-muted` | 8.2 / 7.5 |
| Brand fills (primary buttons, step-number discs, category icon discs, hero visual panel) | `bg-brand` with `text-brand-foreground` only | 4.9 |
| Soft tints (badges, icon discs, secondary buttons) | `bg-brand-soft` with `text-ink` | 8.9 |
| The one dark panel (`CtaBand`) | `bg-surface-dark` with `text-surface` only, no muted grey; focus `outline-surface` | 12.6 |

- **Brand is a fill only.** `text-brand`, `border-brand` and `outline-brand` do not appear anywhere in T4. White text never sits on brand.
- **Bands.** Page sections alternate `bg-surface` and `bg-surface-alt`. Each page has at most one `surface-dark` element, the `CtaBand` panel. The panel is a rounded block inside a light band, so a light strip always separates it from the dark Footer. The Footer is the site chrome and is not counted as a band.
- **No new images.** Visuals are built from lucide icons and token-styled blocks (`VisualPanel`, `PhoneFrame`, `IdCardPreview`, `JobBoardPreview`). The only image used is the existing logo mark, through `Logo`.

### 0.2 Type, spacing and sizing (T2 §0.4, §0.5)

- Headings use the base layer: `h1` is `text-h2 md:text-h1` (32 / 44), `h2` is `text-h2`, `h3` is `text-h3`. In T4, `h3` inside cards and steps is styled down to `text-h4` with a class, and heading levels never skip.
- Spacing steps are only `1 2 3 4 6 8 12 16 24` (4 to 96 px). Sizes come from the T2 allowlist (`4 5 6 7 10 11 12 14 16 20 24`, plus `full` and fractions). There are no arbitrary `[…]` values. The exception is the generated Radix `data-[state=…]` variants in the accordion primitive, which select state and are not sizes.
- Reading widths use the default `max-w-xl` / `max-w-2xl` / `max-w-3xl`, which are not reset.
- **Section rhythm:** `py-12 md:py-16 lg:py-24`. Page intros and the hero use `pt-8 pb-12 md:py-16`. Heading block to content is `mt-8 md:mt-12`.
- **Anchors:** every section with an `id` gets `scroll-mt-16`, so the 64 px sticky header never covers its heading. This covers `#services`, `#customers` and `#workers`. FAQ items get `scroll-mt-24`.

### 0.3 Touch targets and overflow

- Every link and button is at least 44 px tall: `Button` sizes `sm` and up, `min-h-11` on text links and breadcrumb links, `min-h-12` on picker chips, `min-h-14` on accordion triggers and `h-12` on the search field.
- At 375 px nothing is removed; layouts only stack. Grids are `grid-cols-1` or `grid-cols-2`, and every button row is `flex-col` or `flex-wrap`.
- Long strings: the support email renders as `choresformesupport@<wbr />protonmail.com` with `break-words`, so it wraps at the `@` and never mid-word. External URLs are never printed as text.

### 0.4 Motion

- Hover colour changes use `transition-colors duration-150 motion-reduce:transition-none`.
- Tile arrows use `transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0`.
- The accordion keeps the generated open/close animation and adds `motion-reduce:animate-none`.
- Nothing animates on load, and nothing delays the first action.

### 0.5 Landmarks (same on every T4 page)

```
body
├─ header (banner)          Header: SkipLink, nav[aria-label="Main"]
├─ main#main tabIndex=-1    page content; every section is section[aria-labelledby=<its h2 id>]
└─ footer (contentinfo)     Footer: nav[aria-label="Footer"], copyright, Reset demo data, MobileCtaBar (last in DOM)
```

Extra landmarks: `nav[aria-label="Breadcrumb"]` on service pages, `nav[aria-label="On this page"]` on `/how-it-works`, and `aside[aria-labelledby]` for the FAQ contact card on `/faq` only. There is one `h1` per page, and heading levels never skip.

---

## 1. Shell — layouts, `MarketingShell`, Footer and MobileCtaBar edits

### 1.1 Route layout (decision 9)

The `/workers` mobile bar needs a different CTA. A server layout cannot read the pathname, and a nested layout inside `(marketing)` would render a second Footer. So `/workers` lives in a sibling route group, and both groups share one shell component. Route groups do not change URLs.

```
src/app/(marketing)/layout.tsx             → <MarketingShell>{children}</MarketingShell>
src/app/(marketing)/page.tsx               → /
src/app/(marketing)/services/[category]/page.tsx
src/app/(marketing)/how-it-works/page.tsx
src/app/(marketing)/faq/page.tsx
src/app/(marketing)/privacy/page.tsx
src/app/(marketing)/terms/page.tsx
src/app/(marketing-workers)/layout.tsx     → <MarketingShell mobileCta={WORKERS_PAGE_COPY.mobileCta}>{children}</MarketingShell>
src/app/(marketing-workers)/workers/page.tsx
```

Delete `src/app/page.tsx` and the `.gitkeep` files in `src/app/(marketing)` and `src/components/marketing`. See Open question 1 for the fallback if the group split is not wanted.

### 1.2 `MarketingShell` (new: `src/components/marketing/marketing-shell.tsx`, server)

Props: `children`, `mobileCta?: { label: string; href: string; icon?: LucideIcon }`.

```
<>
  <Header />
  <main id="main" tabIndex={-1} className="flex-1 outline-none">{children}</main>
  <Footer mobileCta={mobileCta} />
</>
```

The root `body` is already `min-h-full flex flex-col`, so `flex-1` pushes the Footer down on short pages (legal). `outline-none` applies only to `main`, which is a skip-link target and not a control.

### 1.3 `MobileCtaBar` edit (existing: `src/components/layout/mobile-cta-bar.tsx`)

- New optional props: `label`, `href` and `icon`, defaulting to `HEADER_ACTIONS.postJob` and `Plus`. Markup and classes stay the same.
- `/workers` passes `{ label: "Create worker account", href: WORKER_SIGNUP_HREF, icon: UserPlus }`.
- Every other page keeps "Post a job".

### 1.4 Footer edit (existing: `src/components/layout/footer.tsx`; decisions 5, 9, 12, 13)

- **Props:** add `mobileCta?` (forwarded to `MobileCtaBar`). `showMobileCta` and `preview` stay.
- **New first group, "Services"** (`h2`, same style as the other groups): 4 links from `CATEGORIES` (label = `name`, href = `serviceHref(id)`), using the existing `linkClass`.
- **Get the app:** use the real Play Store URLs (decision 13), with `target="_blank" rel="noopener noreferrer"` and `<span className="sr-only">(opens in a new tab)</span>` after the label. Rename the constants from `…_URL_PLACEHOLDER` to `PLAY_STORE_CUSTOMER_URL` / `PLAY_STORE_WORKER_URL`.
- **Support:** two link rows, each with an icon (`size-5`, `aria-hidden`) and `gap-2`:
  - `Mail`: `mailto:` the new `SUPPORT_EMAIL` (`choresformesupport@protonmail.com`), rendered with `<wbr />` after the `@`. Replace `break-all` with `break-words`.
  - `Phone`: `tel:+18019480847`, label `(801) 948-0847`.
- **Grid fix** (this also fixes the T2 minor issue where the footer overflows at about 800 px). Four groups in a 2 × 2 grid:

| Width | Brand block | `nav` | Groups inside `nav` |
| --- | --- | --- | --- |
| 1280 | `lg:col-span-4` (379 px) | `lg:col-span-8` (789 px) | `md:grid-cols-2 lg:gap-8`, so each group is 378 px |
| 1024 | `lg:col-span-4` (299 px) | `lg:col-span-8` (629 px) | each group 298 px. The longest item ("Customer app on Google Play" button, about 287 px) fits |
| 768 | `md:col-span-8` (first row) | `md:col-span-8` | `md:grid-cols-2 md:gap-6`, each group 348 px |
| 375 | stacked | stacked | `grid-cols-1 gap-8`; app buttons `w-full` |

Group order (DOM and visual): Services, Get the app, Support, Legal. Replace the inner `md:col-span-3/3/2` with the even 2-column grid above.

---

## 2. Shared marketing components (`src/components/marketing/`)

All are server components except `FaqAccordion`. Copy comes from `constants.ts` (section 11).

| File | Component | Props | Why it exists |
| --- | --- | --- | --- |
| `marketing-shell.tsx` | `MarketingShell` | `children`, `mobileCta?` | Section 1.2 |
| `marketing-section.tsx` | `MarketingSection` | `id?`, `labelledBy?` (renders a `div` instead of a `section` when absent), `tone: "surface" \| "alt"`, `spacing?: "section" \| "intro"`, `className?`, `children` | One place for band colour, vertical rhythm, `Container`, `scroll-mt-16` and `aria-labelledby` |
| `section-heading.tsx` | `SectionHeading` | `id`, `title`, `eyebrow?`, `intro?`, `align?: "start" \| "center"`, `as?: "h1" \| "h2"` | Consistent eyebrow, heading and intro (the product plan leaves this choice to the UI plan) |
| `page-intro.tsx` | `PageIntro` | `titleId`, `title`, `eyebrow?`, `intro?`, `breadcrumb?: LinkItem[]`, `actions?: ReactNode`, `visual?: ReactNode` | The h1 band for every page except landing |
| `breadcrumbs.tsx` | `Breadcrumbs` | `items: LinkItem[]` (the last item is the current page) | Service pages |
| `visual-panel.tsx` | `VisualPanel` | `tone: "brand" \| "alt" \| "surface"`, `children`, `className?` | The rounded backdrop behind every illustration |
| `phone-frame.tsx` | `PhoneFrame` | `children` | Token-styled phone mockup (PRD keeps "phone mockups") |
| `id-card-preview.tsx` | `IdCardPreview` | `variant?: "compact" \| "detailed"` | Illustrative Chores ID-Card (decision 15) |
| `job-board-preview.tsx` | `JobBoardPreview` | none | Decorative "open jobs" list for the worker visuals |
| `hero.tsx` | `Hero` | none (reads `LANDING_COPY.hero`) | Landing hero |
| `hero-category-picker.tsx` | `HeroCategoryPicker` | `labelId` | 4 compact category links |
| `category-tile.tsx` | `CategoryTile` | `category: Category`, `href?: string`, `description?: string`, `actionLabel?: string`, `headingLevel?: 3 \| 4` | Tile; renders a plain card when `href` is missing (used on `/workers`) |
| `category-tiles.tsx` | `CategoryTiles` | `categories: readonly Category[]`, `hrefFor?: (id) => string`, `descriptionFor?: (c) => string`, `actionLabel?`, `layout?: "four" \| "three"` | Grid of tiles |
| `how-it-works.tsx` | `HowItWorks` | `steps: { title, body, href?, linkLabel? }[]` (3 or 4) | Numbered steps; customer and worker variants |
| `feature-list.tsx` | `FeatureList` | `items: { icon: LucideIcon; title: string; body: string }[]`, `layout: "stack" \| "columns"` | Icon, title and body points (Trust, Worker section, `/workers`) |
| `trust-block.tsx` | `TrustBlock` | `headingId` | Trust section |
| `worker-section.tsx` | `WorkerSection` | none | Landing worker section |
| `service-includes.tsx` | `ServiceIncludes` | `category: Category` | Sub-service list on service pages |
| `faq-accordion.tsx` | `FaqAccordion` (`"use client"`) | `items: FaqItem[]`, `searchable?: boolean`, `grouped?: boolean`, `anchorIds?: boolean` | Search, grouped accordion, empty result, hash opening |
| `faq-teaser.tsx` | `FaqTeaser` | `headingId`, `title`, `itemIds: string[]` | FAQ section on `/` and `/workers` |
| `faq-contact-card.tsx` | `FaqContactCard` | `headingLevel: 2 \| 3`, `as?: "div" \| "aside"` | Support email and phone |
| `cta-band.tsx` | `CtaBand` | `headingId`, `title`, `body?`, `primary: LinkItem`, `secondary?: LinkItem`, `tone: "surface" \| "alt"` | Dark accent panel |
| `external-link.tsx` | `ExternalLink` | `href`, `children`, `className?` | `target="_blank" rel="noopener noreferrer"`, `ExternalLink` icon (`size-4`, `aria-hidden`) and the sr-only "(opens in a new tab)". Used by the FAQ, legal pages and Footer app links |
| `src/components/ui/accordion.tsx` | `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` | shadcn generated | The only new primitive |

There is no `RatingsPreview` file: the two rating rows are inline markup in `TrustBlock`.

### 2.1 `MarketingSection`

- `section` with `aria-labelledby={labelledBy}`, or a plain `div` when `labelledBy` is absent. Add `id` when given, plus `scroll-mt-16`.
- Tone `surface` gives `bg-surface`; `alt` gives `bg-surface-alt`.
- `Container` with `py-12 md:py-16 lg:py-24` (`spacing="section"`) or `pt-8 pb-12 md:py-16` (`spacing="intro"`).

### 2.2 `SectionHeading`

- Wrapper: `max-w-2xl`. With `align="center"`: `mx-auto text-center`.
- Eyebrow: `p` with `text-body-sm font-semibold text-ink-muted`.
- Title: `h2` (or `h1`) with `id`, `mt-2` when there is an eyebrow. It keeps the base heading size.
- Intro: `mt-4 text-body text-ink-muted`.

### 2.3 `PageIntro`

- Uses `MarketingSection tone="surface" spacing="intro"`.
- **With `visual`:** `grid grid-cols-1 gap-8 md:grid-cols-8 md:gap-6 md:items-center lg:grid-cols-12 lg:gap-8`. Text is `md:col-span-5 lg:col-span-7` and the visual is `md:col-span-3 lg:col-span-5`.
- **Without `visual`:** the text block is `max-w-3xl`.
- Text block, in order:
  1. `Breadcrumbs` (`mb-4`)
  2. eyebrow (`text-body-sm font-semibold text-ink-muted`)
  3. `h1` (`mt-2`)
  4. intro (`mt-4 text-body text-ink-muted max-w-2xl`)
  5. actions (`mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap`)

### 2.4 `Breadcrumbs`

- `nav aria-label="Breadcrumb"` containing `ol` with `flex flex-wrap items-center gap-x-2 text-body-sm`.
- Link items: `inline-flex min-h-11 items-center rounded-md text-ink underline underline-offset-4 decoration-1 hover:decoration-2`.
- Separators: `ChevronRight size-4 text-ink-muted aria-hidden`.
- Current item: `span aria-current="page"` with `text-ink-muted`.

### 2.5 `VisualPanel`

| Tone | Classes | Used for |
| --- | --- | --- |
| `brand` | `rounded-lg bg-brand p-6 md:p-4 lg:p-8 xl:p-12` | Landing hero, `/workers` intro, service-page intro |
| `alt` | `rounded-lg bg-surface-alt p-6 md:p-6 lg:p-8` | Landing worker section |
| `surface` | `rounded-lg border border-border bg-surface p-6 lg:p-8` | Trust block (sits on an alt band) |

Inner layout: `flex flex-col items-center gap-6`. Only surface-coloured children carry text. No text ever sits directly on the brand fill.

### 2.6 `PhoneFrame` (decorative chrome)

- `div` with `mx-auto w-full max-w-xs rounded-lg border-4 border-ink bg-surface-alt p-3`.
- Notch: `span aria-hidden` with `mx-auto mb-3 block h-4 w-16 rounded-full bg-ink`.
- Children follow the notch. At 768 px the frame is about 207 px wide, and children must not overflow (they use `min-w-0` and wrap).

### 2.7 `IdCardPreview` (illustrative; not the T10 `IdCard`)

```
figure[aria-label="Sample Chores ID-Card"] .w-full min-w-0 rounded-lg border border-border bg-surface p-4 lg:p-6
├─ div.flex items-center justify-between gap-3
│  ├─ div.flex items-center gap-2 — Logo variant="mark" href={null}; span "Chores ID-Card" text-body-sm font-semibold text-ink
│  └─ span "Sample" — rounded-full border border-input px-2 py-1 text-caption font-semibold text-ink
├─ div.mt-4 flex items-center gap-4
│  ├─ span.size-14 rounded-full bg-brand-soft flex items-center justify-center (UserRound size-6 text-ink, aria-hidden)
│  └─ div — p "Sample worker" text-h4 font-semibold text-ink; p "Illustrative example" text-caption text-ink-muted
├─ Separator.my-4
└─ ul.flex flex-col gap-3 — 3 × li.flex items-start justify-between gap-3
   ├─ div.flex min-w-0 gap-2 — Icon size-5 text-ink (Smartphone / IdCard / ShieldCheck)
   │   └─ div — span label text-body-sm font-semibold text-ink ("Phone" / "ID" / "Insurance")
   │           + (detailed only) span.block text-caption text-ink-muted (row detail)
   └─ span.shrink-0 inline-flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1 text-caption font-semibold text-ink
       BadgeCheck size-4 aria-hidden + VERIFICATION_STATUS_LABELS.verified
```

- `compact` is used in the hero and on `/workers`; `detailed` is used in the trust block.
- There is no rating number (decision 15). It is not a heading, so it does not affect the page outline.

### 2.8 `JobBoardPreview` (decorative, `aria-hidden="true"`)

- `div.w-full min-w-0 flex flex-col gap-3`.
- Title row: `p` "Open jobs near you" in `text-body-sm font-semibold text-ink`.
- Three rows built from `CATEGORIES[0..2]`. Each is `flex items-center gap-3 rounded-md border border-border bg-surface p-3` containing:
  - an icon disc `size-10 shrink-0 rounded-md bg-brand-soft` (`CATEGORY_ICONS[id]` `size-5 text-ink`)
  - a `min-w-0` text block: the category name (`text-body-sm font-semibold text-ink truncate`) and the first sub-service (`text-caption text-ink-muted truncate`)
  - a placeholder bar `ml-auto h-4 w-12 shrink-0 rounded-full bg-border`
- No prices, distances or counts (product rule 28).

### 2.9 `CategoryTile` and `CategoryTiles`

**Tile with `href`:** a `Link` with these classes:

```
group flex h-full flex-col gap-4 rounded-lg border border-border bg-surface p-4 md:p-6
transition-colors duration-150 hover:border-input motion-reduce:transition-none
```

Contents, in order:

- Icon disc: `size-10 md:size-12 rounded-md bg-brand flex items-center justify-center`, with `CATEGORY_ICONS[id]` `size-5 md:size-6 text-brand-foreground`, `aria-hidden`.
- Name: `h3` in `text-body md:text-h4 font-semibold text-ink`.
- Description: `p` in `text-body-sm text-ink-muted`.
- Action row (`aria-hidden`, so the link's name is the name plus the description): `mt-auto inline-flex items-center gap-2 text-body-sm font-semibold text-ink underline-offset-4 group-hover:underline`, with `ArrowRight size-4` and the tile arrow motion from 0.4.

**Tile without `href`:** the same card as a `div`, with no hover state and no action row.

**Grids** (`ul` with each tile in an `li`):

| `layout` | Classes |
| --- | --- |
| `four` | `grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4 lg:gap-8` |
| `three` | `grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 lg:gap-8` |

### 2.10 `HowItWorks`

**List:** `ol` with these classes:

| Steps | Classes |
| --- | --- |
| 3 | `grid grid-cols-1 gap-0 md:grid-cols-3 md:gap-6 lg:gap-8` |
| 4 | `grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:gap-8` |

**Each step** (`li`) is `relative flex gap-4 pb-8 last:pb-0 md:flex-col md:gap-0 md:pb-0` and contains:

- **Number disc:** `span aria-hidden` with `relative flex size-12 shrink-0 items-center justify-center rounded-full bg-brand text-h4 font-semibold text-brand-foreground`.
- **Desktop connector** (every step except the last): `span aria-hidden` with `absolute top-6 left-16 -right-4 hidden h-px bg-input lg:block`. It joins the discs across the gap. It is drawn only at `lg` ("3 columns joined by a line").
- **Mobile connector** (every step except the last): `span aria-hidden` with `absolute top-12 bottom-0 left-6 w-px bg-input md:hidden`. Together these make the vertical numbered list.
- **Text block** (`min-w-0 md:mt-6`):
  - `h3` in `text-h4`
  - body in `mt-2 text-body text-ink-muted`
  - optional link: `Button asChild variant="link" size="sm"` with `ArrowRight`, at `mt-2` (it is `min-h-11`)

The `ol` gives the order semantics, so the number disc is hidden from assistive tech.

### 2.11 `FeatureList`

| `layout` | List classes | Item classes |
| --- | --- | --- |
| `stack` | `ul.flex flex-col gap-6` | `li.flex gap-4` |
| `columns` | `ul.grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6 lg:gap-8` | `li.flex gap-4 md:flex-col` |

Each item contains:

- Icon disc: `size-10 shrink-0 rounded-md bg-brand-soft flex items-center justify-center`, with the icon `size-5 text-ink`.
- `h3` in `text-body font-semibold` (`stack`) or `text-h4` (`columns`, with `md:mt-4`).
- Body: `mt-1 text-body-sm text-ink-muted` (`stack`) or `mt-2 text-body text-ink-muted` (`columns`).

### 2.12 `Accordion` primitive (`src/components/ui/accordion.tsx`, shadcn add, re-themed)

| Part | Classes |
| --- | --- |
| `Accordion` (Root) | `w-full rounded-lg border border-border bg-surface` |
| `AccordionItem` | `border-b border-border last:border-b-0` |
| `AccordionTrigger` (inside the generated `Header`, which renders `h3`) | `group flex w-full min-h-14 items-center justify-between gap-4 px-4 py-4 md:px-6 text-left text-body font-semibold text-ink transition-colors duration-150 hover:bg-surface-alt focus-visible:-outline-offset-2 motion-reduce:transition-none` |
| Trigger chevron | `ChevronDown size-5 shrink-0 text-ink transition-transform duration-200 motion-reduce:transition-none`, rotated 180° when open (keep the generated state selector) |
| `AccordionContent` | Keep the generated height animation with `motion-reduce:animate-none`. Inner `div`: `px-4 pb-4 md:px-6 md:pb-6 text-body text-ink-muted` |

Generated `text-sm` and `font-medium` become `text-body` and `font-semibold`. Drop any `focus-visible:ring-*` and rely on the global outline. The first item's hover fill must be clipped by the root's `overflow-hidden rounded-lg`.

---

## 3. Landing — `/`

`src/app/(marketing)/page.tsx`. Metadata comes from `MARKETING_META.home`.

**Band map:** Hero `surface` → Services `alt` → How it works `surface` → Trust `alt` → Workers `surface` → FAQ `alt` → CTA band section `surface` (with the dark panel inside) → Footer (dark chrome).

### Desktop 1280 px (reference)

1. **Hero** (`MarketingSection tone="surface" spacing="intro"` with `labelledBy="hero-title"`): 12-column grid with `items-center`.
   - **Left** (`lg:col-span-7`, 687 px), in order:
     - Eyebrow pill: `inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-body-sm font-semibold text-ink`, with `ShieldCheck size-4`.
     - `h1#hero-title` at `mt-4` (2 lines at 44 / 52).
     - Supporting line: `mt-4 text-body text-ink-muted max-w-xl`.
     - CTA row: `mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap`. **Post a job** (`Button size="lg"`, primary, → `/post-job/category`) and **Earn with Chores For Me** (`Button variant="outline" size="lg"`, → `/signup?role=worker`).
     - No-account note: `mt-3 text-body-sm text-ink-muted`.
     - `HeroCategoryPicker` at `mt-8`.
   - **Right** (`lg:col-span-5`, 470 px): `VisualPanel tone="brand"` containing `PhoneFrame` › `IdCardPreview variant="compact"`. Below the frame is a decorative row (`aria-hidden`, `flex justify-center gap-3`) of 4 `size-12 rounded-md bg-surface` tiles, each with a `CATEGORY_ICONS` icon `size-6 text-ink`.
   - **Fold check at 1280 × 800:** 64 header + 64 top padding + 44 eyebrow + 104 h1 + 64 line + 88 CTAs, so the CTAs end at about 430 px. The picker ends at about 620 px.
2. **Services** (`id="services"`, tone `alt`, `labelledBy="services-title"`):
   - `SectionHeading align="center"`: eyebrow, h2 "What do you need done?" and intro.
   - Below it: `CategoryTiles layout="four"`, with `hrefFor = postJobForCategory`, `descriptionFor = CATEGORY_DESCRIPTIONS[id]` and action "Start a job". At xl each tile is 276 px.
3. **How it works** (tone `surface`):
   - `SectionHeading align="center"`.
   - `HowItWorks` with the 3 customer steps (connector line on).
   - Below: `mt-12 flex justify-center`, with `Button variant="outline"` "See the full guide" → `/how-it-works`.
4. **Trust** (tone `alt`): `TrustBlock` (section 3a).
5. **Workers** (tone `surface`): `WorkerSection` (section 3b).
6. **FAQ** (tone `alt`): `FaqTeaser` with h2 "Common questions" and items `cancellation-fee`, `payouts`, `sole-proprietor` (PRD: cancellation, payouts, independent contractor).
   - Grid `lg:grid-cols-12 lg:gap-8`. Left `lg:col-span-8`: accordion, then "See all FAQs" (`Button variant="outline"`, `mt-6`, → `/faq`). Right `lg:col-span-4`: `FaqContactCard headingLevel={3}`.
7. **CTA band** (`CtaBand tone="surface"`): h2 "Ready to get it done?", body, primary "Post your first job" → `/post-job/category`, secondary "Earn with Chores For Me" → `/workers` (decision 6).

### 3a. `TrustBlock` (inside a tone `alt` section)

- Grid `grid-cols-1 gap-8 md:grid-cols-8 md:gap-6 md:items-center lg:grid-cols-12 lg:gap-8`.
- **Text** (`md:col-span-4 lg:col-span-6`):
  - `SectionHeading` (start-aligned): eyebrow "Trust and safety" and h2 "What “verified” means".
  - `FeatureList layout="stack"` at `mt-8` with 5 points: Phone check (`Smartphone`), Identity verification (`IdCard`), Insurance check (`ShieldCheck`), Chores ID-Card (`BadgeCheck`), Two-way ratings (`Star`).
- **Visual** (`md:col-span-4 lg:col-span-6`): `VisualPanel tone="surface"` containing:
  - `IdCardPreview variant="detailed"`.
  - Two rating rows (`aria-hidden`, `w-full flex flex-col gap-3`). Each row is `flex items-center justify-between gap-3 rounded-md bg-surface-alt p-4`, with a label in `text-body-sm font-semibold text-ink` ("Customers rate workers" / "Workers rate customers") and 5 outline `Star size-4 text-ink` in `flex gap-1`. The stars are not filled and there is no number.
  - The rows are hidden from assistive tech because the "Two-way ratings" text point already says this.

### 3b. `WorkerSection` (inside a tone `surface` section)

- Same split grid as Trust, but on desktop the visual sits on the **left**: the visual gets `lg:order-first`. DOM order stays text then visual, so mobile and focus order are text first.
- **Text:**
  - `SectionHeading`: eyebrow "For workers" and h2 "Earn with Chores For Me".
  - `FeatureList layout="stack"` with 3 points: `MapPin` set your own area and services, `ListChecks` choose the jobs you want, `Wallet` get paid to your payout account.
  - Actions row: `mt-8 flex flex-col gap-3 sm:flex-row`. **Start earning** (`Button variant="secondary" size="lg"`, → `/signup?role=worker`) and "See what you'll need" (`Button variant="link"`, → `/workers`).
- **Visual:** `VisualPanel tone="alt"` containing `PhoneFrame` › `JobBoardPreview`.

### 3c. `HeroCategoryPicker`

- `p#hero-picker-label` in `text-body-sm font-semibold text-ink`: "Or start with a service".
- `ul aria-labelledby="hero-picker-label"` with `mt-3 grid grid-cols-2 gap-3`.
- Each chip is a `Link` → `postJobForCategory(id)`:

```
flex min-h-12 items-center gap-2 rounded-md border border-input bg-surface px-3 py-2
text-left text-body-sm font-semibold text-ink transition-colors duration-150
hover:bg-surface-alt motion-reduce:transition-none
```

- Each chip has `CATEGORY_ICONS[id]` at `size-5 shrink-0 aria-hidden`. Text wraps up to 2 lines.

### Tablet 768 px and 1024 px

- **1024:** the desktop layout in a 960 px column.
  - Hero is 7 / 5 (546 / 381 px): the h1 is still 2 lines, the CTAs still sit on one row (447 px), and each picker chip is 267 px on one line.
  - Tiles are 4 in a row at 216 px; names may wrap to 2 lines (tiles use `h-full`).
  - How it works keeps the connector.
  - FAQ stays split 8 / 4.
- **768:**
  - **Hero:** two columns, smaller visual. Text `md:col-span-5` (441 px), visual `md:col-span-3` (255 px). `VisualPanel` brand uses `md:p-4`, so the `PhoneFrame` is about 207 px and the decorative icon row wraps. The CTA row wraps (`sm:flex-wrap`), so "Earn…" drops to a second line. The h1 is 44 px over 3 lines.
  - **Tiles:** 2 × 2 with `md:gap-6` and `md:p-6`.
  - **How it works:** 3 columns, no connector.
  - **Trust and Workers:** split 4 / 4 columns (348 px each); the worker visual is back on the right because `lg:order-first` does not apply.
  - **FAQ:** single column, with the contact card after "See all FAQs" (`mt-8`).
  - **CTA band:** stacked (see `CtaBand`).

### Mobile 375 px

- **Hero:** stacked in this order: eyebrow, h1 (3 lines at 32 / 40), line, CTAs (`flex-col`, both `w-full`), note, picker (2 × 2, chips 165 px, names wrap to 2 lines), then the visual (`VisualPanel` `p-6`, frame full width up to 320 px).
  - **Fold check at 375 × 812:** the visible area is 676 px (812 − 64 header − 72 bar). The second CTA ends at about 408 px from the top of `main`, and the picker ends at about 632 px. So the h1, both CTAs and the picker are all above the fold.
- **Tiles:** 2 × 2, compact (`p-4`, `size-10` disc, name `text-body`). The description and "Start a job" stay.
- **How it works:** vertical numbered list, with the disc on the left, the text on the right and the line between discs.
- **Trust and Workers:** stacked, text first, then the visual. The worker section actions are full width (`w-full sm:w-auto`).
- **FAQ:** accordion, then "See all FAQs" (`w-full`), then the contact card.
- **CTA band:** stacked, buttons `w-full`.
- The sticky "Post a job" bar is the default.

### Component tree

```
src/app/(marketing)/page.tsx  (server)
├─ Hero (new: src/components/marketing/hero.tsx)
│  ├─ MarketingSection (new) tone="surface" spacing="intro" labelledBy="hero-title"
│  ├─ h1#hero-title, p, Button×2 (existing: src/components/ui/button.tsx) asChild Link
│  ├─ HeroCategoryPicker (new: src/components/marketing/hero-category-picker.tsx) — labelId
│  └─ VisualPanel tone="brand" (new) › PhoneFrame (new) › IdCardPreview variant="compact" (new)
├─ MarketingSection id="services" tone="alt" labelledBy="services-title"
│  ├─ SectionHeading (new) id="services-title" align="center"
│  └─ CategoryTiles (new) layout="four" hrefFor=postJobForCategory descriptionFor actionLabel
│     └─ CategoryTile ×4 (new)
├─ MarketingSection tone="surface" labelledBy="how-title"
│  ├─ SectionHeading id="how-title" align="center"
│  ├─ HowItWorks (new) steps=LANDING_COPY.howItWorks.steps
│  └─ Button outline → /how-it-works
├─ MarketingSection tone="alt" labelledBy="trust-title" › TrustBlock (new) headingId="trust-title"
│  ├─ SectionHeading, FeatureList layout="stack" (new)
│  └─ VisualPanel tone="surface" › IdCardPreview variant="detailed" + rating rows
├─ MarketingSection tone="surface" labelledBy="workers-title" › WorkerSection (new)
│  ├─ SectionHeading, FeatureList, Button secondary, Button link
│  └─ VisualPanel tone="alt" › PhoneFrame › JobBoardPreview (new)
├─ MarketingSection tone="alt" labelledBy="faq-title" › FaqTeaser (new) itemIds=LANDING_FAQ_IDS
│  ├─ SectionHeading id="faq-title"
│  ├─ FaqAccordion (new, client) items searchable={false} grouped={false} anchorIds={false}
│  │  └─ Accordion… (new primitive: src/components/ui/accordion.tsx)
│  ├─ Button outline → /faq
│  └─ FaqContactCard (new) headingLevel={3}
└─ CtaBand (new) tone="surface" headingId="cta-title"
```

**Heading outline:** h1 hero → h2 services (h3 × 4 tiles) → h2 how it works (h3 × 3) → h2 trust (h3 × 5) → h2 workers (h3 × 3) → h2 FAQ (h3 × 3 questions, h3 contact) → h2 CTA band → footer h2 × 4.

### Styling (key elements)

| Element | Classes |
| --- | --- |
| Hero grid | `grid grid-cols-1 gap-8 md:grid-cols-8 md:gap-6 md:items-center lg:grid-cols-12 lg:gap-8` |
| Hero text | `md:col-span-5 lg:col-span-7`; visual `md:col-span-3 lg:col-span-5` |
| Hero CTAs | `Button size="lg"` (56 px); mobile `w-full sm:w-auto` |
| Section content offset | `mt-8 md:mt-12` after `SectionHeading` |
| FAQ split | `grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-8`; accordion `lg:col-span-8`, card `lg:col-span-4 lg:self-start` |

### States

Static page with no service calls, so there is no loading, error or success state. The only dynamic piece is the FAQ teaser accordion (no search there, so no empty state).

### Interaction details

- **Focus order:** skip link, header, hero CTAs (Post a job, Earn), picker × 4, tiles × 4, step links, "See the full guide", trust (no controls), worker CTAs, accordion triggers × 3, "See all FAQs", contact email, contact phone, CTA band × 2, footer, mobile bar.
- `/#services` from any page lands on the Services section heading, clear of the sticky header (`scroll-mt-16`).
- Hover: tiles darken their border and nudge the arrow; chips get an `alt` fill. Every hover action is also a plain link.

---

## 4. Service pages — `/services/[category]`

`src/app/(marketing)/services/[category]/page.tsx`:

- `generateStaticParams` from `CATEGORY_IDS`.
- `notFound()` for any other value, which falls back to the default Next 404.
- `generateMetadata` from `SERVICE_PAGE_COPY[id]`.

**Band map:** Intro `surface` → What's included `alt` → How it works `surface` → Trust `alt` → Other services `surface` → CTA band section `alt` (dark panel inside).

### Desktop 1280 px (reference)

1. **Intro:** `PageIntro` with a visual.
   - Breadcrumb: Home (`/`) › Services (`/#services`) › {name} (current).
   - Eyebrow "Services", h1 `SERVICE_PAGE_COPY[id].heading`, intro.
   - Actions: **Post a job** (`Button size="lg"` → `postJobForCategory(id)`, the "same primary CTA") and "How it works" (`Button variant="link"` → `/how-it-works`).
   - Visual: `VisualPanel tone="brand"` with `py-16` content and a centred `size-24 rounded-lg bg-surface flex items-center justify-center` tile, holding `CATEGORY_ICONS[id]` at `size-12 text-ink`, `aria-hidden`.
2. **What's included:** `ServiceIncludes`.
   - `SectionHeading` (h2 "What's included", intro).
   - Then `ul.mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3`. Each `li` is `flex items-center gap-3 rounded-md border border-border bg-surface p-4`, with a `Check size-5 text-ink` disc (`size-10 rounded-md bg-brand-soft`) and the sub-service in `text-body font-semibold text-ink`.
   - **"Other"** renders as the last card with the label `SERVICE_PAGE_COPY.otherLabel` ("Something else? Describe it in your job").
   - **Custom** has only "Other", so it renders one wide card (`sm:col-span-2 lg:col-span-3`) with `SERVICE_PAGE_COPY.customIncludesBody`.
3. **How it works:** `SectionHeading` (h2 "How it works") and `HowItWorks` with the customer steps.
4. **Trust:** `TrustBlock`, as on landing.
5. **Other services:**
   - `SectionHeading` (h2 "Other services").
   - `CategoryTiles layout="three"` with the 3 other categories: `hrefFor = serviceHref`, action "See service", description from `CATEGORY_DESCRIPTIONS`.
6. **CTA band** (`tone="alt"`): h2 `SERVICE_PAGE_COPY.ctaTitle(name)`, primary "Post a job" → `postJobForCategory(id)`, secondary "Earn with Chores For Me" → `/workers`.

### Tablet 768 px and 1024 px

- **1024:** same as desktop. The intro is 7 / 5, includes is 3 columns and Other services is 3 columns.
- **768:**
  - **Intro:** 5 / 3, with the icon tile still `size-24` and the panel `md:p-4 py-12`.
  - **Includes:** 2 columns (`sm:grid-cols-2`).
  - **How it works:** 3 columns.
  - **Trust:** split.
  - **Other services:** 3 columns (224 px each).

### Mobile 375 px

- **Intro:** stacked. The breadcrumb wraps; the h1 is 32 px; the actions are `flex-col` with Post a job `w-full`; the visual panel (`py-12`) sits below.
- **Includes:** 1 column.
- **How it works:** vertical list.
- **Trust:** stacked.
- **Other services:** 1 column of full-width tiles (`grid-cols-1`).
- **CTA band:** stacked.
- The sticky bar shows "Post a job" → `/post-job/category`. This is the global bar; the in-page CTAs carry the category.

### Component tree

```
src/app/(marketing)/services/[category]/page.tsx (server)
├─ PageIntro (new) titleId="service-title" breadcrumb actions visual
│  ├─ Breadcrumbs (new)
│  └─ VisualPanel tone="brand" › icon tile
├─ MarketingSection tone="alt" labelledBy="includes-title" › ServiceIncludes (new) category
├─ MarketingSection tone="surface" labelledBy="how-title" › SectionHeading + HowItWorks
├─ MarketingSection tone="alt" labelledBy="trust-title" › TrustBlock
├─ MarketingSection tone="surface" labelledBy="other-title" › SectionHeading + CategoryTiles layout="three"
└─ CtaBand tone="alt"
```

**Heading outline:** h1 service heading → h2 What's included → h2 How it works (h3 × 3) → h2 Trust (h3 × 5) → h2 Other services (h3 × 3) → h2 CTA.

### States

Static. An invalid slug gives the 404. Nothing else.

### Interaction details

- **Focus order:** breadcrumb links (2), Post a job, How it works link, step links, other-service tiles × 3, CTA band × 2.
- The breadcrumb "Services" link goes to `/#services`.

---

## 5. How it works — `/how-it-works`

**Band map:** Intro `surface` → Customers `alt` → Workers `surface` → CTA band section `alt`.

### Desktop 1280 px (reference)

1. **Intro:** `PageIntro` without a visual (`max-w-3xl`), containing the h1, intro and an `actions` slot. The slot is a `nav aria-label="On this page"` with `flex flex-wrap gap-3`, holding two `Button variant="outline" size="sm"` links: "For customers" → `#customers` and "For workers" → `#workers`.
2. **Customers** (`id="customers"`):
   - `SectionHeading` (h2 "For customers", intro).
   - `HowItWorks` with the 3 customer steps (connector on).
   - Then `mt-12` **Post a job** (`Button size="lg"` → `/post-job/category`).
3. **Workers** (`id="workers"`):
   - `SectionHeading` (h2 "For workers").
   - `HowItWorks` with the 4 worker steps (decision 2): `lg:grid-cols-4` with the connector. At xl each column is 276 px; at 1024 it is 216 px.
   - Then `mt-12` **Create worker account** (`Button variant="secondary" size="lg"` → `/signup?role=worker`).
4. **CTA band** (`tone="alt"`): the same copy as landing.

### Tablet 768 px and 1024 px

- **1024:** desktop layout. The 4 worker steps sit in 4 columns of 216 px with the connector.
- **768:** customers in 3 columns, workers in 2 × 2, with no connectors.

### Mobile 375 px

- The jump-link chips wrap and stay 44 px tall.
- Both step lists are vertical numbered lists, and both section CTAs are `w-full`.
- Default sticky bar.

### Component tree

```
src/app/(marketing)/how-it-works/page.tsx (server)
├─ PageIntro titleId="hiw-title" actions={nav On this page › Button outline sm ×2}
├─ MarketingSection id="customers" tone="alt" labelledBy="customers-title"
│  └─ SectionHeading + HowItWorks steps=HOW_IT_WORKS_COPY.customers.steps + Button
├─ MarketingSection id="workers" tone="surface" labelledBy="workers-title"
│  └─ SectionHeading + HowItWorks steps=HOW_IT_WORKS_COPY.workers.steps + Button secondary
└─ CtaBand tone="alt"
```

**Heading outline:** h1 → h2 For customers (h3 × 3) → h2 For workers (h3 × 4) → h2 CTA.

### States

Static.

### Interaction details

- **Focus order:** jump links, customer step links, Post a job, worker step links, Create worker account, CTA band.
- The jump links move focus to the section through the hash. The section has `scroll-mt-16`. No smooth-scroll script is used.

---

## 6. Workers — `/workers` ("Why join", Worker flow step 1)

`src/app/(marketing-workers)/workers/page.tsx`. The mobile bar shows **Create worker account** (decision 9). Every CTA on the page has the same label and target (`/signup?role=worker`), which is the "One CTA" rule. The copy uses "identity verification".

**Band map:** Intro `surface` → Why join `alt` → Jobs you can choose `surface` → What you'll need `alt` → Worker questions `surface` → CTA band section `alt`.

### Desktop 1280 px (reference)

1. **Intro:** `PageIntro` with a visual.
   - Eyebrow "For workers", h1 "Earn with Chores For Me", intro.
   - Action: **Create worker account** (`Button size="lg"`, primary on this page).
   - Visual: `VisualPanel tone="brand"` › `PhoneFrame` › `JobBoardPreview`.
2. **Why join:** `SectionHeading align="center"` (h2 "Why join"), then `FeatureList layout="columns"` with 3 points: `MapPin` Choose your area, `ListChecks` Choose your jobs, `Wallet` Get paid to your payout account.
3. **Jobs you can choose:**
   - `SectionHeading` (h2 and intro).
   - `CategoryTiles layout="four"` **without** `hrefFor`, so the tiles are plain cards with no action row, and `descriptionFor = c => c.subServices.join(", ")`. This shows the job types before any documents (PRD principle 1).
4. **What you'll need:** split grid (as in Trust).
   - **Text:** `SectionHeading` (h2 "What you'll need", intro "You can browse jobs first…"), then `ul.mt-8 flex flex-col gap-4`. Each `li` is `flex gap-3`, with an icon (`size-5 text-ink`, `mt-1`) and `text-body text-ink`:
     - `IdCard`: photo ID, front and back
     - `ShieldCheck`: insurance document
     - `Wallet`: payout account, needed before your first payout
     - `CalendarCheck`: 18 or older
   - **Visual:** `VisualPanel tone="surface"` containing `IdCardPreview variant="compact"`, then a status note `p.text-body-sm text-ink` (`WORKERS_PAGE_COPY.statusNote`, built from `VERIFICATION_STATUS_LABELS`). Above the note is a two-badge row `flex flex-wrap items-center gap-2`:
     - "Under review": `rounded-full border border-input px-3 py-1 text-caption font-semibold text-ink`, with a `Clock size-4` icon
     - `ArrowRight size-4 aria-hidden`
     - "Verified": `bg-brand-soft`, with a `BadgeCheck size-4` icon
5. **Worker questions:** `FaqTeaser` with h2 "Worker questions" and items `experience`, `payouts`, `registration-time`, `sole-proprietor`, laid out like the landing FAQ (8 / 4 with the contact card).
6. **CTA band** (`tone="alt"`): h2 "Ready to start earning?", body, primary "Create worker account" and **no secondary** (one CTA).

### Tablet 768 px and 1024 px

- **1024:** desktop layout.
- **768:**
  - **Intro:** 5 / 3.
  - **Why join:** 3 columns (`md:grid-cols-3`, items stack the icon above the text).
  - **Jobs:** 2 × 2.
  - **What you'll need:** split 4 / 4.
  - **FAQ:** single column, contact card below.

### Mobile 375 px

- **Intro:** stacked, CTA `w-full`, visual below.
- **Why join:** 1 column (icon left, text right).
- **Jobs:** 2 × 2, compact. Sub-service lists wrap in `text-body-sm`.
- **What you'll need:** stacked, list then visual.
- **FAQ:** single column.
- **CTA band:** stacked.
- The sticky bar is "Create worker account" with the `UserPlus` icon.

### Component tree

```
src/app/(marketing-workers)/layout.tsx  › MarketingShell mobileCta=WORKERS_PAGE_COPY.mobileCta
src/app/(marketing-workers)/workers/page.tsx (server)
├─ PageIntro titleId="workers-title" actions visual={VisualPanel brand › PhoneFrame › JobBoardPreview}
├─ MarketingSection tone="alt" labelledBy="why-title" › SectionHeading + FeatureList layout="columns"
├─ MarketingSection tone="surface" labelledBy="jobs-title" › SectionHeading + CategoryTiles (no hrefFor)
├─ MarketingSection tone="alt" labelledBy="needs-title"
│  ├─ SectionHeading + ul
│  └─ VisualPanel tone="surface" › IdCardPreview compact + status badges + note
├─ MarketingSection tone="surface" labelledBy="worker-faq-title" › FaqTeaser itemIds=WORKERS_FAQ_IDS
└─ CtaBand tone="alt" (primary only)
```

**Heading outline:** h1 → h2 Why join (h3 × 3) → h2 Jobs you can choose (h3 × 4) → h2 What you'll need → h2 Worker questions (h3 × 4, h3 contact) → h2 CTA.

### States

Static.

### Interaction details

- **Focus order:** Create worker account, accordion triggers × 4 (including the "Read the full guide" external link inside the open sole-proprietor answer), See all FAQs, contact links, CTA band, footer, mobile bar.
- The category cards on this page are not focusable.

---

## 7. FAQ — `/faq`

`src/app/(marketing)/faq/page.tsx` (server) renders `FaqAccordion` (client) with all `FAQ_ITEMS`.

**Band map:** Intro `surface` → FAQ body `alt`. There is no CTA band on this page; the contact card is the next step.

### Desktop 1280 px (reference)

1. **Intro:** `PageIntro` without a visual: h1 "Frequently asked questions" and intro.
2. **Body** (`MarketingSection tone="alt"` with no `labelledBy`, so it renders a `div` and does not repeat the intro's region name): grid `lg:grid-cols-12 lg:gap-8`.
   - **Left** (`lg:col-span-8`): `FaqAccordion searchable grouped anchorIds`, which renders:
     - **Search field.** A `label` "Search the FAQ" (`text-body font-semibold text-ink`, visible). Below it, at `mt-2`, a `div.relative` containing:
       - `Search size-5 text-ink-muted pointer-events-none absolute left-4 top-1/2 -translate-y-1/2` (`aria-hidden`)
       - `input type="search"` with `h-12 w-full rounded-md border border-input bg-surface pl-12 pr-4 text-body text-ink placeholder:text-ink-muted`, `autoComplete="off"`, `enterKeyHint="search"` and `aria-describedby` set to the results line
     - **Results line:** `p#faq-results role="status" aria-live="polite"` with `mt-3 flex flex-wrap items-center gap-x-3 text-body-sm text-ink-muted`. It reads "Showing {n} of {total} questions". When a query is set, a "Clear search" `Button variant="link" size="sm"` follows.
     - **Groups** (`mt-8 flex flex-col gap-12`). For each audience with matches, in the order customer then worker:
       - `h2` with `text-h3` styling ("For customers" / "For workers").
       - `Accordion type="multiple"` at `mt-4`. Each item has `id={item.id}` and `scroll-mt-24`. The answer is a `p`. For `sole-proprietor`, an `ExternalLink` "Read the full guide" follows at `mt-3`, styled as `Button variant="link" size="sm"`.
   - **Right** (`lg:col-span-4`): `FaqContactCard as="aside" headingLevel={2}` with `lg:sticky lg:top-24 lg:self-start`.

### `FaqContactCard`

- Card: `rounded-lg border border-border bg-surface p-6 md:p-8`.
- Icon disc: `size-12 rounded-full bg-brand-soft flex items-center justify-center`, with `MessageCircleQuestion size-6 text-ink`.
- Heading (h2 or h3): `mt-4 text-h4` "Still have questions?".
- Body: `mt-2 text-body text-ink-muted`.
- Links: `ul.mt-6 flex flex-col gap-2`. Each is an `a` with `inline-flex min-h-11 items-center gap-2 text-body text-ink underline underline-offset-4 decoration-1 hover:decoration-2 break-words`:
  - `Mail size-5`: email (`mailto:`, with `<wbr />` after the `@`)
  - `Phone size-5`: `(801) 948-0847` (`tel:+18019480847`)

### Tablet 768 px and 1024 px

- **1024:** the desktop split (8 / 4) with the sticky card.
- **768:** single column. Search, groups, then the contact card (`mt-12`, not sticky).

### Mobile 375 px

- Single column: search (full width), results line, groups (triggers `px-4`, wrapping up to 3 lines and growing from 56 px), then the contact card.
- The phone and email links each have their own 44 px row.
- Default sticky bar.

### Component tree

```
src/app/(marketing)/faq/page.tsx (server)
├─ PageIntro titleId="faq-title"
└─ MarketingSection tone="alt" (div, no labelledBy)
   ├─ FaqAccordion (new, client) items=FAQ_ITEMS searchable grouped anchorIds
   │  ├─ label + input[type=search] + p[role=status] + Button link "Clear search"
   │  ├─ h2 group × 2 › Accordion (new primitive) › AccordionItem × n (h3 trigger) › ExternalLink (sole-proprietor)
   │  └─ EmptyState (existing: src/components/states/empty-state.tsx) — when no item matches
   └─ FaqContactCard (new) as="aside" headingLevel={2}
```

**Heading outline:** h1 FAQ → h2 For customers (h3 × 4) → h2 For workers (h3 × 5) → h2 Still have questions (aside).

### States

| State | What shows |
| --- | --- |
| Default (success) | Both groups, all items collapsed (unless the hash names one); results line "Showing 9 of 9 questions" |
| Filtering | Groups with no matches are removed; matching items keep their open or closed state; the results line updates |
| **Empty (no results)** | Groups are replaced by `EmptyState` (`icon={SearchX}`, `headingLevel={2}`, title "No questions match your search", description "Try a different word, or contact support.", action `Button variant="outline"` "Clear search"). The contact card stays on the right (or below). The results line reads "No questions match “{query}”" |
| Loading / Error | Not applicable: the items are static constants and there are no service calls |

### Interaction details

- **Search:**
  - Filters as you type, with no submit and no debounce (9 items).
  - Matching is a case-insensitive "contains" on question plus answer, with the query trimmed and whitespace collapsed.
  - Enter does nothing beyond the native search behaviour, because the field is not in a form.
  - Esc clears the field (native `type="search"`).
  - "Clear search", in either the results line or the empty state, clears the query and **returns focus to the input**.
- **Hash `/faq#<id>`:**
  - On mount and on `hashchange`, if the hash matches an item id: clear any query, add the id to the open values, then `scrollIntoView({ block: "start" })`. Use `behavior: "smooth"` only when `prefers-reduced-motion` is not set. Then focus that item's trigger with `preventScroll`.
  - An unknown hash does nothing.
  - Opening an item does not rewrite the URL.
- **Focus order:** search, Clear search (when shown), triggers in order (with links inside open answers in place), contact email, phone.
- **Keyboard:**
  - Radix gives Enter and Space to toggle, and Up, Down, Home and End to move between triggers.
  - The trigger exposes `aria-expanded` and the content has `role="region"` (Radix default).
  - Triggers use `focus-visible:-outline-offset-2` so the outline is not clipped by the rounded root.
- **Teaser use** (`/`, `/workers`): `searchable={false}`, `grouped={false}`, `anchorIds={false}`, so there is no field, no group headings and no DOM ids, and there are no hash side effects.

---

## 8. Legal placeholders — `/privacy` and `/terms`

Each page renders `LegalPlaceholder kind="privacy" | "terms"`. Metadata sets `robots: { index: false }` (decision 8).

**Band map:** one `surface` band. Footer follows.

### Desktop 1280 px (reference)

- `MarketingSection tone="surface" spacing="section" labelledBy="legal-title"`, with the inner block `max-w-2xl`.
  - Eyebrow "Legal" and `h1#legal-title` ("Privacy Policy" / "Terms").
  - **Notice card** at `mt-8`: `rounded-lg border border-border bg-surface-alt p-6 flex gap-4`, with `Info size-6 shrink-0 text-ink` (`aria-hidden`) and a `div`:
    - `p.text-body text-ink` `LEGAL_COPY.notice`: "The final web version is being prepared. Until it's published, the current policy on choresforme.com applies."
    - `ExternalLink` (`mt-3`, `Button variant="link" size="sm"`): "Read the current Privacy Policy" → `https://choresforme.com/privacy-policy`, or "Read the current Terms of Service" → `https://choresforme.com/terms-of-service`.
  - Questions line at `mt-8`: `text-body text-ink-muted` "Questions? Email" followed by the `mailto:` support email link (`text-ink underline`, `min-h-11 inline-flex`).
  - Cross link at `mt-4`: `Button variant="link"` to the other legal page ("Terms" / "Privacy Policy").
- No legal text is copied or invented (product rule 15, decision 16).

### Tablet 768 px and 1024 px

Unchanged, because the 2xl measure is narrower than both columns.

### Mobile 375 px

- The notice card switches to `p-4` and keeps the icon left and text right.
- Links wrap.
- Default sticky bar. Footer `pb-24` clears it.

### Component tree

```
src/app/(marketing)/privacy/page.tsx, terms/page.tsx (server)
└─ LegalPlaceholder (new: src/components/marketing/legal-placeholder.tsx) kind
   └─ MarketingSection › h1, notice card › ExternalLink (new), mailto link, Button link
```

**Heading outline:** h1 only, then the footer h2s.

### States

Static.

### Interaction details

- **Focus order:** current-policy link (new tab), support email, the other legal page.

---

## 9. `CtaBand` (shared)

- Outer element: `MarketingSection tone={tone} labelledBy={headingId}`.
- Inner panel: `rounded-lg bg-surface-dark px-6 py-12 md:px-12 lg:px-16 lg:py-16`, with `flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between`.
- **Text** (`max-w-xl`): `h2` with `text-h2 text-surface`, and the body in `mt-4 text-body text-surface`.
- **Actions** (`flex flex-col gap-3 sm:flex-row lg:shrink-0`):
  - Primary: `Button size="lg"` (brand fill, `text-brand-foreground`) with `focus-visible:outline-surface`.
  - Secondary: `Button variant="inverse" size="lg"`.
  - On mobile both are `w-full sm:w-auto`. "Earn with Chores For Me" at `lg` is about 278 px, which fits the 295 px mobile panel interior.
- **Breakpoints:** at 1280 and 1024 the text is left and the buttons are right. At 768 and 375 it is stacked.

---

## 10. Hero picker, tiles and FAQ hrefs (quick reference)

| Element | Target |
| --- | --- |
| Hero "Post a job", CTA band primary (landing, how-it-works), mobile bar | `/post-job/category` |
| Hero picker chip, landing tile | `/post-job/services?category=<id>` |
| Service page "Post a job", its CTA band primary | `/post-job/services?category=<id>` |
| Hero "Earn with Chores For Me", "Start earning", every "Create worker account" | `/signup?role=worker` |
| CTA band secondary "Earn with Chores For Me" | `/workers` |
| Footer Services, "Other services" tiles | `/services/<id>` |
| Breadcrumb "Services" | `/#services` |

All `/post-job/*`, `/signup*` and `/login` links are dead until T5 and T6 (decision 17).

---

## 11. New strings and constants (`src/lib/constants.ts`, T4 block)

Everything marked [provisional] needs client approval. Labels quoted from the PRD or the decisions are not provisional.

**Routes**

- `postJobForCategory(id)`
- `serviceHref(id)`
- `WORKER_SIGNUP_HREF = "/signup?role=worker"`
- `WORKERS_HREF = "/workers"`

**Icons**

- `CATEGORY_ICONS`: outdoor → `Trees`, cleaning → `Sparkles`, disposal → `Trash2`, custom → `Wrench`
- `CATEGORY_DESCRIPTIONS` [provisional]:
  - outdoor: "Lawn mowing, weeding, planting and gutters."
  - cleaning: "Standard, deep and move-out cleaning."
  - disposal: "Furniture, appliances, yard waste and cleanouts."
  - custom: "Describe any chore that doesn't fit the others."

**Support and footer**

- `SUPPORT_EMAIL = "choresformesupport@protonmail.com"`
- `SUPPORT_PHONE = "(801) 948-0847"`
- `SUPPORT_PHONE_HREF = "tel:+18019480847"`
- `PLAY_STORE_CUSTOMER_URL` and `PLAY_STORE_WORKER_URL` (decision 13)
- `FOOTER.servicesHeading = "Services"`

**Accessibility**

- `A11Y.newTab = "(opens in a new tab)"`
- `A11Y.breadcrumb = "Breadcrumb"`
- `A11Y.onThisPage = "On this page"`

**`LANDING_COPY`**

- `hero`:
  - `eyebrow`: "Phone, ID and insurance verified" [provisional]
  - `headline`: "Your chores, done by verified local pros"
  - `supportingLine`: "Describe your chore, pick a verified local worker or post it to the job board, and pay when it's done." [provisional]
  - `primaryCta`: "Post a job"
  - `secondaryCta`: "Earn with Chores For Me"
  - `noAccountNote`: "No account needed to start a job." [provisional]
  - `pickerLabel`: "Or start with a service" [provisional]
- `services`:
  - `eyebrow`: "Services"
  - `title`: "What do you need done?"
  - `intro`: "Pick a category to start your job. You'll add the details next."
  - `tileAction`: "Start a job"
  - All [provisional]
- `howItWorks`:
  - `eyebrow`: "How it works"
  - `title`: "Three steps to a finished chore"
  - `steps`: the 3 PRD customer steps
  - `fullGuide`: "See the full guide"
  - All [provisional]
- `trust`:
  - `eyebrow`: "Trust and safety"
  - `title`: "What “verified” means"
  - `points` × 5 (title and body): Phone check, Identity verification, Insurance check, Chores ID-Card, Two-way ratings
  - `ratingRows`: "Customers rate workers", "Workers rate customers"
  - All [provisional]
- `workers`:
  - `eyebrow`: "For workers"
  - `title`: "Earn with Chores For Me"
  - `points` × 3
  - `cta`: "Start earning"
  - `secondaryLink`: "See what you'll need"
- `faq`:
  - `title`: "Common questions"
  - `seeAll`: "See all FAQs"
  - `itemIds`: `["cancellation-fee", "payouts", "sole-proprietor"]`
- `ctaBand`:
  - `title`: "Ready to get it done?" [provisional]
  - `body`: "Post your first job in a few minutes. No account needed to start." [provisional]
  - `primary`: "Post your first job"
  - `secondary`: "Earn with Chores For Me" → `/workers`

**`HOW_IT_WORKS_COPY`** [provisional]

- `title`: "How Chores For Me works"
- `intro`
- `jumpLinks`: "For customers", "For workers"
- `customers`:
  - `title`: "For customers"
  - `intro`
  - `steps` × 3. Suggested links: step 1 → "Post a job" (`/post-job/category`); step 3 → "When am I charged?" (`/faq#payment-timing`).
  - `cta`: "Post a job"
- `workers`:
  - `title`: "For workers"
  - `steps` × 4. Suggested links: step 1 → "Create worker account"; step 2 → "What categories can I choose?" (`/faq#categories`); step 4 → "How do I get paid?" (`/faq#payouts`).
  - `cta`: "Create worker account"

**`SERVICE_PAGE_COPY`**

- Per category: `metaTitle`, `metaDescription`, `heading` (e.g. "House cleaning by verified local pros"), `intro` [provisional].
- Shared:
  - `eyebrow`: "Services"
  - `breadcrumbHome`: "Home"
  - `includesTitle`: "What's included"
  - `includesIntro`
  - `otherLabel`: "Something else? Describe it in your job"
  - `customIncludesBody`
  - `howTitle`: "How it works"
  - `otherServicesTitle`: "Other services"
  - `otherServicesAction`: "See service"
  - `ctaTitle(name)`: "Get help with {name}"
  - `ctaBody`

**`WORKERS_PAGE_COPY`**

- `eyebrow`: "For workers"
- `title`: "Earn with Chores For Me"
- `intro`: "Choose your area, choose your jobs and get paid to your payout account."
- `cta`: "Create worker account"
- `mobileCta`: `{ label: "Create worker account", href: WORKER_SIGNUP_HREF, icon: UserPlus }`
- `whyJoin`: `title` "Why join", `points` × 3
- `jobTypes`: `title` "Jobs you can choose", `intro`
- `needs`:
  - `title`: "What you'll need"
  - `intro`: "You can browse jobs first. Before you accept your first job, complete identity verification."
  - `items` × 4
- `statusNote`: "Your ID and insurance show as “Under review” until approved. Then your Chores ID-Card shows them as “Verified”."
- `faq`: `title` "Worker questions", `itemIds`
- `ctaBand`: `title` "Ready to start earning?", `body`

**`FAQ_ITEMS`**

- The 9 entries in decision 1 (`id`, `audience`, `question`, `answer`).
- `sole-proprietor` also carries `link: { label: "Read the full guide", href: "https://choresforme.com/sole-proprietor" }`.

**`FAQ_COPY`**

- `title`: "Frequently asked questions"
- `intro`: "Answers for customers and workers."
- `searchLabel`: "Search the FAQ"
- `searchPlaceholder`: "Try “payout” or “cancel”"
- `resultsCount(n, total)`: "Showing {n} of {total} questions"
- `noResultsLine(q)`: "No questions match “{q}”"
- `clearSearch`: "Clear search"
- `noResultsTitle`: "No questions match your search"
- `noResultsDescription`: "Try a different word, or contact support."
- `groups`:
  - `customer`: "For customers"
  - `worker`: "For workers"
- `contact`:
  - `title`: "Still have questions?"
  - `body`: "Our support team is happy to help."

**`LEGAL_COPY`**

- `eyebrow`: "Legal"
- `privacy`:
  - `title`: "Privacy Policy"
  - `currentLabel`: "Read the current Privacy Policy"
  - `currentHref`
- `terms`:
  - `title`: "Terms"
  - `currentLabel`: "Read the current Terms of Service"
  - `currentHref`
- `notice`
- `questions`: "Questions? Email"

**Previews**

- `ID_CARD_PREVIEW_SAMPLE`:
  - `ariaLabel`: "Sample Chores ID-Card"
  - `title`: "Chores ID-Card"
  - `sampleTag`: "Sample"
  - `name`: "Sample worker"
  - `note`: "Illustrative example"
  - `rows`, each `{ label, detail }`, labelled with `VERIFICATION_STATUS_LABELS.verified`:
    - Phone: "Mobile number confirmed by SMS code"
    - ID: "Photo ID checked, 18 or older"
    - Insurance: "Insurance document reviewed"
- `JOB_BOARD_PREVIEW_COPY.title`: "Open jobs near you"

**Metadata**

- `MARKETING_META` for `/`, `/how-it-works`, `/workers`, `/faq`, `/privacy` and `/terms` [provisional, decision 18].

---

## 12. QA hooks (design-specific)

- `grep` T4 files for `text-brand`, `border-brand`, `text-white`, raw hex, `text-sm`, `text-base`, `font-medium` and `font-bold`. The result must be zero.
- Exactly one `bg-surface-dark` element per page in `main` (the `CtaBand` panel), and it is never adjacent to the Footer without a light band between them.
- One `h1` per page. Run a heading-order check (no skipped levels) on all 10 routes (`/`, 4 service pages, `/how-it-works`, `/workers`, `/faq`, `/privacy`, `/terms`).
- At 375 × 812, `document.documentElement.scrollWidth === 375` on every route. On `/`, the hero h1 and both CTAs are fully visible above the mobile bar.
- At 1280 × 800, the hero h1 and both CTAs are above the fold.
- `/workers` at 375: the bar reads "Create worker account". Every other route reads "Post a job".
- `/faq`: type "zzz" to see the EmptyState with "Clear search", which returns focus to the field. Open `/faq#payouts` to see that item expanded, scrolled clear of the header, with focus on its trigger.
- `/#services` from `/faq`: the section heading is visible below the sticky header.
- Footer at 768 to 820 px: no button text overflow, and the email wraps only at the `@`.
- Tab through each page. Every link, chip, tile, trigger and the search field shows the 2 px outline (white outline inside the CTA band and Footer).

---

## Open questions

1. **`/workers` route group.** This plan moves `/workers` to `src/app/(marketing-workers)/` so its layout can pass the worker CTA to the mobile bar (decision 9) without a client component. The product plan lists every route under `(marketing)`. The alternative keeps `/workers` in `(marketing)` and makes `MobileCtaBar` a small client component that switches on `usePathname()`. Which do you prefer? The plan assumes the route group.
2. **Support phone in the Footer.** Decision 12 supplies the phone number. This plan shows it in the Footer "Support" group and in the FAQ contact card, as a call link only. The PRD mentions "text options", but no SMS number or flow is known. Confirm that showing the phone in the Footer is wanted, since the PRD Footer row lists only the email.
3. **Category icons.** `Trees`, `Sparkles`, `Trash2` and `Wrench` are my picks for Outdoor, Cleaning, Disposal and Custom. Do the Android apps use specific icons that the client wants matched?
4. **Hero eyebrow claim.** "Phone, ID and insurance verified" reflects the PRD rule that workers verify before accepting jobs. Confirm the client is happy with this wording above the fold, or drop the eyebrow. The layout and fold checks still pass without it.
