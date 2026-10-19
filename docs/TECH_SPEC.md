# Chores For Me — Web MVP Technical Implementation Spec

Oct 19, 2026 · @Krunal Bakhal

## Purpose and ground rules for AI agents

This spec turns the Chores For Me — Web-First MVP PRD into exact build instructions. The PRD says what and why; this doc says how. When they disagree, this spec wins for implementation details and the PRD wins for product behaviour.

Rules every agent session follows:

1. **Front end only.** No backend, database, API routes that persist data, or third-party auth. All data comes from the mock service layer.
2. **Auth is mocked.** Google, Facebook and email buttons all go through the mock auth service; no OAuth SDKs are installed.
3. **One ticket per session.** Build only the ticket in scope (see Build plan); do not refactor unrelated files.
4. **Use the defined types, tokens and components.** Never invent a new colour, font size, data shape or duplicate component; extend the shared ones.
5. **Every screen ships with its four states:** loading, empty, error and success.
6. **Validate with the shared Zod schemas** in `lib/validation`; never inline ad-hoc validation.
7. **Desktop first, mobile ready.** Design and build each screen at 1280 px first, then adapt it so it works fully at 1024, 768 and 375 px (see Responsive layouts).
8. **Done means the acceptance criteria pass,** `npm run lint` and `npm run typecheck` pass, and the page renders with no console errors.
9. **No real personal data.** Uploads and payment fields are UI only; nothing leaves the browser.

## Stack and project structure

The stack is fixed; agents install the latest stable version of each at scaffold time and do not add other UI or state libraries without approval.

| Concern | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js, App Router, TypeScript (strict) | Server components for marketing pages; client components for flows and dashboards |
| Styling | Tailwind CSS | Tokens defined once as CSS variables and mapped in the Tailwind config |
| Components | shadcn/ui (Radix based) | Generated into `components/ui`, then themed with our tokens |
| Forms | React Hook Form | One form instance per step |
| Validation | Zod | Schemas shared between forms and mock services |
| Client state | Zustand with `persist` (localStorage) | Holds mock session, job draft and worker onboarding progress |
| Icons | lucide-react | Comes with shadcn/ui |
| Maps (worker radius) | Static map image placeholder + radius slider | No map SDK in the MVP |
| Analytics | `lib/analytics.ts` that logs events to the console | Swappable later for GA4 or PostHog |
| Quality | ESLint, Prettier, `tsc --noEmit` | Scripts: `lint`, `typecheck`, `format` |
| Package manager | npm | Node LTS |

**Folder structure**

```
src/
  app/
    (marketing)/            # landing, services, how-it-works, faq, legal
    (auth)/                 # login, signup, role picker
    post-job/[step]/        # customer job builder
    worker/onboarding/[step]/
    dashboard/              # customer dashboard
    worker/dashboard/       # worker dashboard
  components/
    ui/                     # shadcn primitives (themed)
    layout/                 # Header, Footer, AppShell, BottomNav
    marketing/              # Hero, CategoryTiles, HowItWorks, TrustBlock, FAQ
    flow/                   # Stepper, StepLayout, ReviewSummary
    job/                    # JobCard, JobDetail, WorkerCard, PriceInput
    states/                 # Loading, EmptyState, ErrorState
  lib/
    types.ts                # all domain types
    validation/             # Zod schemas per form
    mock/                   # seed data + mock services
    store/                  # Zustand stores
    analytics.ts
    constants.ts            # categories, sub-services, statuses
  styles/globals.css        # design tokens
```

## Route map

Every screen in the PRD maps to one route below; guarded routes redirect to `/login?next=<route>` when there is no mock session.

| Route | Screen | Access | PRD section |
| --- | --- | --- | --- |
| `/` | Landing page | Public | Landing / home page |
| `/services/[category]` | Category service page | Public | Landing (SEO pages) |
| `/how-it-works` | Customer and worker steps | Public | Landing |
| `/workers` | "Earn with Chores For Me" page | Public | Worker flow step 1 |
| `/faq`, `/privacy`, `/terms` | FAQ and legal | Public | Design direction |
| `/login` | Login | Public | Authentication |
| `/signup` | Role picker, then sign-up form | Public | Role selection, Authentication |
| `/signup?role=customer` / `?role=worker` | Sign-up with role preset | Public | Role selection |
| `/forgot-password` | Reset request (mock success) | Public | Authentication |
| `/post-job/category` | Step 1 Category | Public | Customer flow |
| `/post-job/services` | Step 2 Services | Public | Customer flow |
| `/post-job/location` | Step 3 Where | Public | Customer flow |
| `/post-job/details` | Step 4 Details | Public | Customer flow |
| `/post-job/match` | Step 5 Who | Public | Customer flow |
| `/post-job/review` | Step 6 Review & Post (inline sign-up) | Public | Customer flow |
| `/post-job/payment` | Step 7 Payment | Customer | Customer flow |
| `/post-job/confirmation` | Step 8 Confirmation + app prompt | Customer | Customer flow, App hand-off |
| `/dashboard` | Customer Home | Customer | Dashboards |
| `/dashboard/jobs/[id]` | Job detail | Customer | Dashboards |
| `/dashboard/history` | History | Customer | Dashboards |
| `/dashboard/account` | Account | Customer | Dashboards |
| `/worker/onboarding/area` | Your area (1/4) | Worker | Worker flow |
| `/worker/onboarding/services` | Your services (2/4) | Worker | Worker flow |
| `/worker/onboarding/id` | Verify ID (3/4) | Worker | Worker flow |
| `/worker/onboarding/insurance` | Insurance (4/4) | Worker | Worker flow |
| `/worker/onboarding/payout` | Payout account | Worker | Worker flow |
| `/worker/dashboard` | Jobs board + verification checklist | Worker | Dashboards |
| `/worker/dashboard/my-jobs` | My Jobs | Worker | Dashboards |
| `/worker/dashboard/earnings` | Earnings | Worker | Dashboards |
| `/worker/dashboard/account` | Account + Chores ID-Card | Worker | Dashboards |

**Routing rules**

- `/post-job/*` steps 1 to 6 are public; the draft lives in the job-draft store. Opening a later step with missing earlier data redirects to the first incomplete step.
- `/services/[category]` and category tiles link to `/post-job/services?category=<id>`, which pre-selects the category and skips step 1.
- A worker session hitting `/dashboard` (or a customer hitting `/worker/*`) sees the "separate accounts" notice with a sign-up link for the other role.
- After login, users go to `next` if present, else to their role's dashboard.

## Data model

All domain types live in `lib/types.ts` and mirror the Android apps' fields, so the mock layer can later be replaced by the real backend without changing screens.

```ts
export type Role = 'customer' | 'worker';

export type CategoryId = 'outdoor' | 'cleaning' | 'disposal' | 'custom';

export interface Category {
  id: CategoryId;
  name: string;            // 'Outdoor Home Service' | 'House Cleaning' | 'Item Disposal' | 'Custom'
  subServices: string[];   // e.g. outdoor: Lawn Mowing, Weed Removal, Planting, Gutter Service, Other
}

export interface User {
  id: string;
  role: Role;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;          // E.164, +1 only
  phoneVerified: boolean;
  dob: string;             // ISO date, required for both roles
  photoUrl?: string;
  authProvider: 'email' | 'google' | 'facebook';
  createdAt: string;
}

export type VerificationStatus = 'not_started' | 'under_review' | 'verified' | 'rejected';

export interface WorkerProfile {
  userId: string;
  baseAddress: Address;
  radiusMiles: number;     // 5 to 200
  categories: CategoryId[];
  idStatus: VerificationStatus;
  insuranceStatus: VerificationStatus;
  payoutAdded: boolean;
  rating: number;          // 0 to 5
  jobsCompleted: number;
  rejectionReason?: string;
}

export interface Address {
  line1: string;
  city: string;
  state: string;           // US state code, e.g. 'TX'
  zip: string;             // 5 digits
  landmark?: string;
}

export type PricingType = 'fixed' | 'hourly';

export type JobStatus = 'open' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface Job {
  id: string;
  customerId: string;
  category: CategoryId;
  subServices: string[];
  otherText?: string;
  address: Address;
  description: string;
  photos: string[];        // object URLs or seed image paths
  pricingType: PricingType;
  amount: number;          // USD; fixed total or hourly rate
  hours?: number;          // required when hourly, 1 to 12
  matchType: 'board' | 'direct';
  workerId?: string;       // set when direct or accepted
  status: JobStatus;
  savedAsTemplate: boolean;
  createdAt: string;
  completedAt?: string;
  customerRating?: number;
}

export type JobDraft = Partial<Omit<Job, 'id' | 'customerId' | 'status' | 'createdAt'>> & { lastStep: number };

export interface Template { id: string; customerId: string; name: string; job: JobDraft; }

export interface PaymentMethod { id: string; brand: 'visa' | 'mastercard' | 'amex'; last4: string; }
```

**Seed data** (`lib/mock/seed.ts`), enough to make every dashboard and list look real:

| Entity | Count | Notes |
| --- | --- | --- |
| Categories | 4 | Exact names and sub-services from the apps |
| Customers | 2 | One with history, one brand new (for empty states) |
| Workers | 6 | Mixed ratings 3.8 to 5.0; statuses: 4 verified, 1 under review, 1 rejected |
| Jobs | 12 | All statuses represented, across 3 US cities, fixed and hourly |
| Templates | 2 | For the customer with history |
| Payment methods | 1 | Visa ending 4242 |

Demo logins (shown on the login page in a "Demo accounts" panel): customer `demo.customer@choresforme.test`, worker `demo.worker@choresforme.test`, any password.

## Mock service layer and mock auth

Screens call only these async service functions; each returns a Promise with a 400–800 ms simulated delay, so loading states are real and the swap to HTTP calls later touches only `lib/mock`.

```ts
// lib/mock/services.ts — the only data entry point for UI code
auth.signUp(input: SignUpInput): Promise<User>
auth.login(email: string, password: string): Promise<User>
auth.loginWithProvider(provider: 'google' | 'facebook', role: Role): Promise<User>
auth.sendOtp(mobile: string): Promise<void>
auth.verifyOtp(mobile: string, code: string): Promise<boolean>
auth.requestPasswordReset(email: string): Promise<void>
auth.logout(): Promise<void>

jobs.listForCustomer(customerId: string): Promise<Job[]>
jobs.listBoard(workerId: string): Promise<Job[]>   // filtered by area + categories
jobs.get(id: string): Promise<Job>
jobs.create(draft: JobDraft): Promise<Job>
jobs.accept(jobId: string, workerId: string): Promise<Job>   // first come, first served
jobs.cancel(jobId: string): Promise<Job>
jobs.rate(jobId: string, stars: number): Promise<Job>

workers.listForArea(address: Address, category: CategoryId): Promise<WorkerSummary[]>
workers.getProfile(userId: string): Promise<WorkerProfile>
workers.updateOnboarding(userId: string, patch: Partial<WorkerProfile>): Promise<WorkerProfile>
workers.uploadDocument(userId: string, kind: 'id_front' | 'id_back' | 'insurance', file: File): Promise<VerificationStatus>

templates.list(customerId: string): Promise<Template[]>
templates.save(customerId: string, name: string, draft: JobDraft): Promise<Template>

payments.listMethods(userId: string): Promise<PaymentMethod[]>
payments.addMethod(userId: string, card: CardInput): Promise<PaymentMethod>
```

**Mock auth behaviour**

| Action | Mock result |
| --- | --- |
| Continue with Google / Facebook | Opens a small in-page dialog "Signing in with Google (demo)" with the demo identity prefilled; on confirm, returns a user with `authProvider` set; new users then complete mobile, DOB and Terms |
| Email sign-up | Creates the user in the store; an email already in seed data returns the "already have an account" error |
| Login | Any seeded email with any password succeeds; unknown email returns "No account found" |
| OTP | Code `123456` always succeeds; any other code fails |
| Forgot password | Always shows the "Check your email" success screen |
| Session | Stored in the Zustand session store (persisted); logout clears session, keeps seed data |

**Other mock rules**

- `jobs.accept` fails with "This job was just taken" when the job is no longer open (to demonstrate first come, first served).
- `workers.uploadDocument` returns `under_review`; a dev-only "Approve" button on the worker dashboard flips statuses to `verified` for demos.
- `payments.addMethod` accepts any 16-digit number and stores only the brand and last 4 digits.
- Add `?mockError=1` to any URL to make the next service call reject, so error states can be shown on demand.
- A "Reset demo data" link in the footer (demo builds only) restores seed data.

## Design tokens and components

Token names are fixed now; their values are provisional until ticket T2 replaces them with the logo colours and fonts of the current choresforme.com. Components use tokens only, never raw hex values.

```css
/* styles/globals.css */
:root {
  --brand: #16A34A;          /* provisional: replace with site primary */
  --brand-foreground: #FFFFFF;
  --brand-soft: #DCFCE7;
  --ink: #0F172A;            /* primary text */
  --ink-muted: #475569;      /* secondary text */
  --surface: #FFFFFF;
  --surface-alt: #F8FAFC;    /* section bands */
  --surface-dark: #0B1220;   /* accent band carried over from the current dark site */
  --border: #E2E8F0;
  --success: #16A34A;
  --warning: #D97706;
  --danger: #DC2626;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --font-sans: 'Inter', system-ui, sans-serif;   /* provisional */
}
```

| Scale | Values |
| --- | --- |
| Type (px) | 12 caption · 14 body-sm · 16 body · 20 h4 · 24 h3 · 32 h2 · 44 h1 (32 on mobile) |
| Weights | 400 regular, 600 semibold only |
| Spacing (px) | 4, 8, 12, 16, 24, 32, 48, 64, 96 |
| Breakpoints (px) | sm 640, md 768, lg 1024, xl 1280; content max width 1200 |
| Touch targets | At least 44 × 44 px |

**Component inventory** (build once, reuse everywhere)

| Component | Used on | Notes |
| --- | --- | --- |
| `Header`, `Footer` | Marketing pages | Header CTA "Post a job"; mobile menu sheet; sticky mobile CTA bar |
| `Hero` | Landing | Headline, sub-line, two CTAs, inline category picker |
| `CategoryTile` | Landing, step 1, service pages | Icon, name, link to the builder |
| `HowItWorks`, `TrustBlock`, `FAQAccordion`, `CTABand` | Marketing pages | Content from `constants.ts` |
| `AuthCard`, `SocialButtons`, `OtpInput`, `RolePicker` | Auth | `SocialButtons` call mock auth only |
| `Stepper`, `StepLayout` | Job builder, worker onboarding | Progress bar, Back and Continue, sticky footer on mobile |
| `SelectableCard` | Categories, sub-services, role, match type | Single and multi select |
| `AddressInput` | Step 3, worker area | US-only fields; autocomplete mocked from seed addresses |
| `PhotoUploader` | Step 4, ID, insurance | Preview, remove, 5-photo limit, camera capture on mobile |
| `PriceInput` | Step 4 | Fixed or Hourly toggle, hours selector, live estimated total |
| `WorkerCard` | Step 5, favourites | Photo, name, rating, ID-Card badges |
| `ReviewSummary` | Step 6 | Sections with Edit links back to each step |
| `JobCard`, `JobDetail`, `StatusBadge` | Dashboards | Status colours from tokens |
| `VerificationChecklist`, `IdCard` | Worker dashboard | Statuses: Not started, Under review, Verified, Rejected |
| `AppPrompt` | Confirmation, worker dashboard | Device-aware; dismiss hides for 7 days |
| `AppShell`, `BottomNav`, `SideNav` | Dashboards | Bottom nav on mobile, side nav from md |
| `LoadingState`, `EmptyState`, `ErrorState` | Every data screen | See Screen states |

## Responsive layouts

The website is designed for desktop first: every screen's reference layout is 1280 px wide, then it adapts down to tablet and phone without losing any feature.

**Grid:** content max width 1200 px, 12 columns, 32 px gutters on desktop; 8 columns and 24 px gutters on tablet; 4 columns and 16 px side margins on mobile.

| Screen | Desktop (1280 px, reference) | Tablet (768 px) | Mobile (375 px) |
| --- | --- | --- | --- |
| Header | Logo, full nav (Services, How it works, For workers), Log in, "Post a job" button | Nav collapses into a menu; Post a job stays visible | Logo, menu sheet, plus a sticky bottom "Post a job" bar |
| Landing hero | Two columns: headline, CTAs and category picker left; photo or phone mockups right | Two columns, smaller visual | Stacked: text and CTAs first, visual below |
| Category tiles | 4 in a row | 2 × 2 | 2 × 2, compact |
| How it works | 3 columns joined by a line | 3 columns | Vertical numbered list |
| Trust and worker sections | Split two columns, text and visual | Split two columns | Stacked |
| FAQ | Accordion left, contact card right | Single column | Single column |
| Login / sign-up | Split screen: form card left, brand panel with trust points right | Centred card, no brand panel | Full-width form |
| Role picker | Two large cards side by side | Side by side | Stacked cards |
| Job builder steps | Stepper across the top; form left (~640 px) and a sticky live "Your job" summary panel right (~360 px) with the price estimate | Form full width; summary collapses into a panel above Continue | Single column; summary as a collapsible bar; sticky Continue footer |
| Pick a Worker | 3-column card grid | 2 columns | List |
| Review & Post | Summary left, inline sign-up or Post card right | Stacked | Stacked |
| Payment | Card form left, order summary right | Stacked | Stacked, summary first |
| Dashboards (shell) | Side nav (240 px), main content, right rail for templates and app prompt | Icon-only side nav, no right rail | Bottom nav, single column |
| Job detail | Details left, sticky card right with worker, price and actions | Stacked, actions at top | Stacked, sticky action bar |
| Worker onboarding | Form left, "Your progress" checklist and ID-Card preview right | Checklist above the form | Checklist collapsed at top |
| Worker job board | Filter sidebar (category, distance) + job list; verification checklist banner on top | Filters in a sheet | Filters in a sheet, list cards |
| History, Earnings | Data tables | Data tables | Card lists |
| Dialogs | Centred modal | Centred modal | Bottom sheet |

**Rules**

- Implement with Tailwind's standard breakpoints; design reviews and screenshots start at desktop, then each breakpoint down.
- No horizontal scrolling at any width down to 375 px; nothing is hidden on mobile that exists on desktop, only rearranged.
- Desktop gets hover states, but no action is available only on hover.
- Every ticket is checked at 1280, 1024, 768 and 375 px before it is done.

## Validation rules

Each form has one Zod schema in `lib/validation`; errors show under the field on blur and on submit, and the first invalid field gets focus.

| Field | Rule | Error message |
| --- | --- | --- |
| First / last name | Required, 1–50 characters, letters, spaces, hyphen, apostrophe | "Enter your first name" / "Enter your last name" |
| Email | Required, valid email format | "Enter a valid email address" |
| Password | Required, at least 8 characters, at least one letter and one number | "Use at least 8 characters with a letter and a number" |
| Mobile | Required, 10-digit US number, stored as +1XXXXXXXXXX | "Enter a 10-digit US mobile number" |
| OTP code | Exactly 6 digits | "Enter the 6-digit code" / "That code didn't work. Try again" |
| Date of birth | Required, valid date, not in the future; worker must be 18 or older | "Enter your date of birth" / "You must be 18 or older to work on Chores For Me" |
| Terms consent | Must be checked | "Please accept the Terms and Privacy Policy" |
| Category | Exactly one | "Choose a category" |
| Sub-services | At least one; "Other" requires text, 3–100 characters | "Choose at least one service" / "Describe the other service" |
| Address line 1 | Required, 3–100 characters | "Enter the street address" |
| City | Required | "Enter the city" |
| State | Required, one of the 50 US states or DC | "Choose a state" |
| ZIP | Required, 5 digits | "Enter a 5-digit ZIP code" |
| Description | Required, 10–500 characters, live counter | "Add a few words about the job (at least 10 characters)" |
| Photos | Optional, up to 5, JPG/PNG/HEIC/WebP, max 10 MB each | "You can add up to 5 photos" / "Photos must be under 10 MB" |
| Fixed price | Required when fixed, $5–$5,000, whole dollars or cents | "Enter a price between $5 and $5,000" |
| Hourly rate | Required when hourly, $10–$200 | "Enter an hourly rate between $10 and $200" |
| Hours | Required when hourly, 1–12 in steps of 0.5 | "Choose between 1 and 12 hours" |
| Match type | Required; Pick a Worker requires a selected worker | "Choose a worker or post to the job board" |
| Template name | Required when Save As Template is ticked, 3–40 characters | "Name this template" |
| Card number | 16 digits (15 for Amex) | "Enter a valid card number" |
| Expiry | MM/YY, not in the past | "Enter a valid expiry date" |
| CVC | 3 digits (4 for Amex) | "Enter the security code" |
| Worker radius | 5–200 miles | "Choose a radius between 5 and 200 miles" |
| Worker categories | At least one | "Choose at least one service you offer" |
| ID photos | Front and back both required | "Upload the front of your ID" / "Upload the back of your ID" |
| Insurance document | Required, image or PDF, max 10 MB | "Upload your insurance document" |
| Payout account | Routing number 9 digits, account number 4–17 digits | "Enter a 9-digit routing number" / "Enter a valid account number" |

Price limits, hour limits and the radius range are provisional values for the demo; confirm with the client before the integration phase.

## Screen states

Every screen that calls a service renders all four states with the shared components; forms also show a submitting state on their primary button.

| Screen | Loading | Empty | Error | Success |
| --- | --- | --- | --- | --- |
| Customer Home | Skeleton job cards | "No jobs yet" + Post a job button | ErrorState with Retry | Active jobs + templates |
| History | Skeleton rows | "Your finished jobs will appear here" | ErrorState with Retry | Past jobs list |
| Job detail | Skeleton detail | — | "We couldn't find this job" + back to dashboard | Full detail and actions |
| Step 5 Pick a Worker | Skeleton worker cards | "No verified workers in this area yet — post to the job board instead" (switches match type) | ErrorState with Retry | Worker cards |
| Worker Jobs board | Skeleton job cards | "No open jobs in your area right now" + edit area and services link | ErrorState with Retry | Jobs list; Accept disabled until verified |
| My Jobs | Skeleton rows | "Jobs you accept will show here" | ErrorState with Retry | Jobs by status |
| Earnings | Skeleton summary | "Complete your first job to see earnings" | ErrorState with Retry | Totals and payout list |
| Saved Templates | Skeleton rows | Section hidden | Inline error | Template list with Re-post |
| Login / Sign-up | Button spinner, form disabled | — | Inline message above the form | Redirect to next route |
| OTP | Button spinner | — | "That code didn't work. Try again" | Field marked verified |
| Job builder steps | Button spinner on Continue | — | Toast "Something went wrong. Your job is saved — try again" | Next step |
| Payment | Button spinner, "Posting your job…" | — | Inline "We couldn't add this card" | Confirmation page |
| Document upload | Progress bar per file | Upload prompt | "Upload failed" + retry per file | Status "Under review" |
| Accept job | Button spinner | — | Toast "This job was just taken" and the card is removed | Job moves to My Jobs, toast "Job accepted" |

General rules: skeletons match the final layout; errors never clear typed input; toasts auto-dismiss after 4 s; any action that changes data shows a success toast.

## Acceptance criteria

A ticket is done only when every criterion for its screens passes at 1280, 1024, 768 and 375 px, plus the global checks below.

**Global (every ticket)**

- [ ] `npm run lint` and `npm run typecheck` pass with no errors
- [ ] No console errors or warnings on the touched pages
- [ ] Loading, empty, error and success states render (error via `?mockError=1`)
- [ ] All interactive elements reachable by keyboard with a visible focus ring
- [ ] Only design tokens used for colour, type and spacing

**Landing and marketing**

- [ ] Hero shows the headline, "Post a job" (primary) and "Earn with Chores For Me" (secondary) above the fold at 1280 px and at 375 px
- [ ] Each category tile opens `/post-job/services` with that category pre-selected
- [ ] "Download" does not appear in the hero; app links appear only in the footer
- [ ] Footer shows the current year, one support email and "Privacy Policy"
- [ ] Page content is real text (no text inside images); each page has a unique title and meta description

**Role selection and auth**

- [ ] `/signup` without a role shows the picker; with `?role=` it skips it
- [ ] Google and Facebook buttons open the demo sign-in dialog and never load an external SDK
- [ ] New social users must still add mobile, DOB and accept Terms
- [ ] OTP `123456` verifies; any other code shows the error
- [ ] A worker under 18 cannot complete sign-up
- [ ] An existing email shows "You already have an account — log in"
- [ ] After login, users land on `next` or their role's dashboard

**Customer job builder**

- [ ] Steps 1 to 6 work with no session; the progress bar shows the step out of the total
- [ ] Reloading or going Back keeps every entered value
- [ ] Hourly shows the live estimated total (rate × hours)
- [ ] Non-US or invalid ZIP addresses cannot continue
- [ ] Pick a Worker lists only verified workers serving that category; empty state switches to Job Board
- [ ] Step 6 without a session shows inline sign-up; after sign-up, the draft is attached and the flow continues to Payment
- [ ] Posting creates a job that appears on the customer dashboard and, for board jobs, on the worker board
- [ ] Save As Template creates a template that can be re-posted in one tap

**Worker onboarding**

- [ ] Area, services, ID, insurance and payout steps save progress and can be resumed
- [ ] ID requires front and back, labelled correctly
- [ ] After uploads, statuses show "Under review" on the checklist and ID-Card
- [ ] Accept shows "Verify to accept" until verified; the demo Approve button flips statuses
- [ ] Accepting an already-taken job shows "This job was just taken"

**Dashboards and hand-off**

- [ ] Customer and worker navigation match the PRD (Home · Jobs · History · Account / Jobs · My Jobs · Earnings · Account)
- [ ] Cancel shows a confirmation dialog noting the fee rule is to be confirmed
- [ ] App prompt shows the Play Store button on Android user agents and "We'll email and text you updates" elsewhere; dismiss hides it for 7 days
- [ ] Every PRD funnel event fires once, logged to the console with role, device and source

## Build plan

Twelve tickets, one per agent session, in dependency order; after T3, the marketing track (T4) and the app track (T5 onward) can run in parallel.

| Ticket | Scope | Depends on | Done when |
| --- | --- | --- | --- |
| T1 Scaffold | Next.js + TypeScript strict, Tailwind, shadcn/ui init, ESLint, Prettier, scripts, folder structure | — | App runs; lint and typecheck pass |
| T2 Design system | Pull logo, colours and fonts from the current choresforme.com into tokens; theme shadcn; Header, Footer, AppShell, BottomNav, SideNav, Loading/Empty/ErrorState | T1 | A `/styleguide` page shows every token and component |
| T3 Data + mock layer | `types.ts`, `constants.ts`, seed data, mock services with delays and `?mockError`, Zustand stores, `analytics.ts` stub | T1 | Services callable from a test page; seed data loads |
| T4 Marketing pages | Landing, service pages, how-it-works, workers page, FAQ, legal | T2 | Landing acceptance criteria pass |
| T5 Auth | Login, sign-up, role picker, demo social dialog, OTP, forgot password, route guards, demo accounts panel | T2, T3 | Auth acceptance criteria pass |
| T6 Job builder 1–5 | Category, Services, Where, Details (pricing + hours), Who; draft persistence and step guards | T2, T3 | Steps 1–5 criteria pass |
| T7 Job builder 6–8 | Review with inline sign-up, Payment, Confirmation, Save As Template | T5, T6 | A guest can post a job end to end |
| T8 Customer dashboard | Home, Job detail (edit, cancel, rate), History, Account, templates Re-post | T7 | Customer dashboard criteria pass |
| T9 Worker onboarding | Why join, area + radius, services, ID, insurance, payout, checklist | T5 | A new worker reaches "Under review" |
| T10 Worker dashboard | Board with accept, My Jobs, Earnings, Account, ID-Card, demo Approve | T9, T7 | A posted board job can be accepted by a verified worker |
| T11 Hand-off + analytics | AppPrompt with device detection and dismiss; wire every funnel event | T7, T10 | Hand-off and analytics criteria pass |
| T12 QA + demo deploy | Full acceptance checklist at 1280, 1024, 768 and 375 px, accessibility pass, deploy a demo build (for example Vercel) | All | Every checklist item ticked; demo URL shared with the client |

Each agent session starts by reading `AGENTS.md`, this spec and the ticket row, and ends by listing which acceptance criteria were checked.
