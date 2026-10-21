import { Suspense } from "react";
import type { Metadata } from "next";

import { RequireRole } from "@/components/auth/require-role";
import { StepSkeleton } from "@/components/flow/step-skeleton";
import { ConfirmationStep } from "@/components/post-job/confirmation-step";
import { JOB_BUILDER_COPY } from "@/lib/constants";

/*
 * The session guard renders the page only after the session has loaded in
 * the browser, so it is never part of the prerendered shell. Opt it out of
 * instant-navigation validation, which would otherwise report it as a
 * dropped segment (as T5 does on /dashboard and T6 on steps 1–5).
 */
export const instant = false;

export const metadata: Metadata = {
  title: JOB_BUILDER_COPY.meta.confirmation,
  robots: { index: false, follow: false },
};

/*
 * Step 8 Confirmation (`?job=<id>`). Customer only; a worker session never
 * reaches `RequireRole`: the builder gate shows its notice first.
 */
export default function PostJobConfirmationPage() {
  return (
    <Suspense fallback={<StepSkeleton />}>
      <RequireRole role="customer" loading={<StepSkeleton />}>
        <ConfirmationStep />
      </RequireRole>
    </Suspense>
  );
}
