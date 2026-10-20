"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { StepSkeleton } from "@/components/flow/step-skeleton";
import { useRevisitKey } from "@/lib/hooks/use-revisit-key";
import {
  categoryChangePatch,
  firstIncompleteStepBefore,
  parseCategoryParam,
} from "@/lib/job-builder";
import { useJobDraftHydrated, useJobDraftStore } from "@/lib/store";

type JobStepRouteProps = {
  /** 1-based builder step. */
  step: number;
  /** A raw `?category=` value (step 2 only). */
  categoryParam?: string | null;
  children: React.ReactNode;
};

/**
 * The part of every builder step that stays mounted for the route's
 * lifetime (T6):
 * - applies a valid `?category=` (step 2: pre-selects it, decision 5 rules);
 * - the step guard: once the draft has loaded, a step whose earlier steps
 *   are incomplete redirects to the first incomplete one (rule 1);
 * - keys the step view with `useRevisitKey`, so a client-side revisit
 *   (Cache Components restores the route) remounts it with the current draft.
 */
export function JobStepRoute({ step, categoryParam = null, children }: JobStepRouteProps) {
  const revisitKey = useRevisitKey();
  const router = useRouter();
  const hydrated = useJobDraftHydrated();
  const draft = useJobDraftStore((state) => state.draft);
  const patchDraft = useJobDraftStore((state) => state.patchDraft);

  const preselect = parseCategoryParam(categoryParam);
  const applyingCategory = hydrated && preselect !== null && draft.category !== preselect;
  const redirectTo = hydrated && !applyingCategory ? firstIncompleteStepBefore(step, draft) : null;

  React.useEffect(() => {
    if (!hydrated || !preselect) return;
    const patch = categoryChangePatch(useJobDraftStore.getState().draft, preselect);
    if (Object.keys(patch).length > 0) patchDraft(patch);
  }, [hydrated, preselect, patchDraft]);

  React.useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  if (!hydrated || applyingCategory || redirectTo) return <StepSkeleton />;

  return <React.Fragment key={revisitKey}>{children}</React.Fragment>;
}

/** Step 2: reads `?category=`. Render inside `<Suspense>`. */
export function JobStepRouteWithCategoryParam(props: Omit<JobStepRouteProps, "categoryParam">) {
  const searchParams = useSearchParams();
  return <JobStepRoute {...props} categoryParam={searchParams.get("category")} />;
}
