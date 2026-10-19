# AGENTS.md — Chores For Me Web MVP

Read this file at the start of every session. It is the short version of the rules; the full detail lives in the two specs below.

## Source documents

- **Product PRD:** "Chores For Me — Web-First MVP PRD" — what to build and why (flows, screens, fields, business rules).
- **Technical Implementation Spec:** "Chores For Me — Web MVP Technical Implementation Spec" — how to build it (stack, routes, types, mock services, tokens, components, validation, screen states, acceptance criteria, tickets).
- Both live in this repo as `docs/PRD.md` and `docs/TECH_SPEC.md`. If a spec doc changes, export it again and replace the file here.
- If the two disagree: the Tech Spec wins on implementation, the PRD wins on product behaviour. If something is missing from both, stop and ask; do not invent product rules.

## What this project is

A front-end-only web MVP for Chores For Me, a US two-sided home-services marketplace with customers and workers. It shows a Web-First funnel: users sign up, post a job or start worker onboarding in the browser, and the Android apps are offered afterwards. All data is mocked.

## Hard rules

1. **No backend.** No database, no API routes that persist data, no server actions that write data, and no third-party auth or payment SDKs.
2. **All data goes through `src/lib/mock/services.ts`.** UI code never imports seed data directly.
3. **Auth is mocked.** Google and Facebook buttons open the demo sign-in dialog. OTP code `123456` always works.
4. **Fixed stack:** Next.js (App Router) + TypeScript strict, Tailwind CSS, shadcn/ui, React Hook Form, Zod, Zustand (persist), lucide-react. Do not add libraries without approval.
5. **Use the shared pieces.** Types come from `src/lib/types.ts`, validation from the Zod schemas in `src/lib/validation`, and styling from the design tokens in `src/styles/globals.css`. Never use raw hex colours or one-off font sizes.
6. **Reuse components.** Check `src/components` before creating one; extend it instead of duplicating it.
7. **Every data screen ships four states:** loading, empty, error and success. Use `LoadingState`, `EmptyState` and `ErrorState`, and test errors with `?mockError=1`.
8. **Desktop first, mobile ready.** Design and build each screen at 1280 px first, then adapt it per the Tech Spec "Responsive layouts" table so it works fully at 1024, 768 and 375 px. No horizontal scroll at 375 px, nothing removed on mobile (only rearranged), and touch targets are at least 44 px.
9. **No real personal data.** Uploads and card fields are UI only, and nothing is sent anywhere.
10. **Product decisions already made** (do not change):
    - Jobs are on demand, with no date or time picker.
    - Hourly jobs take a rate plus a number of hours.
    - The Job Board is first come, first served.
    - The customer is charged on completion, and there are no refunds.
    - One role per account.
    - US addresses only.
    - Date of birth is required for both roles, and workers must be 18 or older.
    - ID and insurance status shows as "Under review" until approved.

## How to work a ticket

Every ticket runs through the four-agent pipeline with `/build-ticket T#`:

1. **product-owner** writes `docs/tickets/T#/01-product-plan.md`: scope, screens, components, data, rules, acceptance criteria.
2. **ui-ux-planner** writes `docs/tickets/T#/02-ui-plan.md`: desktop-first layouts down to 375 px, component tree, tokens, states.
3. **Approval gate:** the person reviews both plans before any code is written.
4. **lead-engineer** implements the plans, then runs `npm run lint`, `npm run typecheck` and `npm run build`.
5. **qa-reviewer** checks the result and saves `docs/tickets/T#/04-qa-report.md`. QA focuses on flows and design and splits issues into BLOCKING and MINOR. On NEEDS FIXES, the lead-engineer fixes the BLOCKING issues and QA runs again (at most 3 rounds); MINOR issues are logged in PROGRESS.md and fixed in T12.
6. The final report lists the MANUAL browser checks (1280, 1024, 768 and 375 px, console errors) and any open questions.
7. Agents do not commit; the person commits after their manual check.

Every agent builds only that ticket's scope and never refactors unrelated files.

## Ticket order

T1 Scaffold → T2 Design system → T3 Data + mock layer → then two parallel tracks:

- Marketing: T4 Marketing pages
- App: T5 Auth → T6 Job builder steps 1–5 → T7 Job builder steps 6–8 → T8 Customer dashboard → T9 Worker onboarding → T10 Worker dashboard → T11 Hand-off + analytics

Both tracks finish with T12 QA + demo deploy.

## Conventions

- File names use kebab-case and components use PascalCase; one component per file.
- Server components are the default. Add `"use client"` only for interactive flows, forms and stores.
- Copy and labels live in `src/lib/constants.ts`, not scattered through JSX.
- Analytics: call `track(eventName, props)` from `src/lib/analytics.ts`, using the event names in the PRD "Funnel analytics" section exactly.
- Commits use conventional messages and include the ticket id, e.g. `feat(T6): add details step with hourly pricing`.

## Demo accounts

- Customer: `demo.customer@choresforme.test` (any password)
- Worker: `demo.worker@choresforme.test` (any password)
- OTP code: `123456`
