"use client";

import * as React from "react";

import { RoleMismatchNotice } from "@/components/auth/role-mismatch-notice";
import { StepSkeleton } from "@/components/flow/step-skeleton";
import { useJobDraftHydrated, useSessionHydrated, useSessionStore } from "@/lib/store";

/**
 * Wraps every `/post-job/*` step (T6). Nothing renders before the draft and
 * the session have loaded from localStorage. A worker session sees the
 * separate accounts notice ("Post a job" is a customer CTA, rule 4); guests
 * and customers go through.
 */
export function JobBuilderGate({ children }: { children: React.ReactNode }) {
  const draftHydrated = useJobDraftHydrated();
  const sessionHydrated = useSessionHydrated();
  const session = useSessionStore((state) => state.session);

  if (!draftHydrated || !sessionHydrated) return <StepSkeleton />;

  // Expired sessions are dropped when the session store loads.
  if (session?.user.role === "worker") {
    return <RoleMismatchNotice sessionRole="worker" />;
  }

  return <>{children}</>;
}
