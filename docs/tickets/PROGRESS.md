# MVP build progress

| Ticket | Status | Commit | Notes |
| --- | --- | --- | --- |
| T1 Scaffold | Done | 48c6c12 | Full fixed stack installed; shadcn on Radix (radix-nova); tokens via Tailwind v4 `@theme inline` in `src/styles/globals.css`; `agentRules: false` in next.config |
| T2 Design system | Done | 043f904 | Brand from choresforme.com: #00ABF6, Poppins 400/600, logo mark in `public/brand/`; light only; Header, Footer, AppShell, SideNav, BottomNav, state components; `/styleguide` (noindex, unlinked) |
| T3 Data + mock layer | Done | | Spec types, constants, seed (4 categories, 2 customers, 6 workers, 12 jobs, 2 templates, Visa 4242), persisted mock DB, all spec services plus extras, one-shot `?mockError=1`, 3 SSR-safe stores, Zod schemas + resolver, `track()` stub, Footer "Reset demo data", `/dev/mock` (noindex) |
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

### T3
- `/dev/mock` at 1280 px: after logging in and scrolling mid-page, check whether the sticky Stores card is cut off; seed tile row; chip wrapping.
- `/dev/mock` at 1024 px: the "Payment methods" tile label wraps cleanly; the store Clear buttons stay on their heading rows.
- `/dev/mock` at 768 px: one column, Stores after Favourites, and the "Stores" chip jumps to it.
- `/dev/mock` at 375 px: no sideways scroll with the longest JSON open; Run, Reset and link buttons are full width; JSON boxes scroll by touch.
- `/dev/mock` with the keyboard: tab order and the focus ring on JSON boxes; focus returns to Run after a call finishes.
- `/dev/mock?mockError=1`: the armed notice shows; the first Run shows "Simulated error (?mockError=1)"; Retry succeeds; "Load without ?mockError" removes the notice.
- `/styleguide` footer at 1280 and 375 px: Reset placement; white outline on keyboard focus, none on mouse click; native confirm, where Cancel does nothing and OK reloads with the seed restored.
- All routes: no console errors or warnings.

## Minor issues (fix in T12)

- [T1] `.prettierignore` does not list root markdown files (AGENTS.md, CLAUDE.md, README.md); `npm run format` rewrites their line endings and `format:check` fails on AGENTS.md. Fix: ignore `*.md` at root.
- [T2] `src/app/page.tsx:5-6`: `text-2xl` / `text-base` emit nothing after the type-scale reset (placeholder; T4 replaces it).
- [T2] `src/components/ui/sheet.tsx:48`: `SheetContent` close label defaults to "Close menu"; default it to a generic "Close".
- [T2] `src/components/states/error-state.tsx:50`: Retry button lacks `type="button"`.
- [T2] `src/components/layout/side-nav.tsx:67`: in responsive mode the `title` tooltips stay on at lg+ where labels are visible.
- [T2] `src/app/styleguide/page.tsx:91`: Brand grid uses `md:grid-cols-2 xl:grid-cols-3`; UI plan says `md:grid-cols-3`.
- [T2] `src/app/styleguide/page.tsx:287-366`: previews repeat "Main" / "Dashboard" nav landmarks (dev page only).
- [T2] `/styleguide` Footer preview at about 800 px: the "Customer app on Google Play" button text overflows its border, and the support email wraps mid-word (found during T3).
- [T3] `src/app/dev/mock/_components/dev-mock-panel.tsx:64`: the sticky Stores aside grows past the viewport (802 px at 1280×800) once a session exists; drop `lg:sticky` in that case, as the UI plan says.
- [T3] `src/app/dev/mock/_components/use-service-call.ts:38`: "Resolved in N ms" includes render overhead (up to 812 ms); measure only the service promise.
- [T3] `src/components/layout/reset-demo-data-button.tsx:8`: statically imports `services.ts`, so every page with the Footer bundles the whole mock layer; import it dynamically in the click handler.
- [T3] `src/lib/validation/payment.ts:52`: the Amex CVC-length check lacks `{ when: always }`, so its error appears only after the other card errors are fixed.
- [T3] The T1 `.gitkeep` files in `src/lib/mock`, `src/lib/store` and `src/lib/validation` are no longer needed.

## Open questions

- [T1] Temporary home meta description "Chores For Me connects customers with verified local workers for home chores." — T4 should replace with client-approved copy.
- [T2] Headings on choresforme.com use GothamPro (commercial). The MVP uses Poppins everywhere. Does the client hold a web licence for GothamPro they want used?
- [T2] Brand blue #00ABF6 fails AA with white text, so filled brand buttons use dark text (#333333). Is the client OK with this, or do they want a darker brand shade added?
- [T2] Google Play URLs for the Customer and Worker apps are placeholders (`#`) in `constants.ts`. Need the real links.
- [T2] Customer nav "Jobs" points to `/dashboard/jobs`, a list route not in the Tech Spec route map (T8 adds it). Confirm.
- [T2] `/styleguide` stays reachable in the hosted demo (noindex). Confirm, or hide it in production.
- [T3] Sub-services are provisional: House Cleaning = Standard Cleaning, Deep Cleaning, Move-in / Move-out, Window Cleaning, Other; Item Disposal = Furniture Removal, Appliance Removal, Yard Waste, Garage Cleanout, Other; Custom = Other only. Is the Outdoor list complete? Need the exact lists from the apps.
- [T3] The service area is provisional: Texas only (seed cities Austin, Dallas, Houston). Other states see "notify me". Which states are served at launch?
- [T3] Direct ("Pick a Worker") jobs are created as Accepted and never appear on the board. Confirm.
- [T3] Cancel is allowed for Open and Accepted jobs only; ratings are 1–5 stars, completed jobs only, once, and update the worker's average. Confirm.
- [T3] The board's distance is a deterministic mock derived from ZIP codes (the data model has no coordinates).
- [T3] Provisional copy not in the spec: the rejected-ID reason "The ID photo was unclear. Please upload a new photo.", "Enter your password", "Photos must be JPG, PNG, HEIC or WebP", "This job can't be changed right now", "Log in to continue", and the demo account labels. There is also a default worker radius of 25 miles.
- [T3] Demo social identities: Google = Alex Rivera (`alex.google@choresforme.test`), Facebook = Sam Lee (`sam.facebook@choresforme.test`).
