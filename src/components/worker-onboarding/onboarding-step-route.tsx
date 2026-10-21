"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { StepSkeleton } from "@/components/flow/step-skeleton";
import { ErrorState } from "@/components/states/error-state";
import { OnboardingContext } from "@/components/worker-onboarding/onboarding-context";
import { WORKER_ONBOARDING_COPY } from "@/lib/constants";
import { useRevisitKey } from "@/lib/hooks/use-revisit-key";
import { workers } from "@/lib/mock/services";
import {
  selectOnboardingProgress,
  selectSessionUser,
  useOnboardingHydrated,
  useOnboardingStore,
  useSessionStore,
} from "@/lib/store";
import type { OnboardingStep, WorkerProfile } from "@/lib/types";
import {
  completedOnboardingSteps,
  firstIncompleteRequiredStep,
  onboardingStepRoute,
} from "@/lib/worker-onboarding";

type OnboardingStepRouteProps = {
  step: OnboardingStep;
  /** The step view; it reads the profile with `useOnboarding()`. */
  children: React.ReactNode;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; retrying: boolean }
  | { status: "ready"; profile: WorkerProfile };

/**
 * The part of every onboarding step that stays mounted for the route's
 * lifetime (T9). It keys the step with `useRevisitKey`, so a client-side
 * revisit (Cache Components restores the route) loads the profile again
 * and starts the step fresh.
 */
export function OnboardingStepRoute({ step, children }: OnboardingStepRouteProps) {
  const revisitKey = useRevisitKey();
  return (
    <OnboardingStepLoader key={revisitKey} step={step}>
      {children}
    </OnboardingStepLoader>
  );
}

/**
 * Loads `workers.getProfile` (loading: the step skeleton; error, including
 * `?mockError=1`: ErrorState with Retry), then runs the step guard (T9 rule
 * 5: area, then services, must be saved first) and records the current step
 * in the onboarding store, which mirrors the profile's completed steps.
 */
function OnboardingStepLoader({ step, children }: OnboardingStepRouteProps) {
  const router = useRouter();
  const user = useSessionStore(selectSessionUser);
  const userId = user?.id ?? null;
  const hydrated = useOnboardingHydrated();
  const [load, setLoad] = React.useState<LoadState>({ status: "loading" });
  const startedOnMount = React.useRef(false);

  const fetchProfile = React.useCallback(async () => {
    if (!userId) return;
    try {
      setLoad({ status: "ready", profile: await workers.getProfile(userId) });
    } catch {
      setLoad({ status: "error", retrying: false });
    }
  }, [userId]);

  React.useEffect(() => {
    // Once per mount (Strict Mode runs effects twice; a second request would hide a ?mockError=1 failure).
    if (startedOnMount.current || !userId) return;
    startedOnMount.current = true;
    void fetchProfile();
  }, [fetchProfile, userId]);

  const profile = load.status === "ready" ? load.profile : null;
  const blockedBy = profile ? firstIncompleteRequiredStep(profile, step) : null;
  const redirectTo = blockedBy ? onboardingStepRoute(blockedBy) : null;

  React.useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  React.useEffect(() => {
    if (!hydrated || !profile || !userId || redirectTo) return;
    const store = useOnboardingStore.getState();
    const recorded = selectOnboardingProgress(userId)(store).completedSteps;
    completedOnboardingSteps(profile).forEach((done) => {
      if (!recorded.includes(done)) store.markStepComplete(userId, done);
    });
    store.setCurrentStep(userId, step);
  }, [hydrated, profile, userId, step, redirectTo]);

  const setProfile = React.useCallback(
    (next: WorkerProfile) => setLoad({ status: "ready", profile: next }),
    [],
  );

  const context = React.useMemo(
    () => (user && profile ? { step, user, profile, setProfile } : null),
    [step, user, profile, setProfile],
  );

  if (load.status === "error") {
    return (
      <div className="mx-auto max-w-xl">
        <ErrorState
          headingLevel={1}
          message={WORKER_ONBOARDING_COPY.loadError}
          isRetrying={load.retrying}
          onRetry={() => {
            setLoad({ status: "error", retrying: true });
            void fetchProfile();
          }}
        />
      </div>
    );
  }

  if (!hydrated || !context || redirectTo) return <StepSkeleton segments={4} asideFirst />;

  return <OnboardingContext value={context}>{children}</OnboardingContext>;
}
