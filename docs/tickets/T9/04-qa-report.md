QA report — T9 Worker onboarding

Code health: lint pass · typecheck pass · build pass

Hard-rule scan of the T9 diff: no API routes, server actions, DB/ORM or SDKs; `package.json` unchanged (slider/progress come from the installed `radix-ui`); no seed imports outside `src/lib/mock`; no `track()` calls (approved); no raw hex, `text-white`, `text-brand`, `ring-*`, `text-sm|xs`, `font-medium|bold`; the only inline styles are the approved `--ring-size` and the generated Progress `translateX`. Copy lives in `WORKER_ONBOARDING_COPY`. Product decisions hold (US addresses, "Under review" until approved, one role per account).

How this was checked: `next start -p 3100`, curl on every route, then the built-in browser at 1280, 1024, 768 and 375 (emulated), with DOM measurements and screenshots. The pane is narrow, so screenshots at 1280/1024 come back heavily scaled; 768 and 375 are readable. The save-error path was simulated by removing the worker's profile from `cfm-mock-db` after the step loaded, so `updateOnboarding` threw.

Flow
- [PASS] Routes: `/workers`, `/signup?role=worker`, `/worker/onboarding/{area,services,id,insurance,payout}` (also with `?mockError=1`), `/worker/dashboard` and `/post-job/*` all return 200. The removed `[step]` folder returns 404. The onboarding pages have their own titles, `noindex, nofollow`, are not in the sitemap and have `instant = false` with a comment.
- [PASS] Done-when, end to end at 1280: `/workers` → "Create worker account" → email sign-up (OTP 123456, DOB, Terms) lands on `/worker/onboarding/area` (POST_SIGN_UP_ROUTE switch). On Area, an empty Continue shows the four address messages verbatim and focuses Street. An Arkansas address shows the non-blocking "Jobs may be limited in Arkansas" note. The slider works by keyboard only: Right +5, PageUp +25, End 200, Home 5, PageDown clamps at 5, Up +5; `aria-valuetext` "N miles"; the ring (51 % at 35 mi = 122 of 240 px) and the caption follow. Continue saves and lands on Services with focus on the `h1` ("Step 2 of 4"). The checklist shows Area "Done" and "1 of 5 done". On Services, an empty Continue shows "Choose at least one service you offer" on the group and on every card's `aria-describedby`, with focus on the first card. Two cards → Continue → Verify ID. Front, back and photo upload with "Uploading… → Uploaded". The success alert says "Under review". Insurance (PDF) → both rows "Under review" in the checklist and the ID-Card. The Stepper marks 1–3 done, the count reads "4 of 5 done", and the mock DB has `idStatus` and `insuranceStatus` set to `under_review`.
- [PASS] ID requires both sides, each labelled correctly. An empty submit shows "Upload the front of your ID" and "Upload the back of your ID". Focus goes to "Choose file for front of your ID" (`aria-describedby="id-front-error"`, `aria-invalid`). Each group's `aria-describedby` is "hint error". Each side has its own label, icon, prompt and accessible names.
- [PASS] `?mockUploadError=1` + Retry (ID). Both rows show the progress bar with "Uploading… 30%" (Back, Remove and the primary are disabled). Front shows "Upload failed" and keeps its file and Remove; back shows "Uploaded". The partial note shows. The checklist and ID-Card stay "Not started" for ID, and the mock records `idSidesUploaded: [id_back]`. Focus goes to "Retry upload: Front of your ID". Retry re-sends only the front. Both rows then show "Uploaded", the success alert is focused, the checklist and ID-Card show "Under review", the primary becomes Continue, and `idSidesUploaded` is cleared.
- [PASS] `?mockUploadError=1` + Retry (insurance). "Upload failed" with the PDF kept and focus on Retry; Retry → "Uploaded", "Under review" in the checklist and ID-Card.
- [PASS] Checklist and upload rows never contradict each other. A single row only ever says "Uploaded"; "Under review" appears only in the overall status (checklist, ID-Card, status panel, success alert), as the orchestrator ruled.
- [PASS] Pick refusals. A `.txt` and an 11 MB PDF are refused into `#insurance-pick-error` (`role="alert"`, on the group's `aria-describedby`) and clear on the next valid pick. The PDF and HEIC tiles render. A very long file name wraps with no overflow.
- [PASS] Payout. An empty submit shows "Enter a 9-digit routing number" and "Enter a valid account number" with focus on Routing. Fields are `inputMode=numeric`, `autocomplete=off` and have `maxLength` 9/17. A short routing number keeps its error live. The demo numbers save and go to `/worker/dashboard`. Only `payoutAdded: true` is stored; neither number appears anywhere in localStorage. On revisit: the "Payout account added" panel, Continue, no Skip. "Update payout account" opens empty fields and focuses Routing.
- [PASS] Skip. ID "Skip for now" goes to Insurance with focus on its `h1`; the Stepper leaves "Verify ID" un-done (`doneSteps`). Payout Skip goes to `/worker/dashboard` (code path, `focusHeading: false`).
- [PASS] Save and resume. Reloading Area pre-fills the address, state and 35 mi. Services pre-checks the categories. ID and Insurance revisits show the status panel instead of the upload controls. The onboarding store `cfm-worker-onboarding` mirrors the completed steps and `currentStep`. After a reload the ID-Card falls back to initials with the photo note (approved Q5).
- [PASS] Deep-link redirects. With no session, `/worker/onboarding/id` → `/login?next=%2Fworker%2Fonboarding%2Fid`, and logging in lands on `/id`. With area cleared, `/insurance` → `/area`. With area set and no services, `/payout` → `/services`. Hard loads and redirects never move focus. A demo worker login without `next` lands on `/worker/dashboard`.
- [PASS] Save-error alert (simulated; Area, with the same code in Services and Payout). Continue shows "Saving…" (disabled, `aria-busy`, fieldset disabled). Then "Something went wrong. Your progress is saved — try again" appears inline and focused, with the typed address and radius kept, and no toast. After restoring the DB, Continue succeeds.
- [PASS] `?mockError=1` on all five steps shows ErrorState ("Something went wrong" + "We couldn't load your onboarding progress…"). Retry shows "Retrying…" and then the step.
- [PASS] Rejected seed worker (Olivia, `wrk-006`). The red-bordered panel shows "Rejected", "Reason: The ID photo was unclear…" and the re-upload line above fresh upload fields; the checklist and ID-Card show Rejected. Re-uploading both sides gives "Under review" everywhere, and `rejectionReason` is cleared in the mock.
- [PASS] Customer session on `/worker/onboarding/services`: the "Customer and worker accounts are separate" notice, with "Log out and create a worker account" and "Go to my dashboard", the plain header and the Footer.
- [PASS] Focus and keyboard. Tab order is Logo → Finish later → Log out → checklist rows (the current row is not a link, `aria-current="step"`) → See jobs → fields → Skip → Back → primary. Every stop shows the global outline (checklist rows inset). Checklist links and Continue/Back/Skip move focus to the next `h1`.
- [PASS] Console: no errors or warnings on hard loads and client navigation of the onboarding steps, including `?mockError=1` and `?mockUploadError=1` (checked in a fresh tab). No hydration errors.
- [PASS] T6/T7 regression smoke (customer). Steps 1–5 and Review work. The nav is labelled "Job progress", with "Step N of 8" and 8 columns. Back is present on every step; Back from Where keeps the Services selection and focuses the `h1`. Continue in the builder is still `h-12` (49 px).

Design
- [PASS] 1280: form 687 px left, "Your progress" panel 379 px right, top-aligned, not sticky. The header has Logo, "Finish later" and "Log out" (all 44 px). The 4-column Stepper is labelled "Onboarding progress". Area has no Back and Continue sits at the right. The map is 687 × 240 with a caption.
- [PASS] 1024: form 619 and panel 294 (the plan's 629/299 minus the scrollbar).
- [PASS] 768: the panel is above the `h1`, always open, with the checklist and ID-Card side by side (316 px each). The ID fields are 2 × 340 and the payout fields 2 × 340.
- [PASS] 375: no horizontal scroll on any step (`scrollWidth` 375), including a long file name, a HEIC tile and the open panel. The header fits on one 65 px row (mark logo, Finish later, Log out). The "Your progress · N of 5 done" toggle is 343 × 56, closed by default, with `aria-expanded`; open, it shows all rows (≥ 75 px) and the ID-Card (rearranged, not removed). Services cards stack at 343 px. Back and primary sit in a sticky footer. "Take photo" shows on touch emulation. Every touch target is ≥ 44 px (the slider thumb is 24 px inside the 44 px slider row, as planned).
- [PASS] Shared components are reused (StepLayout, Stepper, StepSkeleton, AddressInput, SelectableCard, FormField, FormAlert, ErrorState, RequireRole, LogoutButton, Footer); none is duplicated. Badges pair each status with its own word and icon.
- [BLOCKING] Primary action button stretches tall at desktop on short steps — `src/components/flow/step-layout.tsx:168` (actions row) with `:184` (`h-auto` on the primary) and `:93` (aside `lg:row-span-2`) — the progress panel (about 825 px) is taller than the Services, Insurance and Payout forms. Grid row 2 grows, so the flex actions row stretches the `h-auto` primary button while Back stays 48 px. Measured: Services Continue 146 px (1280) / 148 px (1024); Insurance "Submit for review" 164 px (1280) and Continue on the status-panel view 268 px (1024); Payout "Add payout account" 159 px (1280) / 170 px (1024). A screenshot shows a large blue block beside a small Back button. The UI plan has Back/Continue at `h-12`. — Fix: keep the action buttons at their natural height, for example add `items-start` (or `lg:self-start`) to the actions container. Then re-check that T6/T7 actions are unchanged.

Minor (log only, does not block)
- `src/components/flow/step-layout.tsx:184` with `src/lib/constants.ts:2068,2072` — at 375 the primary in the sticky footer wraps to two lines ("Submit for review", "Add payout account" are 214 × 73 px) next to a 48 px Back. — Shorten the labels or let the primary take more width on mobile (T12 copy/polish pass).
- `src/lib/validation/worker.ts:56-58` — a refused pick (wrong type, or over 10 MB) shows the "required" message ("Upload your insurance document" / "Upload the front of your ID"), which doesn't say why the file was refused. — Add type and size messages for documents (T3 schema; log for T12).
- `src/lib/mock/services.ts:636-641` — when a side from an earlier visit is already on record and both sides are uploaded again, the first call completes the pair and clears the record, and the second call records its side again. A stale side can then make a later single-side re-upload (for example after a T10 rejection) flip the ID to "Under review". — Don't record a side once the ID is `under_review`/`verified`, or clear the sides when the status changes.

Manual checks for the person
- `/worker/onboarding/services`, `/insurance`, `/payout` at 1280 and 1024 px — after the fix, Continue / "Submit for review" / "Add payout account" are the same height as Back (48 px). Also re-check `/post-job/*` at 1280.
- `/worker/onboarding/area` at 1280 px — overall look of the map placeholder (dashed ring on brand-soft, pin disc, "Preview — not to scale" chip, caption); the ring animates while you drag the slider and does not animate with reduced motion.
- `/worker/onboarding/id` at 1280 and 1024 px — the two ID fields sit side by side and the photo field is in the left half; check the look of the progress bar, the "Uploaded" tick, the red "Upload failed" + Retry (use `?mockUploadError=1`), and the thumbnail and HEIC/PDF tiles.
- Every onboarding step at 1280 and 1024 px — the "Your progress" panel (surface-alt frame, white checklist and ID-Card cards, badge colours and icons in greyscale, the ink border on "You're here").
- `/worker/onboarding/payout` at 768 px — the panel above the `h1`, with the checklist and ID-Card side by side and the same height.
- Every onboarding step at 375 px on a real phone — the sticky footer stays above the browser bar (`pb-safe`), "Take photo" opens the camera, and the toggle chevron rotates.
- `/post-job/*` (any width) — in the production build, Continue and Back between builder steps sometimes did a full document load (RSC fetch then document request), so the next step's `h1` did not take focus. T9 does not touch these routes or the router, so compare with a build of the last commit before treating it as a T9 regression. Three unexplained 404s also appeared in that tab's console during the marketing/sign-up/builder part of the session; the onboarding pages were clean in a fresh tab.

Verdict: NEEDS FIXES (1 blocking)

---

## Round 2

QA report — T9 Worker onboarding (round 2: re-check of the BLOCKING fix)

Code health: lint pass · typecheck pass · build pass

The fix under review is `lg:self-start` on both `ACTIONS_COLUMN` entries in `src/components/flow/step-layout.tsx:103-104`, with a comment explaining it. Nothing else in the T9 diff changed. I checked it on the production build (`next start -p 3100`) in the built-in browser, with seed worker Noah (`wrk-005`); I edited the mock DB to reach each step state. The `/post-job` steps ran with no session.

Flow
- [PASS] Routes: `/worker/onboarding/{area,services,id,insurance,payout}`, `/post-job/category` and `/post-job/review` return 200. `/login?next=/worker/onboarding/services` lands on Services.

Design
- [PASS] Former BLOCKING: the primary action no longer stretches at 1280 or 1024. The action row is 74 px at both widths. Back is 48 px on every step that has one (Area has none).

  | Screen | Primary at 1280 | Primary at 1024 |
  | --- | --- | --- |
  | Services, Continue | 152 × 49 | 152 × 49 |
  | Insurance upload view, "Submit for review" | 219 × 49 (also 49 while uploading) | 219 × 49 |
  | Insurance after upload, Continue | 152 × 49 | n/a |
  | Insurance status-panel view, Continue | 152 × 49 | 152 × 49 (was 268) |
  | Payout fields, "Add payout account" | 244 × 49 | 244 × 49 |
  | Payout "added" panel, Continue | 152 × 49 | 152 × 49 |
  | Area, Continue | 49 | 49 |
  | ID, Continue | 49 | 49 |

  A 1024 px screenshot of Insurance shows normal-height Back and "Submit for review" next to the tall progress panel.
- [PASS] `/post-job` regression at 1280 and 1024: steps 1–5 show "Step N of 8", Continue 49 px and Back 48 px. Review (no session) shows "Step 6 of 8: Review & Post", "Create account" 49 px and Back 48 px. No horizontal scroll (`scrollWidth` 1265 / 1009, which is the viewport minus the scrollbar).
- [PASS] 768: unchanged. The onboarding panel sits above the `h1`, with its body as a grid. The action row is static: Continue 49, "Submit for review" 49, "Add payout account" 49, Back 48. `/post-job/services`, `/match` and `/review` are unchanged. No horizontal scroll (753).
- [PASS] 375: unchanged. On all five onboarding steps the action row is `position: sticky` and the "Your progress" toggle shows above the `h1`. Opened, it shows the body and the ID-Card. Area's Continue fills the width (343). `scrollWidth` is 375 everywhere. `/post-job/location` and `/match` keep the sticky footer; on location it sits on the viewport bottom, and on the short match page it sits where it naturally falls. Review keeps Back sticky. Touch targets are unchanged: the header items measure 43.997 px, which is a sub-pixel effect of the scaled emulation; computed 44.
- [PASS] Console: no new errors. The tab still holds the three 404s logged in round 1; the resource timing for the current page has no 404.

Minor (log only, does not block)
- None new. The round 1 MINOR items stand and are not re-raised.

Manual checks for the person
- The round 1 list stands, with one change: the first item becomes a quick visual confirmation. On `/worker/onboarding/services`, `/insurance` and `/payout`, and on `/post-job/*` at 1280 and 1024, Back and the primary should look the same height.
- `/post-job/*` full page loads: the lead engineer could not reproduce them (0 of 31 moves on HEAD and on the working tree), and the issue is logged against T6 for T12. In this browser pane, Continue in the builder still started a new document (`performance.now()` reset, running scripts cut off). Not blocking. If you see it in your browser, it belongs to the T6 entry.

Verdict: READY TO COMMIT
