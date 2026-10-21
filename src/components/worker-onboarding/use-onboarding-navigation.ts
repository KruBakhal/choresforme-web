"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { markStepNavigation } from "@/components/flow/step-layout";

/**
 * Moves between onboarding steps (T9). Within the flow the next step's
 * heading takes focus; leaving for the dashboard does not move focus.
 */
export function useOnboardingNavigation() {
  const router = useRouter();
  return React.useCallback(
    (href: string, options: { focusHeading?: boolean } = {}) => {
      if (options.focusHeading ?? true) markStepNavigation();
      router.push(href);
    },
    [router],
  );
}
