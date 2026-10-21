"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { StepSkeleton } from "@/components/flow/step-skeleton";
import { useRevisitKey } from "@/lib/hooks/use-revisit-key";
import {
  categoryChangePatch,
  firstIncompleteStepBefore,
  isReviewPassed,
  parseCategoryParam,
  REVIEW_STEP,
  stepRoute,
} from "@/lib/job-builder";
import { useJobDraftHydrated, useJobDraftStore } from "@/lib/store";
import type { JobDraft } from "@/lib/types";

type JobStepRouteProps = {
  /** 1-based builder step. */
  step: number;
  /** A raw `?category=` value (step 2 only). */
  categoryParam?: string | null;
  children: React.ReactNode;
};

/**
 * Lets a step stop its guard before it clears the draft on purpose (T7:
 * Payment posts the job, clears the draft, then replaces the route). Without
 * it the guard would see the empty draft and flash a redirect to step 1.
 */
const HoldGuardContext = React.createContext<() => void>(() => {});

/** Call right before clearing the draft and leaving the step (T7 rule 27). */
export function useHoldStepGuard(): () => void {
  return React.useContext(HoldGuardContext);
}

/**
 * The part of every builder step that stays mounted for the route's
 * lifetime (T6):
 * - applies a valid `?category=` (step 2: pre-selects it, decision 5 rules);
 * - the step guard: once the draft has loaded, a step whose earlier steps
 *   are incomplete redirects to the first incomplete one (rule 1); from
 *   step 7, a draft that has not passed Review goes to Review (T7);
 * - keys the step view with `useRevisitKey`, so a client-side revisit
 *   (Cache Components restores the route) remounts it with the current draft.
 */
export function JobStepRoute({ step, categoryParam = null, children }: JobStepRouteProps) {
  const revisitKey = useRevisitKey();
  const router = useRouter();
  const hydrated = useJobDraftHydrated();
  const draft = useJobDraftStore((state) => state.draft);
  const templateName = useJobDraftStore((state) => state.templateName);
  const patchDraft = useJobDraftStore((state) => state.patchDraft);

  // Held for this visit only: a revisit (new key) runs the guard again.
  const [heldFor, setHeldFor] = React.useState<number | null>(null);
  const held = heldFor === revisitKey;
  const hold = React.useCallback(() => setHeldFor(revisitKey), [revisitKey]);

  const preselect = parseCategoryParam(categoryParam);
  const applyingCategory = hydrated && preselect !== null && draft.category !== preselect;
  const redirectTo =
    hydrated && !applyingCategory && !held ? guardRedirect(step, draft, templateName) : null;

  React.useEffect(() => {
    if (!hydrated || !preselect) return;
    const patch = categoryChangePatch(useJobDraftStore.getState().draft, preselect);
    if (Object.keys(patch).length > 0) patchDraft(patch);
  }, [hydrated, preselect, patchDraft]);

  React.useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  if (!hydrated || applyingCategory || redirectTo) return <StepSkeleton />;

  return (
    <HoldGuardContext value={hold}>
      <React.Fragment key={revisitKey}>{children}</React.Fragment>
    </HoldGuardContext>
  );
}

function guardRedirect(
  step: number,
  draft: JobDraft,
  templateName: string | undefined,
): string | null {
  const incomplete = firstIncompleteStepBefore(step, draft);
  if (incomplete) return incomplete;
  if (step > REVIEW_STEP && !isReviewPassed(draft, templateName)) return stepRoute(REVIEW_STEP);
  return null;
}

/** Step 2: reads `?category=`. Render inside `<Suspense>`. */
export function JobStepRouteWithCategoryParam(props: Omit<JobStepRouteProps, "categoryParam">) {
  const searchParams = useSearchParams();
  return <JobStepRoute {...props} categoryParam={searchParams.get("category")} />;
}
