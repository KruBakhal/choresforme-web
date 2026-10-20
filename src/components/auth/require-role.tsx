"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { AuthHeader } from "@/components/auth/auth-header";
import { RoleMismatchNotice } from "@/components/auth/role-mismatch-notice";
import { Container } from "@/components/layout/container";
import {
  getLogoutDestination,
  isProfileComplete,
  loginHref,
  signUpHref,
} from "@/lib/auth/redirect";
import { isSessionActive, useSessionHydrated, useSessionStore } from "@/lib/store";
import type { Role } from "@/lib/types";

type RequireRoleProps = {
  role: Role;
  /** Shown until the session has loaded, and while a redirect runs (never protected content). */
  loading: React.ReactNode;
  children: React.ReactNode;
};

type GuardStatus = "loading" | "signed-out" | "incomplete" | "mismatch" | "ok";

/**
 * Client-side route guard (T5 decision 3), reused by T7–T10. It waits for the
 * persisted session, so the server render and the first client render are
 * the same (`loading`) and nothing redirects early:
 * - no session → `/login?next=<route>`
 * - unfinished social profile → `/signup?role=<role>&next=<route>`
 * - the other role → the separate accounts notice
 */
export function RequireRole({ role, loading, children }: RequireRoleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useSessionHydrated();
  const session = useSessionStore((state) => state.session);
  const user = hydrated ? (session?.user ?? null) : null;

  const status: GuardStatus = !hydrated
    ? "loading"
    : !user
      ? "signed-out"
      : !isProfileComplete(user)
        ? "incomplete"
        : user.role !== role
          ? "mismatch"
          : "ok";

  const userRole = user?.role;

  React.useEffect(() => {
    const current = `${pathname}${window.location.search}`;
    const signedIn = isSessionActive(useSessionStore.getState().session);
    if (status === "signed-out" || (status !== "loading" && !signedIn)) {
      router.replace(getLogoutDestination() ?? loginHref(current));
    } else if (status === "incomplete" && userRole) {
      router.replace(signUpHref(userRole, new URLSearchParams({ next: current })));
    }
  }, [status, userRole, pathname, router]);

  if (status === "mismatch" && userRole) {
    return (
      <>
        <AuthHeader />
        <main id="main" tabIndex={-1} className="flex-1 bg-surface outline-none">
          <Container className="py-8 md:py-12 lg:py-16">
            <RoleMismatchNotice sessionRole={userRole} />
          </Container>
        </main>
      </>
    );
  }

  if (status === "ok") return <>{children}</>;

  return <>{loading}</>;
}
