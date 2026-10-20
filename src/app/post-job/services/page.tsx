import { Suspense } from "react";
import type { Metadata } from "next";

import { StepSkeleton } from "@/components/flow/step-skeleton";
import { ServicesStep } from "@/components/post-job/services-step";
import { JobStepRouteWithCategoryParam } from "@/components/post-job/job-step-route";
import { JOB_BUILDER_COPY } from "@/lib/constants";

/*
 * The builder gate renders the step only after the draft has loaded in the
 * browser, so it is never part of the prerendered shell. Opt it out of
 * instant-navigation validation, which would otherwise report it as a dropped
 * segment (as T5 does on /dashboard).
 */
export const instant = false;

export const metadata: Metadata = {
  title: JOB_BUILDER_COPY.meta.services,
  robots: { index: false, follow: false },
};

/* Step 2. The draft lives in the browser, so the step renders after it loads. */
export default function PostJobServicesPage() {
  return (
    <Suspense fallback={<StepSkeleton />}>
      <JobStepRouteWithCategoryParam step={2}>
        <ServicesStep />
      </JobStepRouteWithCategoryParam>
    </Suspense>
  );
}
