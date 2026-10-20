"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { dashboardFor } from "@/lib/auth/redirect";
import { AUTH_COPY, HEADER_ACTIONS } from "@/lib/constants";
import { selectSessionUser, useSessionHydrated, useSessionStore } from "@/lib/store";

type HeaderAuthActionsProps = {
  /** `inline`: the desktop Header (lg+). `stacked`: the HeaderMenu sheet. */
  layout: "inline" | "stacked";
};

/**
 * Header "Log in" / "Sign up", swapped for a "Dashboard" link once the
 * session has loaded and someone is signed in (decision 12). Before
 * hydration it renders the signed-out links, as the server does.
 */
export function HeaderAuthActions({ layout }: HeaderAuthActionsProps) {
  const hydrated = useSessionHydrated();
  const user = useSessionStore(selectSessionUser);
  const stacked = layout === "stacked";

  if (hydrated && user) {
    return (
      <Button
        asChild
        variant="outline"
        size={stacked ? "default" : "sm"}
        className={stacked ? "w-full" : undefined}
      >
        <Link href={dashboardFor(user.role)}>
          <LayoutDashboard aria-hidden />
          {AUTH_COPY.header.dashboard}
        </Link>
      </Button>
    );
  }

  if (stacked) {
    return (
      <>
        <Button asChild variant="outline" className="w-full">
          <Link href={HEADER_ACTIONS.logIn.href}>{HEADER_ACTIONS.logIn.label}</Link>
        </Button>
        <Button asChild variant="secondary" className="w-full">
          <Link href={HEADER_ACTIONS.signUp.href}>{HEADER_ACTIONS.signUp.label}</Link>
        </Button>
      </>
    );
  }

  return (
    <>
      <Button asChild variant="ghost" size="sm">
        <Link href={HEADER_ACTIONS.logIn.href}>{HEADER_ACTIONS.logIn.label}</Link>
      </Button>
      <Button asChild variant="outline" size="sm">
        <Link href={HEADER_ACTIONS.signUp.href}>{HEADER_ACTIONS.signUp.label}</Link>
      </Button>
    </>
  );
}
