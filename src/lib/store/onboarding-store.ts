"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ONBOARDING_STEPS } from "@/lib/constants";
import { browserStorage, STORE_KEYS, useStoresHydratedFor } from "@/lib/store/storage";
import type { OnboardingProgress, OnboardingStep } from "@/lib/types";

/*
 * Worker onboarding progress, per worker on this device: which steps are done
 * and where to resume. The profile data itself is saved through
 * `workers.updateOnboarding`.
 */

export const EMPTY_ONBOARDING_PROGRESS: OnboardingProgress = {
  completedSteps: [],
  currentStep: ONBOARDING_STEPS[0],
};

type OnboardingState = {
  byUser: Record<string, OnboardingProgress>;
  /** Marks a step done and moves on to the next unfinished step. */
  markStepComplete: (userId: string, step: OnboardingStep) => void;
  setCurrentStep: (userId: string, step: OnboardingStep) => void;
  clear: () => void;
};

function nextStep(completed: readonly OnboardingStep[], after: OnboardingStep): OnboardingStep {
  const start = ONBOARDING_STEPS.indexOf(after);
  const ordered = [...ONBOARDING_STEPS.slice(start + 1), ...ONBOARDING_STEPS.slice(0, start + 1)];
  return ordered.find((step) => !completed.includes(step)) ?? after;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      byUser: {},
      markStepComplete: (userId, step) =>
        set((state) => {
          const current = state.byUser[userId] ?? EMPTY_ONBOARDING_PROGRESS;
          const completedSteps = ONBOARDING_STEPS.filter(
            (item) => item === step || current.completedSteps.includes(item),
          );
          return {
            byUser: {
              ...state.byUser,
              [userId]: { completedSteps, currentStep: nextStep(completedSteps, step) },
            },
          };
        }),
      setCurrentStep: (userId, step) =>
        set((state) => {
          const current = state.byUser[userId] ?? EMPTY_ONBOARDING_PROGRESS;
          return { byUser: { ...state.byUser, [userId]: { ...current, currentStep: step } } };
        }),
      clear: () => set({ byUser: {} }),
    }),
    {
      name: STORE_KEYS.onboarding,
      version: 1,
      storage: browserStorage,
      skipHydration: true,
      partialize: (state) => ({ byUser: state.byUser }),
    },
  ),
);

const ONBOARDING_STORES = [useOnboardingStore] as const;

/** False on the server and until progress has loaded from localStorage. */
export function useOnboardingHydrated(): boolean {
  return useStoresHydratedFor(ONBOARDING_STORES);
}

export const selectOnboardingProgress =
  (userId: string) =>
  (state: OnboardingState): OnboardingProgress =>
    state.byUser[userId] ?? EMPTY_ONBOARDING_PROGRESS;
