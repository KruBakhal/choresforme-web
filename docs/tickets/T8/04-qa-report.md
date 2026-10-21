QA report — T8 Customer dashboard

Code health: lint pass · typecheck pass · build pass

Hard-rule scan: `package.json` unchanged. No API routes, server actions or persistence. Every view gets its data through `src/lib/mock/services.ts`, and no T8 file imports seed data. The new read is `workers.getSummaries` (approved). The forbidden-class grep over the T8 files (raw hex, `text-white`, `text-brand`, `border-brand`, `ring-*`, `text-sm|xs|base|lg`, `font-medium|bold`, arbitrary `[…]`) found nothing except `text-brand-foreground`, which is allowed. No AGENTS product decision is broken: no date picker, hourly is rate × hours, charged on completion with no refunds, one role per account, US addresses only.

Method: I ran `next start -p 3100` (production build) and `next dev -p 3101` (to catch hydration warnings) and drove both in the built-in browser with emulated viewports of 1280×800, 1024×768, 768×1024 and 375×812. Keyboard steps were real key presses: Tab, Enter, Space, arrows and Esc. Layout was checked by DOM measurement: `scrollWidth`, element rects and the size of every visible control. The pane's screenshots are low resolution, so the visual items are also listed under Manual checks. Every route in the ticket returned 200 with `curl`, including `/dashboard/jobs/job-unknown` and `?mockError=1`.

Flow
- [PASS] Routing. Logged out, `/dashboard/history` goes to `/login?next=%2Fdashboard%2Fhistory`, and `/dashboard/jobs/job-006` keeps the full path in `next`. After login the user lands on `next`. As `demo.worker`, `/dashboard/jobs/job-006` shows "Customer and worker accounts are separate" with the sign-up link.
- [PASS] Navigation matches the PRD: Home · Jobs · History · Account in the SideNav (240 px at lg, 80 px icons at md) and the BottomNav (< md). "Post a job" is always in the SideNav and the mobile top bar. `/dashboard/jobs/<id>` and `/edit` mark **Jobs** as `aria-current="page"` in both navs.
- [PASS] Home (`demo.customer`): "Hi, Jordan", 3 active job cards (newest first) with "View all jobs", and a 320 px rail at 1280 holding Saved Templates (2) and the app banner ("We'll email and text you updates" on desktop). After posting a job end to end, "Go to my dashboard" shows the new job first on Home and on Jobs.
- [PASS] Jobs: "9 active jobs" (5 open, 2 accepted, 2 in progress), newest first. 3 columns at 1280, 2 at 1024 and 768, 1 at 375. Each card is a single Tab stop and the whole card is clickable.
- [PASS] Job detail, every status:
  - **open**: Edit job and Cancel job, the board line, "Back to jobs".
  - **accepted**: Cancel only, the "can't be edited" note, WorkerCard with the favourite toggle.
  - **in_progress**: no actions and no mobile bar, the "under way" note.
  - **completed**: Rate this job and Re-post, the Rate section first, Receipt with "Total charged" and "Charged on completion. No refunds.", "Back to history".
  - **cancelled**: Re-post only, "This job was cancelled before it was done.", no amount.
  - Photos show "No photos added." No `<img>` is rendered.
- [PASS] Cancel dialog. It opens with focus on "Keep job". It says "A cancellation fee may apply. The amount and when it applies are still being confirmed." and links to "Is there a fee to cancel a job?" (`/faq#cancellation-fee`, new tab). No amount is shown. Esc or Keep closes it and focus returns to Cancel job.
  - Success: the status becomes Cancelled, the back link becomes "Back to history", the actions become Re-post, and focus moves to "Job cancelled." (`role="status"`).
  - For an accepted job the description reads "Priya P. will no longer do this job."
- [PASS] Cancel `NOT_ALLOWED`, simulated by setting job-001 to cancelled in the mock DB while the dialog was open:
  - the inline alert "This job can't be changed right now" takes focus;
  - "Cancel job" disappears and "Keep job" becomes "Close";
  - the job reloads behind the dialog (Cancelled, Re-post);
  - Close moves focus to `#page-title`.
- [PASS] Rate, keyboard only, on job-011:
  - "Rate this job" moves focus to `#rate-title`, and Tab enters the radios (one Tab stop, 2 px focus ring on the 44 px star box).
  - Submitting with nothing chosen shows "Choose a star rating" and focuses the first star.
  - ArrowRight ×3 checks 4 stars: the read-out says "4 out of 5" and 4 stars are filled.
  - Submit shows "You rated 4 stars", focused. The form and the bar's Rate button go away. Worker wrk-002's rating moved from 5 to 4.98.
  - job-010 shows "You rated 5 stars".
- [PASS] Rate `NOT_ALLOWED`, simulated by setting job-010 to rated in the DB after the form had rendered. Submitting reloads the job and shows and focuses "You rated 5 stars".
- [PASS] Favourite toggle on Job detail: "Remove from Favourite Workers" leads to "Priya P. removed from your Favourite Workers." and the label changes. Adding her back reads "…is now a favourite worker." Focus stays on the button.
- [PASS] Edit (job-003):
  - Fields are pre-filled. Category and Who are read-only.
  - A too-short description plus a $2 price shows both spec messages and focuses the description first.
  - State Ohio shows "We're not in Ohio yet / Choose an address in Texas…". Save then focuses that note and does not save.
  - Back to Texas and $160 saves, returns to the detail page and shows "Your changes are saved." (focused) with Price $160.
  - `/dashboard/jobs/job-006/edit` (accepted) shows "This job can't be changed right now" and "Back to job".
  - Edit `NOT_ALLOWED` (job flipped to accepted while the form was open) shows a focused alert with "Back to job", and the typed values are kept.
- [PASS] Re-post:
  - from a cancelled job with an empty draft, it opens `/post-job/review` with every section filled, focus on the h1, Save As Template unticked, and `lastStep` 5. `/post-job/payment` redirects to Review.
  - from a template with a draft in progress, "Replace the job you're building?" opens on "Keep my current job". Keep leaves the draft and returns focus to the Re-post button. Replace loads the template draft and opens Review.
  - from History and from Account templates, it reaches Review.
- [PASS] History: 3 rows (cancelled job-012 by posted date, then the completed jobs by completed date). Cancelled rows show "—" with sr "No amount shown". Rated/not-rated text and Re-post / Rate / View receipt are present.
  - "View receipt" and "Rate" (client navigation) land on the detail page and focus `#receipt-title` and `#rate-title`.
  - Table at 1280 (5 columns) and at 1024 and 768 (4 columns, badge inside the Job cell). Cards at 375.
- [PASS] Account:
  - **Profile.** Edit moves focus to First name. Changing the mobile blocks Save with "Verify your mobile number"; Send code then OTP `123456` shows "Mobile number verified", and Save shows "Profile saved." (focused) with the new values. The SideNav shows "Jordy Miller" after the name change. A duplicate email shows "This email is already used by another account" and focuses Email. Cancel returns focus to "Edit profile".
  - **Add a card.** Opening it focuses Card number. Saving empty shows the three spec messages. Amex `378282246310005` gives "American Express ending 0005 added." (focused) and adds a row. No card digits appear in localStorage or the URL.
  - **Remove favourite.** Removing wrk-002 shows "Priya P. removed…", moves focus to `#favourites-title` and then shows the empty state. Step 5 then shows Priya P. without the "Favourite" tag.
  - Templates with Re-post, and Support (email, phone, FAQ).
- [PASS] `new.customer`:
  - Home shows "No jobs yet" with Post a job. The templates section is hidden and the rail holds only the banner. Dismissing the banner removes the rail, moves focus to `#page-title` and announces "Hidden for 7 days.".
  - Jobs shows "No jobs yet", and History shows "Your finished jobs will appear here" with "View active jobs".
  - Account shows "No saved cards yet." and "No favourite workers yet".
- [PASS] `?mockError=1`. `ErrorState` and then a successful Retry on Home (jobs; the rail still loads), Jobs, History, Job detail (with "Back to dashboard") and Edit (with "Back to dashboard"). On Account only the Payment details section errors and the other sections load.
- [PASS] Not found: `/dashboard/jobs/job-unknown`, and a job whose `customerId` was set to `cust-new`, both show "We couldn't find this job" with "Back to dashboard".
- [PASS] Revisit (decision 8): with the profile in edit mode I went to Jobs and back, and the profile was in view mode. A job cancelled in the DB went from "8 active jobs" to "7 active jobs" on the next client visit to Jobs.
- [PASS] Route-change focus. Client navigation moves focus to `#page-title` on every T8 page. A hard load leaves focus on `body`.
- [PASS] Regression, T7 Confirmation: after a full post (Re-post template, Review, Payment with the saved Visa, Post job), the Job summary header shows `StatusBadge` "Open" (brand-soft, dashed-circle icon, sr "Status:").
- [PASS] Regression, T6 steps 2 and 4 with the extracted fields:
  - Step 2: ticking "Other" (Space) shows the text field, and Continue with it empty shows "Describe the other service" and focuses it. With text it goes on to `/post-job/location`.
  - Step 4: the counter goes from 65 / 500 to 4 / 500, and the live region says "4 of 500 characters". Continue shows the description message and focuses it.
  - The diff is a faithful extraction with no behaviour change.
- [PASS] Console. `next dev` (hydration check): hard loads and client navigation across all six T8 routes, the cancel dialog, the `#rate` jump, Account panels and Re-post logged only the React DevTools info and "[HMR] connected", with no warnings or errors. Neither server log had errors.

Design
- [PASS] Home: 1280 shows main and a 320 px sticky rail (Templates, then the banner). At 1024, 768 and 375 the rail content stacks under the active jobs with nothing removed. Going from Home to Jobs removes the rail at once, and the other pages draw no `aside`.
- [PASS] Job detail:
  - 1280 and 1024: details on the left and a sticky 320 px card on the right (`lg:sticky`).
  - 768: stacked, with the card (actions inside) directly under the header.
  - 375: the action bar is `fixed` with its bottom at 736.3 px and the BottomNav top at 735.6 px, so it sits on the nav (a sub-pixel overlap, no gap). The last section ends at 596 px, clear of the bar's top at 664 px. Both buttons are 166×48.
- [PASS] Edit at 375: the sticky Cancel / Save bar sits on the BottomNav (same offsets). Cancel is 107×48 and Save changes 224×48.
- [PASS] Dialogs: a 448 px centred modal at 1280. At 375 a full-width bottom sheet with buttons stacked full width, "Keep job" on top, and a 44 px close button.
- [PASS] History: the table never scrolls sideways (table 975 / 719 / 639 px inside containers of 976 / 720 / 640). Card list at 375.
- [PASS] Account: two stacks at xl (547 / 382 px), one column at 1024 and 768 (625 px at 768), stacked at 375 with Profile edit, the OTP row and the Add-a-card panel with all errors open. No horizontal scroll.
- [PASS] No horizontal scroll at 1280, 1024, 768 or 375 on Home, Jobs, Job detail (open, accepted, completed), Edit (with errors), History and Account (`scrollWidth === clientWidth` each time).
- [PASS] Touch targets: every visible T8 control is at least 44 px tall. The stars, back links, History link buttons, Re-post, Remove and the support links are all 44 px. JobCard title links are 22 px, but the stretched overlay makes the whole card the target. Shell items (Logo 40 px wide at md) are T2.
- [PASS] StatusBadge: each status has its own label, icon shape and sr "Status:" prefix. The token pairs follow the plan.
- [PASS] Shared components are reused, not duplicated: WorkerCard display variant, FormAlert success tone, AppPrompt `layout="rail"`, MobileVerifyField `initiallyVerified`, LoadingState `columns` and `form`, CardFields, AddressInput, PriceInput, and the extracted SubServicesField and DescriptionField.

Minor (log only, does not block)
- `src/components/dashboard/history-list.tsx:226`: the table's "Rate" link button is only 34 px wide (44 px tall). Fix: add `min-w-11` to the link-variant actions.
- `src/components/dashboard/payment-methods-section.tsx:124`: "Add a card" has a hard-coded `aria-expanded={false}` and no `aria-controls`. The button is hidden while the panel is open, so the attribute never changes. Fix: drop `aria-expanded`, or keep the button rendered and wire `aria-expanded={panelOpen}` and `aria-controls="add-card-form"`.
- `src/components/dashboard/template-list.tsx:139`: in the 320 px rail at xl the template text column is only 103 px. "House Cleaning · $40/hr × 4 hours" wraps to 4 lines (96 px). Fix: in `variant="rail"`, stack the Re-post button under the text (`flex-col`, button `self-start`).
- `src/components/job/job-detail.tsx:28`: at 1024 the details column is 353 px but the `dl` rows stay 3-column (`sm:`), leaving about 180 px for values, so the description wraps heavily. Fix: switch the rows at `xl:` instead of `sm:`, or use a 1/3 + 2/3 split only when the column is wide.
- `src/app/dashboard/layout.tsx:20`: on a hard load of `/dashboard/jobs/[id]` (and `/edit`) the Suspense fallback is a full-width skeleton with no SideNav, top bar or skip link. The shell then pops in, and the content shifts by 240 px at lg (about 30 ms here, longer on slow devices). Focus is not lost, because hard loads keep focus on `body`. Fix: give the fallback the shell frame (for example `AppShell role="customer" activeHref="/dashboard/jobs"` around `GuardLoading`), so only the body swaps.
- `src/components/dashboard/cancel-job-dialog.tsx:152,160`: while "Cancelling…" runs, both footer buttons are disabled, so focus drops to `body` inside the open modal (seen by keyboard). Fix: keep focus on the dialog, for example with `aria-disabled` and a click guard instead of `disabled`, or focus the `DialogContent` while the request runs.
- `src/components/dashboard/job-detail-view.tsx:123`: after a quiet reload (cancel or rate `NOT_ALLOWED`), the worker and favourites are not reloaded. If the job changed status, for example open to accepted in another tab, the side card keeps the old board line or the favourites skeleton. This is an edge case in the mock only. Fix: when the reloaded `workerId` or status differs, run the full worker and favourites load.

Manual checks for the person
- `/dashboard` at 1280 px: look at the rail. Template rows are cramped (narrow text column, 3–4 line meta). Check that the AppPrompt in `layout="rail"` (disc and dismiss on one line, title full width) looks right. The banner was already dismissed in my session, so look at it fresh.
- `/dashboard` at 1024, 768 and 375 px: the rail content under the active jobs. Check spacing between the last card, "Saved Templates" and the banner, and that nothing sits behind the BottomNav at 375.
- `/dashboard/jobs` at 1280 and 768 px: card footers (worker initials and rating on the left, price and the hourly breakdown on the right) in the 304 / 300 px columns, and the hover border.
- `/dashboard/jobs/[id]` at 1280 px: accepted job-006 has the tallest side card (614 px). Check it stays fully visible when stuck at `top-8` on a 720 px-tall laptop screen. Check the StatusBadge colours in the header (accepted dark, in progress brand, completed white with a green check, cancelled grey).
- `/dashboard/jobs/[id]` at 1024 px: the narrow details column next to the 320 px card (see Minor).
- `/dashboard/jobs/[id]` at 375 px on a real iPhone with a home indicator: the action bar sits flush on the BottomNav with the safe area. Scroll to the bottom: the Receipt or Photos section is fully clear of both bars.
- `/dashboard/jobs/job-002` (hard reload) at 1280 px: watch for the brief no-nav skeleton before the shell appears (see Minor), on a throttled "Slow 4G" profile.
- `/dashboard/jobs/[id]` cancel dialog at 375 px: the bottom-sheet look and the brand-soft fee note. Press Esc while "Cancelling…" shows: the dialog must stay open.
- `/dashboard/jobs/job-011#rate` at 1280 and 375 px: the star focus ring and hover tint, filled versus outline stars, and "4 out of 5" beside the stars.
- `/dashboard/jobs/[id]/edit` at 375 px with all errors and the Ohio note showing: the sticky Cancel / Save bar never covers a focused field (Tab through the form).
- `/dashboard/history` at 768 px: the 4-column table with the stacked action links and the badge inside the Job cell. At 375 px: the card buttons wrap without overflow.
- `/dashboard/account` at 1280 px: the two-column balance (Profile and Payment on the left; Favourites, Templates and Support on the right). At 375 px: the Profile edit with the OTP panel open, and the Add-a-card panel with errors.
- `/post-job/confirmation` at 375 px: the "Job summary" header with the new StatusBadge wraps cleanly.
- Any page in a fresh browser profile on `next start`: my pane logged "link preload but not used" warnings for `3jnuprpv3ix9y.css`. That chunk does not exist in the current build, so it is likely a stale cached prefetch from an older build, not T8. Confirm the console is clean.

Verdict: READY TO COMMIT
