import { Suspense } from "react";
import type { Metadata } from "next";

import { StepSkeleton } from "@/components/flow/step-skeleton";
import { JobStepRoute } from "@/components/post-job/job-step-route";
import { ReviewStep } from "@/components/post-job/review-step";
import { JOB_BUILDER_COPY } from "@/lib/constants";

/*
 * The builder gate renders the step only after the draft and the session have
 * loaded in the browser, so it is never part of the prerendered shell. Opt it
 * out of instant-navigation validation, which would otherwise report it as a
 * dropped segment (as T5 does on /dashboard and T6 on steps 1–5).
 */
export const instant = false;

export const metadata: Metadata = {
  title: JOB_BUILDER_COPY.meta.review,
  robots: { index: false, follow: false },
};

/* Step 6 Review & Post. Public: a guest signs up or logs in inline here. */
export default function PostJobReviewPage() {
  return (
    <Suspense fallback={<StepSkeleton />}>
      <JobStepRoute step={6}>
        <ReviewStep />
      </JobStepRoute>
    </Suspense>
  );
}
