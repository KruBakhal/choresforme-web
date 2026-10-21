"use client";

import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import { ROLE_HOME, WORKER_ONBOARDING_COPY } from "@/lib/constants";

/** Onboarding header controls (T9): "Finish later" (what is saved stays saved) and Log out. */
export function OnboardingHeaderActions() {
  return (
    <>
      <Button asChild variant="outline" size="sm">
        <Link href={ROLE_HOME.worker}>{WORKER_ONBOARDING_COPY.header.finishLater}</Link>
      </Button>
      <LogoutButton appearance="link" />
    </>
  );
}
