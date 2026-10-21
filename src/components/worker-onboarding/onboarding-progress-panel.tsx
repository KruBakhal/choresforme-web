"use client";

import * as React from "react";
import {
  ChevronDown,
  IdCard as IdCardIcon,
  Landmark,
  ListChecks,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { markStepNavigation } from "@/components/flow/step-layout";
import { IdCard } from "@/components/worker/id-card";
import {
  type ChecklistItem,
  VerificationChecklist,
} from "@/components/worker/verification-checklist";
import { useProfilePhotoUrl } from "@/components/worker-onboarding/profile-photo-memory";
import { ONBOARDING_STEPS, WORKER_ONBOARDING_COPY } from "@/lib/constants";
import { workerDisplayName, workerInitials } from "@/lib/job-builder";
import type { OnboardingStep, User, WorkerProfile } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  completedOnboardingSteps,
  isOnboardingStepComplete,
  onboardingStepRoute,
} from "@/lib/worker-onboarding";

type OnboardingProgressPanelProps = {
  profile: WorkerProfile;
  user: Pick<User, "id" | "firstName" | "lastName" | "phoneVerified">;
  currentStep: OnboardingStep;
};

const COPY = WORKER_ONBOARDING_COPY.progress;
const TITLE_ID = "progress-title";
const BODY_ID = "progress-body";
const ID_CARD_TITLE_ID = "progress-id-card-title";

/** The five onboarding rows, statuses read from the profile (T9 rule 8). */
export function onboardingChecklistItems(profile: WorkerProfile): ChecklistItem[] {
  const doneOr = (step: OnboardingStep) =>
    isOnboardingStepComplete(profile, step) ? "done" : "not_started";
  return [
    {
      key: "area",
      label: COPY.rows.area,
      href: onboardingStepRoute("area"),
      icon: MapPin,
      status: doneOr("area"),
    },
    {
      key: "services",
      label: COPY.rows.services,
      href: onboardingStepRoute("services"),
      icon: ListChecks,
      status: doneOr("services"),
    },
    {
      key: "id",
      label: COPY.rows.id,
      href: onboardingStepRoute("id"),
      icon: IdCardIcon,
      status: profile.idStatus,
    },
    {
      key: "insurance",
      label: COPY.rows.insurance,
      href: onboardingStepRoute("insurance"),
      icon: ShieldCheck,
      status: profile.insuranceStatus,
    },
    {
      key: "payout",
      label: COPY.rows.payout,
      href: onboardingStepRoute("payout"),
      icon: Landmark,
      status: doneOr("payout"),
      note: COPY.payoutNote,
    },
  ];
}

/**
 * "Your progress" (T9): the checklist and the Chores ID-Card preview. A right
 * column from `lg`, an open panel above the form at tablet and a collapsed
 * bar at the top on phones (the ID-Card is inside it, never removed). It
 * holds no errors and no live region; it re-renders from the profile.
 */
export function OnboardingProgressPanel({
  profile,
  user,
  currentStep,
}: OnboardingProgressPanelProps) {
  const [open, setOpen] = React.useState(false);
  const photoUrl = useProfilePhotoUrl(user.id);
  const done = completedOnboardingSteps(profile).length;
  const countText = COPY.count(done, ONBOARDING_STEPS.length);

  return (
    <aside aria-labelledby={TITLE_ID} className="rounded-lg bg-surface-alt md:p-6 lg:p-4 xl:p-6">
      <h2 id={TITLE_ID} className="text-h4 font-semibold text-ink">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={BODY_ID}
          onClick={() => setOpen((value) => !value)}
          className="flex min-h-14 w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left focus-visible:-outline-offset-2 md:hidden"
        >
          <span className="text-body font-semibold text-ink">{COPY.title}</span>
          <span className="flex items-center gap-2 text-body-sm font-normal text-ink">
            {countText}
            <ChevronDown
              className={cn(
                "size-5 transition-transform motion-reduce:transition-none",
                open && "rotate-180",
              )}
              aria-hidden
            />
          </span>
        </button>
        <span className="hidden md:flex md:flex-wrap md:items-baseline md:justify-between md:gap-x-4">
          {COPY.title}
          <span className="text-body-sm font-normal text-ink-muted">{countText}</span>
        </span>
      </h2>
      <div
        id={BODY_ID}
        className={cn(
          "flex-col gap-4 px-4 pb-4 md:mt-4 md:grid md:grid-cols-2 md:gap-6 md:p-0 lg:flex lg:flex-col lg:gap-4",
          open ? "flex" : "hidden",
        )}
      >
        <VerificationChecklist
          items={onboardingChecklistItems(profile)}
          currentKey={currentStep}
          onNavigate={markStepNavigation}
          ariaLabelledBy={TITLE_ID}
        />
        <IdCard
          titleId={ID_CARD_TITLE_ID}
          name={workerDisplayName(user)}
          initials={workerInitials(user)}
          photoUrl={photoUrl ?? undefined}
          phoneStatus={user.phoneVerified ? "verified" : "not_started"}
          idStatus={profile.idStatus}
          insuranceStatus={profile.insuranceStatus}
          showPhotoNote
        />
      </div>
    </aside>
  );
}
