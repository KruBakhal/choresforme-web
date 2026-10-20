# T5 — UI plan (Auth)

Input: `01-product-plan.md`, including its "Orchestrator decisions" (binding). Also the T2 UI plan (tokens, type scale, spacing and sizing allowlists, contrast pairs, focus rule, Button, Sheet, AppShell), the T4 UI plan (marketing visual language: `VisualPanel`, `FeatureList`, `IdCardPreview`, `PhoneFrame`, bands, tiles), and the Tech Spec sections "Responsive layouts", "Screen states" and "Validation rules". This plan does not reopen any of those decisions.

Reference width is 1280 px, then 1024, 768 and 375. Breakpoints: `sm 640 · md 768 · lg 1024 · xl 1280`. "Desktop" means `lg` and up, so 1024 uses the desktop split with a 960 px content column. "Tablet" means `md` to `< lg`, and "mobile" means `< md`.

---

## 0. Ground rules for every T5 screen

### 0.1 Colour, type, spacing (T2 §0.3–0.5, restated)

- Text is `text-ink` or `text-ink-muted` on `surface`, `surface-alt` or `brand-soft`. Brand is a **fill only** (primary buttons, icon discs, the brand `VisualPanel`, a checked checkbox), always with `text-brand-foreground`. `text-brand`, `border-brand` and `text-white` never appear.
- `text-danger` is allowed for error text on `surface` (4.8:1) and on `surface-alt` (4.4:1 is **not** enough, so error text never sits on `surface-alt`; see §7 for the OTP panel). `text-success` is used only for a `size-5` icon with a text label beside it (T2 rule).
- Type steps: `text-caption`, `text-body-sm`, `text-body`, `text-h4`, `text-h3`, `text-h2`, `text-h1`. Weights: `font-normal`, `font-semibold`.
- Spacing steps only `1 2 3 4 6 8 12 16 24`. Sizes from the T2 allowlist (`4 5 6 7 10 11 12 14 16 20 24 60 80`, `full`, `dvh`, fractions). Reading widths `max-w-md` (448), `max-w-lg` (512), `max-w-xl` (576), `max-w-2xl`, `max-w-3xl` (768). No arbitrary `[…]` values, except generated Radix `data-[state=…]` / `data-[side=…]` selectors in primitives.
- **Auth headings.** A form page's `h1` is `text-h3 md:text-h2` (24 / 32), overriding the base `text-h2 md:text-h1`; a 44 px title is too loud above a form. Section headings inside auth pages (`Demo accounts`, brand panel) are `h2` styled `text-h4` or `text-h3` as stated.

### 0.2 Touch targets, overflow and motion

- Every control is at least 44 px: inputs `h-12`, buttons `sm` (44) and up, link buttons `min-h-11`, OTP boxes `h-12 w-11`, checkbox hit area `size-11`, password toggle `size-12`.
- At 375 every button row is `flex-col` with `w-full` buttons, or wraps. Any button whose label can exceed the 343 px column gets `h-auto min-h-12 py-3 whitespace-normal text-center` (called **wrap-safe** below). Emails use `break-all` only inside identity blocks (they have no spaces to wrap on).
- `document.documentElement.scrollWidth === 375` on every T5 route.
- Motion: `transition-colors duration-150 motion-reduce:transition-none` for hovers; the dialog keeps the generated fade/slide with `motion-reduce:animate-none`; spinners are `motion-safe:animate-spin` (the Button `loading` prop already does this).

### 0.3 Width map for the auth split (Container: `px-4 md:px-6 lg:px-8`, 1200 px max)

| Width | Layout | Form column | Card inner width |
| --- | --- | --- | --- |
| 1280 | 12 cols, `gap-8`; form `col-span-6`, aside `col-span-6` | 584 px | 488 (`xl:p-12`) |
| 1024 | same | 464 px | 400 (`p-8`) |
| 768 | one centred column, `max-w-xl` | 576 px | 512 (`p-8`) |
| 375 | one column, no card chrome ("Full-width form") | 343 px | 343 |

### 0.4 Landmarks on auth routes

```
body
├─ header (banner)        AuthHeader: SkipLink, Logo
├─ main#main tabIndex=-1  page content (one h1)
└─ footer (contentinfo)   Footer showMobileCta={false}
```

---

## 1. New primitives (`src/components/ui/*`, via `shadcn add`, re-themed)

Only **input, label, dialog, checkbox**. No `radio-group`, no `input-otp`, no `form`, no `sonner`. Generated `text-sm`/`text-xs`/`font-medium` become `text-body-sm`/`text-caption`/`font-semibold`; every `focus-visible:ring-*` is removed in favour of the global outline (T2 §0.7); every `shadow-*` stays as generated and none is added.

### 1.1 Input (`input.tsx`)

```
h-12 w-full min-w-0 rounded-md border border-input bg-surface px-4 text-body text-ink
placeholder:text-ink-muted
read-only:bg-surface-alt
disabled:cursor-not-allowed disabled:opacity-50
aria-invalid:border-danger
file:… (remove the generated file: classes; no file inputs in T5)
```

- No placeholders that repeat the label. Placeholders are used only as format examples (mobile `(555) 123-4567`); they are `ink-muted` (8.2:1), so they pass.
- `aria-invalid:border-danger` is never the only signal: the error text with an icon always shows under the field.
- `type="date"` (date of birth) uses the same class; the native picker icon inherits `text-ink`.

### 1.2 Label (`label.tsx`)

`text-body-sm font-semibold text-ink`, with the generated `peer-disabled:opacity-50` kept. No required asterisks: every T5 field is required, and each control carries `aria-required="true"`.

### 1.3 Checkbox (`checkbox.tsx`) — 44 px hit area, 24 px box

The Radix `Checkbox.Root` is the hit area, and a span inside it draws the box:

| Part | Classes |
| --- | --- |
| Root (button) | `group/checkbox flex size-11 shrink-0 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50` |
| Box (span) | `flex size-6 items-center justify-center rounded-sm border-2 border-input bg-surface transition-colors duration-150 motion-reduce:transition-none group-data-[state=checked]/checkbox:bg-brand group-aria-invalid/checkbox:border-danger` |
| Indicator | `Check size-4 text-brand-foreground` (4.9:1 on brand) |

The box border stays `border-input` when checked, so the boundary keeps 8.2:1 against the surface (brand alone is 2.6:1).

### 1.4 Dialog (`dialog.tsx`) — centred modal from md, bottom sheet below md

One component, responsive classes only (no JS media query, so no hydration mismatch). This covers the Tech Spec "Dialogs | Centred modal | Centred modal | Bottom sheet" row, so the existing `Sheet` is not needed for the social dialog.

| Part | Classes |
| --- | --- |
| Overlay | `fixed inset-0 z-50 bg-ink/50` + generated fade, `motion-reduce:animate-none` |
| Content (mobile, `< md`) | `fixed inset-x-0 bottom-0 z-50 flex max-h-dvh flex-col gap-6 overflow-y-auto rounded-t-lg border-t border-border bg-surface px-4 pt-6 pb-safe text-ink` + `slide-in-from-bottom` / `slide-out-to-bottom` |
| Content (md and up) | `md:inset-x-auto md:bottom-auto md:top-1/2 md:left-1/2 md:w-full md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-lg md:border md:p-6` + fade and `zoom-in-95`; all animations `motion-reduce:animate-none` |
| Close button | `Button variant="ghost" size="icon"` (`size-11`) at `absolute top-2 right-2 md:top-4 md:right-4`, `XIcon`, sr-only label from `A11Y.closeDialog` ("Close") |
| Header | `flex flex-col gap-2 pr-12` (keeps the title clear of the close button) |
| Title (`h2`) | `text-h4 font-semibold text-ink` |
| Description | `text-body-sm text-ink-muted` |
| Footer | `flex flex-col gap-3 sm:flex-row sm:justify-end` |

A drag handle is not drawn (it would suggest a gesture that does nothing). Radix gives the focus trap, Esc to close, overlay click to close and focus return to the trigger.

---

## 2. Shared auth building blocks

| File | Component | Kind | Props | Why it exists |
| --- | --- | --- | --- | --- |
| `src/components/auth/auth-header.tsx` | `AuthHeader` | server-safe (no hooks; also imported by the client guard) | none | Minimal banner: SkipLink + Logo |
| `src/components/auth/auth-split-layout.tsx` | `AuthSplitLayout` | server-safe | `children` (the card), `aside?` (top of right column, e.g. demo panel), `brand` (the `AuthBrandPanel`), `stickyBrand?: boolean` | One grid for `/login` and `/signup?role=` |
| `src/components/auth/auth-card.tsx` | `AuthCard` | server-safe | `titleId`, `title`, `description?`, `eyebrow?: ReactNode`, `alert?: ReactNode`, `footer?: ReactNode`, `focusTitleOnMount?: boolean`, `children` | Card frame, h1, alert slot above the form, footer links |
| `src/components/auth/auth-card-skeleton.tsx` | `AuthCardSkeleton` | server | `rows?: number` (default 4) | Pre-hydration placeholder for `/signup` (§5) |
| `src/components/forms/form-field.tsx` | `FormField` | server-safe | `id`, `label`, `hint?`, `error?`, `children` (render prop receiving `{ id, describedBy, invalid }`) | Label, control, hint, error and `aria-describedby` in one place; reused by T6–T9 |
| `src/components/forms/form-alert.tsx` | `FormAlert` | client | `tone: "error" \| "info"`, `title?`, `message`, `action?: ReactNode`, `autoFocus?: boolean` (default true) | The "Inline message above the form" from Screen states |
| `src/components/auth/password-input.tsx` | `PasswordInput` | client | Input props + `autoComplete: "current-password" \| "new-password"` | Show/hide toggle (PRD) |
| `src/components/auth/social-buttons.tsx` | `SocialButtons` | client | `role?: Role`, `next?: string`, `onIncompleteProfile`, `onSuccess(user)`, `dividerLabel` | Two buttons + the "or" divider + the dialog |
| `src/components/auth/auth-brand-panel.tsx` | `AuthBrandPanel` | server | `audience: "trust" \| "worker"` | Brand panel (lg) / compact strip (below lg) |

### 2.1 `AuthHeader`

```
header.h-16 border-b border-border bg-surface   (not sticky: short pages, more room for the form on phones)
├─ SkipLink
└─ Container className="h-full" innerClassName="flex h-full items-center"
   └─ Logo (lockup, href "/")
```

The auth header has no nav and no CTAs, so a user mid-sign-up has no exit except the logo and the Footer (both are deliberate, low-emphasis exits).

### 2.2 `(auth)/layout.tsx` — decision 7: keep the Footer

```
<AuthHeader />
<main id="main" tabIndex={-1} className="flex-1 bg-surface outline-none">
  <Container className="py-8 md:py-12 lg:py-16">{children}</Container>
</main>
<Footer showMobileCta={false} />
```

**Why keep the Footer:** it carries "Reset demo data" (T3 decision 20; the product plan keeps it out of the Demo accounts panel), the Terms and Privacy links the sign-up checkbox refers to, and support contacts. **Why no mobile CTA bar:** a fixed "Post a job" bar would sit over the form's submit button and compete with it. Footer then uses its `pb-12` mobile padding.

Remove `src/app/(auth)/.gitkeep`. Each page exports `metadata` with its title and `robots: { index: false, follow: false }` (decision 15). Nothing is added to `sitemap.ts`.

### 2.3 `AuthSplitLayout`

```
div.grid grid-cols-1 gap-8 md:mx-auto md:max-w-xl lg:mx-0 lg:max-w-none lg:grid-cols-12 lg:gap-8
├─ div.min-w-0 lg:col-span-6 lg:row-span-2           → children (AuthCard)
├─ div.min-w-0 lg:col-span-6 lg:col-start-7           → aside (optional, e.g. DemoAccountsPanel)
└─ div.min-w-0 lg:col-span-6 lg:col-start-7 [lg:sticky lg:top-8 lg:self-start when stickyBrand] → brand
```

- DOM order is card → aside → brand, which is also the mobile and tablet order and the focus order.
- With no `aside`, the brand cell takes row 1 of the right column.

### 2.4 `AuthCard`

| Part | Classes |
| --- | --- |
| Wrapper (`div`) | `w-full md:rounded-lg md:border md:border-border md:bg-surface md:p-8 xl:p-12` (no card chrome below md: "Full-width form") |
| Eyebrow slot | `mb-4` (holds the role chip on sign-up, §5) |
| Title | `h1#{titleId}` `tabIndex={-1}` `text-h3 md:text-h2 outline-none focus-visible:outline-2` |
| Description | `mt-2 text-body text-ink-muted` |
| Alert slot | `mt-6` (only rendered when `alert` is set) |
| Body | `mt-6 md:mt-8` |
| Footer slot | `mt-8 border-t border-border pt-6 text-body-sm text-ink` (the "Already have an account? Log in" style lines) |

`focusTitleOnMount` focuses the h1 after client-side swaps (picker → form, form → complete profile, forgot form → "Check your email"). It never fires on a hard page load.

### 2.5 `FormField` (all T5 fields; T6–T9 reuse it)

```
div.flex flex-col gap-2
├─ Label htmlFor={id}
├─ control (gets id, aria-describedby, aria-invalid, aria-required)
├─ p#{id}-hint   text-body-sm text-ink-muted            (when hint)
└─ p#{id}-error  flex items-start gap-2 text-body-sm text-danger   (when error)
     CircleAlert size-4 shrink-0 aria-hidden (16 px icon top-aligned with the 20 px first line)
```

- `aria-describedby` lists only the ids that exist: `"{id}-hint {id}-error"`, `"{id}-hint"` or `"{id}-error"`.
- `aria-invalid="true"` only while an error shows.
- The hint stays when an error appears (it often explains the rule).
- Errors render under the control, never above, and never in a tooltip.

### 2.6 `FormAlert` (service errors, "Inline message above the form")

| Tone | Classes | Icon |
| --- | --- | --- |
| `error` | `flex gap-3 rounded-md border border-danger bg-surface p-4` | `CircleAlert size-5 shrink-0 text-danger` |
| `info` | `flex gap-3 rounded-md border border-input bg-brand-soft p-4` | `Info size-5 shrink-0 text-ink` |

- Title (optional): `text-body font-semibold text-ink`; message: `text-body-sm text-ink` (never red text; the icon and border carry the tone).
- `action`: a `Button variant="link" size="sm"` on its own line (`mt-1`).
- `role="alert"` (error) / `role="status"` (info), `tabIndex={-1}`, `outline-none focus-visible:outline-2`. With `autoFocus`, it receives focus when it appears, which also scrolls it into view. It stays until the next submit starts, then clears.

### 2.7 `PasswordInput`

- `div.relative` → `Input type={visible ? "text" : "password"} className="pr-12"`.
- Toggle: `Button type="button" variant="ghost" size="icon-lg"` (`size-12`) at `absolute inset-y-0 right-0 rounded-l-none focus-visible:-outline-offset-2`, icon `Eye` / `EyeOff` `size-5 text-ink`.
- `aria-label` swaps between "Show password" and "Hide password"; `aria-controls` = the input id. Toggling keeps focus on the toggle and never clears the value.
- `autoComplete` `current-password` (login) / `new-password` (sign-up). `autoCapitalize="none"`, `spellCheck={false}`.

### 2.8 `SocialButtons`

```
div.flex flex-col gap-3
├─ Button variant="outline" className="w-full" → "Continue with Google"
├─ Button variant="outline" className="w-full" → "Continue with Facebook"
└─ div.my-2 flex items-center gap-4   (divider; the "or" text is read by screen readers, the rules are decorative)
   ├─ Separator className="flex-1"
   ├─ span text-body-sm text-ink-muted → "or"
   └─ Separator className="flex-1"
```

- Each button starts with a provider monogram, `span aria-hidden` `flex size-6 items-center justify-center rounded-full border border-input text-caption font-semibold text-ink` ("G" / "f"). No brand logos, no brand colours, no external assets (see Open question 1).
- Buttons are always stacked: side by side they would be ~196 px each at 1024, too narrow for "Continue with Facebook".
- On sign-up and login the social buttons come **first**, then the divider, then the email form (fastest path first).
- Each button is the trigger of `SocialSignInDialog` (§8); Radix returns focus to it on close.

### 2.9 `AuthBrandPanel` (decision 16: panel at lg, compact strip below lg, nothing removed)

Content, reusing T4 copy and components:

| `audience` | Eyebrow pill | Title (`h2`) | Points (`FeatureList layout="stack"`) | Visual |
| --- | --- | --- | --- | --- |
| `trust` (login, customer sign-up) | `LANDING_COPY.trust.eyebrow` with `ShieldCheck` | `AUTH_COPY.brandPanel.trustTitle` [provisional] | `LANDING_COPY.trust.points` items Phone check, Identity verification, Two-way ratings | `VisualPanel tone="brand"` › `IdCardPreview variant="compact"` |
| `worker` (worker sign-up) | `LANDING_COPY.workers.eyebrow` with `HandCoins` | `LANDING_COPY.workers.title` | `LANDING_COPY.workers.points` (3) | `VisualPanel tone="brand"` › `PhoneFrame` › `JobBoardPreview` |

Markup (one render, responsive classes; it sits after the card in the DOM):

```
section[aria-labelledby="auth-brand-title"].rounded-lg bg-surface-alt p-6 lg:p-8 xl:p-12
└─ div.grid grid-cols-1 gap-6 md:grid-cols-8 md:items-center lg:grid-cols-1 lg:gap-8
   ├─ div.min-w-0 md:col-span-5 lg:col-span-1
   │  ├─ span pill: inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-body-sm font-semibold text-ink (icon size-4)
   │  ├─ h2#auth-brand-title.mt-4 text-h4 lg:text-h3
   │  └─ FeatureList layout="stack" className="mt-6"
   └─ div.min-w-0 md:col-span-3 lg:col-span-1
      └─ VisualPanel tone="brand" › visual
```

| Width | Result |
| --- | --- |
| 1280 / 1024 | Right column panel, title `text-h3`, visual under the points. On `/signup?role=` it is `lg:sticky lg:top-8 lg:self-start` (the form is ~1,050 px tall). On `/login` it is not sticky (the right column is already taller than the card) |
| 768 | The "compact strip" under the card (and under the demo panel on `/login`): points left (5 of 8 cols, ~318 px), visual right (3 cols, ~174 px; `VisualPanel` brand uses `md:p-4`, `PhoneFrame` shrinks with `min-w-0`) |
| 375 | Strip stacked: pill, title `text-h4`, points, then the visual (`p-6`, full width up to the `PhoneFrame` `max-w-xs`) |

The trust points and the visual stay at every width (decision 16); only their arrangement changes.

---

## 3. Login — `/login`

`src/app/(auth)/login/page.tsx` (server) renders `LoginPageClient` (client, needs `useSearchParams` for `next`; wrap in `Suspense` with the card rendered statically as fallback). Metadata: title "Log in", `noindex`.

### Desktop 1280 px (reference)

`AuthSplitLayout` with `aside={<DemoAccountsPanel />}` and `brand={<AuthBrandPanel audience="trust" />}`:

- **Left, `col-span-6` (584 px), rows 1–2:** `AuthCard` titled "Log in", description "Welcome back to Chores For Me." [provisional]. Body, in order:
  1. `SocialButtons` (no role; decision 3), divider "or".
  2. `LoginForm`:
     - Email (`FormField`, `Input type="email" autoComplete="email" inputMode="email" autoCapitalize="none"`).
     - Password (`FormField` + `PasswordInput autoComplete="current-password"`). No hint (login needs any non-empty password).
     - Row under the password field: `flex justify-end` › `Button asChild variant="link" size="sm"` "Forgot password?" → `/forgot-password` (keeps `next`).
     - Submit: `Button type="submit" className="mt-2 w-full"` "Log in", loading "Logging in…".
  3. Card footer: "New to Chores For Me?" + `Button asChild variant="link" size="sm"` "Sign up" → `/signup` (keeps `next` and `utm_*`; decision 10).
- **Right, `col-start-7`, row 1:** `DemoAccountsPanel` (§3a).
- **Right, row 2:** `AuthBrandPanel audience="trust"`.
- **Fold check at 1280 × 800:** header 64 + `py-16` 64 + card top padding 48 + title 40 + description 32 + 32 gap + social block 168 + email 98 + password 98 + link row 44 + submit 56 ≈ 744 px: the Log in button sits at about the fold; the demo panel's three "Log in" buttons are fully above it (right column top).

### 3a. `DemoAccountsPanel` (`src/components/auth/demo-accounts-panel.tsx`, client)

Props: `onSelect(email: string)`, `pendingEmail: string | null`, `disabled: boolean`.

```
section#demo-accounts[aria-labelledby="demo-accounts-title"].scroll-mt-4 rounded-lg border border-border bg-surface p-4 md:p-6
├─ div.flex items-center gap-3
│  ├─ span.flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-soft (FlaskConical size-5 text-ink aria-hidden)
│  └─ h2#demo-accounts-title.text-h4 → "Demo accounts"
├─ p.mt-2 text-body-sm text-ink-muted → "Log in with one click. Any password works."
├─ ul.mt-4 divide-y divide-border            (DEMO_ACCOUNTS, 3 rows)
│  └─ li.flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between
│     ├─ div.min-w-0 — p text-body font-semibold text-ink (label) + p text-body-sm text-ink-muted break-all (email)
│     └─ Button variant="outline" size="sm" className="w-full sm:w-auto"
│          "Log in" · aria-label "Log in as Demo customer" · loading → "Logging in…"
└─ dl.mt-4 flex flex-wrap gap-2                (always visible)
   ├─ div.rounded-full bg-surface-alt px-3 py-1 text-body-sm text-ink → dt "Password:" (font-semibold) dd "Any password"
   └─ div.(same) → dt "SMS code:" dd DEMO_OTP_CODE ("123456")
```

- **One click:** `onSelect` fills the visible `LoginForm` email with the account and the password with `DEMO_PASSWORD`, then submits the form. The clicked row button shows `loading` ("Logging in…"); the other two row buttons and the form are disabled until the call settles.
- **Error** (`?mockError=1`): the `FormAlert` appears in the card (above the form, §3 States) and receives focus. The filled values stay. Pressing the row button again (or "Log in") retries.

### Tablet 768 px and 1024 px

- **1024:** the same split; form column 464 px (card inner 400). The demo panel row stays `sm:flex-row` (email ~210 px + button ~80 px fit in the 416 px panel interior).
- **768:** one centred column `max-w-xl` (576). Order: card (bordered, `p-8`), demo panel, brand strip (§2.9). No brand panel column, per the spec table.

### Mobile 375 px

- Card chrome removed; all controls full width (343 px). Order: card, demo panel (`p-4`, row buttons full width under each account), brand strip.
- **"Use a demo account" jump link** (`lg:hidden`), placed in the card directly under the description: `Button asChild variant="link" size="sm"` → `#demo-accounts`, with `ArrowDown size-4`. Below lg the panel sits under a ~640 px form, so the link keeps the demo path one tap away. The panel has `scroll-mt-4` (the auth header is not sticky). After the jump, focus moves to the panel heading (`tabIndex={-1}` on the `h2`, focused in the link's click handler).
- No sticky elements on auth pages.

### Component tree

```
LoginPage (server) — metadata
└─ Suspense
   └─ LoginPageClient ("use client") — reads next (safeNext), session redirect (decision 7)
      └─ AuthSplitLayout
         ├─ AuthCard titleId="login-title" title="Log in" alert={<FormAlert/>?} footer={Sign up link}
         │  ├─ Button link "Use a demo account" (lg:hidden)
         │  ├─ SocialButtons (new) — next, onSuccess, onIncompleteProfile
         │  │  └─ SocialSignInDialog (new) ×1, provider state
         │  └─ LoginForm (new) — onSuccess(user), defaultValues, formRef (for demo fill)
         │     ├─ FormField + Input (new ui/input) — email
         │     ├─ FormField + PasswordInput (new)
         │     ├─ Button link "Forgot password?"
         │     └─ Button submit loading
         ├─ DemoAccountsPanel (new) — onSelect, pendingEmail, disabled
         └─ AuthBrandPanel (new) audience="trust"
            ├─ FeatureList (existing: src/components/marketing/feature-list.tsx)
            └─ VisualPanel (existing) › IdCardPreview (existing) variant="compact"
```

`LoginForm` takes `onSuccess(user)` and never redirects (T7 embeds it). The page decides: `router.replace(safeNext(next) ?? dashboardFor(user.role))`, or `/signup?role=<role>` for an incomplete user (decision 4).

### Styling

| Element | Classes |
| --- | --- |
| Form | `flex flex-col gap-6` (field to field 24 px). The "Forgot password?" row is the last child of the password `FormField` wrapper (`flex justify-end`), so it sits 8 px under the field without negative margins |
| Submit | `Button size="default" className="w-full"` (48 px) |
| Card footer line | `flex flex-wrap items-center gap-x-1` "New to Chores For Me?" `text-body-sm text-ink` + link button |

### States

| State | What shows |
| --- | --- |
| Loading (submit) | Submit `loading` "Logging in…"; the form's `fieldset disabled` disables both fields, the toggle and the social buttons (fieldset wraps the whole card body); demo row buttons disabled |
| Empty | — (no data list) |
| Error: validation | Errors under each field on blur and on submit ("Enter a valid email address", "Enter your password"); focus to the first invalid field |
| Error: `NO_ACCOUNT` | `FormAlert tone="error"` "No account found", with action "Sign up" (link → `/signup`, keeps `next`). Focus moves to the alert. The email field stays filled and is not marked invalid (its format is fine) |
| Error: `?mockError=1` | `FormAlert tone="error"` with `SERVICE_MESSAGES.mockError`; focus to the alert; submitting again succeeds |
| Success | Redirect (no success screen). While the redirect runs the submit keeps its spinner |
| Signed in on arrival (decision 7) | After hydration with an active complete session, the card body is replaced by `p role="status"` "Taking you to your dashboard…" and the page `router.replace`s. Before hydration the form renders normally (no blank page for signed-out visitors) |

`ErrorState` is not used here: the screen loads no data, and the spec puts auth errors "inline above the form".

### Interaction details

- **Focus order:** skip link, logo, [Use a demo account (below lg)], Continue with Google, Continue with Facebook, Email, Password, Show password, Forgot password?, Log in, Sign up, demo row buttons × 3, footer.
- Enter in either field submits. Errors never clear typed input.
- Hover: outline buttons get `bg-surface-alt`; link buttons thicken their underline. No hover-only actions.

---

## 4. Role picker — `/signup` (no valid `role`)

`src/app/(auth)/signup/page.tsx` (server, metadata "Sign up", noindex) renders `SignUpPageClient` (client), which shows `RolePicker` when `role` is missing or invalid (decision 8).

### Desktop 1280 px (reference)

- `div.mx-auto max-w-3xl` (768 px), no brand panel (the picker row in the spec has none).
- Heading block `text-center`: `h1#picker-title` "How do you want to use Chores For Me?" (`text-h3 md:text-h2`), sub-line `mt-2 text-body text-ink-muted` "Choose one. Customer and worker accounts are separate." [provisional].
- `RolePicker variant="page"` at `mt-8 md:mt-12`: `ul.grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:gap-8`, two cards (368 px each at 1280).
- Below: `p.mt-8 text-center text-body-sm` "Already have an account?" + `Button asChild variant="link" size="sm"` "Log in" → `/login` (keeps `next`, `utm_*`).

### 4a. `RolePicker` (`src/components/auth/role-picker.tsx`)

Props: `variant: "page" | "compact"`, `hrefFor?: (role) => string` (page), `onSelect?: (role) => void` and `pendingRole?: Role | null` (compact), `headingLevel?: 2 | 3`.

**Page card** (one tap continues, no Next button; decision 14: plain link cards, not `SelectableCard`):

```
li
└─ Link href={hrefFor(role)}   (sets ?role=, keeps next and utm_* params)
   .group flex h-full flex-col gap-4 rounded-lg border border-border bg-surface p-6 lg:p-8
    transition-colors duration-150 hover:border-input hover:bg-surface-alt motion-reduce:transition-none
   ├─ span.flex size-12 items-center justify-center rounded-md bg-brand (icon size-6 text-brand-foreground aria-hidden)
   │     customer: House · worker: HandCoins
   ├─ h2.text-h4 → "I need help with chores" / "I want to earn doing chores" (PRD, verbatim)
   ├─ p.text-body text-ink-muted → one-line description [provisional]
   └─ span[aria-hidden].mt-auto inline-flex items-center gap-2 text-body-sm font-semibold text-ink group-hover:underline underline-offset-4
         "Continue as a customer" / "Continue as a worker" + ArrowRight size-4 (T4 tile arrow motion)
```

The link's accessible name is the heading plus the description (the action row is `aria-hidden`), as on T4 category tiles.

**Compact option** (inside the social dialog, §8): a `button type="button"` per role:

```
flex min-h-16 w-full items-center gap-4 rounded-md border border-input bg-surface p-4 text-left
transition-colors duration-150 hover:bg-surface-alt disabled:opacity-50 motion-reduce:transition-none
├─ span.flex size-10 shrink-0 items-center justify-center rounded-md bg-brand (icon size-5 text-brand-foreground)
├─ span.min-w-0 flex-1 — span.block text-body font-semibold (title) + span.block text-body-sm text-ink-muted (description)
└─ Loader2 size-5 motion-safe:animate-spin (only on the pending option) | ChevronRight size-5 text-ink
```

While one option is pending, both are `disabled` and the pending one has `aria-busy="true"`.

### Tablet 768 px and 1024 px

- **1024:** identical to desktop (768 px wide block, centred).
- **768:** the same two cards side by side (each ~348 px with `md:gap-6`), per the spec ("Side by side").

### Mobile 375 px

- Cards stacked full width (`grid-cols-1 gap-4`), `p-6`. Heading block stays centred. Each card ~220 px tall, so both cards and the "Log in" link fit in ~620 px below the header.

### Component tree

```
SignUpPage (server) — metadata
└─ Suspense fallback={<AuthCardSkeleton />}
   └─ SignUpPageClient ("use client") — role = parseRole(searchParams.role)
      ├─ (no role) → div.mx-auto max-w-3xl
      │    ├─ h1 + sub-line
      │    ├─ RolePicker (new) variant="page" hrefFor={(r) => signUpHref(r, keptParams)}
      │    └─ "Already have an account?" Log in link
      └─ (role) → §5 / §6 / §10
```

### States

| State | What shows |
| --- | --- |
| Loading | None for signed-out users: the picker renders immediately |
| Empty / Error | — (static, no service call) |
| Signed in on arrival | After hydration: incomplete session → `router.replace("/signup?role=<role>")` (complete profile, decision 4); complete session → status line "Taking you to your dashboard…" and redirect (decision 7) |
| Success | Navigation to `?role=`; the form's h1 receives focus (`focusTitleOnMount`) |

### Interaction details

- **Focus order:** skip link, logo, customer card, worker card, Log in.
- Each card is one link: Enter or tap continues immediately.
- Hover darkens the border and fills `surface-alt`; the arrow nudges (motion-safe). The same action is available without hover.

---

## 5. Sign-up form — `/signup?role=customer` · `/signup?role=worker`

### Desktop 1280 px (reference)

`AuthSplitLayout stickyBrand brand={<AuthBrandPanel audience={role === "worker" ? "worker" : "trust"} />}`:

- **Left (584 px) — `AuthCard`:**
  - **Eyebrow:** role chip `inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-body-sm font-semibold text-ink` (icon `House` / `HandCoins` `size-4`) "Customer account" / "Worker account", followed by `Button asChild variant="link" size="sm"` "Change" (`aria-label` "Change account type") → `/signup` with `next`/`utm_*` kept. Layout `flex flex-wrap items-center gap-x-3`.
  - **Title:** "Create your account" (customer) / "Create your worker account" (worker). **Description** [provisional]: customer "Post jobs and track them in one place." / worker "Set up your account to start finding jobs near you."
  - **Body:**
    1. `SocialButtons role={role}`, divider "or".
    2. `SignUpForm`, `form.flex flex-col gap-6`, inside `fieldset.contents` (disabled while submitting):
       - **Name row:** `div.grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-4` → First name (`autoComplete="given-name"`), Last name (`family-name`). 228 px each at 1280, 192 px at 1024.
       - **Email** (`type="email" autoComplete="email"`).
       - **Password** (`PasswordInput autoComplete="new-password"`), hint "At least 8 characters, with a letter and a number." [provisional; paraphrases the validation rule].
       - **Mobile number** → `MobileVerifyField` (§7).
       - **Date of birth:** `Input type="date" autoComplete="bday" max={today}`, `sm:max-w-xs` (320 px; a full-width date field reads oddly). Hint: worker "You must be 18 or older to work on Chores For Me." is the **error** text, so the worker hint is "Workers must be 18 or older." [provisional]; customer has no hint.
       - **Terms** (§5a).
       - **Submit:** `Button type="submit" className="w-full"` "Create account" / "Create worker account", loading "Creating your account…".
  - **Footer:** "Already have an account?" + "Log in" link → `/login` (keeps `next`).
- **Right:** `AuthBrandPanel`, `lg:sticky lg:top-8 lg:self-start`.

### 5a. Terms checkbox

```
div.flex items-start gap-1
├─ Checkbox id="terms" (44 px hit area; box 24 px) aria-describedby="terms-links terms-error" aria-required
└─ div.min-w-0 flex-1 pt-2             (pt-2 aligns the 24 px text line with the 24 px box centred in 44 px)
   ├─ Label htmlFor="terms" className="text-body font-normal" → "I accept the Terms and Privacy Policy"
   ├─ p#terms-links.text-body-sm text-ink-muted
   │    "Read the " ExternalLink(/terms) "Terms" " and the " ExternalLink(/privacy) "Privacy Policy"
   │    links: inline-flex min-h-11 items-center text-ink underline underline-offset-4 (open in a new tab,
   │    so the half-filled form is not lost; ExternalLink adds the sr-only "(opens in a new tab)")
   └─ p#terms-error (FormField error style) "Please accept the Terms and Privacy Policy"
```

The links are outside the `label`, so tapping a link never toggles the box. One checkbox (PRD).

### Tablet 768 px and 1024 px

- **1024:** the split as at 1280; card inner 400 px; name fields 192 px each; the brand panel stays sticky.
- **768:** one centred column `max-w-xl`: bordered card (`p-8`, inner 512), then the brand strip (§2.9). Name fields side by side (`sm:grid-cols-2`).

### Mobile 375 px

- No card chrome; every field full width. Name fields stack (`grid-cols-1`). Date of birth full width (`sm:max-w-xs` only applies from 640). Mobile and Send code stack (§7). Submit full width. Then the brand strip.
- Long labels: "Create worker account" (~210 px) and "Creating your account…" fit in one line at 343 px.

### Component tree

```
SignUpPageClient (role set, signed out or no session)
└─ AuthSplitLayout stickyBrand
   ├─ AuthCard titleId="signup-title" eyebrow={<RoleChip/>} alert={<FormAlert/>?} footer={Log in link} focusTitleOnMount
   │  ├─ SocialButtons (new) role next onSuccess onIncompleteProfile
   │  └─ SignUpForm (new) — role, next?, onSuccess(user)
   │     ├─ FormField ×2 + Input — first/last name
   │     ├─ FormField + Input — email
   │     ├─ FormField + PasswordInput (new)
   │     ├─ MobileVerifyField (new) — value, onChange, verified, onVerified, error
   │     │  └─ OtpInput (new)
   │     ├─ FormField + Input type="date" — dob
   │     ├─ Checkbox (new ui/checkbox) + Label + ExternalLink (existing) ×2 — terms
   │     └─ Button submit loading
   └─ AuthBrandPanel (new) audience
```

`RoleChip` is a small local component in `sign-up-form.tsx` (exported for `CompleteProfileForm`), passed to the `AuthCard` eyebrow slot; it is not a separate file.

### States

| State | What shows |
| --- | --- |
| Before hydration | `AuthCardSkeleton` (card frame with `Skeleton h-8 w-2/3`, `h-4 w-1/2`, then 4 × `h-12 w-full` with `gap-6`, inside `div role="status" aria-busy="true"` + sr-only "Loading…"). The page content depends on the session (complete profile, notice, redirect), so it waits one hydration tick instead of swapping forms |
| Loading (submit) | Submit `loading` "Creating your account…"; `fieldset` disables every field, the OTP controls and the social buttons |
| Error: validation | Every invalid field shows its message in one pass, including "Verify your mobile number" when the number is not verified (decision 1). Focus goes to the first invalid control in DOM order (see §11) |
| Error: worker under 18 | "You must be 18 or older to work on Chores For Me" under Date of birth; submit is not sent |
| Info: `ACCOUNT_EXISTS` | `FormAlert tone="info"` "You already have an account — log in" with action "Log in" → `/login` (keeps `next`; the email is **not** put in the URL). Focus to the alert. Every field keeps its value. This is the PRD's "instead of an error" |
| Error: `?mockError=1` | `FormAlert tone="error"` with `SERVICE_MESSAGES.mockError`; focus to the alert; values kept; submitting again succeeds |
| Success | `onSuccess(user)` → page redirects to `next` or the role's post-sign-up route (decision 9). No toast |

### Interaction details

- **Focus order:** skip link, logo, Change (role), Continue with Google, Continue with Facebook, First name, Last name, Email, Password, Show password, Mobile, Send code [→ OTP boxes, Verify, Resend code, Change number when open], Date of birth, Terms checkbox, Terms link, Privacy Policy link, Create account, Log in.
- Validation runs on blur and on submit, then on change once a field has an error (RHF `mode: "onTouched"`).
- Enter inside the mobile field or the OTP boxes triggers that sub-action (Send code / Verify), **not** the form submit (§7). Enter anywhere else submits.

---

## 6. Complete profile — `/signup?role=<role>` with an incomplete session (decision 4)

Same route and same `AuthSplitLayout stickyBrand` as §5; `SignUpPageClient` renders `CompleteProfileForm` instead of `SignUpForm` when the hydrated session user has an empty `mobile` or `dob`. If `?role=` differs from the account's role, the page `router.replace`s to the account's role first.

### Desktop 1280 px (reference)

- **AuthCard:** eyebrow = the role chip **without** "Change" (the account's role is fixed). Title "Finish setting up your account" [provisional]. Description "You signed in with Google. Add your mobile number and date of birth to finish." [provisional; provider from `user.authProvider`].
- **Identity block** (first item in the body):

```
div.flex items-center gap-4 rounded-md border border-border bg-surface-alt p-4
├─ span[aria-hidden].flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-body font-semibold text-ink → initials
├─ div.min-w-0 flex-1 — p text-body font-semibold (full name) + p text-body-sm text-ink-muted break-all (email)
└─ (sm and up, inline; below sm, its own row under the block) Button variant="link" size="sm" → "Not you? Log out"
```

  "Not you? Log out" calls `auth.logout()` (loading label "Logging out…") and then renders the plain sign-up form for the same `?role=` (focus to its h1).
- **Form** (`flex flex-col gap-6`): `MobileVerifyField`, Date of birth, Terms (same markup as §5). No social buttons, no name, email or password fields.
- **Submit:** "Finish sign-up", loading "Saving…".
- No card footer (a "Log in" link would be wrong for someone already signed in).

### Tablet / Mobile

As §5: centred `max-w-xl` card + strip at 768; full-width form + strip at 375. The identity block becomes `flex-wrap`, with "Not you? Log out" on its own line (`basis-full`) below `sm`.

### Component tree

```
SignUpPageClient (incomplete session)
└─ AuthSplitLayout stickyBrand
   ├─ AuthCard eyebrow={<RoleChip fixed/>} alert focusTitleOnMount
   │  ├─ identity block + LogoutButton variant="link" (new, §12)
   │  └─ CompleteProfileForm (new) — user, onSuccess(user)
   │     ├─ MobileVerifyField → OtpInput
   │     ├─ FormField + Input type="date"
   │     ├─ Checkbox terms
   │     └─ Button submit
   └─ AuthBrandPanel audience
```

### States

| State | What shows |
| --- | --- |
| Loading (submit) | "Saving…" spinner; fieldset disabled |
| Error: validation | Same rules as §5, including "Verify your mobile number" and the worker 18+ message |
| Error: `?mockError=1` (`users.update`) | `FormAlert tone="error"` with `SERVICE_MESSAGES.mockError`, focus to it; retry succeeds |
| Success | Redirect to `next` or the role's home (decision 9) |

### Interaction details

Focus order: Not you? Log out, Mobile, Send code (…OTP), Date of birth, Terms, links, Finish sign-up. On arrival from the social dialog the h1 receives focus.

---

## 7. `MobileVerifyField` and `OtpInput` (decisions 1 and 13)

`src/components/auth/mobile-verify-field.tsx` and `src/components/auth/otp-input.tsx`, both client. All buttons are `type="button"`: the field lives inside the sign-up `form` and must not submit it.

### 7.1 Layout per state

The mobile row is the same in every state:

```
FormField id="mobile" label="Mobile number" hint="US mobile numbers only. We'll text you a 6-digit code."
└─ div.flex flex-col gap-3 sm:flex-row sm:items-start
   ├─ div.flex min-w-0 flex-1
   │  ├─ span[aria-hidden].inline-flex h-12 items-center rounded-l-md border border-r-0 border-input bg-surface-alt px-3 text-body text-ink → "+1"
   │  └─ Input id="mobile" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(555) 123-4567" className="rounded-l-none"
   └─ action slot: Button variant="outline" className="w-full sm:w-auto"
```

The visible "+1" is decorative; the hint says "US mobile numbers only", so the prefix is not lost for screen readers.

| State | Mobile input | Action slot | Below the row |
| --- | --- | --- | --- |
| **Idle** | editable | "Send code" | — |
| **Sending** | `readOnly` | "Send code" `loading` → "Sending…" | — |
| **Code entry** | `readOnly` (`bg-surface-alt`) | "Change number" | OTP panel (7.2) |
| **Verifying** | `readOnly` | "Change number" `disabled` | OTP panel, boxes `disabled`, Verify `loading` "Verifying…" |
| **Error (wrong code)** | `readOnly` | "Change number" | OTP panel with the error (7.3) |
| **Verified** | `readOnly` | "Change number" | status line: `p#mobile-status.mt-2 flex items-center gap-2 text-body-sm font-semibold text-ink` with `CircleCheck size-5 text-success aria-hidden` + "Mobile number verified" |
| **Resend cooldown** | — | — | inside the OTP panel (7.4) |

- `#mobile-status` is added to the input's `aria-describedby` once verified.
- "Change number" (any state after sending): clears the code, the verified flag and any OTP error, makes the mobile editable, and focuses it (decision 13). The slot goes back to "Send code".

### 7.2 OTP panel (code entry)

```
div.mt-3 flex flex-col gap-4 rounded-md border border-border bg-surface p-4
├─ p role="status" .text-body-sm text-ink → "We sent a 6-digit code to (555) 123-4567."
├─ OtpInput
│  ├─ p#otp-label.text-body-sm font-semibold text-ink → "Enter the 6-digit code"
│  ├─ div role="group" aria-labelledby="otp-label" aria-describedby="otp-hint [otp-error]" .mt-2 flex gap-2
│  │  └─ 6 × input
│  ├─ p#otp-hint.mt-2 text-caption text-ink-muted → "Demo code: 123456"
│  └─ p#otp-error role="alert" (FormField error style) — only on error
└─ div.flex flex-col gap-3 sm:flex-row sm:items-center
   ├─ Button variant="secondary" className="w-full sm:w-auto" → "Verify" / loading "Verifying…"
   └─ Button variant="link" size="sm" → "Resend code" / disabled "Resend code in 24s"
```

The panel is `bg-surface` with a border (not `surface-alt`), so the red error text keeps 4.8:1. Verify is `secondary` so the form keeps one brand-filled submit.

**Width check:** the boxes are `h-12 w-11 sm:w-12` with `gap-2`. At 375: 6 × 44 + 5 × 8 = 304 px inside a 311 px panel interior (343 − 2 × 16). At 1024: 6 × 48 + 40 = 328 inside 368. No overflow.

### 7.3 `OtpInput` (hand-built, no `input-otp`)

Props: `value: string`, `onChange(value)`, `onComplete?(value)`, `invalid?: boolean`, `disabled?: boolean`, `describedBy: string`, `labelId: string`, `autoFocus?: boolean`.

Each box:

```
input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={1}
autoComplete={i === 0 ? "one-time-code" : "off"}
aria-label="Digit {i+1} of 6"
className="h-12 w-11 sm:w-12 rounded-md border border-input bg-surface text-center text-h4 font-semibold text-ink
           caret-ink aria-invalid:border-danger disabled:opacity-50"
```

| Interaction | Behaviour |
| --- | --- |
| Type a digit | Fills the box, moves focus to the next box. Non-digits are ignored (box unchanged) |
| Paste (any box) | Strips non-digits, fills from box 1 up to 6, focuses the box after the last filled one (or box 6) |
| Backspace on a filled box | Clears it, focus stays |
| Backspace on an empty box | Moves to the previous box and clears it |
| Left / Right arrows | Move between boxes; Home / End go to box 1 / 6 |
| Enter | Runs Verify (never submits the outer form) |
| Focus a box | Selects its content, so typing replaces it |
| SMS autofill (`one-time-code` on box 1) | Treated as a paste |

### 7.4 States and focus

| State | Visual | Focus | Announcement |
| --- | --- | --- | --- |
| Idle | Row only | — | — |
| Mobile invalid on Send code | "Enter a 10-digit US mobile number" under the row, input `aria-invalid` | Mobile input | via `aria-describedby` on focus |
| Sending | Send code spinner (button `disabled`) | moves to box 1 on success, back to the mobile input on failure | — |
| Send failed (`?mockError=1`) | Error under the row: `SERVICE_MESSAGES.mockError` in the field error style, row back to idle | Mobile input | `role="alert"` on that error |
| Code entry | Panel appears | **Box 1** | panel status line (`role="status"`) |
| Verify with fewer than 6 digits | "Enter the 6-digit code" in `#otp-error`, boxes `aria-invalid` | First empty box | `role="alert"` |
| Wrong code | "That code didn't work. Try again" in `#otp-error`, boxes `aria-invalid`; **digits stay** (errors never clear input) | Box 1 with its content selected | `role="alert"` |
| Verifying | Boxes and Change number disabled, Verify spinner | — | — |
| Verified | Panel removed; `#mobile-status` "Mobile number verified" | **Date of birth** (the next field; the focused Verify button no longer exists) | polite live region (`role="status"` on `#mobile-status`) |
| Resend cooldown | "Resend code" `disabled`, label "Resend code in {n}s" counting down from 30 (starts after every successful send). The countdown text is `aria-live="off"` | — | — |
| Resend pressed | Link shows `loading` "Sending…"; on success the status line changes to "We sent a new code." and the boxes clear | Box 1 | status line |
| Submit while unverified | "Verify your mobile number" (`VALIDATION_MESSAGES.mobileUnverified`, provisional) in `#mobile-error` | Mobile input if no code was sent, otherwise box 1 — only if this is the first invalid field in DOM order | via focus |

---

## 8. Demo social sign-in dialog — `SocialSignInDialog`

`src/components/auth/social-sign-in-dialog.tsx` (client), using the new `Dialog`. Props: `provider: SocialProvider`, `role?: Role`, `open`, `onOpenChange`, `onSuccess(user)`, `onIncompleteProfile(user)`, `next?`.

### Desktop 1280 px, 1024 px and 768 px — centred modal

`DialogContent md:max-w-md` (448 px; 400 px interior):

**View A — confirm (default)**

```
DialogHeader
├─ DialogTitle → "Signing in with Google (demo)"            (Tech Spec, verbatim pattern)
└─ DialogDescription → "This is a demo. No Google account is used and nothing leaves this browser." [provisional]
div.flex flex-col gap-2
├─ p.text-body-sm font-semibold text-ink → "Demo identity"
└─ div.flex items-center gap-4 rounded-md border border-border bg-surface-alt p-4   (read-only, decision 3)
   ├─ span[aria-hidden].flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-body font-semibold text-ink → "AR"
   └─ div.min-w-0 — p text-body font-semibold "Alex Rivera" + p text-body-sm text-ink-muted break-all "alex.google@choresforme.test"
FormAlert (only on a service error, autoFocus=false; see Interaction)
DialogFooter
├─ Button variant="outline" className="w-full sm:w-auto" → "Cancel"
└─ Button className="w-full sm:w-auto" → "Continue as Alex" / loading "Signing in…"
```

**View B — choose a role (`ROLE_REQUIRED`, login page only; decision 3)**

The header stays. The identity block stays (so the user sees who is signing up). Below it:

```
div.flex flex-col gap-3
├─ p#social-role-title tabIndex=-1 .text-body font-semibold text-ink → "How do you want to use Chores For Me?"
├─ p.text-body-sm text-ink-muted → "This Google identity is new here. Choose an account type to continue." [provisional]
└─ RolePicker variant="compact" onSelect={retryWithRole} pendingRole
DialogFooter → Cancel only
```

One tap on an option retries `auth.loginWithProvider(provider, role)`; that option shows the spinner. The new user is incomplete, so success goes to `onIncompleteProfile` → `/signup?role=<role>` (complete profile, §6).

**View C — separate accounts (`ROLE_MISMATCH`, sign-up only)**

The identity block stays; below it `SeparateAccountsNotice variant="inline"` (§10) with:
- Heading `h3` "Customer and worker accounts are separate" (`tabIndex=-1`, receives focus).
- Body: "Alex Rivera already has a worker account. To create a customer account, use a different email." [provisional].
- Actions (`DialogFooter` layout): "Sign up with email instead" (`Button`, primary) closes the dialog and focuses **First name**; "Log in instead" (`Button variant="outline"`) → `/login` (keeps `next`). No session is started (decision 2).

### Mobile 375 px — bottom sheet

- Same three views; content is `inset-x-0 bottom-0 rounded-t-lg px-4 pt-6 pb-safe`, 343 px interior.
- Footer buttons stack full width; DOM order is Cancel then the primary, so the primary sits lowest (closest to the thumb) and the visual order matches the focus order.
- Compact role options are full width (`min-h-16`).
- `max-h-dvh overflow-y-auto`: View B is the tallest (~520 px), so it fits a 667 px phone without scrolling.

### Component tree

```
SocialButtons (new)
├─ Button outline ×2 (DialogTrigger asChild)
└─ SocialSignInDialog (new) — one instance, provider in state
   └─ Dialog (new ui/dialog) › DialogContent
      ├─ DialogHeader › DialogTitle, DialogDescription
      ├─ identity block
      ├─ View A: FormAlert? + DialogFooter (Cancel, Continue)
      ├─ View B: RolePicker variant="compact" (new) + DialogFooter (Cancel)
      └─ View C: SeparateAccountsNotice variant="inline" (new)
```

### Styling

| Element | Classes |
| --- | --- |
| Body stack | Dialog content `gap-6` (mobile and desktop) |
| Identity label | `text-body-sm font-semibold text-ink` |
| Initials disc | `size-12 rounded-full bg-brand-soft text-body font-semibold text-ink` |

### States

| State | What shows |
| --- | --- |
| Loading | Primary `loading` "Signing in…"; Cancel and the close button `disabled`; Esc and overlay clicks are ignored while pending (`onEscapeKeyDown` / `onInteractOutside` `preventDefault`) |
| Error (`?mockError=1`) | `FormAlert tone="error"` with `SERVICE_MESSAGES.mockError` between the identity block and the footer, `role="alert"` (announced). Focus returns to the primary button (it was disabled during the call); pressing it again succeeds |
| `ROLE_REQUIRED` | View B, focus to `#social-role-title` |
| `ROLE_MISMATCH` | View C, focus to the notice heading |
| Success, complete account | Dialog closes; `onSuccess(user)` → page redirect |
| Success, new or incomplete user | Dialog closes; `onIncompleteProfile(user)` → `/signup?role=<role>` (keeps `next`) |

### Interaction details

- **Open:** focus goes to the primary button "Continue as Alex" (`onOpenAutoFocus` → primary), not to the close button.
- **Focus trap:** close button, Cancel, primary (View A); options, Cancel (View B); notice actions (View C).
- **Close:** Esc, overlay, Cancel or the close button; focus returns to the social button that opened it, except "Sign up with email instead" (focus to First name; `onCloseAutoFocus` `preventDefault`).
- Reopening always starts at View A with no alert.
- No external script, iframe or image is loaded (AGENTS.md rule 3).

---

## 9. Forgot password — `/forgot-password`

`src/app/(auth)/forgot-password/page.tsx` (server; metadata "Reset your password", noindex) renders `ForgotPasswordForm` (client).

### Desktop 1280 px (reference)

- One centred card: `div.mx-auto w-full max-w-lg` (512 px) › `AuthCard` (`xl:p-12`, inner 416 px). No brand panel (the spec's split applies to login and sign-up only).
- **Form view:** title "Reset your password", description "Enter the email you used to sign up and we'll send you a link to reset your password." [provisional]. Body `form.flex flex-col gap-6`: Email field; submit `Button className="w-full"` "Send reset link" / loading "Sending…". Footer: `Button asChild variant="link" size="sm"` with `ArrowLeft size-4` "Back to log in" → `/login` (keeps `next`).
- **"Check your email" view** (same card, content swapped):

```
span.flex size-12 items-center justify-center rounded-full bg-brand-soft (MailCheck size-6 text-ink aria-hidden)
h1#forgot-title.mt-4 tabIndex=-1 → "Check your email"                    (Tech Spec, verbatim)
p.mt-2 text-body text-ink-muted → "If an account exists for {email}, a reset link is on its way." [provisional]
p.mt-2 text-body-sm text-ink-muted → "Demo only: no email is sent." [provisional]
div.mt-8 flex flex-col gap-3 sm:flex-row
├─ Button asChild className="w-full sm:w-auto" → "Back to log in" (/login, keeps next)
└─ Button variant="outline" className="w-full sm:w-auto" → "Use a different email" (back to the form view, email kept, focus on the email field)
```

  `{email}` renders in a `span.font-semibold text-ink break-all`.

### Tablet 768 px and 1024 px

Same centred `max-w-lg` card at both widths (`md:p-8`).

### Mobile 375 px

No card chrome; full-width field and buttons; success actions stacked.

### Component tree

```
ForgotPasswordPage (server) — metadata
└─ div.mx-auto max-w-lg
   └─ ForgotPasswordForm (new, "use client") — view: "form" | "sent", email
      └─ AuthCard titleId="forgot-title" alert focusTitleOnMount (on view change)
         ├─ form: FormField + Input email, Button submit
         └─ sent: icon disc, h1, body, actions
```

### States

| State | What shows |
| --- | --- |
| Loading | "Sending…" spinner; email field disabled |
| Error: validation | "Enter a valid email address" under the field; focus to the field |
| Error: `?mockError=1` | `FormAlert tone="error"` `SERVICE_MESSAGES.mockError` above the form, focus to it; retry succeeds |
| Success | The "Check your email" view; the h1 receives focus (for a valid email this always happens, even for unknown emails) |

### Interaction details

Focus order (form): email, Send reset link, Back to log in. Focus order (sent): Back to log in, Use a different email.

---

## 10. Separate accounts notice — `SeparateAccountsNotice`

`src/components/auth/separate-accounts-notice.tsx` (client). Props: `variant: "page" | "inline"`, `headingLevel: 1 | 2 | 3`, `body: string`, `primary: ReactNode`, `secondary?: ReactNode`.

Used in three places:

| Where | Variant | Body [provisional] | Primary | Secondary |
| --- | --- | --- | --- | --- |
| Guard: worker on `/dashboard`, customer on `/worker/*` (§11) | `page`, h1 | "You're logged in with a worker account. To post jobs, create a separate customer account with a different email." | `LogoutButton` "Log out and create a customer account" → logout, then `/signup?role=customer` (decision 6) | `Button outline` "Go to my dashboard" → own role's home |
| `/signup?role=<other role>` with an active session | `page`, h1 | same pattern | same | same |
| Social dialog `ROLE_MISMATCH` | `inline`, h3 | §8 View C | "Sign up with email instead" | "Log in instead" |

### Page variant

```
div.mx-auto w-full max-w-xl rounded-lg border border-border bg-surface px-4 py-12 md:px-8 md:py-16 text-center
├─ span.mx-auto flex size-12 items-center justify-center rounded-full bg-brand-soft (UsersRound size-6 text-ink aria-hidden)
├─ h1.mt-4 tabIndex=-1 text-h3 md:text-h2 → "Customer and worker accounts are separate" [provisional]
├─ p.mt-2 text-body text-ink-muted → body
└─ div.mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center
   ├─ primary — wrap-safe Button (w-full sm:w-auto h-auto min-h-12 py-3 whitespace-normal)
   └─ secondary — Button variant="outline" w-full sm:w-auto
```

- **Width check:** "Log out and create a customer account" is ~330 px of text + 48 px padding, which exceeds 343 px, so the primary is wrap-safe (two lines on a phone). From `sm` the two buttons sit in a row (576 px card) and the label fits on one line.
- The icon disc is `brand-soft` (informational, not an error); the notice is not `role="alert"`. On a client-side render (guard) its h1 receives focus.

### Inline variant

Left-aligned, no border or padding of its own: icon disc `size-10`, `h3.text-h4` (`tabIndex=-1`), body `text-body-sm text-ink-muted`, actions use the `DialogFooter` layout.

### Responsive

| Width | Page variant |
| --- | --- |
| 1280 / 1024 / 768 | Centred 576 px card, buttons in a row |
| 375 | Card fills the column (`px-4 py-12`), buttons stacked full width, primary on two lines |

### States

The primary shows `loading` "Logging out…" while `auth.logout()` runs. On a logout error, `FormAlert tone="error"` (`SERVICE_MESSAGES.mockError`) appears under the actions (`mt-6`, focus moves to it), and the session stays.

---

## 11. Route guard and placeholder dashboards — `/dashboard`, `/worker/dashboard`

### 11.1 Composition (server layout passes server-rendered shells into the client guard)

```
src/app/dashboard/layout.tsx (server)
└─ RequireRole role="customer" loading={<AppShell role="customer"><GuardLoading/></AppShell>}
   └─ AppShell role="customer">{children}</AppShell>

src/app/worker/dashboard/layout.tsx (server)
└─ RequireRole role="worker" loading={<AppShell role="worker"><GuardLoading/></AppShell>}
   └─ AppShell role="worker">{children}</AppShell>
```

`RequireRole` (`src/components/auth/require-role.tsx`, client) renders:

| Condition | Renders |
| --- | --- |
| Not hydrated yet | `loading` prop |
| No active session | `loading` prop, then `router.replace(loginHref(pathname + search))` → `/login?next=/dashboard` |
| Incomplete profile | `loading` prop, then `router.replace("/signup?role=<role>&next=<route>")` (decision 4) |
| Role mismatch | `AuthHeader` + `main#main` (`Container py-8 md:py-12 lg:py-16`) + `SeparateAccountsNotice variant="page"` (no Footer: the Footer is an async server component and cannot render inside the client guard; the notice gives two ways forward) |
| OK | `children` |

The loading shell is the route's own role shell. It shows navigation chrome only, never protected content, and a hard reload while signed in does not jump between layouts (decision 3).

**`GuardLoading`** (inline in the layout files): `LoadingState variant="cards" count={2} label="Checking your session…"` under a `Skeleton h-8 w-1/3 mb-6` (matches the placeholder's heading + card).

### 11.2 Placeholder page content (`src/components/auth/dashboard-placeholder.tsx`, client — reads the user's first name)

### Desktop 1280 px (reference)

Inside AppShell `main` (at 1280: 1040 px wide, `p-8`, no rail):

```
h1.text-h3 md:text-h2 → "Hi, Alex" [provisional]
p.mt-2 text-body text-ink-muted → "You're logged in with a customer account." / "…worker account."
EmptyState (existing) className="mt-8" headingLevel={2}
  icon=LayoutDashboard
  title="Dashboard coming soon"
  description customer: "Your jobs, history and account settings will appear here."
              worker:   "The job board, your jobs and earnings will appear here."
  action customer: Button asChild → "Post a job" (/post-job/category, Plus icon)
         worker:   Button asChild variant="outline" → "See what you'll need" (/workers)
```

### Tablet 768 px and 1024 px

AppShell behaviour (T2): full SideNav at 1024, icon-only at 768. Content unchanged.

### Mobile 375 px

AppShell mobile top bar + BottomNav. EmptyState action full width. Log out lives in the top bar Account sheet (§12).

### States

| State | What shows |
| --- | --- |
| Loading | `GuardLoading` inside the role shell |
| Empty | The "Dashboard coming soon" `EmptyState` is the content |
| Error | — (no service call; logout errors are in §12) |
| Success | Greeting + EmptyState |

The BottomNav / SideNav links to `/dashboard/jobs` etc. are T8/T10 routes and may 404 until then (not a T5 defect).

---

## 12. AppShell Log out controls (decision 11)

New `LogoutButton` (`src/components/auth/logout-button.tsx`, client). Props: `appearance: "sidenav" | "sheet" | "link"`, `mode?: SideNavMode`, `redirectTo?: string` (default `/login`), `onLoggedOut?()`. It calls `auth.logout()`, shows `loading` "Logging out…", then `router.replace(redirectTo)`.

### 12.1 SideNav footer (md and up) — extend `side-nav.tsx`

`SideNav` is already `flex flex-col h-dvh`; add a footer block after the nav:

```
div.mt-auto border-t border-border px-4 py-4
├─ div (user block, only when a session user exists)
│   className per mode: responsive "sr-only lg:not-sr-only lg:mb-3 lg:px-3" · full "mb-3 px-3" · icon "sr-only"
│   ├─ p.text-body-sm font-semibold text-ink truncate → "Alex Rivera"
│   └─ p.text-caption text-ink-muted → "Customer account"
└─ LogoutButton appearance="sidenav" mode
    Button variant="ghost" with the nav-item classes of that mode (m.item):
      full/lg: h-12 w-full justify-start gap-3 px-3 text-body text-ink-muted hover:bg-surface-alt hover:text-ink
      icon/md: mx-auto size-12 justify-center, label sr-only, title="Log out"
    LogOut size-5 + span (m.label) "Log out"
```

- It reads as the last nav item, separated by a rule, so it is easy to find but not a primary action.
- `preview` (styleguide): the user block shows a sample name from `AUTH_COPY.account.previewName` and the button is inert (`onClick` no-op).
- **Error:** `p role="alert" .mt-2 text-caption text-danger text-center lg:text-left` "We couldn't log you out. Try again." [provisional]; at 768 it wraps inside the 80 px rail (accepted; it is a demo-only failure).

### 12.2 Mobile top bar (`< md`) — extend `app-shell.tsx`

The top bar is 343 px wide. Logo lockup (~202 px) + "Post a job" `sm` (~132 px) already uses 342 px, so a third control does not fit beside the lockup.

| Role | Left | Right (`flex items-center gap-2`) |
| --- | --- | --- |
| Customer | `Logo variant="mark"` (40 px tile; the wordmark stays as sr-only text) | "Post a job" `Button size="sm"` + `AccountMenu` |
| Worker | `Logo` lockup | `AccountMenu` |

`AccountMenu` (`src/components/auth/account-menu.tsx`, client):

```
Sheet
├─ SheetTrigger asChild › Button variant="ghost" size="icon" (size-11) — UserRound + sr-only "Account"
└─ SheetContent side="bottom" className="rounded-t-lg pb-safe" closeLabel="Close"
   ├─ SheetTitle → "Account"
   ├─ div.flex items-center gap-4 rounded-md border border-border bg-surface-alt p-4
   │  ├─ initials disc size-12 rounded-full bg-brand-soft
   │  └─ name (text-body font-semibold) + email (text-body-sm text-ink-muted break-all) + role (text-caption text-ink-muted)
   └─ LogoutButton appearance="sheet" → Button variant="outline" className="w-full" (LogOut icon) "Log out"
```

This uses the existing `Sheet` (bottom), matching the "Dialogs → bottom sheet on mobile" rule. Errors show as in §12.1 (`text-body-sm`, left aligned) under the button.

### Interaction details

- Focus order (desktop): skip link, logo, Post a job (customer), nav × 4, Log out, main.
- Focus order (mobile): Logo, Post a job (customer), Account, main, BottomNav.
- After logout, the page navigates to `/login` (no `next`).

---

## 13. Header signed-in island (decision 12)

`HeaderAuthActions` (`src/components/layout/header-auth-actions.tsx`, client). Props: `layout: "inline" | "stacked"`.

| Session | `inline` (Header, `lg` and up) | `stacked` (HeaderMenu sheet, `< lg`) |
| --- | --- | --- |
| Not hydrated, or no active session | "Log in" `ghost sm` + "Sign up" `outline sm` (today's markup) | "Log in" `outline` `w-full` + "Sign up" `secondary` `w-full` (today's markup) |
| Active session (complete or incomplete) | "Dashboard" `Button asChild variant="outline" size="sm"` with `LayoutDashboard` → `dashboardFor(role)` | "Dashboard" `Button asChild variant="outline" className="w-full"` |

- **Header edit:** replace the Log in + Sign up pair inside `div.hidden lg:flex` with `<HeaderAuthActions layout="inline" />`; Post a job stays after it.
- **HeaderMenu edit:** replace the first two stacked buttons with `<HeaderAuthActions layout="stacked" />`; Post a job stays last. The sheet's existing link-click handler closes it.
- **Layout shift:** the right group is right-aligned (`justify-between`), so Post a job stays put and only the island's own width changes (two buttons ~180 px → one ~140 px). The logo and nav never move.
- An incomplete user's "Dashboard" link is caught by the guard and goes to the complete-profile form.

At 375 and 768 nothing changes in the bar itself (Log in / Sign up already live in the menu sheet).

---

## 14. Form-state rules (all T5 forms)

| Concern | Rule |
| --- | --- |
| Field errors | Under the field, `p#{id}-error` with a `CircleAlert` icon, linked via `aria-describedby`; control `aria-invalid="true"`. Shown on blur and on submit; then live on change |
| Messages | Verbatim from `VALIDATION_MESSAGES` / `SERVICE_MESSAGES`; no new wording for existing rules |
| First invalid field | Receives focus after a failed submit (RHF `shouldFocusError`, DOM order). Custom controls register a focus target: `MobileVerifyField` → mobile input, or OTP box 1 when the panel is open; Terms → the checkbox |
| Submit loading | `Button loading` (spinner, `aria-busy`, disabled) with the action label ("Logging in…", "Creating your account…", "Saving…", "Sending…", "Signing in…", "Logging out…"); the form body is a `fieldset disabled` |
| Service errors | `FormAlert` in the `AuthCard` alert slot, above the form, focused on appear; cleared when the next submit starts. Typed values are never cleared |
| `ErrorState` | Not used in T5: no T5 screen loads data, and the spec sets auth errors "inline above the form" |
| Step changes | Picker → form, form ↔ complete profile, forgot → "Check your email": the new view's h1 receives focus. OTP: Send → box 1; Verify → Date of birth; Change number → mobile input. Dialog view changes → the new view's heading |
| Retry | `?mockError=1` makes the first call fail; submitting again succeeds with the same values |

---

## 15. Files

```
src/components/ui/input.tsx | label.tsx | dialog.tsx | checkbox.tsx        (new, shadcn, re-themed)
src/components/forms/form-field.tsx | form-alert.tsx                       (new)
src/components/auth/auth-header.tsx | auth-split-layout.tsx | auth-card.tsx | auth-card-skeleton.tsx
src/components/auth/auth-brand-panel.tsx | password-input.tsx | social-buttons.tsx
src/components/auth/social-sign-in-dialog.tsx | otp-input.tsx | mobile-verify-field.tsx
src/components/auth/role-picker.tsx | login-form.tsx | sign-up-form.tsx | complete-profile-form.tsx
src/components/auth/forgot-password-form.tsx | demo-accounts-panel.tsx | separate-accounts-notice.tsx
src/components/auth/require-role.tsx | logout-button.tsx | account-menu.tsx | dashboard-placeholder.tsx
src/components/layout/header-auth-actions.tsx                              (new)
src/components/layout/header.tsx | header-menu.tsx | side-nav.tsx | app-shell.tsx   (edit)
src/app/(auth)/layout.tsx | login/page.tsx | signup/page.tsx | forgot-password/page.tsx (new; delete .gitkeep)
src/app/dashboard/layout.tsx | page.tsx ; src/app/worker/dashboard/layout.tsx | page.tsx (new; delete .gitkeep)
src/lib/constants.ts                                                        (AUTH_COPY, DEMO_PASSWORD, new messages)
```

Not touched: `Footer` (used as is with `showMobileCta={false}`), `Logo`, `Button`, `Sheet`, state components, marketing components (imported, not edited).

---

## 16. New strings (`src/lib/constants.ts`; all [provisional] unless marked verbatim)

**`AUTH_COPY.meta`**: login "Log in" · signUp "Sign up" · forgotPassword "Reset your password" · dashboard "Dashboard".

**`AUTH_COPY.fields`**: firstName "First name" · lastName "Last name" · email "Email" · password "Password" · passwordHint "At least 8 characters, with a letter and a number." · showPassword "Show password" · hidePassword "Hide password" · mobile "Mobile number" · mobilePrefix "+1" · mobilePlaceholder "(555) 123-4567" · mobileHint "US mobile numbers only. We'll text you a 6-digit code." · dob "Date of birth" · dobHintWorker "Workers must be 18 or older." · termsLabel "I accept the Terms and Privacy Policy" · termsLinksLead "Read the" · termsLinksJoin "and the" (link labels reuse `FOOTER.terms` / `FOOTER.privacy`).

**`AUTH_COPY.login`**: title "Log in" · description "Welcome back to Chores For Me." · demoJump "Use a demo account" · forgotLink "Forgot password?" · submit "Log in" · submitting "Logging in…" · noAccount "New to Chores For Me?" · signUpLink "Sign up" · redirecting "Taking you to your dashboard…".

**`AUTH_COPY.social`**: google "Continue with Google" · facebook "Continue with Facebook" · divider "or" · dialogTitle(provider) "Signing in with {Google|Facebook} (demo)" (Tech Spec pattern) · dialogDescription(provider) "This is a demo. No {provider} account is used and nothing leaves this browser." · identityLabel "Demo identity" · confirm(firstName) "Continue as {firstName}" · confirming "Signing in…" · cancel "Cancel" · roleTitle = picker title · roleBody(provider) "This {provider} identity is new here. Choose an account type to continue." · mismatchBody(name, role, otherRole) "{name} already has a {role} account. To create a {otherRole} account, use a different email." · signUpWithEmail "Sign up with email instead" · logInInstead "Log in instead".

**`AUTH_COPY.picker`**: title "How do you want to use Chores For Me?" (PRD verbatim) · description "Choose one. Customer and worker accounts are separate." · customer { title "I need help with chores" (verbatim), description "Post a job and get matched with verified local workers.", action "Continue as a customer" } · worker { title "I want to earn doing chores" (verbatim), description "Find jobs near you and get paid for the work you choose.", action "Continue as a worker" } · haveAccount "Already have an account?" · logIn "Log in".

**`AUTH_COPY.signUp`**: roleChip { customer "Customer account", worker "Worker account" } · change "Change" · changeLabel "Change account type" · title { customer "Create your account", worker "Create your worker account" } · description { customer "Post jobs and track them in one place.", worker "Set up your account to start finding jobs near you." } · submit { customer "Create account", worker "Create worker account" } · submitting "Creating your account…" · haveAccount "Already have an account?" · logIn "Log in".

**`AUTH_COPY.completeProfile`**: title "Finish setting up your account" · description(provider) "You signed in with {provider}. Add your mobile number and date of birth to finish." · notYou "Not you? Log out" · submit "Finish sign-up" · submitting "Saving…".

**`AUTH_COPY.otp`**: sendCode "Send code" · sending "Sending…" · sentTo(mobile) "We sent a 6-digit code to {mobile}." · resent "We sent a new code." · codeLabel "Enter the 6-digit code" · digitLabel(i) "Digit {i} of 6" · demoHint(code) "Demo code: {code}" · verify "Verify" · verifying "Verifying…" · resend "Resend code" · resendIn(s) "Resend code in {s}s" · changeNumber "Change number" · verified "Mobile number verified". Plus `VALIDATION_MESSAGES.mobileUnverified` "Verify your mobile number" (decision 1).

**`AUTH_COPY.forgot`**: title "Reset your password" · description "Enter the email you used to sign up and we'll send you a link to reset your password." · submit "Send reset link" · submitting "Sending…" · backToLogin "Back to log in" · successTitle "Check your email" (verbatim) · successBody(email) "If an account exists for {email}, a reset link is on its way." · demoNote "Demo only: no email is sent." · differentEmail "Use a different email".

**`AUTH_COPY.demo`**: title "Demo accounts" · description "Log in with one click. Any password works." · logIn "Log in" · logInAs(label) "Log in as {label}" · loggingIn "Logging in…" · passwordLabel "Password:" · passwordValue "Any password" · otpLabel "SMS code:" (value `DEMO_OTP_CODE`). **`DEMO_PASSWORD`** "demo1234".

**`AUTH_COPY.separate`**: title "Customer and worker accounts are separate" · body(role) customer-session "You're logged in with a customer account. To earn doing chores, create a separate worker account with a different email." / worker-session "You're logged in with a worker account. To post jobs, create a separate customer account with a different email." · logOutAndCreate(otherRole) "Log out and create a {otherRole} account" · goToDashboard "Go to my dashboard".

**`AUTH_COPY.brandPanel`**: trustTitle "Help from verified local workers" (eyebrows and points reuse `LANDING_COPY.trust` / `LANDING_COPY.workers`).

**`AUTH_COPY.guard`**: checking "Checking your session…".

**`AUTH_COPY.dashboard`**: greeting(firstName) "Hi, {firstName}" · roleLine { customer "You're logged in with a customer account.", worker "You're logged in with a worker account." } · comingSoon "Dashboard coming soon" · description { customer "Your jobs, history and account settings will appear here.", worker "The job board, your jobs and earnings will appear here." } · workerAction = `LANDING_COPY.workers.secondaryLink` ("See what you'll need").

**`AUTH_COPY.account`**: menu "Account" · logOut "Log out" · loggingOut "Logging out…" · logoutError "We couldn't log you out. Try again." · roleLabel { customer "Customer account", worker "Worker account" } · previewName "Sample user".

**`AUTH_COPY.header`**: dashboard "Dashboard".

**`A11Y.closeDialog`**: "Close".

**`SERVICE_MESSAGES`**: roleMismatch = `AUTH_COPY.separate.title` · roleRequired "Choose an account type to continue." (codes `ROLE_MISMATCH`, `ROLE_REQUIRED`, decision 2).

---

## 17. QA hooks (design-specific)

- `grep` T5 files for raw hex, `text-white`, `text-brand`, `border-brand`, `text-sm`, `text-xs`, `text-base`, `font-medium`, `font-bold`, `ring-` and arbitrary `[…]` sizes (Radix `data-[…]` selectors excepted). Result must be zero.
- At 375 × 812 on `/login`, `/signup`, `/signup?role=customer`, `/signup?role=worker` (with the OTP panel open), `/forgot-password`, the dialog (all 3 views), `/dashboard` and the separate accounts notice: `document.documentElement.scrollWidth === 375`.
- OTP at 375: six boxes in one row, none clipped; paste "123456" fills all; Backspace on an empty box moves back.
- Every control ≥ 44 px: inputs 48, OTP boxes 44 × 48, checkbox hit area 44, link buttons `min-h-11`, dialog close 44.
- Tab through `/signup?role=worker` at 1280: the order matches §5; every control shows the 2 px ink outline; Enter in the mobile field sends the code and does not submit.
- Submit an empty sign-up form: every field shows its message at once, focus lands on First name, and each error is reachable through the field's `aria-describedby`.
- `?mockError=1` on login, sign-up, forgot password and the dialog: the inline alert appears above the form (inside the dialog for social), takes focus, and the second try succeeds with the values kept.
- Dialog: centred modal at 768 and up, bottom sheet below 768; Esc closes it and focus returns to the social button; it ignores Esc while "Signing in…".
- Brand panel: present at 1280 and 1024 (right column, sticky on sign-up); at 768 and 375 the same points and visual appear under the form.
- `/dashboard` hard reload while signed in as the customer: the customer shell skeleton, then content, with no redirect and no notice flash.
- Header at 1280 signed in: "Dashboard" replaces Log in + Sign up; "Post a job" does not move.

---

## Open questions

1. **Google and Facebook marks.** The plan uses neutral "G" / "f" monograms and plain outline buttons, because lucide has no Google icon and adding brand SVGs needs approval (and Google's button guidelines). Are monograms acceptable for the demo, or should official brand assets be supplied?
2. **Customer top bar logo on mobile.** To fit the Account control beside "Post a job" at 375 px, the customer top bar shows the logo mark only (the wordmark stays as screen-reader text; the worker bar keeps the full lockup). Acceptable, or would you rather move Log out into the BottomNav "Account" tab once T8 builds it?
3. **"Use a demo account" jump link** below 1024 px is a small addition so the demo panel stays one tap away on phones and tablets (it sits under a ~640 px form there). Keep it?
4. **Auth Footer.** This plan keeps the full Footer on auth pages (Reset demo data, Terms/Privacy, support) but drops the mobile "Post a job" bar. Confirm, or prefer a slimmer auth-only footer.
5. **Worker sign-up brand panel** shows the worker points and the job-board phone mockup instead of the trust points. Fine, or should every auth page show the trust points?
