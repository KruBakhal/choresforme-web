"use client";

import * as React from "react";

import type { OnboardingStep, User, WorkerProfile } from "@/lib/types";

/** What every onboarding step reads from its route (T9). */
export type OnboardingContextValue = {
  step: OnboardingStep;
  user: User;
  /** Loaded with `workers.getProfile` on each visit; the source of truth for completion. */
  profile: WorkerProfile;
  /** After a save or upload, so the progress panel updates in place. */
  setProfile: (profile: WorkerProfile) => void;
};

export const OnboardingContext = React.createContext<OnboardingContextValue | null>(null);

/** The step's user and profile. Only inside `OnboardingStepRoute`. */
export function useOnboarding(): OnboardingContextValue {
  const value = React.useContext(OnboardingContext);
  if (!value) throw new Error("useOnboarding must be used inside OnboardingStepRoute");
  return value;
}
