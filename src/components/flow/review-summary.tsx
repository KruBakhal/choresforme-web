"use client";

import * as React from "react";
import Link from "next/link";
import { Info } from "lucide-react";

import { markStepNavigation } from "@/components/flow/step-layout";
import { servicesText } from "@/components/job/job-summary-panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CATEGORY_ICONS,
  JOB_BUILDER_COPY,
  JOB_STATUS_LABELS,
  MATCH_TYPE_LABELS,
  PRICING_TYPE_LABELS,
} from "@/lib/constants";
import { editFromReviewHref, estimatedTotal, findCategory, formatUsd } from "@/lib/job-builder";
import type { Job, JobDraft, JobStatus } from "@/lib/types";

export type ReviewWorker = { state: "loading" | "ready" | "error"; name?: string };

type ReviewSummaryProps = {
  source: { kind: "draft"; draft: JobDraft } | { kind: "job"; job: Job };
  /** Edit links back to steps 1–5 (step 6). */
  editable: boolean;
  titleId: string;
  title: string;
  /** Step 8 status chip. */
  status?: JobStatus;
  /** Direct jobs: the picked worker's name. */
  worker?: ReviewWorker;
  /** Step 6: retry a failed worker lookup. */
  onRetryWorker?: () => void;
};

const COPY = JOB_BUILDER_COPY.review;
const SUMMARY = JOB_BUILDER_COPY.summary;

type Section = { key: string; step: number; label: string; value: React.ReactNode };

/**
 * The whole job, section by section (T7, Tech Spec inventory): editable on
 * step 6 with an Edit link per section (`?from=review`), read only on step 8.
 * The estimate band holds no error text.
 */
export function ReviewSummary({
  source,
  editable,
  titleId,
  title,
  status,
  worker,
  onRetryWorker,
}: ReviewSummaryProps) {
  const job: Partial<Job> = source.kind === "draft" ? source.draft : source.job;

  const category = findCategory(job.category);
  const CategoryIcon = job.category ? CATEGORY_ICONS[job.category] : null;
  const address = job.address;
  const total = estimatedTotal(job.pricingType, job.amount, job.hours);
  const hourly = job.pricingType === "hourly";
  const breakdown =
    hourly && job.amount !== undefined && job.hours !== undefined
      ? SUMMARY.hourlyBreakdown(formatUsd(job.amount), job.hours)
      : null;
  const photoCount = job.photos?.length ?? 0;

  const sections: Section[] = [
    {
      key: "category",
      step: 1,
      label: SUMMARY.rows.category,
      value: category ? (
        <span className="inline-flex items-center gap-2">
          {CategoryIcon && <CategoryIcon className="size-5 shrink-0 text-ink" aria-hidden />}
          {category.name}
        </span>
      ) : null,
    },
    {
      key: "services",
      step: 2,
      label: SUMMARY.rows.services,
      value: servicesText(job),
    },
    {
      key: "where",
      step: 3,
      label: SUMMARY.rows.where,
      value: address ? (
        <>
          <span className="block">{address.line1}</span>
          <span className="block">
            {address.city}, {address.state} {address.zip}
          </span>
          {address.landmark?.trim() && (
            <span className="block text-ink-muted">{address.landmark.trim()}</span>
          )}
        </>
      ) : null,
    },
    {
      key: "details",
      step: 4,
      label: SUMMARY.rows.details,
      value: (
        <>
          {job.description && <span className="block whitespace-pre-line">{job.description}</span>}
          {photoCount > 0 && (
            <span className="block text-body-sm text-ink-muted">
              {SUMMARY.photoCount(photoCount)}
            </span>
          )}
          {total !== null && (
            <span className="block text-body-sm">
              {hourly && breakdown
                ? COPY.priceHourly(breakdown)
                : COPY.priceFixed(formatUsd(total))}
            </span>
          )}
        </>
      ),
    },
    {
      key: "who",
      step: 5,
      label: SUMMARY.rows.who,
      value:
        job.matchType === "direct" ? (
          <WhoDirect worker={worker} editable={editable} onRetry={onRetryWorker} />
        ) : (
          <>
            <span className="block">{MATCH_TYPE_LABELS.board}</span>
            <span className="block text-body-sm text-ink-muted">
              {JOB_BUILDER_COPY.match.boardDescription}
            </span>
          </>
        ),
    },
  ];

  return (
    <section aria-labelledby={titleId} className="rounded-lg border border-border bg-surface">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 pt-4 md:px-6 md:pt-6">
        <h2 id={titleId} className="text-h4 font-semibold text-ink">
          {title}
        </h2>
        {status && (
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-body-sm font-semibold text-ink">
            <span className="sr-only">{JOB_BUILDER_COPY.confirmation.statusSr}</span>
            {JOB_STATUS_LABELS[status]}
          </span>
        )}
      </header>
      <div className="mt-2 divide-y divide-border">
        {sections.map((section) => {
          const sectionTitleId = `review-${section.key}-title`;
          return (
            <section
              key={section.key}
              aria-labelledby={sectionTitleId}
              className="px-4 py-3 md:px-6 md:py-4"
            >
              <div className="flex min-h-11 items-center justify-between gap-4">
                <h3 id={sectionTitleId} className="text-body-sm font-semibold text-ink">
                  {section.label}
                </h3>
                {editable && (
                  <Button asChild variant="link" size="sm">
                    <Link href={editFromReviewHref(section.step)} onClick={markStepNavigation}>
                      {COPY.edit}
                      <span className="sr-only">{COPY.editSr(section.label)}</span>
                    </Link>
                  </Button>
                )}
              </div>
              <div className="mt-1 text-body break-words text-ink">
                {section.value ?? <span className="text-ink-muted">{SUMMARY.notAdded}</span>}
              </div>
            </section>
          );
        })}
      </div>
      <footer className="rounded-b-lg bg-surface-alt px-4 py-4 md:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <p className="text-body-sm font-semibold text-ink">{SUMMARY.estimateLabel}</p>
          <p className="text-h3 font-semibold text-ink">
            {total === null ? SUMMARY.estimateEmpty : formatUsd(total)}
          </p>
        </div>
        <p className="text-body-sm text-ink-muted">{breakdown ?? PRICING_TYPE_LABELS.fixed}</p>
        <p className="mt-2 text-caption text-ink-muted">{SUMMARY.chargeNote}</p>
      </footer>
    </section>
  );
}

function WhoDirect({
  worker,
  editable,
  onRetry,
}: {
  worker: ReviewWorker | undefined;
  editable: boolean;
  onRetry?: () => void;
}) {
  const label = `${MATCH_TYPE_LABELS.direct}:`;

  if (!worker || worker.state === "loading") {
    return (
      <span role="status" className="inline-flex items-center gap-2">
        {label}
        <Skeleton aria-hidden className="inline-block h-4 w-24" />
        <span className="sr-only">{COPY.workerLoading}</span>
      </span>
    );
  }

  const name = worker.state === "ready" && worker.name ? worker.name : COPY.workerFallback;
  return (
    <>
      <span className="block">
        {label} {name}
      </span>
      {worker.state === "error" && editable && (
        <p className="mt-2 flex items-start gap-2 text-body-sm text-ink-muted">
          <Info className="mt-1 size-4 shrink-0" aria-hidden />
          <span>
            {COPY.workerError}{" "}
            {onRetry && (
              <Button type="button" variant="link" size="sm" onClick={onRetry}>
                {COPY.workerRetry}
              </Button>
            )}
          </span>
        </p>
      )}
    </>
  );
}
