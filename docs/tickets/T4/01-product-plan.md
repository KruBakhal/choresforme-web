# T4 — Product plan

Ticket row (Tech Spec, Build plan): **T4 Marketing pages**. Scope: "Landing, service pages, how-it-works, workers page, FAQ, legal". Depends on: T2. Done when: "Landing acceptance criteria pass".

T4 replaces the T1/T2 placeholder `/` with the real landing page and adds every public marketing route. The pages are static content from `constants.ts`. They call no mock services, read no stores and fire no analytics events.

## Scope

**In**

- `src/app/(marketing)/layout.tsx`: renders `Header`, `<main id="main">` (the Header skip link needs this id) and `Footer` (with the default sticky mobile "Post a job" bar).
- Move the home page into the group: `src/app/(marketing)/page.tsx` replaces `src/app/page.tsx`, which is deleted because two pages cannot serve `/`. Remove the `.gitkeep` files in `src/app/(marketing)` and `src/components/marketing`.
- `/` landing, sections 2 to 8 of the PRD "Page sections" (Header and Footer come from the layout).
- `/services/[category]`: four category pages (Outdoor Home Service, House Cleaning, Item Disposal, Custom).
- `/how-it-works`: customer steps and worker steps.
- `/workers`: the "Earn with Chores For Me" page (Worker flow step 1, "Why join").
- `/faq`: searchable accordion and a contact card.
- `/privacy`, `/terms`: placeholder pages.
- Shared marketing components in `src/components/marketing/` (see Components).
- Generate the shadcn `accordion` primitive (Radix) into `src/components/ui/accordion.tsx`, themed with tokens.
- Marketing copy, page metadata, the FAQ entries and a category icon map in `src/lib/constants.ts`.
- Metadata: a unique `title` and `description` on every T4 page. Remove the temporary `description` from `src/app/layout.tsx` (keep its default `title: "Chores For Me"`).

**Out**

- Every route the CTAs point to: `/post-job/*` (T6), `/signup`, `/signup?role=worker` and `/login` (T5). These links stay dead until those tickets land.
- Funnel analytics: `landing_view` and `worker_page_view` are wired in T11 (see Analytics).
- The PRD's per-city SEO pages ("Lawn mowing in [City]"). The route map has no city route. See Open question 6.
- The worker dashboard `IdCard` and `VerificationChecklist` (T10) and `AppPrompt` (T11). T4 builds only a static, illustrative ID-Card preview for marketing.
- Real legal text (the client supplies it). Real photos and new image assets: only `public/brand/` may be used.
- App download links anywhere except the existing Footer.
- Cookie consent, UTM capture, the "separate accounts" notice for logged-in users (T5/T11).
- `sitemap.ts`, `robots.ts`, Open Graph images and a custom 404 page (not in either spec; see Open question 7).
- PRD deferrals: scheduling, refunds and disputes, chat and live tracking, price guidance, smart matching, an iPhone app.
- Fixing the T2 and T3 minor issues in PROGRESS.md (T12), except that the T2 note about `src/app/page.tsx` goes away when the page is replaced.

## Screens

All are public, server components, and in `src/app/(marketing)/`.

| Route | Purpose | Access |
| --- | --- | --- |
| `/` | Landing page. Gets a customer into the job builder, or a worker into sign-up, in one click | Public |
| `/services/[category]` | SEO page for one category. Crawlable text, its sub-services and the primary CTA into the builder with the category pre-selected | Public. The 4 `CategoryId` values only; any other value returns 404 (`notFound()`). Static params from `CATEGORY_IDS` |
| `/how-it-works` | Customer steps and worker steps. Each step links into the real flow | Public |
| `/workers` | "Earn with Chores For Me": choose your area, choose your jobs, get paid to your payout account. One CTA, "Create worker account" | Public |
| `/faq` | Searchable FAQ accordion and a contact card with the support email | Public |
| `/privacy` | Placeholder "Privacy Policy" page that says the client will supply the final text | Public |
| `/terms` | Placeholder "Terms" page, same pattern | Public |

## Components

| Component | New or existing (path) | Used on | Responsibility |
| --- | --- | --- | --- |
| `Header` | Existing (`src/components/layout/header.tsx`) | Marketing layout | Logo, nav (Services → `/#services`, How it works, For workers), Log in, Sign up, Post a job; menu sheet below 1024 px. No change |
| `Footer` | Existing (`src/components/layout/footer.tsx`) | Marketing layout | App links, support email, Privacy Policy, Terms, year, Reset demo data. Renders `MobileCtaBar`. No change |
| `MobileCtaBar` | Existing (`src/components/layout/mobile-cta-bar.tsx`) | Through Footer | Sticky "Post a job" bar below 768 px |
| `Container` | Existing (`src/components/layout/container.tsx`) | Every section | 1200 px column and 16 / 24 / 32 px gutters |
| `Button` | Existing (`src/components/ui/button.tsx`) | CTAs | `default` = primary, `outline` / `secondary` = secondary, `inverse` on the dark band, `link` for text links. Use `asChild` with `Link` |
| `Separator`, `Skeleton` | Existing (`src/components/ui/*`) | Where needed | No skeletons expected (static pages) |
| `EmptyState` | Existing (`src/components/states/empty-state.tsx`) | `/faq` | "No questions match your search" result |
| `Accordion` | New, shadcn generated (`src/components/ui/accordion.tsx`) | `FaqAccordion` | Radix accordion, themed with tokens; 44 px triggers |
| Marketing layout | New (`src/app/(marketing)/layout.tsx`) | All T4 routes | Header, `main#main`, Footer |
| `Hero` | New (`src/components/marketing/hero.tsx`) | `/` | h1, supporting line, "Post a job" (primary) and "Earn with Chores For Me" (secondary), inline category picker, illustrative visual |
| `HeroCategoryPicker` | New (`src/components/marketing/hero-category-picker.tsx`) | `Hero` | The 4 categories as compact links to `/post-job/services?category=<id>`. Plain links, server rendered |
| `CategoryTile` | New (`src/components/marketing/category-tile.tsx`) | `/` (also T6 step 1 per the spec inventory) | Icon, name, link. Takes `category` and `href` so T6 can pass its own target |
| `CategoryTiles` | New (`src/components/marketing/category-tiles.tsx`) | `/`, service pages (other categories) | The grid of tiles. Landing section has `id="services"` |
| `HowItWorks` | New (`src/components/marketing/how-it-works.tsx`) | `/`, `/how-it-works` | Numbered steps from constants, each with an optional link. Takes a step list so customer and worker variants share it |
| `TrustBlock` | New (`src/components/marketing/trust-block.tsx`) | `/`, `/workers` (optional), service pages | Phone, ID and insurance checks, the Chores ID-Card, two-way ratings; text left, visual right |
| `IdCardPreview` | New (`src/components/marketing/id-card-preview.tsx`) | `Hero`, `TrustBlock` | Static, token-styled illustration of a Chores ID-Card with Phone, ID and Insurance shown as "Verified" (labels from `VERIFICATION_STATUS_LABELS`) and a sample rating. Decorative sample data from constants; not the T10 `IdCard` |
| `WorkerSection` | New (`src/components/marketing/worker-section.tsx`) | `/` | Set your own area and services, choose jobs, get paid to your payout account; CTA "Start earning" |
| `FaqAccordion` | New, client (`src/components/marketing/faq-accordion.tsx`) | `/faq`, `/` | `"use client"`. Search field (on `/faq`), filtered accordion, empty result, opens the item named in the URL hash |
| `FaqContactCard` | New (`src/components/marketing/faq-contact-card.tsx`) | `/faq`, `/` FAQ section | "Still have questions?" with the support email (`SUPPORT_EMAIL`) as a `mailto:` link |
| `CtaBand` | New (`src/components/marketing/cta-band.tsx`) | `/`, `/how-it-works`, service pages, `/workers` | Dark accent band (`surface-dark`) with a headline, the primary CTA and a secondary link |
| `SectionHeading` | New, optional (`src/components/marketing/section-heading.tsx`) | All sections | Eyebrow, h2 and intro line, so headings stay consistent. UI planner decides |
| `LegalPlaceholder` | New (`src/components/marketing/legal-placeholder.tsx`) | `/privacy`, `/terms` | Page title, the "final text will be supplied by Chores For Me" notice and the support email |

Only `FaqAccordion` (and the Header's existing `HeaderMenu`) are client components. Everything else is a server component.

## Data and services

- **Types** (`src/lib/types.ts`, existing): `Category`, `CategoryId`. No new domain types. Local prop types for components are fine.
- **Constants** (`src/lib/constants.ts`, existing): `CATEGORIES`, `CATEGORY_IDS`, `VERIFICATION_STATUS_LABELS`, `HEADER_ACTIONS` (Post a job → `/post-job/category`, Log in, Sign up), `SUPPORT_EMAIL`, `BRAND_NAME`, `FOOTER`.
- **New constants** (add in a T4 block; do not change existing values):
  - `CATEGORY_ICONS: Record<CategoryId, LucideIcon>`: lucide icons per category.
  - `ROUTES` helpers or plain strings: `postJobForCategory(id) => "/post-job/services?category=" + id`, `serviceHref(id) => "/services/" + id`, `WORKER_SIGNUP_HREF = "/signup?role=worker"`.
  - `LANDING_COPY`: hero (headline "Your chores, done by verified local pros" from the PRD, supporting line, CTA labels "Post a job" and "Earn with Chores For Me", picker label), category section, how it works (3 customer steps), trust block, worker section (CTA "Start earning"), FAQ section heading and "See all FAQs" link, final CTA band ("Post your first job" plus the worker link).
  - `HOW_IT_WORKS_COPY`: customer steps and worker steps, each `{ title, body, href?, linkLabel? }`.
  - `SERVICE_PAGE_COPY: Record<CategoryId, { metaTitle, metaDescription, heading, intro }>` [provisional]. Sub-service lists come from `CATEGORIES`, never duplicated.
  - `WORKERS_PAGE_COPY`: the three value points, "what you'll need" list (photo ID front and back, insurance document, payout account, 18 or older), statuses copy ("Under review" until approved), CTA "Create worker account".
  - `FAQ_ITEMS: { id: string; question: string; answer: string; audience?: "customer" | "worker" }[]`, supplied by the orchestrator from the live site. `id` is a stable slug so other tickets can link `/faq#<id>`.
  - `FAQ_COPY`: page heading, search label and placeholder, no-results title and description, contact card copy.
  - `LEGAL_COPY`: privacy and terms headings and the placeholder notice.
  - `ID_CARD_PREVIEW_SAMPLE`: the illustrative card's sample name, rating and badge labels, marked as illustrative.
  - `MARKETING_META`: `{ title, description }` for `/`, `/how-it-works`, `/workers`, `/faq`, `/privacy`, `/terms`.
- **Mock services:** none. Marketing pages never import `services.ts`, the seed or the stores.
- **Stores:** none.
- **Zod schemas:** none. The FAQ search field is a filter, not a form.

## Behaviour and rules

1. Landing has "one job: get a customer into the job builder, or a worker into sign-up, within one click." (PRD)
2. CTA hierarchy (PRD): Primary "Post a job" in the hero, the sticky mobile bar and the end of the page → job builder step 1 (`/post-job/category`, no login). Secondary "Earn with Chores For Me" as the hero secondary button and in the worker section → worker sign-up (`/signup?role=worker`; the PRD role table says this CTA sets role Worker and shows no picker). Tertiary "Log in" in the header. "Get the app" only in the footer.
3. "The current 'Download' CTA is removed from the hero; app links move to the footer". No Play Store link or "Download" text on any T4 page body.
4. Landing sections in order (PRD): Header; Hero; Category tiles; How it works; Trust block; Worker section; FAQ; Final CTA band; Footer.
5. Hero: "headline on the benefit (for example 'Your chores, done by verified local pros'), one supporting line, the primary and secondary CTAs, and a service picker with the four categories so the first click already starts a job."
6. Category tiles and the hero picker: "Outdoor Home Service, House Cleaning, Item Disposal, Custom; each tile opens the job builder with that category pre-selected." Target `/post-job/services?category=<id>` (routing rule: "pre-selects the category and skips step 1"). Names come from `CATEGORIES`.
7. The landing category section has `id="services"` because the Header "Services" link is `/#services` (orchestrator decision).
8. How it works on the landing page: "three steps for customers: describe the job, choose a worker or post to the board, get it done and rate." `/how-it-works` adds the worker steps from the Worker flow (create a worker account, set area and services, browse jobs, verify ID and insurance, accept jobs and get paid). "Each step links into the real flow instead of being a picture only."
9. Trust block: "what verification means: phone, ID and insurance checks, the Chores ID-Card, two-way ratings." "Trust signals early: verified badges, ratings and a Chores ID-Card preview above the fold" → the hero visual includes `IdCardPreview`.
10. Worker section: "set your own area and services, choose jobs, get paid to your payout account; CTA 'Start earning'."
11. FAQ on the landing page: "reuse the current FAQ (cancellation fee, payouts, independent contractor status)". It shows a short set from `FAQ_ITEMS` and links to `/faq`.
12. `/faq`: "Searchable accordion, also linked from the flow steps where those questions come up." Search filters questions and answers as the user types, shows `EmptyState` when nothing matches, and never needs a submit. Each item has a stable `id`; opening `/faq#<id>` scrolls to that item and expands it.
13. `/workers` (Worker flow step 1, "Why join"): "Short value screen: choose your area, choose your jobs, get paid to your payout account". "One CTA: 'Create worker account'" → `/signup?role=worker`. Principle: "a worker sees job types and earnings info before uploading documents", so show the four job types. Use the wording "identity verification" ("fixing the current typo"). Statuses read "Under review" until approved (AGENTS.md).
14. Service pages: "one page per category … each with crawlable text and the same primary CTA." The primary CTA goes to `/post-job/services?category=<id>`.
15. Legal pages: "One name (Privacy Policy), current copyright year, one support address." Placeholder text only, saying the client will supply the final text. Do not invent legal terms (orchestrator decision).
16. "Text, not images: headings and copy are real HTML text". Page content is real text; images are decorative only (`alt=""`) or the brand logo.
17. Visuals: no new image assets beyond `public/brand/`. Use token-styled illustrative blocks and lucide icons for the phone mockups and photos (orchestrator decision). "The dark look stays as an accent band" → `CtaBand` on `surface-dark`.
18. "One type family, two weights and a clear size scale". Use tokens only: `text-caption` to `text-h1`, `font-normal` / `font-semibold`, colour tokens; no raw hex. h1 is 44 px desktop and 32 px on mobile. One h1 per page.
19. "Light motion only (hover states, step transitions); nothing delays the first action." Respect `prefers-reduced-motion`. No hover-only actions.
20. Responsive layouts (Tech Spec), verbatim rows:
    - Header: "Logo, full nav (Services, How it works, For workers), Log in, 'Post a job' button" / "Nav collapses into a menu; Post a job stays visible" / "Logo, menu sheet, plus a sticky bottom 'Post a job' bar" (already built in T2).
    - Landing hero: "Two columns: headline, CTAs and category picker left; photo or phone mockups right" / "Two columns, smaller visual" / "Stacked: text and CTAs first, visual below".
    - Category tiles: "4 in a row" / "2 × 2" / "2 × 2, compact".
    - How it works: "3 columns joined by a line" / "3 columns" / "Vertical numbered list".
    - Trust and worker sections: "Split two columns, text and visual" / "Split two columns" / "Stacked".
    - FAQ: "Accordion left, contact card right" / "Single column" / "Single column".
21. "No horizontal scrolling at any width down to 375 px; nothing is hidden on mobile that exists on desktop, only rearranged." Touch targets at least 44 × 44 px. Check at 1280, 1024, 768 and 375 px.
22. The hero h1 and both hero CTAs must be above the fold at 1280 px and at 375 px (375 × 812, with the 64 px header and the sticky mobile bar covering the bottom).
23. Server components by default; `"use client"` only for `FaqAccordion` (orchestrator decision, Tech Spec stack table). Under `cacheComponents: true`, pages must not read uncached data during render. `/services/[category]` gets `generateStaticParams` from `CATEGORY_IDS`.
24. Performance: "Landing page loads in under 2.5 s on a mid-range phone over 4G". Keep client JS to the accordion and the header menu.
25. Accessibility (WCAG 2.1 AA): keyboard access and a visible focus ring on every link, button and accordion trigger; the search field has a visible label; heading levels in order.
26. Copy lives in `constants.ts`, not in JSX (AGENTS.md).
27. Marketing pages do not call mock services, so the four data states do not apply. The only state is the FAQ search "no results" (empty) state. Note this when checking the global criterion "Loading, empty, error and success states render".
28. Trust copy must not invent facts: no customer counts, job counts, average ratings, prices, earnings figures, review times, background-check claims or service-area claims beyond the PRD. The `IdCardPreview` sample is clearly illustrative.

## Analytics

T4 fires **no events**. The Tech Spec T4 row does not mention analytics, and the T11 row is "wire every funnel event", so per the orchestrator decision T11 wires:

- `landing_view`: on `/` view (T11; needs a small client component on the landing page because the page is a server component).
- `worker_page_view`: on `/workers` view (T11, same pattern).
- `job_builder_start` is fired by the builder (T6/T11), not by T4 links.

T4 must not import `track()`.

## Acceptance criteria

Tech Spec "Acceptance criteria", verbatim. Each must pass at 1280, 1024, 768 and 375 px.

**Global (every ticket)**

- [ ] `npm run lint` and `npm run typecheck` pass with no errors
- [ ] No console errors or warnings on the touched pages
- [ ] Loading, empty, error and success states render (error via `?mockError=1`) — not applicable to static marketing pages (no service calls); the FAQ "no results" empty state applies
- [ ] All interactive elements reachable by keyboard with a visible focus ring
- [ ] Only design tokens used for colour, type and spacing

**Landing and marketing**

- [ ] Hero shows the headline, "Post a job" (primary) and "Earn with Chores For Me" (secondary) above the fold at 1280 px and at 375 px
- [ ] Each category tile opens `/post-job/services` with that category pre-selected
- [ ] "Download" does not appear in the hero; app links appear only in the footer
- [ ] Footer shows the current year, one support email and "Privacy Policy"
- [ ] Page content is real text (no text inside images); each page has a unique title and meta description

Ticket-level checks (from the rules above):

- [ ] `/#services` from any page scrolls to the landing category section
- [ ] `/services/outdoor`, `/services/cleaning`, `/services/disposal`, `/services/custom` render; `/services/anything-else` returns 404
- [ ] `/faq` search filters items and shows the no-results state; `/faq#<id>` opens that item
- [ ] `/privacy` and `/terms` say the client will supply the final text; no invented legal terms
- [ ] `src/app/layout.tsx` no longer has the temporary meta description; `npm run build` passes

## Open questions

1. **FAQ copy (orchestrator to fetch).** Need every FAQ question and answer from the live choresforme.com, verbatim or lightly edited for the new tone, at least: cancellation fee, payouts (when and how workers are paid), independent contractor / Sole Proprietor status. Also any others on the live FAQ, which audience each is for (customer or worker), and a short slug for each. If the live answer states a cancellation fee amount, the PRD still lists the fee as open with the client ("Cancellation fee: amount and when it applies"). Confirm whether to show the live wording or a "to be confirmed" answer.
2. **Other live-site copy to reuse (orchestrator to fetch, optional).** The live "How It Works" steps for Customer and Worker, and any short service descriptions per category, so service pages and `/how-it-works` reuse real wording. Without them, T4 writes neutral copy marked [provisional].
3. **Service page slugs.** `/services/[category]` uses the `CategoryId` (`outdoor`, `cleaning`, `disposal`, `custom`) by default. Does the client want descriptive slugs (for example `/services/house-cleaning`) for SEO? Does "Custom" get its own service page?
4. **Inbound links to service pages.** The Header "Services" link goes to `/#services`, and tiles go to the builder, so nothing links to `/services/*`. Default: each landing tile keeps its builder link, and the category section adds a separate text link per category ("About House Cleaning") to its service page; service pages link to each other. Confirm, or prefer a Footer "Services" column (that changes the T2 Footer).
5. **Final CTA band worker link.** The PRD says "'Post your first job' plus the worker link" without a target. Default: `/workers`. Alternative: `/signup?role=worker`.
6. **City SEO pages.** The PRD mentions "one page per category and per city served (for example 'Lawn mowing in [City]')", but the route map has only `/services/[category]` and the service area is still open (T3: Texas only, provisional). Out of T4 unless a route is added.
7. **SEO extras.** Are `sitemap.ts`, `robots.ts`, canonical URLs and Open Graph metadata wanted in T4? Neither spec lists them. Should the placeholder `/privacy` and `/terms` be `noindex` until the real text arrives?
8. **Sticky mobile bar on `/workers`.** The global bar says "Post a job", but the page has "One CTA: 'Create worker account'". Keep the global bar (default), or show the worker CTA in the bar on that page (needs a small `Footer`/`MobileCtaBar` prop)?
9. **`/workers` and T9 "Why join".** T9's scope includes "Why join", but the route map has no onboarding route for it and maps `/workers` to "Worker flow step 1". Confirm that `/workers` built in T4 is the Why join screen, and T9 does not build a second one.
10. **FAQ search input primitive.** No `input` primitive exists yet. T5 (running in parallel) will likely generate shadcn `input`. Should T4 generate shadcn `input` now (risk of a parallel edit to the same file), or use a token-styled native `<input type="search">` local to `FaqAccordion`?
11. **Support phone and text.** The PRD says support offers "the single support email, phone and text options already offered in the apps". Only the email is known. The FAQ contact card shows email only until the phone number is supplied.
12. **Page titles and descriptions.** No client-approved meta copy exists (T1 open question). T4 writes provisional titles and descriptions in `MARKETING_META` and `SERVICE_PAGE_COPY`, for example `/` → "Chores For Me · Your chores, done by verified local pros". The client should approve them.
13. **ID-Card preview sample.** The hero and trust block show an illustrative Chores ID-Card with a made-up first name and sample rating. Is a fictional example acceptable, or should the card show labels only (Phone, ID, Insurance: Verified) with no name or rating?
14. **Dead links until T5/T6.** Hero, tiles, service pages and the worker CTAs link to `/post-job/*`, `/signup?role=worker` and `/login`, which 404 until T5 and T6 land. The demo should not be shown to the client before then.

## Orchestrator decisions (binding; resolve the open questions above)

Source: the live choresforme.com home page, FAQ and `/sole-proprietor` page, fetched by the orchestrator on 2026-10-20. Live copy is lightly copy-edited (typos fixed) but keeps its meaning. Put it all in `constants.ts`.

1. **FAQ copy.** Use these entries (audience · slug · question · answer):
   - worker · `experience` · "Do I need experience to work?" · "No. We don't ask for work experience; what matters is completing the chores you accept. Experience does help you pick the jobs that suit your strengths."
   - worker · `payouts` · "How do I get paid?" · "Every worker sets up a payout account, which is required. It is linked to your bank account or card, and money moves to it when the customer's payment is made."
   - worker · `registration-time` · "How long does it take to get registered?" · "Not long. Add a few details, verify your ID and insurance, and you're ready to go."
   - worker · `categories` · "What categories can I choose from?" · "There are four: Outdoor Home Service, House Cleaning, Item Disposal and Custom. Custom lets you describe a skill that doesn't fit the other categories."
   - worker · `sole-proprietor` · "Do I need to register as a sole proprietor?" · "Workers on Chores For Me are independent contractors. Many register a sole proprietorship: choose a business name, file an assumed business name (DBA) with your state, and get any licences or permits your work and city need. Requirements vary by state and city." Add a link "Read the full guide" to `https://choresforme.com/sole-proprietor`, opening in a new tab with `rel="noopener noreferrer"`.
   - customer · `cancel-job` · "How do I cancel a job?" · "Open the job in your dashboard and choose Cancel. You can cancel until the job has started."
   - customer · `cancellation-fee` · "Is there a fee to cancel a job?" · "There's no fee while no worker has accepted your job. After a worker accepts, a cancellation fee may apply; the exact amount is being confirmed." The live site says 5% after a deposit. The PRD keeps the fee rule open ("to be confirmed"), so show "being confirmed" and do NOT show 5%. This is logged as a client question.
   - customer · `payment-timing` · "When am I charged?" · "Your card is charged when the job is completed. There are no refunds in this version." This comes from the AGENTS.md product decision.
   - customer · `tips` · "Can I add or change a tip?" · "Tipping is coming in a future update."
   - Leave out the live "multiple job listings" answer. Its rule (no new job while one is in progress) is not in the PRD and the MVP does not enforce it; it is logged as a client question.
2. **How It Works copy.** Use the PRD's three customer steps ("describe the job, choose a worker or post to the board, get it done and rate"). Worker steps come from the PRD worker flow: "Create your account → Set your area and services → Browse jobs → Verify ID and insurance, then accept and get paid". The live site's steps describe the old app screens and are not reused. The copy is provisional.
3. **Category descriptions** are one short neutral line each and provisional, in `constants.ts`.
4. **Service page slugs** are the `CategoryId` slugs (`/services/outdoor`, `/services/cleaning`, `/services/disposal`, `/services/custom`). Custom gets a page too, so all 4 are static params and anything else returns 404.
5. **Links into service pages:** add a Footer "Services" column linking to the 4 service pages. Landing tiles open the builder, as the spec says. Do not add an extra text link under each tile.
6. **The final CTA band's worker link** goes to `/workers`.
7. **City SEO pages** are out of scope; they are listed as an open question.
8. **SEO extras:** add `robots.ts` (disallow `/dev/`, `/styleguide`) and `sitemap.ts` (public marketing routes only), with title and description metadata per page. No Open Graph images. The placeholder legal pages are `noindex`.
9. **Sticky mobile bar:** on `/workers` it shows the page's own CTA, "Create worker account" (→ `/signup?role=worker`), instead of "Post a job". All other marketing pages keep "Post a job". Extend `MobileCtaBar` with props; don't duplicate it.
10. **T9 "Why join":** the `/workers` page T4 builds IS that screen. T9 does not build another one.
11. **FAQ search** uses a native `<input type="search">` local to `FaqAccordion` and styled with tokens. No shadcn `input` in T4; T5 adds it.
12. **Support contact:** email `choresformesupport@protonmail.com`, phone `(801) 948-0847` (live site). Update the T2 support constant if it differs.
13. **Google Play URLs:** set the real ones from the live site and replace the T2 `#` placeholders. Customer: `https://play.google.com/store/apps/details?id=com.choresforme.user`. Worker: `https://play.google.com/store/apps/details?id=com.choresforme.worker`. (The live site also has App Store links; the PRD hand-off is Android-only, so don't add them.)
14. **Social links:** none in T4. They are not in the PRD.
15. **ID-Card preview** shows a clearly sample identity, "Sample worker", with labels and status badges and no rating number.
16. **Legal pages:** `/privacy` and `/terms` are placeholders. They say the final web policy is being prepared and link to the current policies at `https://choresforme.com/privacy-policy` and `https://choresforme.com/terms-of-service`. Do not copy or invent legal text.
17. **Dead links** to `/post-job/*`, `/signup*` and `/login` are expected until T5 and T6.
18. **Page titles and descriptions** are provisional and need client approval.
