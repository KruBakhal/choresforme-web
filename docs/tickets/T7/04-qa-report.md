# QA report — T7 Job builder steps 6–8

Code health: lint pass · typecheck pass · build pass

How this was checked: I read the T7 product and UI plans, the Tech Spec (the T7 row, routing rules, card validation, screen states, responsive layouts, acceptance criteria), the PRD (customer steps 6–8 and app hand-off), and every changed or new file. Then I ran the production build (`npm run start -- -p 3100`) and drove it in the built-in browser at 1280, 1024, 768 and 375 px. All routes returned 200: `/post-job/review`, `/post-job/payment`, `/post-job/confirmation`, `/post-job/confirmation?job=x`, `/post-job/category` and `/dashboard`. The hard-rule scan found nothing: no backend code, no new dependencies, no seed imports in UI code, and no forbidden classes (raw hex, `text-white`, `text-brand`, `border-brand`, `ring-*`, `text-sm|xs|base|lg`, `font-medium|bold` or arbitrary `[…]` values) in the T7 files.

## Flow

- [PASS] **The ticket is done: a guest posted a job end to end.** I went through steps 1–5 in the UI and reached Review. I signed up inline: the empty submit showed every error and focused First name; a wrong OTP showed "That code didn't work. Try again"; `123456` verified; DOB and Terms were filled. After sign-up the user stays on Review, the Post card appears and focus moves to "Ready to post your job". Then Continue to payment → no saved card, so the card form showed directly → 4242… / 12/30 / 123 → Post job → Confirmation. The draft was cleared to `{lastStep:0}`, one `open` job was created for the new customer, and the template "Weekly lawn care" was saved.
- [PASS] **The job appears for the customer.** The posted job has the new customer's `customerId`. For `demo.customer`, `/dev/mock` `jobs.listForCustomer`, `jobs.listBoard` (demo worker, Austin, outdoor) and `templates.list` all included the new job and template. A direct (Pick a Worker) job was created `accepted` with `workerId`. Confirmation shows "Accepted" and "We've sent your job to Marcus J…".
- [PASS] **Demo customer with a saved card.** After an inline login, Review showed the Post card at once. Payment preselected "Visa ending 4242". Posting needed no new card.
- [PASS] **Save As Template.** Ticking the box and leaving the name empty, then blurring or submitting, shows "Name this template". The field gets `aria-invalid` and `aria-describedby="templateName-error"`, and focus goes to the field. The box and the name survive a reload and Back (`templateName` is in `cfm-job-draft`). The template is saved after posting. Confirmation then shows "Saved as template "…"", and after a reload it shows "Saved as a template".
- [PASS] **A template save that fails during posting.** I simulated it by re-arming `?mockError=1` with `history.replaceState` while `jobs.create` was in flight, so `templates.save` failed. The job still posted, and Confirmation showed the offer with the quiet note "We couldn't save your template. You can try again here." and the name filled in. Save template then worked, and the Saved line took focus. The offer's own validation also works: empty → "Name this template", `aria-describedby` includes `confirm-template-name-error`, and the field is focused.
- [PASS] **Edit links with `?from=review`.**
  - Edit details opens `/post-job/details?from=review` with "Save and return to review" and focus on the step heading. Changing the price to $150 → Continue → back on Review with $150 and focus on `review-title`.
  - Edit category → a new category → `/post-job/services?from=review` (the draft is incomplete) → pick a service → back to Review.
- [PASS] **Inline auth details.**
  - An existing email in Sign up shows "You already have an account — log in". Its "Log in" button switches mode in place and focuses `review-auth-title`.
  - An unknown email in Log in shows "No account found". Its "Sign up" button switches back.
  - Forgot password links to `/forgot-password?next=%2Fpost-job%2Freview`.
  - Enter in the template name as a guest validates, then focuses the auth card. Nothing navigates.
- [PASS] **Social (Google) sign-in inline on Review.**
  - A new Alex Rivera: the dialog closes, the "Finish setting up your account" card appears inline, and focus is on its `h2`. Focus does not jump back to the removed trigger. Mobile + OTP + DOB + Terms → Finish sign-up → Post card, with focus on `post-card-title`.
  - Logging out with "Not you? Log out" keeps the draft and the URL, shows the Sign up card again and focuses its heading.
  - Google again as the now-complete Alex goes straight to the Post card, with focus on `post-card-title`.
  - A hard reload as a customer does not move focus (activeElement is BODY).
- [PASS] **A worker logs in inline.** `demo.worker` on Review → the session starts and "Customer and worker accounts are separate" replaces the page, with focus on its `h1`. The draft is kept. There is only one `<main>` (and one `<header>`) on Review, Payment and Confirmation, so there is no nested main.
- [PASS] **Guards on Payment.**
  - A guest is sent to `/login?next=%2Fpost-job%2Fpayment`.
  - A customer with `lastStep 5` (Review not passed) is sent to `/post-job/review`.
  - A customer with no description is sent to `/post-job/details`.
- [PASS] **Guards on Confirmation.**
  - A guest is sent to `/login?next=%2Fpost-job%2Fconfirmation%3Fjob%3Djob-001`.
  - With no `?job=` and an empty draft, the page goes to `/dashboard`.
  - An unknown id, and another customer's job (`job-001` for a new customer), both show "We couldn't find this job" (as the `h1`, with no Stepper) plus "Go to my dashboard" → `/dashboard` and "Post a job" → `/post-job/category`.
- [PASS] **Payment states.**
  - Loading: skeleton rows, with Post job disabled.
  - Empty: the "Add a card" heading, the intro line and the card form.
  - `?mockError=1`: ErrorState with Retry, and Post job disabled. Retry loads the methods with the first one preselected.
  - Card errors: the empty submit shows all three messages verbatim, focus goes to the card number, and each error is in its input's `aria-describedby` with `aria-invalid`. A past expiry (01/20) shows "Enter a valid expiry date".
  - The brand label "Visa" appears, and number and expiry are formatted as typed.
- [PASS] **Posting failures.** With `addMethod` forced to fail, "We couldn't add this card" was shown and focused, the typed card stayed, and no job was created. With `addMethod` succeeding and `jobs.create` forced to fail, "Something went wrong. Your job is saved — try again" was shown and focused. "Mastercard ending 4444" became the checked saved row and the panel closed. Retry posted once, without adding the card again.
- [PASS] **No card digits stored.** After posting with 4242 and 5555…4444, no `cfm-*` key contained the card number, expiry or CVC. Stored methods are `{id, brand, last4}` only.
- [PASS] **No step-1 flash and no double post.** I polled every 25 ms through posting. The sequence was Payment ("Posting your job…") → `/post-job/confirmation?job=…` (loading) → "Job posted", with no step 1 and no Review in between. Calling `click()` twice on Post job created exactly one job. Focus lands on "Job posted" on arrival. A reload does not move focus.
- [PASS] **`?mockError=1` on Confirmation.** The ErrorState `h1` "Something went wrong" appears with Retry and "Go to my dashboard", under the Stepper. Retry shows "Job posted".
- [PASS] **AppPrompt.**
  - Desktop UA: the "We'll email and text you updates" variant only.
  - Android UA (375 mobile emulation): the PRD title, "The Chores For Me app is free on Google Play." and "Get it on Google Play" → `play.google.com/…com.choresforme.user` with `target=_blank`. The dashboard action becomes `secondary` (approved).
  - Dismiss stores now + 7.000 days in `cfm-app-prompt-customer`, moves focus to "Go to my dashboard" and announces "Hidden for 7 days.". The prompt stays hidden after a reload, and shows again once the expiry is in the past.
  - No hydration warnings appeared on a hard reload with the Android UA.
- [PASS] **Worker lookup error on Review.** `?mockError=1` on a direct job shows the quiet note "Pick a Worker: your chosen worker / We couldn't load the worker's details. Try again". Try again re-runs the lookup. A worker that no longer qualifies is cleared and the guard sends the user to step 5.
- [PASS] **Browser Back after posting.** Back from Confirmation goes to Review, whose guard sends the empty draft to `/post-job/category` (OQ 15).
- [PASS] **Console.** There were no application errors or warnings on Review, Payment or Confirmation during the whole run, and nothing in the server log. The only console errors came from my own `focusin` test listener.

## Design

- [PASS] **Review at 1280.** Columns are 687 / 481 (7/5). The guest aside scrolls with the page (`static`). The customer Post card is `sticky`. Back is the only action. The help links are present.
- [PASS] **Review at 1024 (not covered by lead QA).** Columns are 457 / 457, 6/6 inside the 1009 px client width. The six OTP boxes sit in one row inside the bordered panel (right edge at 898 px, panel edge at 944 px). The Post card is sticky. No horizontal scroll.
- [PASS] **Review at 768 (not covered by lead QA).** Stacked at 705 px in this order: summary and template → auth or Post card → Back. The guest jump link is visible below `lg`; clicking it scrolls the card to 16 px from the top and focuses `review-auth-title`.
- [PASS] **Review at 375.**
  - `scrollWidth` is 375 with the OTP panel open.
  - The sticky footer holds Back only.
  - After an empty sign-up submit, the first invalid field (y 382–430) stays above the footer (y 740).
  - The Post card is visible after a social sign-in.
- [PASS] **Payment at 1280 / 1024 / 768 / 375.**
  - 1280: 687 + 379 (sticky).
  - 1024: 619 + 294 (sticky).
  - 768: stacked with the expanded "Your job" summary first (approved).
  - 375: the "Your job · Est. $120" bar sits before the `h1`, and the sticky footer has Back + Post job.
  - No horizontal scroll at any width, including with all card errors showing.
- [PASS] **Confirmation at 1280 / 1024 / 768 / 375.** The column is 672 px and centred at 1280, 1024 and 768, and 343 px at 375. Actions stack full width at 375. The Android prompt at 375 has no overflow.
- [PASS] **Touch targets.** No visible control in `main` is under 44 px tall at any width (Edit links, mode switch, help links, "Not you? Log out", Dismiss, method rows, inputs, buttons). Edit links are about 28 px wide at a 44 px height; that is the plan's `min-h-11` link rule.
- [PASS] **Keyboard-only focus order (not covered by lead QA).** Every stop had `:focus-visible`.
  - Review (guest, 1280): Edit ×5 → Save as template → Template name → Log in → Google → Facebook → sign-up fields → Create account → the two FAQ links → Back → footer. This matches UI plan §2.
  - Payment (768): method group (one stop) → card number → expiry → security code → When am I charged? → Back → Post job.
  - Confirmation: Template name → Save template → Dismiss → Go to my dashboard → Post another job.
- [PASS] **Shared components reused, no duplicates.** `StepLayout`, `AuthCard`, `FormAlert`, `SelectableCard`, `JobSummaryPanel` (with `servicesText` exported, not copied), `LoadingState`, `ErrorState` and `EmptyState`. Copy lives in `constants.ts`.

## Minor (log only, does not block)

- `src/components/post-job/use-step-navigation.ts:44` (`draftComplete`, used at :53) — the Continue label comes from the saved draft, not the live form. On Category opened with `?from=review`, the label still says "Save and return to review" after a new category is picked, but Continue goes to Services. On Services it says "Continue", but Continue returns to Review. Fix: work out the label from the step's live values (or from the patch it is about to save), in the same way `nextRoute()` does.
- `src/lib/constants.ts:1719` — `nextDirect` followed by `workerDisplayName` ("Marcus J.") reads "We've sent your job to Marcus J.. It shows…" (double full stop). Fix: drop the template's full stop when the name already ends with one, or reword the copy (for example "…to Marcus J. — it shows as Accepted…").
- `src/components/post-job/confirmation-step.tsx:436` (with `payment-step.tsx:174` / `services.ts:435`) — the template status after a reload comes from `job.savedAsTemplate` alone. So:
  - If `templates.save` failed during posting, a reload shows "Saved as a template" although no template exists.
  - If the template was saved from the Confirmation offer, a reload offers it again, so a duplicate template is possible.

  Fix in T8/T12: check `templates.list` for this job, or record the result on the job.
- `src/components/flow/step-layout.tsx:172` — at 375 px, "Posting your job…" with the spinner wraps to two lines (the button grows to 73 px). UI plan §3 and §9 expect it on one line. Fix: a shorter spinner gap, or let the footer give Post job more width while posting.
- `src/components/post-job/review-auth-panel.tsx:185` — the incomplete-profile variant's `LogoutButton` has no `onError`, so a failed logout there is silent. The Post card variant shows it. Fix: pass `onError={setLogoutError}` and render the alert in the same way.

## Manual checks for the person

**`/post-job/review`**
- At 1280: look at the guest Sign up card next to the summary (7/5 split). The Post card should stay pinned when you scroll as `demo.customer`.
- At 1024: open the OTP panel in Sign up and check that the six boxes have no visual clipping.
- At 768: the order should be summary, template, auth card, Questions?, Back. The "Create an account to continue" link should scroll to the card.
- At 375: the auth card has no card chrome, and the footer holds Back only. Social sign-in → "Finish setting up your account" should be visible without scrolling.
- At any width: tab through by keyboard and check that the focus ring is visible on the Edit links and the Save as template checkbox.

**`/post-job/payment`**
- At 1280: the order summary stays sticky while the card form scrolls.
- At 768: the expanded "Your job" panel sits above the heading.
- At 375: the "Your job · Est. $…" bar sits above the heading. Post a job and look at the "Posting your job…" wrap (Minor above). Brand label "American Express" with 3782 822463 10005: the digits should not run under the label.

**`/post-job/confirmation?job=…`**
- At 1280, 1024 and 768: a centred 672 px column.
- At 375 with Android device emulation: the Play button wraps under the text and the dismiss X does not overlap the title.
- At any width: after Dismiss, a reload keeps the prompt hidden.

**`/post-job/confirmation?job=job-unknown`**
- At 375 and 1280: the "We couldn't find this job" card with stacked buttons at 375.

**Every T7 route**
- At 1280, 1024, 768 and 375: DevTools console with no errors or warnings (my run was clean apart from my own test listener).

Cleanup done: the `cfm-*` keys are cleared, the viewport and user agent are reset (desktop preset, non-Android UA), the server is stopped with `taskkill /T /F`, and port 3100 is free.

Verdict: READY TO COMMIT
