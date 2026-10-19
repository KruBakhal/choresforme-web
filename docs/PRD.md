# Chores For Me — Web-First MVP PRD

Oct 19, 2026 · @Krunal Bakhal

## Overview

The MVP turns choresforme.com from a download-only brochure into a working web product where customers post and pay for a job, and workers sign up and find work, without installing an app.

The MVP is front end only: no new backend is built. Every screen runs on mock data so the full journey can be demonstrated, and it is structured so the existing app backend can be connected in the next phase without redesigning screens.

**Goal:** more visitors become active customers and workers, with the least possible friction before the first meaningful action.

**Success metrics** (measured once the web app is connected to the backend and live):

| Metric | Definition |
| --- | --- |
| Visit → job started | Share of visitors who open the job builder |
| Job started → job posted | Share of started jobs that are submitted and paid |
| Visit → worker sign-up | Share of visitors who create a worker account |
| Worker sign-up → verified | Share of new workers who finish ID and insurance checks |
| Time to first post | Median time from landing to a posted job |
| Web → app install | Share of web users who install an app after their first action |

**In scope for the MVP**

- Modernized landing page built on the current choresforme.com, plus SEO-ready service pages
- Role selection, sign-up and login screens for customers and workers
- Customer job builder, matching choice (Pick a Worker or Job Board) and checkout screens
- Worker onboarding screens: area and radius, services, ID and insurance upload
- Customer and worker web dashboards with core actions
- App install prompts and a funnel analytics event plan
- Front end only, on mock data, ready to connect to real APIs

**Out of scope for the MVP** (later phases)

- Any backend work: new APIs, database changes or integrations
- Job date and time scheduling (not supported by the backend today)
- Refunds and dispute handling
- In-app chat and live job tracking (stay in the mobile apps)
- Price guidance, smart matching and the growth dashboard
- An iPhone app

## Users and design principles

The MVP serves two roles that share one account system, as the apps do today.

| Role | Who they are | What they want on the first visit |
| --- | --- | --- |
| Customer | Homeowner or renter needing lawn care, cleaning, disposal or a custom chore | Post a job quickly, know it will be done by someone trustworthy |
| Worker (Service Provider) | Independent contractor looking for local jobs | See what work exists nearby and how to start earning |

Design principles that every screen follows:

1. **Value before account.** A customer builds a job before being asked to sign up; a worker sees job types and earnings info before uploading documents.
2. **One question per screen** on mobile web; short stepped forms, never one long page.
3. **Ask only what is needed now.** Fields that are not needed until later (profile photo, documents) are collected later.
4. **Desktop first, mobile ready.** Every screen is designed for desktop (1280 px) first, then adapted so it works fully on tablets and phones down to 375 px.
5. **Same data as the apps.** Categories, fields and statuses match the Android apps so the backend stays shared.
6. **Progress is saved.** A user who leaves mid-flow returns to where they stopped.

## Design direction: build on the existing website

The MVP is a modern redesign of the current choresforme.com, not a new brand: it keeps what works today and makes it lighter, clearer and quicker to act on.

| Keep from today's site | Improve in the MVP |
| --- | --- |
| Brand name, logo and colour palette | Lighter, higher-contrast layout with more white space; the dark look stays as an accent band |
| How It Works for Customer and Worker, with phone mockups | Each step links into the real flow instead of being a picture only |
| "Check Entire Flow" walkthrough | Replaced by a "Post a job" start right in the hero |
| FAQ (cancellation, payouts, Sole Proprietor) | Searchable accordion, also linked from the flow steps where those questions come up |
| Legal pages | One name (Privacy Policy), current copyright year, one support address |
| App download links | Moved to the footer and the after-action hand-off moments |

Visual rules:

- **Text, not images:** headings and copy are real HTML text, so pages load fast and can be found in search.
- **One type family,** two weights and a clear size scale, used the same way on every screen.
- **Real photos** of chores and workers alongside the existing phone mockups.
- **Trust signals early:** verified badges, ratings and a Chores ID-Card preview above the fold.
- **Shared components** (buttons, inputs, cards, steppers) across landing, flows and dashboards, matching the apps' look.
- **Light motion only** (hover states, step transitions); nothing delays the first action.

## User journey map

Both paths start on the landing page and reach a dashboard; the steps marked ★ are where each role commits.

```
Landing page (Post a job · Earn)
│
├── Customer (from "Post a job")
│     Build the job (5 short steps) → ★ Review (sign up here) → Pay + post (app prompt) → Dashboard (jobs, history)
│
└── Worker (from "Earn with Chores For Me")
      Sign up (account first) → Set area and services → Browse jobs (read-only) → ★ Verify, then accept

Header "Sign up" with no role → role picker → one of the two paths above
```

Customers commit (sign up) only once their job is built; workers commit (verify ID and insurance) only after seeing real jobs in their area. Each step is detailed in the sections below.

## Landing / home page

The home page has one job: get a customer into the job builder, or a worker into sign-up, within one click.

**CTA hierarchy**

| Priority | CTA | Where it appears | Goes to |
| --- | --- | --- | --- |
| Primary | Post a job (or "Book a chore") | Hero, sticky bar on mobile, end of page | Job builder, step 1 (no login) |
| Secondary | Earn with Chores For Me | Hero secondary button, worker section | Worker sign-up |
| Tertiary | Log in | Header | Login |
| Tertiary | Get the app | Footer and after first action only | App store links |

The current "Download" CTA is removed from the hero; app links move to the footer and the hand-off moments described below.

**Page sections, top to bottom**

1. **Header** — logo, Services, How it works, For workers, Log in, and a "Post a job" button.
2. **Hero** — headline on the benefit (for example "Your chores, done by verified local pros"), one supporting line, the primary and secondary CTAs, and a service picker with the four categories so the first click already starts a job.
3. **Category tiles** — Outdoor Home Service, House Cleaning, Item Disposal, Custom; each tile opens the job builder with that category pre-selected.
4. **How it works** — three steps for customers: describe the job, choose a worker or post to the board, get it done and rate.
5. **Trust block** — what verification means: phone, ID and insurance checks, the Chores ID-Card, two-way ratings.
6. **Worker section** — set your own area and services, choose jobs, get paid to your payout account; CTA "Start earning".
7. **FAQ** — reuse the current FAQ (cancellation fee, payouts, independent contractor status).
8. **Final CTA band** — "Post your first job" plus the worker link.
9. **Footer** — app store links, support (one address: support@choresforme.com), Privacy Policy, Terms, current copyright year.

**SEO pages:** one page per category and per city served (for example "Lawn mowing in [City]"), each with crawlable text and the same primary CTA. Copy is real text, not images.

## Role selection

Most users never see a role picker: the CTA they click already sets their role. The explicit picker appears only when the role is unknown.

| Entry point | Role set | Shows picker? |
| --- | --- | --- |
| Post a job, category tile, service page | Customer | No |
| Earn with Chores For Me, Start earning, worker page | Worker | No |
| Header "Sign up" or a direct /signup link | Unknown | Yes |
| Login with an existing account | Read from the account | No |

**Picker screen** ("How do you want to use Chores For Me?")

- Two large cards: **I need help with chores** (Customer) and **I want to earn doing chores** (Worker), each with a one-line description.
- One tap selects and continues; no separate Next button.
- A "Log in" link sits below for returning users.

**Rules**

- One role per account: customer and worker accounts are separate, as in the apps today.
- Whether one person may hold both roles is to be confirmed with the client; the MVP assumes not.
- A logged-in user who clicks the other role's CTA sees a short message explaining the accounts are separate.

## Authentication and account creation

The web uses the same sign-in methods as the apps, but asks for far fewer fields up front.

**Sign-in methods:** Google, Facebook, and email with password; Forgot Password by email link. Guest mode is replaced on the web by "build the job first, create the account at checkout", which removes the guest-can't-pay dead end.

**When the account is created**

- **Customer:** after building the job, on the Review & Post step (see Customer flow).
- **Worker:** right after role selection, as the first onboarding step.

**Sign-up fields: apps today vs web MVP**

| Field | Apps today | Web MVP | Collected later when |
| --- | --- | --- | --- |
| First and last name | At sign-up | At sign-up | — |
| Email | At sign-up | At sign-up | — |
| Password | At sign-up | At sign-up (skipped with Google or Facebook) | — |
| Mobile (+1) | At sign-up | At sign-up, verified by SMS code | — |
| Date of birth | At sign-up | At sign-up, required for both roles | — (workers are also checked as 18+ from their ID) |
| Terms & Privacy consent | At sign-up | At sign-up, one checkbox | — |
| Profile photo | At sign-up | Later | Customer: optional in profile; worker: before the Chores ID-Card |

**Rules**

- Google and Facebook prefill name and email; the user adds mobile and accepts Terms.
- Phone verification by one-time SMS code supports the existing "Phone verified" status on the Chores ID-Card.
- Password: at least 8 characters, shown with a visibility toggle; inline errors, never a cleared form.
- An email already registered shows "You already have an account — log in" instead of an error.
- Sessions persist for 30 days on the same device unless the user logs out.

## Customer flow: post a job

The app's single long job form becomes short single-purpose steps, with sign-up placed after the customer has invested in the job.

| Step | Screen | Fields and actions | Rules |
| --- | --- | --- | --- |
| 1 | Category | Outdoor Home Service, House Cleaning, Item Disposal, Custom | Skipped when the user arrives from a category tile or service page |
| 2 | Services | Multi-select sub-services (e.g. Lawn Mowing, Weed Removal, Planting, Gutter Service, Other) | At least one; "Other" opens a short text field |
| 3 | Where | Address with autocomplete, optional landmark | US addresses only; outside the service area → "notify me" email capture |
| 4 | Details | Description, photos (optional, up to 5), price: Fixed Price, or Hourly with rate and number of hours | Hourly shows the estimated total (rate × hours); jobs are on demand, with no date or time picker |
| 5 | Who | Post to Job Board (default) or Pick a Worker from verified workers serving that area | Job Board is first come, first served; Pick a Worker shows name, rating and ID-Card badges, Favourite Workers first |
| 6 | Review & Post | Summary with edit links, Save As Template checkbox | Not logged in → sign-up or login inline on this screen, then continue |
| 7 | Payment | Add or choose a payment method, confirm | Customer is charged on job completion; no refunds in the MVP; mock data only |
| 8 | Confirmation | Job posted, what happens next, app hand-off prompt | See App hand-off |

**Behaviour**

- A progress bar shows the step out of the total.
- The job draft is saved in the browser at every step and attached to the account at sign-up, so nothing typed is lost.
- Back never clears entered data.
- Saved Templates and Re-post work on the web exactly as in the app for logged-in customers.

## Worker flow: onboarding

Workers create an account and see real jobs in their area before the heavy verification step; verification is required before they can accept their first job.

| Step | Screen | Fields and actions | Rules |
| --- | --- | --- | --- |
| 1 | Why join | Short value screen: choose your area, choose your jobs, get paid to your payout account | One CTA: "Create worker account" |
| 2 | Account | Sign-up as in Authentication (name, email, password or Google/Facebook, mobile with SMS code, date of birth, Terms) | Account role = Worker |
| 3 | Your area (1/4) | Base address and service radius on a map | Same fields as the app's Choose Your City; US addresses only |
| 4 | Your services (2/4) | Multi-select categories: Outdoor Home Service, House Cleaning, Item Disposal, Custom | At least one |
| 5 | Browse jobs | Open Job Board filtered by area and services, read-only | First come, first served once verified; Accept shows "Verify to accept" until then |
| 6 | Verify ID (3/4) | Photo ID front and back (correctly labelled), profile photo | ID must be valid and show the worker is 18 or older; camera or file upload |
| 7 | Insurance (4/4) | Insurance document upload | Status "Under review" until approved |
| 8 | Payout | Payout account (bank or card), as the app's Update Payout Account | Required before the first payout, not before applying |
| 9 | Approved | Chores ID-Card with Phone, ID and Insurance shown as Verified | Worker can accept jobs from the web or the app |

**Behaviour**

- Steps 6 to 8 can be done in any order and resumed later; the dashboard shows a checklist of what remains.
- Verification status is one of: Not started, Under review, Verified, Rejected (with reason and a re-upload button).
- Review time shown to workers: to confirm with the client.
- Copy uses "identity verification" (fixing the current typo).

## Post-login dashboards

Each role lands on a dashboard built around its next action, using the same sections as the app's bottom bar and profile drawer.

### Customer dashboard

Navigation: **Home · Jobs · History · Account**, with a persistent "Post a job" button.

| Screen | Contents | Key actions |
| --- | --- | --- |
| Home | Active jobs (worker, rating, price, status), Saved Templates, app banner | Post a job, Re-post a template, open a job |
| Job detail | Services, address, date and time, price, photos, assigned worker or board status | Edit (before acceptance), cancel (cancellation fee rule to be confirmed), rate after completion |
| History | Past jobs with date, worker, amount | Re-post, rate, view receipt |
| Account | Profile, Payment Details, Payment Analytics, Favourite Workers, Ratings, Notifications, Settings, Support | Edit details, manage payment method |

### Worker dashboard

Navigation: **Jobs · My Jobs · Earnings · Account**.

| Screen | Contents | Key actions |
| --- | --- | --- |
| Verification checklist | Shown at the top until verified: ID, Insurance, Payout | Complete the next step |
| Jobs (board) | Open jobs in area and services: category, distance, date, price | Accept (once verified), view details |
| My Jobs | Jobs the worker was picked for or accepted, by status | Open job, mark started or completed (as the app allows) |
| Earnings | Earning Analytics: totals by week and month, payouts | Update payout account |
| Account | Chores ID-Card, Update Details, Update Document, Ratings, Notifications, Settings, Support | Share ID-Card, re-upload documents |

**Shared:** a notification bell for job updates, and a Support link with the single support email, phone and text options already offered in the apps.

## App hand-off

The app is offered only after the user has done something worth tracking, with a reason tied to that action.

| Moment | Role | Message | Shown to |
| --- | --- | --- | --- |
| Job posted (confirmation) | Customer | "Get notified the moment a worker accepts — install the app" | Android users: Play Store button; iPhone and desktop: "We'll email and text you updates" |
| Worker accepted the job | Customer | "Track your job and message your worker in the app" | Email and SMS with app link |
| Worker account created | Worker | "Get job alerts near you in the Worker app" | Android users |
| Worker verified | Worker | "You're approved — accept jobs faster from the app" | Android users |

**Rules**

- Never block a web action behind an install.
- Detect the device: Android sees the matching app (Customer or Worker); iPhone and desktop users see email and SMS updates instead of a dead link.
- A dismissed prompt stays hidden for 7 days.
- The app login accepts the web account with no extra steps.

## Funnel analytics

Every step of both flows sends an event, so drop-off can be measured from day one.

| Funnel | Events in order |
| --- | --- |
| Customer | landing_view → job_builder_start → category_selected → services_selected → address_entered → details_entered → match_choice → signup_started → signup_completed → payment_added → job_posted |
| Worker | worker_page_view → worker_signup_started → worker_signup_completed → area_set → services_set → board_viewed → id_uploaded → insurance_uploaded → payout_added → worker_verified → first_job_accepted |
| Hand-off | app_prompt_shown → app_prompt_clicked → app_first_login |

**Requirements**

- Each event carries source (search, ad, referral, direct), device type and role.
- UTM parameters are kept through the whole flow, including sign-up.
- A simple funnel view (a ready-made analytics tool such as Google Analytics 4 or PostHog) is set up at launch; the custom growth dashboard comes in a later phase.
- Cookie consent defaults to essential-only until the user agrees.

## Technical and non-functional requirements

The MVP is a front-end build that demonstrates the full web journey; it adds no backend.

| Area | Requirement |
| --- | --- |
| Scope | Front end only; no new backend, database or APIs in the MVP |
| Data | A mock data layer (categories, sample jobs, workers, statuses) behind one service interface, so real APIs replace it later without screen changes |
| Next phase | Connect to the existing app backend for accounts, jobs, payments and documents |
| Front end | Server-rendered framework (for example Next.js) so landing and service pages are crawlable |
| Performance | Landing page loads in under 2.5 s on a mid-range phone over 4G |
| Responsive | Designed for desktop at 1280 px first, fully usable down to 375 px; works on current Chrome, Safari, Firefox and Edge |
| Accessibility | WCAG 2.1 AA: labels on every field, keyboard navigation, sufficient contrast |
| Security and privacy | No real card, ID or personal data collected in the MVP; payment and upload screens are UI only |
| Uploads | Browser-side preview and compression, ready to send once connected |
| Environments | Hosted demo build for client review; no development build names visible |

## Decisions and open questions

Decisions made so far shape the MVP as follows; the open items below still need the client.

| Topic | Decision for the MVP |
| --- | --- |
| Backend | None; front end on mock data |
| Job date and time | Not supported by the backend; jobs are on demand |
| Hourly jobs | Customer sets the number of hours |
| Job board | First come, first served |
| Payment | Customer is charged on job completion |
| Refunds | Out of scope for the MVP |
| Accounts | One role per account assumed |
| Region | United States |
| ID and insurance | Reviewed manually; shown as Under review |
| Date of birth | Required at sign-up for customers and workers |
| Design | Modernize the existing website, same brand |

Open with the client:

- [ ] Cancellation fee: amount and when it applies
- [ ] Refund and dispute policy, for a later phase
- [ ] Can one person hold both a customer and a worker account?
- [ ] How long ID and insurance review takes
- [ ] Which US states are served at launch
- [ ] Brand assets from the current site: logo files, colours, fonts
- [ ] Backend stack and API access, for the integration phase
