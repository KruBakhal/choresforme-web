QA report — T6 Job builder steps 1–5

Code health: lint pass · typecheck pass · build pass

Hard-rule scan of the T6 files: no backend code, no new packages (`radio-group`, `select` and `textarea` are Radix/shadcn primitives already covered by the `radix-ui` dependency), no seed imports (UI reaches data only through `src/lib/mock/services.ts`), no date or time picker, hourly is rate × hours, US-only states. No raw hex values, no forbidden type or brand classes and no arbitrary `[…]` sizes in the T6 files.

Routes (production build, `next start -p 3100`): `/post-job/category`, `/services`, `/services?category=cleaning`, `/location`, `/details` and `/match` all return 200. `/post-job/review` returns 404 (approved until T7). `src/app/post-job/[step]` is gone.

Method: I checked the code, then ran every journey in the built-in browser against the production build. I used real key events for keyboard checks and DOM/JS measurements for layout. The 1024, 768 and 375 widths were checked in same-origin iframes and with viewport emulation. The 375 run used touch emulation.

## Flow

- [PASS] **Accessible names on the Radix radio and checkbox cards (the lead engineer's concern).** Not a defect. Each card is a `button role="radio"` or `role="checkbox"`. Its `aria-labelledby` points at a unique id (`_r_N_-title`) that holds the visible title, and its `aria-describedby` points at the description, plus the group error while one shows. In the DOM these resolve to "Outdoor Home Service", "House Cleaning", "Item Disposal" and "Custom" on step 1, to the sub-service names on step 2, to "Post to Job Board" and "Pick a Worker" on step 5, and to "Emma D." / "Marcus J." on the worker cards. Every id appears exactly once. The groups are labelled by the step `h1` (`category-title`, `services-title`, `match-title`) or by `workers-title`. The `read_page` tool's empty names are an artifact of the tool: it does not resolve `aria-labelledby` or nested text. The same tool also shows no name for the committed header logo link, which contains the text "Chores For Me". The nameless "radio outdoor" entries it lists are Radix's hidden native inputs, which are `aria-hidden="true"` and `tabindex="-1"`, so the real accessibility tree leaves them out. A final check in the DevTools Accessibility pane or with a screen reader is listed under Manual checks.
- [PASS] Full guest journey, steps 1–5. Category → Services (with "Other" text) → Where (autocomplete) → Details (Hourly, photos) → Who (Pick a Worker) → Continue goes to `/post-job/review` (404 until T7). No session is needed. The Stepper shows "Step N of 8", with done steps marked " (done)" and `aria-current="step"` on the current one.
- [PASS] Step 1 validation: "Choose a category". It sits on the group's and on every card's `aria-describedby`, the cards get `aria-invalid`, and focus goes to the first card. Back on step 1 goes to `/`.
- [PASS] Step 2 validation: "Choose at least one service" and "Describe the other service" (3–100 characters). "Other" has `aria-controls="otherText"`. Custom pre-checks "Other" and opens its text field.
- [PASS] Step 3: an empty Continue shows all four messages verbatim, each linked through `aria-describedby`, with focus on Street address. ZIP "787a" is blocked with "Enter a 5-digit ZIP code". The state can only be one of the 50 states or DC (Radix Select), so a non-US address cannot be entered.
- [PASS] Step 3 autocomplete combobox. "Searching addresses…" shows while loading, then the listbox has up to 5 options (56–60 px tall). ArrowDown sets `aria-activedescendant` and `aria-selected`. Enter applies the option and does not submit the form. The street, city, state and ZIP fill in, focus stays on the street field, and the status announces "Address filled: 1208 S Lamar Blvd, Austin, TX 78704". With no matches, the status says "No matching addresses".
- [PASS] Out-of-area handling. A valid Ohio address shows "We're not in Ohio yet" right away; the body names Texas and the city, and the live status announces it. Continue does not navigate: focus moves to `#out-of-area-title`, and `lastStep` stays 2. Notify-me rejects "bad" with "Enter a valid email address" (focus on the email field, linked through `aria-describedby`). Enter in the email field sends the request and never submits the step. The button shows "Saving…". Success shows "Thanks! We'll email … when we reach Ohio." and takes focus. Continue stays blocked after success. A logged-in customer's email is pre-filled.
- [PASS] Step 4 description. The live counter reads "5 / 500" and is part of the textarea's `aria-describedby`. The polite live region updates about 1 s after typing stops. Below 10 characters, Continue shows "Add a few words about the job (at least 10 characters)", with focus on the description first and the amount error second.
- [PASS] Photos, 5-photo limit and revoke on remove. One batch of 4 PNGs, a PDF and an 11 MB JPEG adds 4 photos and shows "Photos must be JPG, PNG, HEIC or WebP" and "Photos must be under 10 MB". A later batch of 2 adds one photo (5 in total) and shows "You can add up to 5 photos". Remove buttons are 44×44 and labelled "Remove photo N: name". Removing photo 2 with Enter calls `URL.revokeObjectURL` on that URL (a `fetch` of it then fails), focus moves to the next remove button, and the status announces "Photo removed. 4 of 5." Alt text reads "Photo i of n: name". The draft in localStorage never holds `photos`. After a reload the uploader is empty and the note "Photos stay until you reload or close this tab." shows.
- [PASS] Hourly live total (rate × hours). With $40 and 3 hours, the estimate box shows "$120" and "$40/hr × 3 hours", the summary panel matches, and the polite region says "Estimated total $120". With $45.50 × 3 it shows "$136.50". The hours select has 23 options (1–12 in 0.5 steps). Switching type keeps both amounts on the page.
- [PASS] Step 5 Pick a Worker shows verified workers only. Outdoor at 78704 lists Marcus J. and Emma D. and leaves out the under-review worker wrk-005, whose area covers that ZIP. A loading skeleton (3 worker cards, "Loading workers…") shows first. The count line reads "2 verified workers serve Austin."
- [PASS] Favourites first for a logged-in customer. As `demo.customer`, Dallas cleaning shows wrk-002 tagged "Favourite" (with "Favourite worker." in its description) and the line "Your favourite workers are shown first." With wrk-004 added to the customer's favourites in the browser's mock DB, Emma D. (4.2) is listed before Marcus J. (4.8). Guests see no tag and no favourites sentence.
- [PASS] Empty case switches to Job Board. Disposal in Houston → Pick a Worker shows "No verified workers in this area yet — post to the job board instead" verbatim in a `role="status"`. Job Board becomes checked, the draft's `matchType` becomes `board`, and the worker section is removed.
- [PASS] Step 5 validation: "Choose a worker or post to the job board" shows under the grid, linked from each worker card and the group. A saved worker is pre-checked after a reload. After a category change, the saved `workerId` is cleared.
- [PASS] `?mockError=1` on step 3. Typing "ma" shows the quiet ink-muted note "Suggestions aren't available — enter the address below", linked through `aria-describedby`, with no popup. When notify-me is the first call, `#notify-error` (`role="alert"`) shows, focus goes to the email field and the email is kept. A second Notify me succeeds.
- [PASS] `?mockError=1` on step 5. With `matchType: direct`, the ErrorState ("Something went wrong", `role="alert"`) replaces the grid. Continue shows the error under the match group, with focus on the Pick a Worker card. Retry shows "Retrying…" and then loads the cards.
- [PASS] `?category=` pre-selects the category and skips step 1. `/post-job/services?category=cleaning` with an empty draft shows step 2, "Step 2 of 8", Category marked done and the House Cleaning chip. `?category=bogus` with no draft redirects to `/post-job/category`. The T4 landing tiles link to all four `?category=` URLs, and a client-side click from `/` lands on step 2 with the category pre-selected. "Change" → step 1 → choosing Custom → Continue lands on `/post-job/services` with Custom and "Other" pre-checked.
- [PASS] Step guard. A hard load of `/post-job/match` with steps 1–2 done and an out-of-area address goes to `/post-job/location`. After a category change (services empty), `/post-job/details` goes to `/post-job/services`. The skeleton shows and there is no flash of step content. A hard reload on step 4 with a full draft stays on step 4 and does not move focus.
- [PASS] Draft survives reload and Back. Back from 5 → 4 → 3 → 2 → 1 restored every value: hourly $45.50 × 3 hours, the description, the full address, the services with "abc oven" and the category. Each Back focused the step `h1`. Revisiting step 1 by client navigation and changing the category cleared the services and the worker, with no stale values.
- [PASS] Worker session. `demo.worker` on `/post-job/details` sees "Customer and worker accounts are separate", with "Log out and create a customer account" and "Go to my dashboard". The `h1` is focused, and there is no Stepper and no form.
- [PASS] Keyboard-only completion. Radio groups are one Tab stop; real key events move focus with the arrow keys, and arrows check the option when the keyup comes after Radix's deferred focus (a human key press). Space checks. Checkbox cards are separate Tab stops and Space toggles them. Enter on a card or in a text field submits (approved). The State and Hours selects open with Space, use typeahead ("o" → Ohio) and arrows, and Enter selects. Retry and photo remove work with Enter. Every step was completed without a mouse, except opening the native file dialog (Manual check).
- [PASS] Focus on step change and on error. Continue, Back and "Change" focus the new `h1`, whose `aria-describedby` is the Stepper status ("Step 2 of 8: Services"). Hard loads and guard redirects leave focus on `body`. Field errors use `aria-invalid` plus `aria-describedby` = hint + error (+ the counter on the description).
- [PASS] Console. No React, hydration or runtime errors on any step during the session. Hard-loading every step produced no 4xx resources (checked with `performance` entries). The only 404s came from visiting `/post-job/review` (expected). The one `ERR_FILE_NOT_FOUND` was my own `fetch` of a revoked blob URL. A few "preloaded but not used" warnings for the font and CSS chunks showed during the early loads and the iframe batches, but a clean hard load of `/post-job/category` with a 6 s wait added none. See the Manual check.

## Design

- [PASS] Desktop 1280. The form column is 687 px and the summary 379 px (`position: sticky`, top-right). Category cards are 335 px in a 2 × 2 grid. Worker cards are 218 px (3 columns). The Stepper is across the top.
- [PASS] 1024. The form is 629 px and the summary 294–299 px, sticky. Worker and match cards are 2 columns at 302 px.
- [PASS] 768. The summary is an expanded panel between the fields and Back/Continue, and its toggle is hidden. The actions are static. Match and worker cards are 2 columns at 344 px.
- [PASS] 375. Single column. The summary is a collapsible bar (closed by default; it opens to show "Your job Est. $120" with `aria-expanded`). Back/Continue are a sticky footer pinned to the viewport bottom while scrolling, and at the end of the page they rest above the site Footer without covering it. A field focused mid-form is not covered by the footer. Worker cards are a 1-column list. State and ZIP sit side by side at 156 px each.
- [PASS] No horizontal scroll at any width. `scrollWidth` equals `clientWidth` on every step at 1024, 768 and 375, including with the suggestion list open (5 options), 5 photos added, Hourly selected and the worker list loaded.
- [PASS] Touch targets are at least 44 px for cards, segments (44), select items (44), suggestions (56–60), photo remove (44×44), the summary toggle (56), the "Change" link (44 high) and Back/Continue (48). With touch emulation at 375, "Take photo" shows, using `capture="environment"`. Nothing is removed on mobile.
- [PASS] Shared components are reused: `AuthHeader`, `Footer showMobileCta={false}`, `FormField`, `FieldError`, `focusFirstError`, `RoleMismatchNotice`, `EmptyState`, `ErrorState` and `LoadingState` (with the new `workers` variant). The card frame is shared through `card-indicator.tsx`. Copy lives in `constants.ts`.

## Minor (log only, does not block)

- `src/components/post-job/match-step.tsx:155` — After Retry succeeds, the Retry button unmounts and keyboard focus falls to `body`. Fix: after a successful retry, focus the first worker card or the `workers-title` heading.
- `src/components/job/job-summary-panel.tsx:25` — `job-summary-title` and `job-summary-body` are fixed ids. Routes kept alive in a hidden Activity leave two copies in the DOM, which breaks unique-id rules and can point `aria-controls` and `aria-labelledby` at the hidden copy. Fix: build the ids with `React.useId()`.
- `src/components/post-job/details-step.tsx:106` — The counter's live region fills about 1 s after every mount ("0 of 500 characters" or the restored count), so screen readers hear it on each visit. Fix: skip the first announcement and start only after the user types.
- `src/components/post-job/match-step.tsx:217` — While the worker list is in error, the "Choose a worker…" error is on the match group's `aria-describedby`, but the match cards get no `describedBy` or `invalid`. UI plan §12 asks for both on options. Fix: pass `invalid` and `describedBy={MATCH_ERROR_ID}` to the Pick a Worker card in that state.
- `src/components/forms/address-input.tsx:170` — `aria-controls="address-suggestions"` points at an element that only exists while the list is open. Fix: always render the empty `ul#address-suggestions` (hidden), or set `aria-controls` only while it is open.
- `src/components/post-job/job-step-route.tsx:43` — Browser history Back into an earlier `/post-job/services?category=X` entry (after the user used "Change" to pick another category) re-applies X and clears the services chosen since. Fix: apply `?category=` once, then `router.replace` to `/post-job/services` without the parameter.

## Manual checks for the person

/post-job/category
- At 1280 px, in the DevTools Accessibility pane (or NVDA/VoiceOver), confirm each card's computed name is its title ("Outdoor Home Service" …) with its description, inside the "What do you need help with?" radiogroup. Also confirm the hidden Radix inputs are absent from the tree.
- At 1280 px, press Tab once into the group, then use the arrow keys on a physical keyboard: confirm they move and check, and that the 2 px focus outline is visible on the cards.
- At 375 px, the cards use the row look with the indicator top-right, and the "Your job" bar sits above the sticky footer.

/post-job/services
- At 1280 px, with a screen reader, confirm the checkbox cards are named by the service title and that the group is announced as "Which services do you need?".
- At 768 and 375 px, confirm the chip row wraps cleanly and the "Other" field spans the full width.

/post-job/location
- At 1280 px, check the suggestion list's visual layering and hover states.
- At 375 px, open the suggestion list with the street field near the sticky footer and confirm the footer does not cover the options.
- At 375 px, a long state name ("District of Columbia") truncates in the trigger.

/post-job/details
- At 375 px on a real phone, "Take photo" opens the camera and "Choose photos" opens the gallery.
- At 375 px on a real phone, check that HEIC photos show a file tile with the name.
- At 1280 px, the summary stays sticky while scrolling the long step.
- At 1280 px, the keyboard opens the native file dialog from "Choose photos".

/post-job/match
- At 1280 px, the worker cards in 3 columns: check badge wrapping at 218 px.
- At 1024 px, the worker cards are in 2 columns.
- At 375 px, the worker list rows, and the empty state and ErrorState cards at full width.
- At 1280 px, a screen reader announces "Loading workers…", the count line and the empty-state status.

All five steps, at 1280, 1024, 768 and 375 px
- Browser console after a fresh hard load of each step: there should be no errors or hydration warnings. Check whether the "preloaded but not used" font and CSS warnings ever repeat on a clean load; they did not in my final run.

Verdict: READY TO COMMIT
