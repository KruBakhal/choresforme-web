"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import {
  JOB_BUILDER_COPY,
  MATCH_TYPE_LABELS,
  OTHER_SUB_SERVICE,
  PRICING_TYPE_LABELS,
} from "@/lib/constants";
import { estimatedTotal, findCategory, formatUsd } from "@/lib/job-builder";
import type { JobDraft } from "@/lib/types";
import { cn } from "@/lib/utils";

type JobSummaryPanelProps = {
  /** The saved draft merged with the current step's live values. */
  draft: JobDraft;
  currentStep: number;
  /** "Jordan M." when a worker is picked and known. */
  workerName?: string;
};

const COPY = JOB_BUILDER_COPY.summary;
const TITLE_ID = "job-summary-title";
const BODY_ID = "job-summary-body";

function servicesText(draft: JobDraft): string | null {
  if (!draft.subServices?.length) return null;
  return draft.subServices
    .map((service) =>
      service === OTHER_SUB_SERVICE && draft.otherText?.trim()
        ? `${COPY.otherPrefix}${draft.otherText.trim()}`
        : service,
    )
    .join(", ");
}

function WhereValue({ draft }: { draft: JobDraft }) {
  const address = draft.address;
  const line1 = address?.line1?.trim();
  const place = [
    address?.city?.trim(),
    [address?.state, address?.zip?.trim()].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");
  const landmark = address?.landmark?.trim();
  if (!line1 && !place) return null;
  return (
    <>
      {line1 && <span className="block">{line1}</span>}
      {place && <span className="block">{place}</span>}
      {landmark && <span className="block text-ink-muted">{landmark}</span>}
    </>
  );
}

/**
 * "Your job" (T6): a live summary of the draft with the price estimate.
 * A sticky right column from `lg`, an open panel at tablet and a collapsible
 * bar on phones. It holds no errors and no live region.
 */
export function JobSummaryPanel({ draft, workerName }: JobSummaryPanelProps) {
  const [open, setOpen] = React.useState(false);

  const category = findCategory(draft.category)?.name ?? null;
  const services = servicesText(draft);
  const where = <WhereValue draft={draft} />;
  const hasWhere = !!(
    draft.address?.line1?.trim() ||
    draft.address?.city?.trim() ||
    draft.address?.zip?.trim() ||
    draft.address?.state
  );
  const description = draft.description?.trim() || null;
  const photoCount = draft.photos?.length ?? 0;
  const who =
    draft.matchType === "direct"
      ? workerName
        ? COPY.whoDirect(workerName)
        : MATCH_TYPE_LABELS.direct
      : draft.matchType === "board"
        ? MATCH_TYPE_LABELS.board
        : null;

  const total = estimatedTotal(draft.pricingType, draft.amount, draft.hours);
  const breakdown =
    total === null
      ? null
      : draft.pricingType === "hourly" && draft.amount !== undefined && draft.hours !== undefined
        ? COPY.hourlyBreakdown(formatUsd(draft.amount), draft.hours)
        : PRICING_TYPE_LABELS.fixed;

  const rows: { key: string; label: string; value: React.ReactNode | null }[] = [
    { key: "category", label: COPY.rows.category, value: category },
    { key: "services", label: COPY.rows.services, value: services },
    { key: "where", label: COPY.rows.where, value: hasWhere ? where : null },
    {
      key: "details",
      label: COPY.rows.details,
      value:
        description || photoCount ? (
          <>
            {description && <span className="line-clamp-3">{description}</span>}
            {photoCount > 0 && (
              <span className="block text-ink-muted">{COPY.photoCount(photoCount)}</span>
            )}
          </>
        ) : null,
    },
    { key: "who", label: COPY.rows.who, value: who },
  ];
  const allEmpty = rows.every((row) => row.value === null) && total === null;

  return (
    <aside aria-labelledby={TITLE_ID} className="rounded-lg bg-surface-alt md:p-6">
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
            {total === null ? COPY.barNoPrice : COPY.barEstimate(formatUsd(total))}
            <ChevronDown
              className={cn(
                "size-5 transition-transform motion-reduce:transition-none",
                open && "rotate-180",
              )}
              aria-hidden
            />
          </span>
        </button>
        <span className="hidden md:inline">{COPY.title}</span>
      </h2>
      <div id={BODY_ID} className={cn("px-4 pb-4 md:block md:p-0", open ? "block" : "hidden")}>
        {allEmpty && <p className="text-body-sm text-ink-muted md:mt-4">{COPY.emptyIntro}</p>}
        <dl className="mt-4 flex flex-col divide-y divide-border">
          {rows.map((row) => (
            <div key={row.key} className="flex flex-col gap-1 py-3 first:pt-0">
              <dt className="text-body-sm font-semibold text-ink">{row.label}</dt>
              <dd
                className={cn(
                  "text-body-sm break-words",
                  row.value === null ? "text-ink-muted" : "text-ink",
                )}
              >
                {row.value ?? COPY.notAdded}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 rounded-md bg-surface p-4">
          <p className="text-body-sm font-semibold text-ink">{COPY.estimateLabel}</p>
          {total === null ? (
            <p className="text-body text-ink-muted">{COPY.estimateEmpty}</p>
          ) : (
            <>
              <p className="text-h3 font-semibold text-ink">{formatUsd(total)}</p>
              {breakdown && <p className="text-body-sm text-ink-muted">{breakdown}</p>}
            </>
          )}
          <p className="mt-2 text-caption text-ink-muted">{COPY.chargeNote}</p>
        </div>
      </div>
    </aside>
  );
}
