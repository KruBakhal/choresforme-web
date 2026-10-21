import { BadgeCheck, Circle, CircleCheck, CircleX, Clock, type LucideIcon } from "lucide-react";

import { VERIFICATION_STATUS_LABELS, WORKER_ONBOARDING_COPY } from "@/lib/constants";
import type { VerificationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

/** A verification status, or `done` for the area, services and payout rows. */
export type ChecklistStatus = VerificationStatus | "done";

type BadgeStyle = { frame: string; icon: LucideIcon; iconClass: string };

/*
 * Token pairs from the T9 UI plan §4.1. Each status has its own word and
 * icon shape, so colour is never the only signal. Badges sit on `surface`.
 */
const BADGE_STYLES: Record<ChecklistStatus, BadgeStyle> = {
  not_started: {
    frame: "border border-input bg-surface text-ink-muted",
    icon: Circle,
    iconClass: "text-ink-muted",
  },
  under_review: { frame: "bg-brand-soft text-ink", icon: Clock, iconClass: "text-ink" },
  verified: {
    frame: "border border-input bg-surface text-ink",
    icon: BadgeCheck,
    iconClass: "text-success",
  },
  rejected: {
    frame: "border border-danger bg-surface text-ink",
    icon: CircleX,
    iconClass: "text-danger",
  },
  done: {
    frame: "border border-input bg-surface text-ink",
    icon: CircleCheck,
    iconClass: "text-success",
  },
};

const SIZES = {
  sm: "px-2 py-1 text-caption",
  md: "px-3 py-1 text-body-sm",
} as const;

export function checklistStatusLabel(status: ChecklistStatus): string {
  return status === "done"
    ? WORKER_ONBOARDING_COPY.status.done
    : VERIFICATION_STATUS_LABELS[status];
}

type VerificationBadgeProps = {
  status: ChecklistStatus;
  size?: keyof typeof SIZES;
  className?: string;
};

/** A verification status as a pill: icon, label and an sr-only "Status: " prefix (T9). */
export function VerificationBadge({ status, size = "sm", className }: VerificationBadgeProps) {
  const style = BADGE_STYLES[status];
  const Icon = style.icon;
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1 rounded-full font-semibold whitespace-nowrap",
        SIZES[size],
        style.frame,
        className,
      )}
    >
      <Icon className={cn("size-4 shrink-0", style.iconClass)} aria-hidden />
      <span className="sr-only">{WORKER_ONBOARDING_COPY.status.statusSr}</span>
      {checklistStatusLabel(status)}
    </span>
  );
}
