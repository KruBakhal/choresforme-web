# MVP build progress

| Ticket | Status | Commit | Notes |
| --- | --- | --- | --- |
| T1 Scaffold | Done | 48c6c12 | Full fixed stack installed; shadcn on Radix (radix-nova); tokens via Tailwind v4 `@theme inline` in `src/styles/globals.css`; `agentRules: false` in next.config |
| T2 Design system | Done | | Brand from choresforme.com: #00ABF6, Poppins 400/600, logo mark in `public/brand/`; light only; Header, Footer, AppShell, SideNav, BottomNav, state components; `/styleguide` (noindex, unlinked) |
| T3 Data + mock layer | Not started | | |
| T4 Marketing pages | Not started | | |
| T5 Auth | Not started | | |
| T6 Job builder 1–5 | Not started | | |
| T7 Job builder 6–8 | Not started | | |
| T8 Customer dashboard | Not started | | |
| T9 Worker onboarding | Not started | | |
| T10 Worker dashboard | Not started | | |
| T11 Hand-off + analytics | Not started | | |
| T12 QA + demo deploy | Not started | | |

## Manual checks

### T1
- `/` at 1280 px: heading and line centred on white surface, tab title "Chores For Me", no console errors or warnings.
- `/` at 1024 and 768 px: same centred block with 32 px side padding.
- `/` at 375 px: text wraps with 16 px side padding, no horizontal scroll.
- `/` with OS/browser dark mode: page stays light.

### T2
- `/styleguide` at 1280 px: header frame on one row; customer AppShell shows 3 columns; logo mark crisp; Tab shows a 2 px dark focus outline (white on the dark footer band).
- `/styleguide` at 1024 px: header still on one row; AppShell rail stacks under main.
- `/styleguide` at 768 px: open the menu with the keyboard, press Esc, the slide-out animation plays and focus returns to the menu button; the icon-only side nav shows hover titles.
- `/styleguide` at 375 px: no sideways scroll; menu sheet is full width; the Post a job bar and BottomNav previews look right (active pill tint, readable labels).
- `/styleguide` at every width: no console errors or warnings.
- `/` and `/styleguide` with OS dark mode: both stay light.
- Any route: the tab favicon is the Chores For Me mark.

## Minor issues (fix in T12)

- [T1] `.prettierignore` does not list root markdown files (AGENTS.md, CLAUDE.md, README.md); `npm run format` rewrites their line endings and `format:check` fails on AGENTS.md. Fix: ignore `*.md` at root.
- [T2] `src/app/page.tsx:5-6`: `text-2xl` / `text-base` emit nothing after the type-scale reset (placeholder; T4 replaces it).
- [T2] `src/components/ui/sheet.tsx:48`: `SheetContent` close label defaults to "Close menu"; default it to a generic "Close".
- [T2] `src/components/states/error-state.tsx:50`: Retry button lacks `type="button"`.
- [T2] `src/components/layout/side-nav.tsx:67`: in responsive mode the `title` tooltips stay on at lg+ where labels are visible.
- [T2] `src/app/styleguide/page.tsx:91`: Brand grid uses `md:grid-cols-2 xl:grid-cols-3`; UI plan says `md:grid-cols-3`.
- [T2] `src/app/styleguide/page.tsx:287-366`: previews repeat "Main" / "Dashboard" nav landmarks (dev page only).

## Open questions

- [T1] Temporary home meta description "Chores For Me connects customers with verified local workers for home chores." — T4 should replace with client-approved copy.
- [T2] Headings on choresforme.com use GothamPro (commercial). The MVP uses Poppins everywhere. Does the client hold a web licence for GothamPro they want used?
- [T2] Brand blue #00ABF6 fails AA with white text, so filled brand buttons use dark text (#333333). Is the client OK with this, or do they want a darker brand shade added?
- [T2] Google Play URLs for the Customer and Worker apps are placeholders (`#`) in `constants.ts`. Need the real links.
- [T2] Customer nav "Jobs" points to `/dashboard/jobs`, a list route not in the Tech Spec route map (T8 adds it). Confirm.
- [T2] `/styleguide` stays reachable in the hosted demo (noindex). Confirm, or hide it in production.
