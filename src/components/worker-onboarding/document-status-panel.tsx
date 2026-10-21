import type * as React from "react";

import { VerificationBadge, type ChecklistStatus } from "@/components/worker/verification-badge";
import { WORKER_ONBOARDING_COPY } from "@/lib/constants";
import { cn } from "@/lib/utils";

type DocumentStatusPanelProps = {
  id: string;
  title: string;
  status: ChecklistStatus;
  /** The status line. */
  message: React.ReactNode;
  /** Shown before the message when rejected ("Reason: …"). */
  reason?: string;
  /** For example Payout's "Update payout account". */
  action?: React.ReactNode;
};

/**
 * A saved status at the top of Verify ID, Insurance and Payout (T9): title,
 * badge and one line; a rejected document shows the reason. No review time.
 */
export function DocumentStatusPanel({
  id,
  title,
  status,
  message,
  reason,
  action,
}: DocumentStatusPanelProps) {
  const titleId = `${id}-title`;
  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "rounded-lg border bg-surface p-4 md:p-6",
        status === "rejected" ? "border-danger" : "border-input",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={titleId} className="text-h4 font-semibold text-ink">
          {title}
        </h2>
        <VerificationBadge status={status} size="md" />
      </div>
      {status === "rejected" && (
        <p className="mt-2 text-body-sm text-ink">
          <span className="font-semibold">{WORKER_ONBOARDING_COPY.statusPanel.reasonLabel}</span>{" "}
          {reason || WORKER_ONBOARDING_COPY.statusPanel.reasonFallback}
        </p>
      )}
      <p className="mt-2 text-body-sm text-ink">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </section>
  );
}
