"use client";

import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

import { VerificationBadge, type ChecklistStatus } from "@/components/worker/verification-badge";
import { WORKER_ONBOARDING_COPY } from "@/lib/constants";
import type { OnboardingStep } from "@/lib/types";
import { cn } from "@/lib/utils";

export type ChecklistItem = {
  key: OnboardingStep;
  label: string;
  href: string;
  icon: LucideIcon;
  status: ChecklistStatus;
  note?: string;
};

type VerificationChecklistProps = {
  items: readonly ChecklistItem[];
  /** The step on screen: shown as "You're here", not as a link. */
  currentKey?: OnboardingStep;
  /** Called before a row link navigates (T9: the next step's heading takes focus). */
  onNavigate?: () => void;
  /** Id of the heading that names the list. */
  ariaLabelledBy: string;
};

const ROW =
  "flex min-h-14 items-center gap-3 rounded-md border-2 px-3 py-3 transition-colors duration-150 motion-reduce:transition-none";

/**
 * "Your progress" rows (T9; T10 shows ID, Insurance and Payout only): a
 * label, a status badge and a link to the step. Presentation only.
 */
export function VerificationChecklist({
  items,
  currentKey,
  onNavigate,
  ariaLabelledBy,
}: VerificationChecklistProps) {
  return (
    <ul
      aria-labelledby={ariaLabelledBy}
      className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-2"
    >
      {items.map((item) => {
        const current = item.key === currentKey;
        const Icon = item.icon;
        const content = (
          <>
            <Icon className="size-5 shrink-0 text-ink" aria-hidden />
            <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
              <span className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-body-sm font-semibold text-ink">{item.label}</span>
                {current && (
                  <span className="text-caption text-ink-muted">
                    {WORKER_ONBOARDING_COPY.progress.youAreHere}
                  </span>
                )}
              </span>
              <VerificationBadge status={item.status} />
              {item.note && <span className="text-caption text-ink-muted">{item.note}</span>}
            </span>
            {!current && <ChevronRight className="size-5 shrink-0 text-ink-muted" aria-hidden />}
          </>
        );
        return (
          <li key={item.key}>
            {current ? (
              <div aria-current="step" className={cn(ROW, "border-ink")}>
                {content}
              </div>
            ) : (
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  ROW,
                  "border-transparent hover:border-input focus-visible:-outline-offset-2",
                )}
              >
                {content}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
