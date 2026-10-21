import {
  Ban,
  CircleCheck,
  CircleDashed,
  Clock,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";

import { DASHBOARD_COPY, JOB_STATUS_LABELS } from "@/lib/constants";
import type { JobStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type StatusStyle = { frame: string; icon: LucideIcon; iconClass: string };

/*
 * "Status colours from tokens" (Tech Spec inventory). Every pair is an
 * approved T2 pairing; each status also has its own label and icon shape,
 * so colour is never the only signal. Badges always sit on `surface`.
 */
const STATUS_STYLES: Record<JobStatus, StatusStyle> = {
  open: { frame: "bg-brand-soft text-ink", icon: CircleDashed, iconClass: "text-ink" },
  accepted: {
    frame: "bg-surface-dark text-surface",
    icon: UserRoundCheck,
    iconClass: "text-surface",
  },
  in_progress: {
    frame: "bg-brand text-brand-foreground",
    icon: Clock,
    iconClass: "text-brand-foreground",
  },
  completed: {
    frame: "border border-input bg-surface text-ink",
    icon: CircleCheck,
    iconClass: "text-success",
  },
  cancelled: { frame: "bg-surface-alt text-ink-muted", icon: Ban, iconClass: "text-ink-muted" },
};

type StatusBadgeProps = {
  status: JobStatus;
  className?: string;
};

/** A job's status as a pill: icon, label and an sr-only "Status: " prefix (T8). */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = STATUS_STYLES[status];
  const Icon = style.icon;
  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1 rounded-full px-3 py-1 text-body-sm font-semibold whitespace-nowrap",
        style.frame,
        className,
      )}
    >
      <Icon className={cn("size-4 shrink-0", style.iconClass)} aria-hidden />
      <span className="sr-only">{DASHBOARD_COPY.status.statusSr}</span>
      {JOB_STATUS_LABELS[status]}
    </span>
  );
}
