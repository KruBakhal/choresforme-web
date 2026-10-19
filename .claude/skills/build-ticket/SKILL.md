---
name: build-ticket
description: Runs the four-agent pipeline (product-owner → ui-ux-planner → lead-engineer → qa-reviewer) for one Chores For Me ticket from docs/TECH_SPEC.md. Use when the person types /build-ticket T#.
argument-hint: [ticket-id e.g. T6]
disable-model-invocation: true
---

Run the build pipeline for ticket **$ARGUMENTS**. You are the orchestrator: you call the subagents in order, pass work between them through the files in `docs/tickets/$ARGUMENTS/`, and stop at the approval gate. You do not write application code yourself.

If no ticket ID was given, ask for one and stop. If the ticket's dependencies in the Build plan are not done yet, say so and stop.

## Stage 1 — Product Owner
Use the **product-owner** subagent with ticket $ARGUMENTS. It writes `docs/tickets/$ARGUMENTS/01-product-plan.md`.

## Stage 2 — UI/UX Planner
Use the **ui-ux-planner** subagent with ticket $ARGUMENTS. It reads the product plan and writes `docs/tickets/$ARGUMENTS/02-ui-plan.md`.

## Approval gate (stop here)
Show the person a short summary of both plans: the screens, the new vs reused components, the desktop and mobile layout in one line each, and any open questions. Give both file paths so they can read or edit the plans.

Then stop and wait. Continue only when the person approves. If they ask for changes, update the plan (re-run the relevant subagent with their feedback) and show the summary again.

## Stage 3 — Lead Engineer
Use the **lead-engineer** subagent with ticket $ARGUMENTS to implement both plans.

## Stage 4 — QA Engineer
Use the **qa-reviewer** subagent with ticket $ARGUMENTS. Save its report to `docs/tickets/$ARGUMENTS/04-qa-report.md`.

- Verdict **NEEDS FIXES** → give only the BLOCKING issues to the **lead-engineer** subagent to fix, then run **qa-reviewer** again. Repeat at most 3 rounds.
- MINOR issues never block. Append them to the "Minor issues" section of `docs/tickets/PROGRESS.md` for the T12 cleanup.
- Still failing after 3 rounds → stop and show the person the remaining issues.

## Final output
When the verdict is READY TO COMMIT, report:
1. Files created and changed.
2. lint / typecheck / build results.
3. The MANUAL checks the person must do in the browser (route + width + what to look at).
4. Open questions for the product owner.
5. The suggested commit message, e.g. `feat($ARGUMENTS): <summary>`.

Do not commit; the person commits after the manual check.
