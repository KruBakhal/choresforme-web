QA report — T1 Scaffold

Code health: lint pass · typecheck pass · build pass

Hard-rule scan (changed files): no API routes, server actions, database/ORM, OAuth or payment SDKs. New dependencies are the fixed stack plus the shadcn init output approved by the orchestrator (`class-variance-authority`, `cn`, `lucide-react`, `radix-ui`, `shadcn`, `tw-animate-css`, `react-hook-form`, `zod`, `zustand`, dev `prettier`). No `@hookform/resolvers`, `eslint-config-prettier` or `prettier-plugin-tailwindcss`. No seed-data imports (there is no data layer yet). No AGENTS.md product decision is touched.

Flow
- [PASS] `npm run build` then `npm run start -- -p 3100`: `GET /` returns 200. An unknown route returns 404 (`/_not-found`). The server was stopped and port 3100 is free again.
- [PASS] `next dev -p 3101`: `GET /` returns 200 with no errors in the dev log. Its process tree was killed and port 3101 is free again.
- [PASS] `/` placeholder: the HTML has `<title>Chores For Me</title>`, the planned meta description, an h1 "Chores For Me" and the p "Our new website is under construction." The string "Create Next App" appears 0 times. The starter SVGs in `public/` were removed and `public/.gitkeep` was added.
- [PASS] `tsconfig.json` keeps `"strict": true` and the `@/*` → `./src/*` alias.
- [PASS] `components.json` (style `radix-nova`, rsc, tsx) sets `css` to `src/styles/globals.css`, `ui` to `@/components/ui`, `utils` to `@/lib/utils` and `components` to `@/components`. `src/lib/utils.ts` re-exports `cn` from the `cn` package.
- [PASS] Scripts: `dev`, `build`, `start`, `lint`, `typecheck` (`tsc --noEmit`), `format` (`prettier --write .`) and `format:check` are all present. `.prettierrc` and `.prettierignore` are both present.
- [PASS] Folder structure matches the Tech Spec. These folders exist, each with a `.gitkeep`: `(marketing)`, `(auth)`, `post-job/[step]`, `worker/onboarding/[step]`, `dashboard`, `worker/dashboard`, `components/{ui,layout,marketing,flow,job,states}` and `lib/{validation,mock,store}`. No `types.ts`, `constants.ts` or `analytics.ts` was created. The empty route folders do not break the build, which emits only `/` and `/_not-found`.
- [PASS] `src/app/globals.css` was removed (a staged rename) and `layout.tsx` imports `@/styles/globals.css`.
- N/A: loading, empty, error and success states, funnel events and `?mockError=1`. This ticket has no data screens.

Design
- [PASS] `/` placeholder vs `02-ui-plan.md`: the `main` and text-block classes match the plan's styling table exactly (`bg-surface text-ink font-sans px-4 py-16 md:px-8`, `max-w-xl gap-3 text-center`, h1 `text-2xl font-semibold text-balance`, p `text-base font-normal text-ink-muted`). There is no raw hex value, no arbitrary `[...]` class and no inline style. Nothing has a fixed width, so the page should not scroll horizontally at 375 px. It is a server component with no `"use client"`.
- [PASS] Token CSS: `src/styles/globals.css` declares all 16 provisional tokens with the Tech Spec values. That `:root` block comes after shadcn's, so our `--border` wins. The `@theme inline` block maps brand, ink, surface and the status colours. The compiled CSS contains `.bg-surface{background-color:var(--surface)}`, `.text-ink`, `.text-ink-muted` and `md:px-8`. Our `--font-sans` is an unlayered `:root` declaration, so it overrides Tailwind's layered default.
- [PASS] Dark mode: the create-next-app `prefers-color-scheme` block is gone (none is left in the compiled CSS). Only shadcn's class-based `.dark` remains, which the plan allows, so the page should stay light when the OS uses dark mode.
- [PASS] `layout.tsx` keeps `next/font` (Geist) unchanged, as the plan says. Geist is not wired into `--font-sans`.

Minor (log only, does not block)
- `.prettierignore` — the root markdown files (AGENTS.md, CLAUDE.md, README.md) are not ignored. `npm run format` rewrites their line endings, and `npm run format:check` currently fails on `AGENTS.md`. Fix: add `*.md`, or those three files, to `.prettierignore`.

Manual checks for the person
- `/` at 1280 px — heading and line are centred both ways on a white surface. Tab title is "Chores For Me". The console shows no errors or warnings.
- `/` at 1024 and 768 px — same centred block with 32 px side padding. No layout shift.
- `/` at 375 px — text wraps in a balanced way with 16 px side padding, and `document.documentElement.scrollWidth === document.documentElement.clientWidth` (no horizontal scroll).
- `/` with the OS or browser set to dark mode — the page stays light.

Verdict: READY TO COMMIT
