import { servicesText } from "@/components/job/job-summary-panel";
import { DASHBOARD_COPY } from "@/lib/constants";
import { formatDateTime, formatUsd, jobPrice } from "@/lib/job-builder";
import type { Job } from "@/lib/types";

const COPY = DASHBOARD_COPY.receipt;

const row = "grid grid-cols-1 gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-3 sm:gap-4";
const dt = "text-body-sm font-semibold text-ink";
const dd = "text-body break-words text-ink sm:col-span-2";

/**
 * The receipt of a completed job (T8 open question 11): reference, completed
 * date, services, worker, total and the charge rule. No card details (the
 * method used is not recorded) and no download. `#receipt` is History's
 * "View receipt" target. Client only (local dates).
 */
export function JobReceipt({ job, workerName }: { job: Job; workerName: string }) {
  const price = jobPrice(job);
  return (
    <section
      id="receipt"
      aria-labelledby="receipt-title"
      className="scroll-mt-24 rounded-lg border border-border bg-surface p-4 md:scroll-mt-8 md:p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2
          id="receipt-title"
          tabIndex={-1}
          className="text-h4 font-semibold text-ink outline-none focus-visible:outline-2"
        >
          {COPY.title}
        </h2>
        <p className="text-body-sm text-ink-muted">{DASHBOARD_COPY.detail.reference(job.id)}</p>
      </div>
      <dl className="mt-4 divide-y divide-border">
        {job.completedAt && (
          <div className={row}>
            <dt className={dt}>{COPY.completed}</dt>
            <dd className={dd}>
              <time dateTime={job.completedAt}>{formatDateTime(job.completedAt)}</time>
            </dd>
          </div>
        )}
        <div className={row}>
          <dt className={dt}>{COPY.services}</dt>
          <dd className={dd}>{servicesText(job)}</dd>
        </div>
        <div className={row}>
          <dt className={dt}>{COPY.worker}</dt>
          <dd className={dd}>{workerName}</dd>
        </div>
        {job.pricingType === "hourly" && (
          <div className={row}>
            <dt className={dt}>{COPY.rate}</dt>
            <dd className={dd}>{price.breakdown}</dd>
          </div>
        )}
      </dl>
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 border-t border-border pt-4">
        <p className="text-body font-semibold text-ink">{COPY.total}</p>
        <p className="text-h3 font-semibold text-ink">
          {price.total === null ? "" : formatUsd(price.total)}
        </p>
      </div>
      <p className="mt-2 text-caption text-ink-muted">{COPY.note}</p>
    </section>
  );
}
