"use client";

import Link from "next/link";
import { CircleX, Pencil, Repeat, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DASHBOARD_COPY } from "@/lib/constants";
import type { Job } from "@/lib/types";

type JobActionsProps = {
  job: Job;
  onCancel: () => void;
  onRate: () => void;
  onRepost: () => void;
  reposting: boolean;
};

const COPY = DASHBOARD_COPY.detail;

/** True when the status allows at least one action (in progress allows none). */
export function hasJobActions(job: Job): boolean {
  return job.status !== "in_progress";
}

/**
 * The actions this status allows (T8 rule 14), at most two: open → Edit,
 * Cancel; accepted → Cancel; completed → Rate (until rated), Re-post;
 * cancelled → Re-post. In the side card from md; below md the same element is
 * the sticky bar on top of the BottomNav.
 */
export function JobActions({ job, onCancel, onRate, onRepost, reposting }: JobActionsProps) {
  const button = "flex-1 md:flex-none lg:w-full";
  const canEdit = job.status === "open";
  const canCancel = job.status === "open" || job.status === "accepted";
  const canRate = job.status === "completed" && job.customerRating === undefined;
  const canRepost = job.status === "completed" || job.status === "cancelled";

  return (
    <div
      role="group"
      aria-label={COPY.actionsLabel}
      className="fixed inset-x-0 bottom-above-nav z-40 flex gap-3 border-t border-border bg-surface px-4 py-3 md:static md:z-auto md:border-0 md:bg-transparent md:p-0 lg:flex-col"
    >
      {canEdit && (
        <Button asChild variant="secondary" className={button}>
          <Link href={`/dashboard/jobs/${encodeURIComponent(job.id)}/edit`}>
            <Pencil aria-hidden />
            {COPY.edit}
          </Link>
        </Button>
      )}
      {canCancel && (
        <Button type="button" variant="outline" className={button} onClick={onCancel}>
          <CircleX aria-hidden />
          {COPY.cancel}
        </Button>
      )}
      {canRate && (
        <Button asChild className={button}>
          <a
            href="#rate"
            onClick={(event) => {
              event.preventDefault();
              onRate();
            }}
          >
            <Star aria-hidden />
            {COPY.rate}
          </a>
        </Button>
      )}
      {canRepost && (
        <Button
          type="button"
          variant="secondary"
          className={button}
          loading={reposting}
          onClick={onRepost}
        >
          {!reposting && <Repeat aria-hidden />}
          {reposting ? COPY.reposting : COPY.repost}
        </Button>
      )}
    </div>
  );
}
