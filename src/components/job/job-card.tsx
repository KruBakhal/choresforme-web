import Link from "next/link";
import { ClipboardList, MapPin, Star, UserRound } from "lucide-react";

import { servicesText } from "@/components/job/job-summary-panel";
import { StatusBadge } from "@/components/job/status-badge";
import { CATEGORY_ICONS, DASHBOARD_COPY } from "@/lib/constants";
import {
  findCategory,
  formatDate,
  formatUsd,
  jobPrice,
  workerDisplayName,
  workerInitials,
} from "@/lib/job-builder";
import type { Job, WorkerSummary } from "@/lib/types";

/** A job's worker as the card shows it: known, or "Your worker" when the lookup failed. */
export type JobCardWorker = { state: "ready"; summary: WorkerSummary } | { state: "fallback" };

type JobCardProps = {
  job: Job;
  /** Undefined while the job has no worker (on the job board). */
  worker: JobCardWorker | undefined;
  headingLevel: 2 | 3;
};

const COPY = DASHBOARD_COPY.card;

export function jobDetailHref(id: string, hash?: string): string {
  return `/dashboard/jobs/${encodeURIComponent(id)}${hash ? `#${hash}` : ""}`;
}

/**
 * An active job on Home and Jobs (Tech Spec inventory, T8 UI plan §3.2):
 * status, posted date, category, services, place, price and the worker or
 * "On the job board". The whole card is one link to Job detail (a stretched
 * overlay on the title link). Render on the client only (local dates).
 */
export function JobCard({ job, worker, headingLevel }: JobCardProps) {
  const Heading = headingLevel === 3 ? "h3" : "h2";
  const category = findCategory(job.category);
  const CategoryIcon = CATEGORY_ICONS[job.category];
  const services = servicesText(job) ?? "";
  const place = `${job.address.city}, ${job.address.state}`;
  const price = jobPrice(job);

  return (
    <article className="relative flex h-full flex-col gap-4 rounded-lg border border-border bg-surface p-4 transition-colors duration-150 hover:border-input motion-reduce:transition-none md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StatusBadge status={job.status} />
        <p className="text-body-sm text-ink-muted">
          {COPY.posted("")}
          <time dateTime={job.createdAt}>{formatDate(job.createdAt)}</time>
        </p>
      </div>

      <div className="flex items-start gap-4">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand md:size-12"
        >
          <CategoryIcon className="size-5 text-brand-foreground md:size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <Heading className="text-body font-semibold text-ink">
            <Link
              href={jobDetailHref(job.id)}
              className="outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
            >
              {category?.name ?? job.category}
              <span className="sr-only">{COPY.linkSr(services, place)}</span>
            </Link>
          </Heading>
          <p className="mt-1 line-clamp-2 text-body-sm break-words text-ink">{services}</p>
          <p className="mt-1 flex items-center gap-1 text-body-sm text-ink-muted">
            <MapPin className="size-4 shrink-0" aria-hidden />
            {place}
          </p>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-t border-border pt-4">
        <CardWorker worker={worker} />
        <div className="text-right">
          <p className="text-h4 font-semibold text-ink">
            {price.total === null ? "" : formatUsd(price.total)}
          </p>
          <p className="text-body-sm text-ink-muted">{price.breakdown}</p>
        </div>
      </div>
    </article>
  );
}

function CardWorker({ worker }: { worker: JobCardWorker | undefined }) {
  if (worker?.state === "ready") {
    const summary = worker.summary;
    return (
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-body-sm font-semibold text-ink"
        >
          {workerInitials(summary)}
        </span>
        <div className="min-w-0">
          <p className="text-body-sm font-semibold text-ink">{workerDisplayName(summary)}</p>
          <p className="flex items-center gap-1 text-body-sm text-ink">
            <Star className="size-4 fill-warning text-warning" aria-hidden />
            {summary.rating.toFixed(1)}
            <span className="sr-only">{COPY.ratingSr}</span>
          </p>
        </div>
      </div>
    );
  }

  const board = worker === undefined;
  const Icon = board ? ClipboardList : UserRound;
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-alt"
      >
        <Icon className="size-5 text-ink" />
      </span>
      <p className="text-body-sm font-semibold text-ink">
        {board ? COPY.board : COPY.workerFallback}
      </p>
    </div>
  );
}
