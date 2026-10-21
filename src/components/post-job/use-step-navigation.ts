"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { markStepNavigation } from "@/components/flow/step-layout";
import { JOB_BUILDER_COPY } from "@/lib/constants";
import {
  editFromReviewHref,
  firstIncompleteStep,
  FROM_REVIEW_PARAM,
  FROM_REVIEW_VALUE,
  REVIEW_STEP,
  stepRoute,
} from "@/lib/job-builder";
import { useJobDraftStore } from "@/lib/store";

/** Moves between builder steps; the next step's heading takes focus. */
export function useStepNavigation() {
  const router = useRouter();
  return React.useCallback(
    (route: string) => {
      markStepNavigation();
      router.push(route);
    },
    [router],
  );
}

/**
 * Continue on a step 1–5 opened from Review (T7 open question 7). When steps
 * 1–5 are all complete, Continue goes back to Review and reads "Save and
 * return to review"; otherwise it goes on to the next step, still carrying
 * `?from=review`, so the user returns once the draft is complete again.
 * Render inside `<Suspense>` (it reads the URL).
 */
export function useStepContinue(step: number) {
  const searchParams = useSearchParams();
  const fromReview = searchParams.get(FROM_REVIEW_PARAM) === FROM_REVIEW_VALUE;
  const draftComplete = useJobDraftStore((state) => firstIncompleteStep(state.draft) === null);

  /** Call after the step's values are saved: reads the saved draft. */
  const nextRoute = React.useCallback((): string => {
    if (!fromReview) return stepRoute(step + 1);
    if (firstIncompleteStep(useJobDraftStore.getState().draft) === null) {
      return stepRoute(REVIEW_STEP);
    }
    return editFromReviewHref(step + 1);
  }, [fromReview, step]);

  return {
    nextRoute,
    continueLabel:
      fromReview && draftComplete
        ? JOB_BUILDER_COPY.actions.returnToReview
        : JOB_BUILDER_COPY.actions.continue,
  };
}
