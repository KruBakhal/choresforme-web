"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useOnboardingNavigation } from "@/components/worker-onboarding/use-onboarding-navigation";
import { ROLE_HOME, WORKER_ONBOARDING_COPY } from "@/lib/constants";

const ACTIONS = WORKER_ONBOARDING_COPY.actions;

/** "See jobs near you first" (T9 open question 1): the worker dashboard, from the ID step on. */
export function SeeJobsLink() {
  return (
    <Button asChild variant="link" size="sm" className="mt-2">
      <Link href={ROLE_HOME.worker}>
        {ACTIONS.seeJobs}
        <ArrowRight aria-hidden />
      </Link>
    </Button>
  );
}

type SkipRowProps = {
  note: string;
  href: string;
  disabled?: boolean;
  /** Within the flow the next step's heading takes focus; not for the dashboard. */
  focusHeading?: boolean;
};

/** "Skip for now" at the end of the form (T9 UI plan open question 8). */
export function SkipRow({ note, href, disabled = false, focusHeading = true }: SkipRowProps) {
  const go = useOnboardingNavigation();
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <p className="text-body-sm text-ink-muted">{note}</p>
      <Button
        type="button"
        variant="link"
        size="sm"
        disabled={disabled}
        onClick={() => go(href, { focusHeading })}
      >
        {ACTIONS.skip}
        <ArrowRight aria-hidden />
      </Button>
    </div>
  );
}
