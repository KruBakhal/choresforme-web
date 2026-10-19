# T2 — Product plan

Ticket row (Tech Spec, Build plan): **T2 Design system**. Scope: "Pull logo, colours and fonts from the current choresforme.com into tokens; theme shadcn; Header, Footer, AppShell, BottomNav, SideNav, Loading/Empty/ErrorState". Depends on: T1. Done when: "A `/styleguide` page shows every token and component".

T2 builds the visual foundation and the shared layout and state components. It wires them into **no** product route. The only page it ships is `/styleguide`.

## Scope

**In**

- Replace the provisional token **values** in `src/styles/globals.css` with the brand values below. The token **names** stay fixed.
- Fonts: Poppins through `next/font/google` (built into Next, so not a new library), weights **400 and 600 only**, wired into `--font-sans`. Remove Geist and Geist Mono from `src/app/layout.tsx`.
- Theme shadcn: map every shadcn variable that the added primitives use onto our tokens (table below). Remove shadcn's oklch values, its `.dark` block and its `--radius-*` calc lines. Our `--radius-sm/md/lg` replace them.
- Light mode only. No style may change when the OS or browser is set to dark mode (see rule 6 and Open question 1).
- Expose the Tech Spec scales (type, weights, spacing, breakpoints, content max width) as Tailwind theme values, so later tickets never need arbitrary `[...]` values.
- Brand assets: the logo lockup (white mark on a `--brand` tile plus the text "Chores For Me"), and the favicon.
- shadcn primitives, limited to the ones these components and the styleguide need: **button, sheet, separator, skeleton**. Anything else needs a reason in the UI plan.
- Layout components: `Header`, `Footer`, `AppShell`, `SideNav`, `BottomNav` (plus any small sub-parts they need, such as `Logo`).
- State components: `LoadingState`, `EmptyState`, `ErrorState`.
- The `/styleguide` dev showcase page.
- The copy and navigation config for these components goes in `src/lib/constants.ts` (see Open question 4).

**Out**

- Wiring Header and Footer into marketing routes (the `(marketing)/layout.tsx`, the landing page) → **T4**. The `/` placeholder from T1 stays unchanged.
- Wiring AppShell into the dashboard routes → **T8** (customer) and **T10** (worker).
- Marketing components (Hero, CategoryTile, HowItWorks, TrustBlock, FAQAccordion, CTABand) → T4.
- Flow and job components (Stepper, StepLayout, SelectableCard, JobCard, StatusBadge, WorkerCard and so on) → T5 to T10.
- `AppPrompt` and its device detection → T11. AppShell only gives it a slot.
- The notification bell (PRD: "Shared: a notification bell for job updates") → the dashboard tickets (see Open question 7).
- The footer link "Reset demo data", which needs the T3 mock layer → T3 or later (see Open question 8).
- Toasts. Screen states use toasts that "auto-dismiss after 4 s", but toasts are not in T2's component list, and adding one may need a new package → the first ticket that needs them (see Open question 9).
- Session, role detection, route guards → T3 and T5. The components take the role and the active route as inputs.
- Analytics events (Header "Post a job" → `job_builder_start` and so on) → T11.
- Dark mode, the iPhone app links (the iPhone app is out of MVP scope), copying or self-hosting GothamPro.

## Screens

| Route | Purpose | Access |
| --- | --- | --- |
| `/styleguide` (`src/app/styleguide/page.tsx`, outside any route group) | Dev showcase of every token and component; the T2 "Done when" check | Public, **not linked** from any page or nav, and **noindex, nofollow** through page `metadata.robots` |

Recommendation: no link to `/styleguide` anywhere, and noindex. Whether to hide it from the hosted demo build is Open question 10. The page has its own `<title>` ("Styleguide · Chores For Me" or similar) and makes no service calls.

## Brand tokens (values for `src/styles/globals.css`)

Source: the orchestrator's extraction from choresforme.com (`style-blue.css`, `font.css`). All tokens are declared once, in `:root`.

| Token | New value | Source / reason | Contrast check (WCAG 2.1) |
| --- | --- | --- | --- |
| `--brand` | `#00ABF6` | Site primary (the colour used most) | On white: about 2.6:1. **Never** use it as text or as the only boundary on white |
| `--brand-foreground` | `#333333` (dark ink) | Accessibility decision: white on brand fails AA | `#333333` on `#00ABF6`: about 4.9:1, which passes AA for normal text |
| `--brand-soft` | `#C7DAF5` (rgb 199,218,245) | Site light-blue accent | `--ink` on it: about 8.9:1 |
| `--ink` | `#333333` | Site text colour | On white: about 12.6:1 |
| `--ink-muted` | `#4D4F52` | Site secondary text. Picked over `#666666` because it has more contrast | On white: about 8.2:1. On `--surface-alt`: about 7.5:1 |
| `--surface` | `#FFFFFF` | | |
| `--surface-alt` | `#F4F4F4` | Site section band | |
| `--surface-dark` | keep `#0B1220` for now | The brief gives no dark band colour | See Open question 2 |
| `--border` | `#DDDDDD` | Site border | Decorative dividers only. Too light for input outlines (rule 8) |
| `--success` | keep `#16A34A` | Spec value, not on the site | On white: about 3.3:1, so do not use for small text |
| `--warning` | keep `#D97706` | Spec value | On white: about 3.2:1, so do not use for small text |
| `--danger` | keep `#DC2626` | Spec value | On white: about 4.8:1, passes |
| `--radius-sm/md/lg` | keep 8 / 12 / 20 px | Spec values | |
| `--font-sans` | Poppins (`next/font` variable), then `system-ui, sans-serif` | Site body font. GothamPro is replaced, not copied | |

`rgb(89,152,239)` and `#666666` / `#D3D3D3` from the site get **no** token, because the spec has no names for them. They are not used.

**shadcn variable mapping.** The left-hand names are shadcn's, and each one points at our token. Add no new token names.

| shadcn variable | Maps to |
| --- | --- |
| `--background`, `--card`, `--popover` | `var(--surface)` |
| `--foreground`, `--card-foreground`, `--popover-foreground`, `--secondary-foreground`, `--accent-foreground` | `var(--ink)` |
| `--primary` / `--primary-foreground` | `var(--brand)` / `var(--brand-foreground)` |
| `--secondary` | `var(--brand-soft)` (the UI planner may choose `--surface-alt` instead) |
| `--muted` / `--muted-foreground` | `var(--surface-alt)` / `var(--ink-muted)` |
| `--accent` (hover fills on ghost or menu items) | `var(--surface-alt)` |
| `--destructive` | `var(--danger)` |
| `--border` | **Same variable as our token.** Declare it once, as `#DDDDDD` |
| `--input` | A token that gives at least 3:1 against `--surface` (rule 8). The UI planner picks it; `--ink-muted` is suggested |
| `--ring` | A token that gives at least 3:1 against `--surface` and `--surface-alt`. `--brand` does **not**. Suggested: `--ink` (rule 7) |
| `--radius` | `var(--radius-md)`. The `@theme` block maps `--radius-sm/md/lg` straight to our tokens. Any `xl`/`2xl`+ radius that a primitive uses maps to `--radius-lg` |
| `--chart-*`, `--sidebar-*` | Remove the variables and their `@theme` lines. No T2 primitive uses them. A later ticket that adds such a primitive maps them then |

## Components

| Component | New or existing (path) | Used on | Responsibility |
| --- | --- | --- | --- |
| `RootLayout` | Existing, edited (`src/app/layout.tsx`) | All routes | Load Poppins 400/600 through `next/font/google` and feed it into `--font-sans`. Drop Geist and Geist Mono. Keep `lang="en"` and the existing metadata |
| Favicon | Existing, replaced (`src/app/favicon.ico` ← contents of `public/brand/favicon.ico`) | All routes | The brand favicon replaces Next's default |
| `globals.css` | Existing, edited (`src/styles/globals.css`) | All | Brand values, the shadcn mapping, the type, spacing and container scales in `@theme`, light only |
| `Button` | New, shadcn (`src/components/ui/button.tsx`) | Header, Footer, AppShell, states, styleguide | Themed variants. `default` is brand fill with `--brand-foreground` text. Sizes meet the 44 px touch target (rule 10) |
| `Sheet` | New, shadcn (`src/components/ui/sheet.tsx`) | Header mobile and tablet menu | The menu sheet |
| `Separator` | New, shadcn (`src/components/ui/separator.tsx`) | Footer, SideNav, styleguide | Dividers |
| `Skeleton` | New, shadcn (`src/components/ui/skeleton.tsx`) | `LoadingState`, later screens | Skeleton blocks |
| `Logo` | New (`src/components/layout/logo.tsx`) | Header, Footer, AppShell, styleguide | Lockup: `public/brand/logo-mark-white.png` on a `--brand` tile, plus the text "Chores For Me". Links to `/`. The mark is decorative (`alt=""`) because the text names it. Uses `next/image` at a small display size |
| `Header` | New (`src/components/layout/header.tsx`) | Marketing pages (wired in T4), styleguide | Desktop: Logo, Services, How it works, For workers, Log in, and a "Post a job" button. Tablet: the nav goes into a menu sheet, and "Post a job" stays visible. Mobile: Logo and a menu button, plus a sticky bottom "Post a job" bar |
| `Footer` | New (`src/components/layout/footer.tsx`) | Marketing pages (wired in T4), styleguide | App store links, one support address `support@choresforme.com` (mailto), Privacy Policy, Terms, © current year |
| `AppShell` | New (`src/components/layout/app-shell.tsx`) | Dashboards (wired in T8/T10), styleguide | Takes a role and a nav config. Desktop: SideNav (240 px), main area and an optional right-rail slot. Tablet: icon-only SideNav, no rail. Mobile: BottomNav and one column. The customer variant shows a persistent "Post a job" button |
| `SideNav` | New (`src/components/layout/side-nav.tsx`) | AppShell | Full (240 px) and icon-only modes. Marks the active item (`aria-current="page"`) |
| `BottomNav` | New (`src/components/layout/bottom-nav.tsx`) | AppShell | Four items fixed to the bottom on mobile. Marks the active item |
| `LoadingState` | New (`src/components/states/loading-state.tsx`) | Every data screen | Skeleton building blocks (for example rows, cards and a detail layout) so screens can "match the final layout". Has a screen-reader busy label |
| `EmptyState` | New (`src/components/states/empty-state.tsx`) | Every data screen | Icon, title, optional description, optional action (for example "Post a job") |
| `ErrorState` | New (`src/components/states/error-state.tsx`) | Every data screen | Title, message, "Retry" button (callback), optional secondary action (for example "back to dashboard"). Announced with `role="alert"` |
| Styleguide page | New (`src/app/styleguide/page.tsx` plus local sections as needed) | `/styleguide` | Shows every token and component (list below) |

Nothing exists yet in `src/components`, so all of these are new. One component per file, kebab-case file names.

**What `/styleguide` must show**

1. Brand: the logo lockup on surface and on `--surface-dark`, and the mark alone.
2. Colours: one swatch for each of the 12 colour tokens, with its name, value and intended use. Also the shadcn aliases and which token each one points at.
3. Typography: every step of the type scale (12, 14, 16, 20, 24, 32, 44 with 32 on mobile), each with its name and px value. Both weights (400, 600). The font family name.
4. Spacing scale (4 to 96), radii (sm, md, lg), breakpoints (sm 640, md 768, lg 1024, xl 1280), content max width (1200), the grid, and the 44 px touch target.
5. Primitives: every Button variant and size, including disabled and the loading or "submitting" look; Separator; Skeleton; Sheet (opens from a button).
6. Header and Footer, rendered in a framed preview.
7. AppShell for both roles (customer and worker nav), SideNav in full and icon-only modes, and BottomNav. Fixed positioning must not cover the styleguide page itself (UI planner decides how).
8. LoadingState (each variant), EmptyState (with and without action), ErrorState (Retry works in the demo only; no service call).

## Data and services

- **No** mock services, stores, Zod schemas or analytics in T2.
- `Role` (`'customer' | 'worker'`) is needed to type the AppShell and nav configs. It belongs in `src/lib/types.ts` (T3). See Open question 4 for the proposal: T2 creates the file with only that line, copied verbatim from the spec.
- Nav and copy config goes in `src/lib/constants.ts`: header links, footer links and labels, the customer and worker nav items (label, href, lucide icon), and the default state texts ("Retry" and so on).

Nav targets (routes from the Tech Spec route map; most return 404 until their ticket lands, which is fine):

| Item | Target |
| --- | --- |
| Header: Services | **Unresolved**: there is no `/services` index route (Open question 5) |
| Header: How it works / For workers / Log in / Post a job | `/how-it-works` / `/workers` / `/login` / `/post-job/category` |
| Footer: Privacy Policy / Terms | `/privacy` / `/terms` |
| Customer nav: Home · Jobs · History · Account | `/dashboard` · **unresolved** (Open question 6) · `/dashboard/history` · `/dashboard/account` |
| Worker nav: Jobs · My Jobs · Earnings · Account | `/worker/dashboard` · `/worker/dashboard/my-jobs` · `/worker/dashboard/earnings` · `/worker/dashboard/account` |

## Behaviour and rules

1. "Token names are fixed now; their values are provisional until ticket T2 replaces them with the logo colours and fonts of the current choresforme.com. Components use tokens only, never raw hex values." (Tech Spec) **Add no new token names** (Open question 3).
2. "Never invent a new colour, font size, data shape or duplicate component; extend the shared ones." (Tech Spec)
3. Type scale: "12 caption · 14 body-sm · 16 body · 20 h4 · 24 h3 · 32 h2 · 44 h1 (32 on mobile)". Weights: "400 regular, 600 semibold only". Spacing: "4, 8, 12, 16, 24, 32, 48, 64, 96". Breakpoints: "sm 640, md 768, lg 1024, xl 1280; content max width 1200". "Touch targets: At least 44 × 44 px". (Tech Spec) These must be available as theme utilities. Tailwind's defaults do not include 32 and 44 px text or a 1200 px container, so they have to be added. Tailwind's default sizes outside this scale must not be used.
4. PRD: "One type family, two weights and a clear size scale, used the same way on every screen." "Text, not images: headings and copy are real HTML text." The brand name in the lockup is text.
5. PRD: "Keep from today's site: Brand name, logo and colour palette". Improve: "Lighter, higher-contrast layout with more white space; the dark look stays as an accent band" (this is `--surface-dark`).
6. Light only: remove shadcn's `.dark` block. The page must stay light with the OS in dark mode (T1 manual check). **Watch out:** in Tailwind v4, deleting `@custom-variant dark` brings back the default `prefers-color-scheme` behaviour for every `dark:` class in the generated shadcn primitives. So either strip the `dark:` classes from the primitives, or keep a variant that never matches (Open question 1).
7. PRD: "WCAG 2.1 AA: labels on every field, keyboard navigation, sufficient contrast." Global criterion: "All interactive elements reachable by keyboard with a visible focus ring." The focus ring needs at least 3:1 against its background. `--brand` (2.6:1 on white) cannot be the ring.
8. Brand blue is a **fill**, never text on white. Filled brand buttons use `--brand-foreground` (`#333333`). Links on white use `--ink` with an underline or similar, not brand text (Open question 3). Input outlines need at least 3:1 (WCAG 1.4.11), so `--border` `#DDDDDD` is for dividers only. Status colours: `--success` and `--warning` are not used for small text on white.
9. Header (Tech Spec): "Header CTA 'Post a job'; mobile menu sheet; sticky mobile CTA bar." Responsive: desktop "Logo, full nav (Services, How it works, For workers), Log in, 'Post a job' button". Tablet "Nav collapses into a menu; Post a job stays visible". Mobile "Logo, menu sheet, plus a sticky bottom 'Post a job' bar". PRD: "Download" does not appear in the header or hero, and "Log in" is tertiary.
10. Footer (PRD): "app store links, support (one address: support@choresforme.com), Privacy Policy, Terms, current copyright year". PRD: "One name (Privacy Policy), current copyright year, one support address." App links appear "only in the footer" on marketing pages.
11. AppShell (Tech Spec): "Bottom nav on mobile, side nav from md". Responsive: desktop "Side nav (240 px), main content, right rail for templates and app prompt". Tablet "Icon-only side nav, no right rail". Mobile "Bottom nav, single column". Because "nothing is hidden on mobile that exists on desktop, only rearranged", content in the right-rail slot must move into the main column wherever the rail is hidden. Icon-only items keep an accessible name.
12. Navigation (PRD): customer "**Home · Jobs · History · Account**, with a persistent 'Post a job' button". Worker "**Jobs · My Jobs · Earnings · Account**".
13. "Every data screen ships four states: loading, empty, error and success. Use `LoadingState`, `EmptyState` and `ErrorState`." "Skeletons match the final layout; errors never clear typed input." ErrorState always offers Retry ("ErrorState with Retry").
14. "Desktop first, mobile ready … works fully at 1024, 768 and 375 px. No horizontal scroll at 375 px, nothing removed on mobile (only rearranged), and touch targets are at least 44 px." "Desktop gets hover states, but no action is available only on hover." Sticky bars (the Header CTA bar, BottomNav) must not cover the last content on the page.
15. "Server components are the default. Add `'use client'` only for interactive flows, forms and stores". Only the parts that need it (the menu sheet trigger, active-route detection, the Retry callback) are client components.
16. "Copy and labels live in `src/lib/constants.ts`, not scattered through JSX."
17. "Do not add libraries without approval." Poppins through `next/font/google` is built in. shadcn primitives are added with `shadcn add` and may only pull in the Radix packages they need (`radix-ui` is already installed).
18. PRD Environments: "no development build names visible". `/styleguide` is not linked from anywhere and is noindex.
19. "Light motion only (hover states, step transitions); nothing delays the first action."

## Analytics

None. T2 fires no events. The Header and Footer CTAs get their events (for example `job_builder_start`) in T11.

## Acceptance criteria

From the T2 Build plan row:

- [ ] A `/styleguide` page shows every token and component

Global (every ticket), copied verbatim:

- [ ] `npm run lint` and `npm run typecheck` pass with no errors
- [ ] No console errors or warnings on the touched pages
- [ ] Loading, empty, error and success states render (error via `?mockError=1`) (T2 note: the state components render on `/styleguide`. `?mockError=1` is N/A because T2 makes no service calls)
- [ ] All interactive elements reachable by keyboard with a visible focus ring
- [ ] Only design tokens used for colour, type and spacing

Criteria from later screens that T2's components must already support (copied verbatim, checked on the styleguide):

- [ ] Footer shows the current year, one support email and "Privacy Policy"
- [ ] "Download" does not appear in the hero; app links appear only in the footer
- [ ] Customer and worker navigation match the PRD (Home · Jobs · History · Account / Jobs · My Jobs · Earnings · Account)

Pipeline (AGENTS.md): `npm run build` passes. Checked at 1280, 1024, 768 and 375 px.

T2-specific checks for QA:

- [ ] `globals.css` has no `.dark` block, no oklch neutrals, no `--radius` calc lines and no unused `--chart-*` or `--sidebar-*` variables. Each token value matches the table above
- [ ] With the OS in dark mode, `/` and `/styleguide` stay light (no `dark:` style applies)
- [ ] Poppins loads at weights 400 and 600 only. Geist is gone. No GothamPro file is in the repo
- [ ] Brand button text and background contrast is at least 4.5:1. Focus ring and input outline contrast is at least 3:1
- [ ] Tab favicon is the Chores For Me mark
- [ ] `/styleguide` has `noindex` in its robots meta and no link to it exists in the app
- [ ] At 375 px: no horizontal scroll on `/styleguide`. Header menu sheet opens and closes with the keyboard (Esc), and focus returns to the trigger
- [ ] Only button, sheet, separator and skeleton were added under `src/components/ui`, unless the UI plan gives a reason for another

## Open questions

1. **Dark variant.** The orchestrator said to remove the dark custom variant. But in Tailwind v4, removing `@custom-variant dark (&:is(.dark *))` makes every `dark:` class in the shadcn primitives follow the OS colour scheme, which would partly darken the UI. Recommendation: keep the class-based custom variant (it stays inert because nothing ever sets `.dark`) and remove only the `.dark` block. The alternative is to strip every `dark:` class from each generated primitive. Which one?
2. **`--surface-dark` value.** The brief gives no dark band colour from the current site. Keep the provisional `#0B1220`, or use a site colour (for example `#333333` or black, matching `logo-mark-white-on-black.jpg`)?
3. **A darker brand shade.** `#00ABF6` cannot be used for text, links, icons on white or a focus ring (2.6:1). The plan works around this with ink-coloured links and ring. If the client wants brand-blue text links or outlines, the spec would need one more token (for example a darker brand shade at about 4.5:1 on white). Not added.
4. **`constants.ts` and `types.ts` before T3.** T2 needs nav and copy config and the `Role` type, but those files are T3's. Proposal: T2 creates `src/lib/constants.ts` with only layout and state copy plus the nav configs, and `src/lib/types.ts` with only `export type Role = 'customer' | 'worker';` (verbatim from the spec). T3 then adds to both files. Approve?
5. **Header "Services" link target.** No `/services` index route exists; only `/services/[category]`. Options: a dropdown of the 4 categories (needs the category list, which is T3 constants), or an anchor to the landing page's category tiles (`/#services`). Which one?
6. **Customer nav "Jobs" target.** The route map has `/dashboard` (Home, which shows active jobs), `/dashboard/jobs/[id]` and `/dashboard/history`, but no jobs list route. Add `/dashboard/jobs` in T8, or point Jobs somewhere else?
7. **Notification bell and Support link** (PRD "Shared" for dashboards). Should AppShell reserve a top-bar spot for them now, or leave them wholly to T8 and T10?
8. **"Reset demo data" footer link** (Tech Spec mock rules: "demo builds only"). Add it in T3 or T4 once the store exists, and confirm it belongs in the marketing Footer.
9. **Toasts.** Several screen states use toasts. shadcn's toast is `sonner`, a new package. Approve it for the first ticket that needs it (T6)?
10. **`/styleguide` in the hosted demo.** Keep it reachable but noindex and unlinked (the recommendation, useful for client review), or return 404 in production builds?
11. **App store links in the Footer.** These need the real Google Play URLs for the Customer and Worker apps. Until then, use placeholder `#` links labelled for both apps?
12. **Header "Sign up".** The PRD Role selection table mentions a header "Sign up" entry, but the header lists in the PRD and the Tech Spec name only "Log in" and "Post a job". Should the Header show "Sign up" (→ `/signup`)?

## Orchestrator decisions (resolve the open questions above)

1. **Dark variant:** keep the class-based `@custom-variant dark` (inert, `.dark` is never set); remove the `.dark` variable block. Light only.
2. **`--surface-dark`:** `#333333` (the site's dark neutral). Text on it uses `--surface` (white).
3. **No darker brand token.** Links and focus rings use `--ink`; brand blue is for fills, tiles and decorative accents only.
4. **T2 creates a minimal `src/lib/constants.ts`** (nav config, layout and state copy only) **and `src/lib/types.ts`** (only the `Role` type, verbatim from the spec). T3 extends both and must not break them.
5. **Header "Services"** links to `/#services` (the landing category section T4 builds).
6. **Customer nav "Jobs"** points to `/dashboard/jobs`; T8 adds that list route (parent of the spec's `/dashboard/jobs/[id]`). Logged as a client open question.
7. **Bell and Support** are left to T8/T10; AppShell does not reserve a slot.
8. **"Reset demo data"** is not in T2. T3 exposes a reset in the mock services; T5 puts the button in the demo accounts panel.
9. **No `sonner`.** No new libraries. Feedback uses inline status messages or Radix-based shadcn primitives already in the stack.
10. **`/styleguide`** stays reachable in all builds, with noindex/nofollow and no links to it.
11. **Play Store URLs** are placeholders in `constants.ts` (`#`), clearly named; logged as a client open question.
12. **Header shows "Sign up"** (PRD line 96, "Header 'Sign up' with no role → role picker"), so the Header has: logo, Services, How it works, For workers, Log in, Sign up, and the "Post a job" button.
