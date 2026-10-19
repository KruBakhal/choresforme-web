# MVP build progress

| Ticket | Status | Commit | Notes |
| --- | --- | --- | --- |
| T1 Scaffold | Done | | Full fixed stack installed; shadcn on Radix (radix-nova); tokens via Tailwind v4 `@theme inline` in `src/styles/globals.css`; `agentRules: false` in next.config |
| T2 Design system | Not started | | |
| T3 Data + mock layer | Not started | | |
| T4 Marketing pages | Not started | | |
| T5 Auth | Not started | | |
| T6 Job builder 1–5 | Not started | | |
| T7 Job builder 6–8 | Not started | | |
| T8 Customer dashboard | Not started | | |
| T9 Worker onboarding | Not started | | |
| T10 Worker dashboard | Not started | | |
| T11 Hand-off + analytics | Not started | | |
| T12 QA + demo deploy | Not started | | |

## Manual checks

### T1
- `/` at 1280 px: heading and line centred on white surface, tab title "Chores For Me", no console errors or warnings.
- `/` at 1024 and 768 px: same centred block with 32 px side padding.
- `/` at 375 px: text wraps with 16 px side padding, no horizontal scroll.
- `/` with OS/browser dark mode: page stays light.

## Minor issues (fix in T12)

- [T1] `.prettierignore` does not list root markdown files (AGENTS.md, CLAUDE.md, README.md); `npm run format` rewrites their line endings and `format:check` fails on AGENTS.md. Fix: ignore `*.md` at root.

## Open questions

- [T1] Temporary home meta description "Chores For Me connects customers with verified local workers for home chores." — T4 should replace with client-approved copy.
