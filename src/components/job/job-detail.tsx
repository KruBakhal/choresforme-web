import * as React from "react";
import { Info } from "lucide-react";

import { JobPhotosPlaceholder } from "@/components/job/job-photos-placeholder";
import { JobReceipt } from "@/components/job/job-receipt";
import { servicesText } from "@/components/job/job-summary-panel";
import { CATEGORY_ICONS, DASHBOARD_COPY, MATCH_TYPE_LABELS } from "@/lib/constants";
import { findCategory, formatDateTime, formatUsd, jobPrice } from "@/lib/job-builder";
import type { Job } from "@/lib/types";
import { cn } from "@/lib/utils";

type JobDetailProps = {
  job: Job;
  /** "Your worker" (a worker is assigned) or "Who" (on the job board). */
  workerTitle: string;
  /** The worker card, board line, skeleton or fallback (with the favourite toggle). */
  worker: React.ReactNode;
  /** `JobActions`, or null when the status allows none (no mobile bar). */
  actions: React.ReactNode | null;
  /** Completed jobs: the rate form or the "You rated N stars" block. */
  rate: React.ReactNode | null;
  /** For the receipt: "Jordan M." or "Your worker". */
  workerName: string;
};

const COPY = DASHBOARD_COPY.detail;

const row = "grid grid-cols-1 gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-3 sm:gap-4";
const dt = "text-body-sm font-semibold text-ink";
const dd = "text-body break-words text-ink sm:col-span-2";

function statusNote(job: Job): string | null {
  if (job.status === "accepted") return COPY.acceptedNote;
  if (job.status === "in_progress") return COPY.inProgressNote;
  return null;
}

function chargeNote(job: Job): string {
  if (job.status === "completed") return COPY.chargedNote;
  if (job.status === "cancelled") return COPY.cancelledNote;
  return COPY.chargeNote;
}

/**
 * The body of Job detail (Tech Spec inventory, T8 UI plan §5): "Details
 * left, sticky card right with worker, price and actions" from lg; stacked
 * with the actions at the top on tablet; stacked with a sticky action bar on
 * mobile. The side card comes first in the DOM at every width. Client only
 * (local dates).
 */
export function JobDetail({ job, workerTitle, worker, actions, rate, workerName }: JobDetailProps) {
  const price = jobPrice(job);
  const note = statusNote(job);
  const completed = job.status === "completed";
  const priceTitle = completed
    ? COPY.priceTotal
    : job.pricingType === "hourly"
      ? COPY.priceHourly
      : COPY.priceFixed;

  return (
    <div
      className={cn(
        "mt-8 flex flex-col gap-6 *:scroll-mb-bars md:*:scroll-mb-0 lg:flex-row-reverse lg:items-start lg:gap-8",
        actions && "pb-24 md:pb-0",
      )}
    >
      <aside aria-labelledby="job-card-title" className="lg:sticky lg:top-8 lg:w-80 lg:shrink-0">
        <div className="flex flex-col gap-6 rounded-lg border border-border bg-surface p-4 md:grid md:grid-cols-2 md:gap-6 md:p-6 lg:flex">
          <h2 id="job-card-title" className="sr-only">
            {COPY.cardTitle}
          </h2>
          <section aria-labelledby="job-worker-title" className="min-w-0">
            <h3 id="job-worker-title" className="text-body-sm font-semibold text-ink">
              {workerTitle}
            </h3>
            <div className="mt-3">{worker}</div>
          </section>
          <section
            aria-labelledby="job-price-title"
            className="min-w-0 border-t border-border pt-6 md:border-t-0 md:pt-0 lg:border-t lg:pt-6"
          >
            <h3 id="job-price-title" className="text-body-sm font-semibold text-ink">
              {priceTitle}
            </h3>
            <p className="mt-1 text-h3 font-semibold text-ink">
              {price.total === null ? "" : formatUsd(price.total)}
            </p>
            <p className="text-body-sm text-ink-muted">{price.breakdown}</p>
            <p className="mt-2 text-caption text-ink-muted">{chargeNote(job)}</p>
          </section>
          {note && (
            <p className="flex items-start gap-2 text-body-sm text-ink md:col-span-2">
              <Info className="size-4 shrink-0" aria-hidden />
              {note}
            </p>
          )}
          {actions && <div className="md:col-span-2">{actions}</div>}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-6 *:scroll-mb-bars md:*:scroll-mb-0">
        {rate}
        <JobDetailsSection job={job} />
        <JobPhotosPlaceholder count={job.photos.length} />
        {completed && <JobReceipt job={job} workerName={workerName} />}
      </div>
    </div>
  );
}

function JobDetailsSection({ job }: { job: Job }) {
  const category = findCategory(job.category);
  const CategoryIcon = CATEGORY_ICONS[job.category];
  const price = jobPrice(job);
  const total = price.total === null ? "" : formatUsd(price.total);
  const landmark = job.address.landmark?.trim();

  return (
    <section
      aria-labelledby="job-details-title"
      className="rounded-lg border border-border bg-surface p-4 md:p-6"
    >
      <h2 id="job-details-title" className="text-h4 font-semibold text-ink">
        {COPY.detailsTitle}
      </h2>
      <dl className="mt-4 divide-y divide-border">
        <div className={row}>
          <dt className={dt}>{COPY.rows.category}</dt>
          <dd className={cn(dd, "flex items-center gap-2")}>
            <CategoryIcon className="size-5 shrink-0" aria-hidden />
            {category?.name ?? job.category}
          </dd>
        </div>
        <div className={row}>
          <dt className={dt}>{COPY.rows.services}</dt>
          <dd className={dd}>{servicesText(job)}</dd>
        </div>
        <div className={row}>
          <dt className={dt}>{COPY.rows.where}</dt>
          <dd className={dd}>
            <span className="block">{job.address.line1}</span>
            <span className="block">
              {job.address.city}, {job.address.state} {job.address.zip}
            </span>
            {landmark && <span className="block text-ink-muted">{landmark}</span>}
          </dd>
        </div>
        <div className={row}>
          <dt className={dt}>{COPY.rows.description}</dt>
          <dd className={cn(dd, "whitespace-pre-line")}>{job.description}</dd>
        </div>
        <div className={row}>
          <dt className={dt}>{COPY.rows.price}</dt>
          <dd className={dd}>
            {job.pricingType === "hourly"
              ? COPY.priceHourlyRow(price.breakdown, total)
              : COPY.priceFixedRow(total)}
          </dd>
        </div>
        <div className={row}>
          <dt className={dt}>{COPY.rows.who}</dt>
          <dd className={dd}>{MATCH_TYPE_LABELS[job.matchType]}</dd>
        </div>
        <div className={row}>
          <dt className={dt}>{COPY.rows.posted}</dt>
          <dd className={dd}>
            <time dateTime={job.createdAt}>{formatDateTime(job.createdAt)}</time>
          </dd>
        </div>
        {job.completedAt && (
          <div className={row}>
            <dt className={dt}>{COPY.rows.completed}</dt>
            <dd className={dd}>
              <time dateTime={job.completedAt}>{formatDateTime(job.completedAt)}</time>
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
