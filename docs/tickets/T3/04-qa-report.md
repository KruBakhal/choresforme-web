```
QA report — T3 Data + mock layer

Code health: lint pass · typecheck pass · build pass

Flow
- [PASS] Hard rules: no API routes, no "use server", no new packages (package.json unchanged), no seed/db/runtime import outside src/lib/mock (grep). The only importers of services.ts are /dev/mock and ResetDemoDataButton
- [PASS] Types: the Tech Spec "Data model" block in src/lib/types.ts matches verbatim (Role … PaymentMethod). Only quote style differs (Prettier). Supporting types (WorkerSummary, SignUpInput, CardInput, BoardJob, Session, ServiceErrorCode, SeedSummary …) match decision 2
- [PASS] Seed (verified at runtime through getSeedSummary): 4 categories, 2 customers, 6 workers (4 verified · 1 under review · 1 rejected, ratings 3.8–5.0, all 18+), 12 jobs (5 open · 2 accepted · 2 in progress · 2 completed · 1 cancelled, Austin/Dallas/Houston, fixed + hourly, board + direct), 2 templates, 1 Visa 4242. Fixed ids and timestamps
- [PASS] Delay: runService applies 400–800 ms (runtime.ts:28-32) to every service, including the decision 17 extras. Measured on /dev/mock across ~45 calls: 411–812 ms (the 805/812 values include React render overhead, see Minor)
- [PASS] ?mockError=1 one-shot per URL load: the first call pressed shows "Simulated error (?mockError=1)" (MOCK_ERROR), Retry then resolves, other calls resolve. With two parallel calls only the first fails. getSeedSummary and resetDemoData are exempt (seed check resolved on an armed URL). The armed notice and the "Load without ?mockError" link show only when armed. Both links are plain <a> (full reload)
- [PASS] Mock auth: a seeded email with any password logs in (customer and worker). Unknown email → "No account found" (NO_ACCOUNT). Sign-up with an existing email → "You already have an account — log in"; a second run of the new-worker sign-up rejects the same way (the check covers every account in the mock DB). verifyOtp 123456 → true, 000000 → false. requestPasswordReset resolves. logout clears the session and keeps the DB. Social login returns authProvider set, empty mobile and dob
- [PASS] jobs.accept first come, first served: run 1 on job-003 → accepted with workerId; run 2 → "This job was just taken" (JOB_TAKEN). An under-review worker → "Verify to accept" (decision 19)
- [PASS] jobs.create as the demo customer → open board job, which then appears in jobs.listBoard(demo worker) with distanceMiles. jobs.get on a missing id → "We couldn't find this job"
- [PASS] payments.addMethod: the result and the mock DB hold only {id, brand: "mastercard", last4: "4444"}. The full number, expiry and CVC are not in localStorage
- [PASS] Empty state: listForCustomer / templates.list / payments.listMethods / favourites.list for new.customer, listForArea Denver and addresses.suggest "zzz" all show "Empty result"
- [PASS] Error state: business rejections show "Service rejected" plus the service text and code, with Retry (ErrorState headingLevel 4)
- [PASS] Validation messages: VALIDATION_MESSAGES match every message in the "Validation rules" table verbatim. The two extras (loginPassword, photoType) are marked provisional (approved copy rule)
- [PASS] Analytics: track() takes a union of the 25 PRD event names (exact, in funnel order) and logs "[analytics] name {…}". There are no track( calls and no analytics.ts imports anywhere
- [PASS] Persistence: after a reload, session, job draft, onboarding progress and created data are all there. The Store viewer updates live after login and Clear
- [PASS] Reset (toolbar on /dev/mock and the Footer on /styleguide): the confirm text matches RESET_DEMO_COPY.confirm. Pending shows "Resetting…", disabled, aria-busy. After the reload the DB is back to seed (12 jobs, 8 users) and cfm-session, cfm-job-draft and cfm-worker-onboarding are removed. The seed check then shows "Matches seed" on all tiles
- [PASS] /dev/mock returns 200 (dev, and ○ static in the build). It has <meta name="robots" content="noindex, nofollow">, and no link to it exists in src or the rendered / and /styleguide
- [PASS] Hydration: no console errors or warnings on /dev/mock (fresh, armed, and with persisted session/draft/onboarding) or on /styleguide. Stores use skipHydration and hydrate after mount. Skeletons show until hydrated. The armed flag uses useSyncExternalStore with a false server snapshot

Design
- [PASS] /dev/mock 1280: head, chips, seed tiles 6-up in one row, 8/4 grid (services 789 px, stores 379 px, aside sticky). h1 44 px
- [PASS] /dev/mock 1024: same two columns (619 / 294 px), tiles 6-up (136 px each)
- [PASS] /dev/mock 768: one column, stores below services and not sticky, tiles 3 × 2
- [PASS] /dev/mock 375: documentElement.scrollWidth = 375 with jobs.listBoard / listForCustomer JSON open. JSON boxes scroll inside (309 px wide, 763 px of content). Run buttons are full width, tiles 2-up, and every button/link in main is at least 44 px tall
- [PASS] Footer Reset: at 1280, copyright on the left and Reset on the right (138 × 44, white text). At 375, stacked, left-aligned. It uses the footer linkClass plus the plan extras
- [PASS] Shared components: Button, Separator, Skeleton, Container, LoadingState, EmptyState, ErrorState. EmptyState/ErrorState get the additive headingLevel 4. No duplicates. No hex, text-sm/xs or font-medium in the new UI files. JSON uses the approved system --font-mono

Minor (log only, does not block)
- src/app/dev/mock/_components/dev-mock-panel.tsx:64 — with a session in the store, the sticky Stores aside is 802 px at 1280×800 (806 px at 1024×768). While stuck at top-8, its bottom 34 px is off-screen until the end of the services column. It gets taller once a full job draft exists. The UI plan says to drop lg:sticky when the viewer is taller than the viewport — drop lg:sticky (or cap with lg:max-h-[calc(100vh-4rem)] lg:overflow-auto)
- src/app/dev/mock/_components/use-service-call.ts:38 — "Resolved in N ms" is measured in the hook, so it includes render and structuredClone overhead and can read 805–812 ms although the delay is capped at 800 ms. That can confuse the 400–800 ms check — note it in the copy, or have runService report the delay it picked
- src/components/layout/reset-demo-data-button.tsx:8 (used by footer.tsx:7) — the static import of services.ts ships the whole mock layer (seed, Zod schemas, stores) in the client bundle of every page that has the Footer. Once T4 adds the Footer to the landing page, that is extra weight against the 2.5 s target — use `const { resetDemoData } = await import("@/lib/mock/services")` inside handleClick
- src/lib/mock/services.ts:269 — loginWithProvider returns an existing account as-is, ignoring the requested role. Facebook as worker, then Facebook as customer, returns the worker. That is consistent with one role per account, but T5 has to handle the role mismatch — document it, or reject with a typed code
- src/lib/validation/payment.ts:52 — the brand-aware CVC length check (superRefine) has no `{ when: always }`, unlike the other cross-field rules. On the first submit, an Amex card with a 3-digit CVC only shows the CVC error after the other card errors are fixed — add `{ when: () => true }`

Manual checks for the person
- /dev/mock at 1280 px — the visual layout: the sticky Stores card (log in first, then scroll mid-page and check whether the Worker onboarding block's bottom is cut off), tile row, chip wrapping
- /dev/mock at 1024 px — "Payment methods" tile label wraps cleanly; store Clear buttons stay on the heading row
- /dev/mock at 768 px — one column, Stores after Favourites, "Stores" jump chip scrolls to it
- /dev/mock at 375 px — no sideways scroll with the longest JSON open; full-width Run/Reset/links; JSON boxes scroll with touch
- /dev/mock (keyboard) — Tab order: links → Reset → chips → seed Run → each call (Run → JSON/Retry) → store Clear → JSON; visible focus ring on JsonBlocks; focus returns to Run after a call settles
- /dev/mock?mockError=1 — the armed notice shows; the first Run shows "Simulated error (?mockError=1)"; Retry succeeds; "Load without ?mockError" removes the notice
- /styleguide footer at 1280 and 375 px — Reset placement; white outline on keyboard focus and none on mouse click; native confirm text; Cancel does nothing; OK reloads with seed restored
- All of the above — no console errors or warnings

Verdict: READY TO COMMIT
```

Notes

- Runtime checks ran in the built-in browser pane (mcp__Claude_Browser__*) against `next dev -p 3100`, with viewport emulation at 1280, 1024, 768 and 375. The pane was hidden, so screenshots came back blank. Layout was verified with DOM measurements (bounding rects, scrollWidth, computed styles), not by eye. That is why the visual checks are listed under Manual. The viewport was reset to desktop afterwards. The dev server process tree was killed with `taskkill /T /F`, and port 3100 is confirmed free.
- The browser's localStorage for localhost:3100 was cleared of the cfm-* keys before testing and was reset to seed during testing. The last run left the demo DB slightly changed: the session was cleared, and one listTemplates and one getJob call were made (read-only).
