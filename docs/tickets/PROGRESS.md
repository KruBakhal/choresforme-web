# MVP build progress

| Ticket | Status | Commit | Notes |
| --- | --- | --- | --- |
| T1 Scaffold | Done | 48c6c12 | Full fixed stack installed; shadcn on Radix (radix-nova); tokens via Tailwind v4 `@theme inline` in `src/styles/globals.css`; `agentRules: false` in next.config |
| T2 Design system | Done | 043f904 | Brand from choresforme.com: #00ABF6, Poppins 400/600, logo mark in `public/brand/`; light only; Header, Footer, AppShell, SideNav, BottomNav, state components; `/styleguide` (noindex, unlinked) |
| T3 Data + mock layer | Done | bfb1b4d | Spec types, constants, seed (4 categories, 2 customers, 6 workers, 12 jobs, 2 templates, Visa 4242), persisted mock DB, all spec services plus extras, one-shot `?mockError=1`, 3 SSR-safe stores, Zod schemas + resolver, `track()` stub, Footer "Reset demo data", `/dev/mock` (noindex) |
| T4 Marketing pages | Done | 0d7ae89 | Landing, `/services/[category]` (4 slugs, real 404), `/how-it-works`, `/workers`, `/faq` (searchable, hash-open), `/privacy` and `/terms` placeholders (noindex); robots + sitemap; live Play URLs and support contact; Footer Services column |
| T5 Auth | Done | 2aa273b | `/login` (demo accounts panel), `/signup` (role picker, form, complete profile), `/forgot-password`; demo Google/Facebook dialog; hand-built inline OTP; `RequireRole` guard with `next`; separate-accounts notice; Log out in AppShell; Header signed-in island; placeholder `/dashboard` and `/worker/dashboard`; `useRevisitKey` resets flows that Cache Components keeps alive. QA passed in round 2 (round 1 had 3 blockers). |
| T6 Job builder 1–5 | Done | 727632e | Five fixed routes `/post-job/{category,services,location,details,match}`; Stepper ("Step N of 8"), StepLayout with sticky mobile footer, "Your job" summary; SelectableCard, AddressInput (mocked autocomplete), NotifyMeForm, PhotoUploader (5 max, camera on touch), PriceInput (fixed/hourly live total), WorkerCard; persisted draft with step guards and `?category=` skip; `instant = false` on step pages |
| T7 Job builder 6–8 | Done | | `/post-job/review` (ReviewSummary with Edit links and `?from=review`, inline sign-up/log-in/social as customer, Save As Template), `/post-job/payment` (saved cards or new card, brand + last 4 only, charged on completion, no refunds), `/post-job/confirmation` (posted job, what happens next, template offer, AppPrompt with Android Play button and 7-day dismiss). A guest can post a job end to end. |
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

### T4
- `/workers` at 375 px, tab in front: hard-reload on throttled "Slow 4G". The bar should read "Create worker account"; note whether "Post a job" flashes first. Open it in a background tab and switch to it: the bar should read "Create worker account".
- `/` at 375 px: h1, both CTAs and the picker sit above the sticky bar, with the visual below. At 768 px: the phone frame (about 207 px) and ID-Card badges don't clip. At 1024 and 1280 px: connector lines join the steps, the worker visual is on the left, and the CTA band has text left and buttons right.
- `/services/*` at 1280 and 375 px: the brand panel and icon tile look balanced; the breadcrumb wraps cleanly at 375; Custom's single wide card reads well.
- `/how-it-works` at 1024 px: the 4 worker columns (about 216 px each) have connectors, and link labels wrap cleanly.
- `/faq` at 375 and 1280 px: search, "zzz" shows the empty state, Clear search works. Changing the hash on the page smooth-scrolls the item clear of the header and expands it. At 1280 the contact card stays sticky. With reduced motion, nothing animates.
- `/privacy` and `/terms` at 375 px: the notice card holds; the email wraps only after "@"; the Footer clears the sticky bar.
- Footer at 768–820 px: the 2×2 group grid holds; the app button text fits; the email wraps only after "@".
- All routes: keyboard Tab shows the 2 px outline everywhere (white in the CTA band and Footer) and the skip link works; the console stays empty apart from the expected 404 prefetches of `/login`, `/signup` and `/post-job/*` until T5/T6.

### T5
- `/login` at 1280 and 375 px: log in and out repeatedly without reloading, through the SideNav and the Account sheet. Each return to `/login` shows a clean, enabled form.
- `/login` at 375 and 768 px: hard reload and type immediately; no input is lost.
- `/login` at 1280 px: while "Signing in…" shows, Esc and an overlay click must not close the social dialog.
- `/signup` at 375 px: after a social sign-in and a log out, "Sign up" shows the enabled picker.
- `/signup?role=customer` and `?role=worker` at 1280 px: an empty keyboard submit focuses First name; on complete profile it focuses Mobile.
- `/signup?role=worker` at 375 px on a real phone: fast typing and SMS autofill in the OTP boxes.
- `/signup` at 1024 and 1280 px: the sticky brand panel (about 824 px tall) shows its end by the bottom of the form.
- `/` Header at 1280 and 375 px: "Dashboard" replaces Log in / Sign up after hydration with no layout jump.
- `/dashboard` at 1280 px as a worker: press "Log out and create a customer account" a few times from a cold load. It should land on `/signup?role=customer` (one run did a full page load instead of a client navigation; informational).
- All auth routes and dashboards at 1280/1024/768/375 px: visual polish against the T5 UI plan; console clean apart from prefetch 404s for later-ticket routes and global font-preload warnings.

### T6
- `/post-job/category` at 1280 px, in the DevTools Accessibility pane or a screen reader: each card's name and description are announced, and the hidden Radix inputs are absent. Arrow keys on a physical keyboard select the cards with a visible focus outline. At 375 px: the cards use the row layout.
- `/post-job/services` with a screen reader: checkbox names and the group label. At 768 and 375 px: the chip row and the "Other" field.
- `/post-job/location` at 375 px: the suggestion list is not covered by the sticky footer, and "District of Columbia" truncates in the State field. At 1280 px: the list's layering and hover states.
- `/post-job/details` at 375 px on a real phone: "Take photo" opens the camera and "Choose photos" opens the gallery; a HEIC photo shows as a file tile with its name. At 1280 px: the summary stays sticky while scrolling, and the keyboard opens the native file dialog.
- `/post-job/match` at 1280 px: badge wrapping on the 218 px cards in 3 columns. At 1024 px: the 2-column grid. At 375 px: the list layout and the empty and error cards. With a screen reader: the loading, count and empty-state announcements.
- All five steps at every width: the console is clean after a fresh load.

### T7
- `/post-job/review` at 1280 px: the 7/5 split; as `demo.customer` the Post card stays pinned while scrolling. At 1024 px: the six OTP boxes show no clipping. At 768 px: the order is summary, template, auth card, Questions?, Back, and the jump link scrolls to the card. At 375 px: no card chrome on the auth card, the footer holds Back only, and after social sign-in the finish-profile card is visible without scrolling. At any width: the focus ring is visible on the Edit links and the checkbox.
- `/post-job/payment` at 1280 px: the order summary stays sticky. At 768 px: the expanded summary sits above the heading. At 375 px: the "Est. $…" bar sits above the heading; check how "Posting your job…" wraps. With an Amex number, the digits don't run under the "American Express" label.
- `/post-job/confirmation?job=…` at 1280, 1024 and 768 px: a centred 672 px column. At 375 px with Android emulation: the Play button sits under the text, and the dismiss X doesn't overlap the title. After Dismiss, a reload keeps the prompt hidden.
- `/post-job/confirmation?job=job-unknown` at 375 and 1280 px: the "We couldn't find this job" card, with stacked buttons at 375.
- Every T7 route at all four widths: no console errors or warnings.

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
- [T3, fixed in T4] `reset-demo-data-button.tsx` static import of `services.ts` (now a dynamic import).
- [T3] `src/lib/validation/payment.ts:52`: the Amex CVC-length check lacks `{ when: always }`, so its error appears only after the other card errors are fixed.
- [T3] The T1 `.gitkeep` files in `src/lib/mock`, `src/lib/store` and `src/lib/validation` are no longer needed.
- [T4] `src/components/marketing/breadcrumbs.tsx:27`: the "Home" breadcrumb link is 42 × 44 px; add `min-w-11`.
- [T4] `src/app/(marketing)/layout.tsx:18`: a full load of `/workers` may flash "Post a job" for one frame before the swap (and keeps it in a background tab or with JS off). Verify by eye; consider a server-resolved bar.
- [T4] `src/components/marketing/faq-accordion.tsx:138`: "Clear search" sits inside the `aria-live` results line and is re-announced on every count change; move it out of the `<p>`.
- [T4] `src/lib/constants.ts:752`: `SITE_URL` points robots/sitemap at choresforme.com; set it to the demo host in T12.
- [T4] Seed cities are Austin/Dallas/Houston (TX), but the live site points to Utah (801 phone, Utah sole-proprietor guide). Switch the seed and served state to Utah (for example Salt Lake City, Provo, Ogden) unless the client says otherwise.
- [T5] `src/components/auth/terms-field.tsx:21-22` and `src/components/auth/sign-up-page-client.tsx:161, :243`: the "Terms" and "Log in" link targets are 43 px wide (need 44).
- [T5] `src/components/layout/app-shell.tsx:59`: the customer mobile top bar logo-mark link is 40×44 px (need 44 wide).
- [T5] `src/components/auth/social-sign-in-dialog.tsx:110`: if a retry fails in the role-choice view, focus goes to a button that only exists in the confirm view, so focus is lost.
- [T5] `src/components/auth/sign-up-page-client.tsx:63, :77, :134-165`: the role picker flashes while redirecting an incomplete session.
- [T5] `src/components/auth/social-sign-in-dialog.tsx`: the role-choice sheet is about 689 px tall at 375 and scrolls on a 667 px phone (the plan expected about 520 px).
- [T5] `src/app/(auth)/login/page.tsx:18-20`: the interactive Suspense fallback is swapped after load, so a very fast first input can be lost.
- [T5] After social sign-in from `/login`, focus doesn't move to the complete-profile h1 (it lands on BODY).
- [T5] Global layout: two font-preload console warnings.
- [T6] `src/components/post-job/match-step.tsx:155`: after Retry succeeds the button disappears and focus falls to `body`; focus the first worker card or the heading.
- [T6] `src/components/job/job-summary-panel.tsx:25`: fixed ids `job-summary-title` / `job-summary-body` duplicate across kept-alive hidden routes; use `useId()`.
- [T6] `src/components/post-job/details-step.tsx:106`: the character counter is announced about 1 s after every visit to step 4, before any typing.
- [T6] `src/components/post-job/match-step.tsx:217`: while the worker list shows its error, the match cards don't carry the error id or `invalid` (UI plan §12).
- [T6] `src/components/forms/address-input.tsx:170`: `aria-controls` points at the suggestion list even when it isn't rendered.
- [T6] `src/components/post-job/job-step-route.tsx:43`: pressing browser Back into an old `?category=X` URL re-applies X and clears the services chosen since; `router.replace` to drop the param once applied.
- [T7] `src/components/post-job/use-step-navigation.ts:44` (used at :53): with `?from=review` the Continue label reads the saved draft, not the live form (on Category it says "Save and return to review" but goes to Services; on Services it says "Continue" but returns to Review).
- [T7] `src/lib/constants.ts:1719`: `nextDirect` plus a name ending in "." gives a double full stop ("…to Marcus J.. It shows…").
- [T7] `src/components/post-job/confirmation-step.tsx:436` (with `payment-step.tsx:174` and `services.ts:435`): after a reload, template status comes only from `job.savedAsTemplate`. A save that failed during posting still reads "Saved as a template", and a template saved from the Confirmation offer is offered again (possible duplicate).
- [T7] `src/components/flow/step-layout.tsx:172`: at 375 px "Posting your job…" wraps to two lines (the button grows to 73 px).
- [T7] `src/components/post-job/review-auth-panel.tsx:185`: "Not you? Log out" on the finish-profile card has no `onError`, so a failed logout is silent.

## Open questions

- [T1] Temporary home meta description "Chores For Me connects customers with verified local workers for home chores." — T4 should replace with client-approved copy.
- [T2] Headings on choresforme.com use GothamPro (commercial). The MVP uses Poppins everywhere. Does the client hold a web licence for GothamPro they want used?
- [T2] Brand blue #00ABF6 fails AA with white text, so filled brand buttons use dark text (#333333). Is the client OK with this, or do they want a darker brand shade added?
- [T2, resolved in T4] Google Play URLs now come from the live site (`com.choresforme.user`, `com.choresforme.worker`).
- [T2] Customer nav "Jobs" points to `/dashboard/jobs`, a list route not in the Tech Spec route map (T8 adds it). Confirm.
- [T2] `/styleguide` stays reachable in the hosted demo (noindex). Confirm, or hide it in production.
- [T3] Sub-services are provisional: House Cleaning = Standard Cleaning, Deep Cleaning, Move-in / Move-out, Window Cleaning, Other; Item Disposal = Furniture Removal, Appliance Removal, Yard Waste, Garage Cleanout, Other; Custom = Other only. Is the Outdoor list complete? Need the exact lists from the apps.
- [T3] The service area is provisional: Texas only (seed cities Austin, Dallas, Houston). Other states see "notify me". Which states are served at launch?
- [T3] Direct ("Pick a Worker") jobs are created as Accepted and never appear on the board. Confirm.
- [T3] Cancel is allowed for Open and Accepted jobs only; ratings are 1–5 stars, completed jobs only, once, and update the worker's average. Confirm.
- [T3] The board's distance is a deterministic mock derived from ZIP codes (the data model has no coordinates).
- [T3] Provisional copy not in the spec: the rejected-ID reason "The ID photo was unclear. Please upload a new photo.", "Enter your password", "Photos must be JPG, PNG, HEIC or WebP", "This job can't be changed right now", "Log in to continue", and the demo account labels. There is also a default worker radius of 25 miles.
- [T3] Demo social identities: Google = Alex Rivera (`alex.google@choresforme.test`), Facebook = Sam Lee (`sam.facebook@choresforme.test`).
- [T4] The live FAQ says a 5% cancellation charge applies after a worker accepts and a deposit is made. The PRD keeps the fee rule open and the MVP charges on completion, so the web FAQ says the amount "is being confirmed". Confirm the fee rule.
- [T4] The live FAQ says customers can't add a new job while one is in progress. That rule is not in the PRD and is not enforced in the MVP. Keep or drop?
- [T4] The business appears to be Utah-based (live phone (801) 948-0847 and the Utah sole-proprietor guide). Which states and cities launch first? (See the Texas seed above.)
- [T4] Legal pages are placeholders linking to the live privacy policy and terms. The client needs to supply final web-product legal text.
- [T4] City SEO pages from the PRD have no route in the Tech Spec; they are out of scope for the MVP.
- [T4] All marketing copy, page titles and descriptions, category descriptions, How It Works steps, the hero "Phone, ID and insurance verified" pill and the category icons are provisional and need client approval.
- [T5] Google and Facebook buttons use neutral "G" / "f" letter badges, not official brand marks. Supply approved brand SVGs, following Google's button guidelines?
- [T5] Provisional auth copy: the separate-accounts notice, role card descriptions, brand panel points, demo dialog text, "Check your email", demo panel text, "Verify your mobile number", "Resend code" (30 s cooldown) / "Change number", and the auth page titles.
- [T5] Until T9, a newly signed-up worker lands on `/worker/dashboard`; T9 switches this to `/worker/onboarding/area`.
- [T6] Provisional job-builder copy: step headings and labels ("Step N of 8"), summary labels, notify-me text, the photo-dropped-on-reload note, the "Favourite" tag and page titles.
- [T6] Photos in the job draft are kept only in memory for the session and dropped on reload (object URLs can't be persisted). Acceptable for the demo?
- [T6] Changing the category clears the chosen services, the "Other" text and any picked worker, but keeps the address and details. Changing the address also clears a picked worker. Confirm.
- [T7] Provisional checkout copy: the demo card note ("Demo only — don't enter a real card. Try 4242 4242 4242 4242."), "You're charged when the job is done. There are no refunds", the what-happens-next lines for board and direct jobs, the template messages, and the AppPrompt text beyond the PRD line.
- [T7] Confirmation shows only a photo count, because photo URLs are revoked when the draft clears. Dashboards (T8) show placeholders.
- [T7] The payment method used isn't recorded on the job (the Job type has no field for it). Fine for the demo?
