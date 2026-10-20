"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { markStepNavigation } from "@/components/flow/step-layout";

/** Moves between builder steps; the next step's heading takes focus. */
export function useStepNavigation() {
  const router = useRouter();
  return React.useCallback(
    (route: string) => {
      markStepNavigation();
      router.push(route);
    },
    [router],
  );
}
