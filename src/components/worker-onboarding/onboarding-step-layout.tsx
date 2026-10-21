"use client";

import type * as React from "react";

import { StepLayout } from "@/components/flow/step-layout";
import { useOnboarding } from "@/components/worker-onboarding/onboarding-context";
import { OnboardingProgressPanel } from "@/components/worker-onboarding/onboarding-progress-panel";
import { WORKER_ONBOARDING_COPY } from "@/lib/constants";
import { doneStepNumbers, ONBOARDING_STEP_NUMBER } from "@/lib/worker-onboarding";

type OnboardingStepLayoutProps = Pick<
  React.ComponentProps<typeof StepLayout>,
  | "titleId"
  | "title"
  | "description"
  | "afterDescription"
  | "onSubmit"
  | "onBack"
  | "backDisabled"
  | "continueLabel"
  | "loading"
  | "children"
>;

const STEPPER = WORKER_ONBOARDING_COPY.stepper;

/**
 * `StepLayout` with the onboarding defaults (T9): the 4-step Stepper
 * ("Onboarding progress", done steps from the profile; payout shows its own
 * status line), and the "Your progress" panel as the aside, before the form
 * below `lg` and not sticky.
 */
export function OnboardingStepLayout(props: OnboardingStepLayoutProps) {
  const { step, user, profile } = useOnboarding();
  const number = ONBOARDING_STEP_NUMBER[step];

  return (
    <StepLayout
      {...props}
      step={number}
      steps={STEPPER.steps}
      stepperLabel={STEPPER.ariaLabel}
      stepperDoneSteps={doneStepNumbers(profile)}
      stepperStatusText={number === 0 ? STEPPER.payoutStatus : undefined}
      summaryFirst
      asideSticky={false}
      summary={<OnboardingProgressPanel profile={profile} user={user} currentStep={step} />}
    />
  );
}
