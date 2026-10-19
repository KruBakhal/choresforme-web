QA report — T2 Design system

Code health: lint pass · typecheck pass · build pass

Hard-rule scan (changed files): no backend code, no new packages (`package.json` unchanged from T1), no seed imports, no raw hex outside `globals.css` and `styleguide/_data/tokens.ts`, no `dark:` classes, no arbitrary `[...]` values outside the generated sheet's `data-[side=…]` selectors, no off-scale spacing steps. Only button, sheet, separator and skeleton were added under `src/components/ui`. No GothamPro file in the repo.

Verification method: code reading, plus `next start -p 3100` (curl) and `next dev -p 3200` in the built-in browser pane at 1280, 1024, 768 and 375 px, with light and dark `prefers-color-scheme`. Both servers were stopped afterwards (`taskkill /T /F`) and ports 3100 and 3200 are free.

Flow
- [PASS] `/styleguide` returns 200; `/` returns 200; `/favicon.ico` and `/brand/logo-mark-white.png` return 200
- [PASS] `/styleguide` metadata: `<title>Styleguide · Chores For Me</title>` and `<meta name="robots" content="noindex, nofollow">`; no link to `/styleguide` anywhere in `src` or in the `/` HTML
- [PASS] Favicon: `src/app/favicon.ico` is byte-identical to `public/brand/favicon.ico`
- [PASS] Header menu sheet (768 and 375 px): Enter on the "Open menu" trigger opens it (`aria-expanded="true"`, dialog titled "Menu", focus moves inside). Escape closes it on the first press (`data-state="closed"`, `aria-expanded="false"`), and focus returns to "Open menu" once the exit animation unmounts it. At 375 the sheet is full width (0 to 375) with no page overflow. It contains Services, How it works, For workers, Log in, Sign up and Post a job, all 48 px tall
- [PASS] ErrorState demo: Retry shows "Retrying…" with `aria-busy`, then "Loaded (demo only — no service call)" in `role="status"`, and "Show error again" restores the `role="alert"` card. No network or service call is made
- [PASS] Sheet demo opens and closes with the keyboard
- [PASS] Nav configs match the PRD and the orchestrator decisions: customer Home · Jobs (`/dashboard/jobs`) · History · Account; worker Jobs · My Jobs · Earnings · Account; Header has Services (`/#services`), How it works, For workers, Log in, Sign up and Post a job. `isNavActive` uses exact matching for the dashboard roots and prefix matching for the rest
- [PASS] Footer shows "© 2026 Chores For Me. All rights reserved.", the one support mailto (support@choresforme.com), "Privacy Policy", "Terms" and the two Play Store links (placeholder `#`, per decision 11). "Download" does not appear in the Header
- [PASS] No console errors or warnings on `/styleguide` or `/` (only the React DevTools info and HMR log), and no warnings in the dev server log
- [PASS] `?mockError=1`: N/A, because T2 makes no service calls (as the product plan notes)

Design
- [PASS] Tokens: every `:root` value matches the plan table (`--surface-dark` #333333 per decision 2). The shadcn aliases map onto the tokens, `--input` is `--ink-muted` and `--ring` is `--ink`. There is no `.dark` block, no oklch values, no `--radius` calc lines and no `--chart-*` or `--sidebar-*` variables. The inert `@custom-variant dark` is kept
- [PASS] Light only: with emulated dark mode, `/` and `/styleguide` keep a white body background and #333 text, the brand button stays #00ABF6 on #333, and the page has no `prefers-color-scheme` rules
- [PASS] Font: the body computes to `Poppins, "Poppins Fallback", system-ui, sans-serif`, loaded at weights 400 and 600 only. Geist is removed
- [PASS] Type scale, weights, spacing, `max-w-content` and the 2xl reset are in `@theme`. h1 measures 44 px at 1280 and 1024 and 32 px at 375
- [PASS] Focus ring: global `:focus-visible` is a 2 px `--ring` (ink) outline with no alpha. The ring is white on `surface-dark` (footer links, the inverse button, the Logo on dark). Verified on the sheet close button in the browser
- [PASS] Header at 1280 and 1024: Logo, the full nav and Log in, Sign up and Post a job are visible, with no clipping inside the frame. At 768: Logo, Post a job and the menu button, and the nav is hidden. At 375: Logo and the menu button only. The Footer's mobile CTA bar renders in its frame
- [PASS] AppShell at 1280: SideNav 240 px, main column and rail 320 px, with the customer Post a job in the SideNav and Home marked `aria-current`. At 1024: SideNav 240 px and the rail stacks under main. At 768: icon-only SideNav (80 px), no rail column and no BottomNav. At 375: the SideNav is hidden, the top bar shows (customer Post a job included) and the BottomNav shows 4 cells of 94 × 64 px with the active item marked
- [PASS] No horizontal scroll: `scrollWidth <= clientWidth` at 1280 (1265/1265), 1024 (1009/1009), 768 (753/753) and 375 (375/375). No element overflows the viewport and no preview frame clips its content
- [PASS] Touch targets: every visible interactive element on `/styleguide` at 375 is at least 44 px tall. Icon buttons are 44 × 44 and BottomNav cells are 94 × 64
- [PASS] State components: LoadingState (cards, rows, detail, summary, with a `role="status"` busy label and `aria-hidden` skeletons), EmptyState with and without an action, and ErrorState with Retry and a secondary action
- [PASS] Styleguide covers all 8 sections: Brand (lockup on light and dark, mark on brand and on dark), the 12 colour swatches with pairings, the alias list, typography, spacing, radii, breakpoints, the live grid, the 44 px target, the button matrix (all variants and sizes, icon, disabled, loading), Separator, Skeleton, Sheet, Header and Footer frames, both AppShell roles, SideNav full and icon, BottomNav for both roles, and every state. Nothing fixed or sticky escapes a frame
- [PASS] Shared pieces are reused (Container, Logo, SkipLink, `isNavActive`) with no duplicated components. Copy lives in `src/lib/constants.ts`

Minor (log only, does not block)
- src/app/page.tsx:5-6 — `text-2xl` and `text-base` emit nothing since the type-scale reset (h1 falls back to the base 44 px). This is the known placeholder and is replaced in T4 — use `text-h2 md:text-h1` and `text-body` if it is touched sooner
- src/components/ui/sheet.tsx:48 — `SheetContent` defaults `closeLabel` to "Close menu", so non-menu sheets (the styleguide demo, and later the filters and dialogs sheets) announce "Close menu" — default to a generic "Close" string in `A11Y` and keep passing `A11Y.closeMenu` from `HeaderMenu`
- src/components/states/error-state.tsx:50 — the Retry `Button` has no `type="button"`, so an ErrorState placed inside a `<form>` would submit it — add `type="button"`
- src/components/layout/side-nav.tsx:67 — in `responsive` mode the `title` hover hint stays on from lg up, where the labels are already visible, which gives a duplicate native tooltip — only set `title` when labels are visually hidden (icon mode or below lg)
- src/app/styleguide/page.tsx:91 — the Brand grid is `md:grid-cols-2 xl:grid-cols-3`, while the UI plan says `md:grid-cols-3`. This is cosmetic; align it or note it as intended
- src/app/styleguide/page.tsx:287-366 — the previews repeat `nav aria-label="Main"` and `nav aria-label="Dashboard"` landmarks several times on one page. This is styleguide-only noise for screen-reader landmark lists and is acceptable for a dev page; it could be wrapped as `aria-hidden` previews or the labels suffixed in preview mode

Manual checks for the person
- `/styleguide` at 1280 px — the header frame shows the full nav with Log in, Sign up and Post a job on one row; the AppShell customer frame shows the side nav, main and rail as three columns; the logo mark is crisp in every tile
- `/styleguide` at 1280 px — Tab through the page: each control shows a 2 px dark outline, and footer links and inverse buttons show a white outline on the dark band
- `/styleguide` at 1024 px — the header frame still fits on one row; in the AppShell frame the Templates rail sits under the main content
- `/styleguide` at 768 px — the header frame shows Logo, Post a job and the menu button. Open the menu with the keyboard, press Esc, and check that the slide-out animation plays and focus lands back on the menu button. The AppShell frames show the icon-only side nav (hover shows the label tooltip)
- `/styleguide` at 375 px — no sideways scroll; the menu sheet covers the full width; the Footer frame's Post a job bar and the BottomNav previews look right (active pill tint, labels readable)
- `/styleguide` and `/` with the OS in dark mode — both pages stay light
- Browser tab on any route — the favicon is the Chores For Me mark
- DevTools console on `/styleguide` at each width — no errors or warnings

Verdict: READY TO COMMIT
