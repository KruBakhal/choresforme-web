import { Suspense } from "react";
import type { Metadata } from "next";

import { StepSkeleton } from "@/components/flow/step-skeleton";
import { PayoutStep } from "@/components/worker-onboarding/payout-step";
import { OnboardingStepRoute } from "@/components/worker-onboarding/onboarding-step-route";
import { WORKER_ONBOARDING_COPY } from "@/lib/constants";

/*
 * The client guard (RequireRole) renders the step only after the session has
 * loaded in the browser, and the step loads the worker profile there, so it
 * is never part of the prerendered shell. Opt it out of instant-navigation
 * validation, which would otherwise report it as a dropped segment (as T5
 * does on /worker/dashboard).
 */
export const instant = false;

export const metadata: Metadata = {
  title: WORKER_ONBOARDING_COPY.meta.payout,
  robots: { index: false, follow: false },
};

/* Keyed per visit with `useRevisitKey` inside OnboardingStepRoute. */
export default function WorkerOnboardingPayoutPage() {
  return (
    <Suspense fallback={<StepSkeleton segments={4} asideFirst />}>
      <OnboardingStepRoute step="payout">
        <PayoutStep />
      </OnboardingStepRoute>
    </Suspense>
  );
}
