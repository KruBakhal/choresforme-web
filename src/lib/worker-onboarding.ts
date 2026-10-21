import { LIMITS, ONBOARDING_ROUTES, ONBOARDING_STEPS } from "@/lib/constants";
import type { OnboardingStep, VerificationStatus, WorkerProfile } from "@/lib/types";
import { addressSchema, radiusSchema, workerCategoriesSchema } from "@/lib/validation";

/*
 * Pure worker onboarding helpers (T9; shared with T10): step completeness,
 * the step guard, routes and the map ring size. Completion is always read
 * from the `WorkerProfile` (the source of truth); the onboarding store
 * mirrors it. Safe on the server and the client.
 */

/** Steps the guard enforces, in order (T9 rule 5): ID, insurance and payout are open once these are saved. */
const REQUIRED_STEPS = ["area", "services"] as const satisfies readonly OnboardingStep[];

/** "Step N of 4" number; payout is not counted (0). */
export const ONBOARDING_STEP_NUMBER: Record<OnboardingStep, number> = {
  area: 1,
  services: 2,
  id: 3,
  insurance: 4,
  payout: 0,
};

/** True for a status that counts as handed in: under review or verified (`rejected` does not). */
export function isDocumentSubmitted(status: VerificationStatus): boolean {
  return status === "under_review" || status === "verified";
}

export function isAreaComplete(profile: Pick<WorkerProfile, "baseAddress" | "radiusMiles">) {
  return (
    addressSchema.safeParse(profile.baseAddress).success &&
    radiusSchema.safeParse(profile.radiusMiles).success
  );
}

/** T9 rule 8. */
export function isOnboardingStepComplete(profile: WorkerProfile, step: OnboardingStep): boolean {
  switch (step) {
    case "area":
      return isAreaComplete(profile);
    case "services":
      return workerCategoriesSchema.safeParse(profile.categories).success;
    case "id":
      return isDocumentSubmitted(profile.idStatus);
    case "insurance":
      return isDocumentSubmitted(profile.insuranceStatus);
    case "payout":
      return profile.payoutAdded;
  }
}

export function onboardingStepRoute(step: OnboardingStep): string {
  return ONBOARDING_ROUTES[step];
}

/** Steps done, in onboarding order. */
export function completedOnboardingSteps(profile: WorkerProfile): OnboardingStep[] {
  return ONBOARDING_STEPS.filter((step) => isOnboardingStepComplete(profile, step));
}

/**
 * The guard for `step` (T9 rule 5): the first incomplete required step
 * before it (area, then services), or null when the step may open.
 */
export function firstIncompleteRequiredStep(
  profile: WorkerProfile,
  step: OnboardingStep,
): OnboardingStep | null {
  const index = ONBOARDING_STEPS.indexOf(step);
  return (
    REQUIRED_STEPS.find(
      (required) =>
        ONBOARDING_STEPS.indexOf(required) < index && !isOnboardingStepComplete(profile, required),
    ) ?? null
  );
}

/** Where to resume (T10 "Continue where you left off"): the first incomplete step, or null when all are done. */
export function firstIncompleteStep(profile: WorkerProfile): OnboardingStep | null {
  return ONBOARDING_STEPS.find((step) => !isOnboardingStepComplete(profile, step)) ?? null;
}

/** The Stepper's done steps ("Step N of 4" numbers), in any order (T9 UI plan §1.2). */
export function doneStepNumbers(profile: WorkerProfile): number[] {
  return completedOnboardingSteps(profile)
    .map((step) => ONBOARDING_STEP_NUMBER[step])
    .filter((number) => number > 0);
}

/** T9 "Done when": ID and insurance have both been handed in. */
export function isUnderReviewReached(profile: WorkerProfile): boolean {
  return isDocumentSubmitted(profile.idStatus) && isDocumentSubmitted(profile.insuranceStatus);
}

/** The step after `step` in the flow; null after payout (the dashboard). */
export function nextOnboardingStep(step: OnboardingStep): OnboardingStep | null {
  return ONBOARDING_STEPS[ONBOARDING_STEPS.indexOf(step) + 1] ?? null;
}

/** The step before `step`; null for area. */
export function previousOnboardingStep(step: OnboardingStep): OnboardingStep | null {
  const index = ONBOARDING_STEPS.indexOf(step);
  return index > 0 ? ONBOARDING_STEPS[index - 1] : null;
}

/**
 * The map ring's diameter as a percentage of the map height (T9 UI plan
 * §4.6): 20 % at the smallest radius up to 100 % at the largest, on a square
 * root curve so small radii stay visible.
 */
export function ringSize(radiusMiles: number): string {
  const span = LIMITS.radiusMax - LIMITS.radiusMin;
  const ratio = Math.min(Math.max((radiusMiles - LIMITS.radiusMin) / span, 0), 1);
  return `${Math.round(20 + 80 * Math.sqrt(ratio))}%`;
}
