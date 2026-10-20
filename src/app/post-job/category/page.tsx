import { Suspense } from "react";
import type { Metadata } from "next";

import { StepSkeleton } from "@/components/flow/step-skeleton";
import { CategoryStep } from "@/components/post-job/category-step";
import { JobStepRoute } from "@/components/post-job/job-step-route";
import { JOB_BUILDER_COPY } from "@/lib/constants";

/*
 * The builder gate renders the step only after the draft has loaded in the
 * browser, so it is never part of the prerendered shell. Opt it out of
 * instant-navigation validation, which would otherwise report it as a dropped
 * segment (as T5 does on /dashboard).
 */
export const instant = false;

export const metadata: Metadata = {
  title: JOB_BUILDER_COPY.meta.category,
  robots: { index: false, follow: false },
};

/* Step 1. The draft lives in the browser, so the step renders after it loads. */
export default function PostJobCategoryPage() {
  return (
    <Suspense fallback={<StepSkeleton />}>
      <JobStepRoute step={1}>
        <CategoryStep />
      </JobStepRoute>
    </Suspense>
  );
}
