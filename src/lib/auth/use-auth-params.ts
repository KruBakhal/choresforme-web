"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import { keptParams, parseRole, safeNext } from "@/lib/auth/redirect";
import type { Role } from "@/lib/types";

export type AuthParams = {
  /** A valid `?role=`, or null (decision 8). */
  role: Role | null;
  /** A same-site `?next=`, or null. */
  next: string | null;
  /** `next` and `utm_*`, carried between login, sign-up and the picker (decision 10). */
  kept: URLSearchParams;
};

/** Reads the auth query params. Uses `useSearchParams`, so render it inside `<Suspense>`. */
export function useAuthParams(): AuthParams {
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  return React.useMemo(() => {
    const params = new URLSearchParams(query);
    return {
      role: parseRole(params.get("role")),
      next: safeNext(params.get("next")),
      kept: keptParams(params),
    };
  }, [query]);
}
