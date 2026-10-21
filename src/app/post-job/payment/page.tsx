import { Suspense } from "react";
import type { Metadata } from "next";

import { RequireRole } from "@/components/auth/require-role";
import { StepSkeleton } from "@/components/flow/step-skeleton";
import { JobStepRoute } from "@/components/post-job/job-step-route";
import { PaymentStep } from "@/components/post-job/payment-step";
import { JOB_BUILDER_COPY } from "@/lib/constants";

/*
 * The session guard and the builder gate render the step only after the
 * stores have loaded in the browser, so it is never part of the prerendered
 * shell. Opt it out of instant-navigation validation, which would otherwise
 * report it as a dropped segment (as T5 does on /dashboard and T6 on steps
 * 1–5).
 */
export const instant = false;

export const metadata: Metadata = {
  title: JOB_BUILDER_COPY.meta.payment,
  robots: { index: false, follow: false },
};

/*
 * Step 7 Payment. Customer only: the session guard runs first (a guest goes
 * to /login?next=/post-job/payment), then the draft guard. A worker session
 * never reaches `RequireRole`: the builder gate shows its notice first.
 */
export default function PostJobPaymentPage() {
  return (
    <Suspense fallback={<StepSkeleton />}>
      <RequireRole role="customer" loading={<StepSkeleton />}>
        <JobStepRoute step={7}>
          <PaymentStep />
        </JobStepRoute>
      </RequireRole>
    </Suspense>
  );
}
