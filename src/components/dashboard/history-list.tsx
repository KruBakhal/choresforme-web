"use client";

import * as React from "react";
import Link from "next/link";
import { History, ReceiptText, Repeat, Star } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { usePageTitleFocus } from "@/components/dashboard/use-page-title-focus";
import { useRepost, type RepostSource } from "@/components/dashboard/use-repost";
import {
  isActiveJob,
  jobWorker,
  lookupWorkers,
  type WorkerLookup,
} from "@/components/dashboard/worker-lookup";
import { jobDetailHref } from "@/components/job/job-card";
import { servicesText } from "@/components/job/job-summary-panel";
import { StatusBadge } from "@/components/job/status-badge";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { DASHBOARD_COPY, NAV_ITEMS } from "@/lib/constants";
import {
  findCategory,
  formatDate,
  formatUsd,
  jobPrice,
  workerDisplayName,
} from "@/lib/job-builder";
import { useRevisitKey } from "@/lib/hooks/use-revisit-key";
import { jobs as jobService } from "@/lib/mock/services";
import { useSessionStore } from "@/lib/store";
import type { Job } from "@/lib/types";

type HistoryState =
  | { status: "loading" }
  | { status: "error"; retrying: boolean }
  | { status: "ready"; jobs: Job[]; lookup: WorkerLookup };

const COPY = DASHBOARD_COPY.history;
const JOBS_HREF = NAV_ITEMS.customer[1].href;

/** Completed jobs sort by `completedAt`, cancelled ones by `createdAt` (open question 4). */
const sortDate = (job: Job) => job.completedAt ?? job.createdAt;

/** `/dashboard/history`: completed and cancelled jobs. Keyed per visit (`useRevisitKey`). */
export function HistoryList() {
  const revisitKey = useRevisitKey();
  return <HistoryView key={revisitKey} />;
}

function HistoryView() {
  const userId = useSessionStore((state) => state.session?.user.id ?? null);
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const [history, setHistory] = React.useState<HistoryState>({ status: "loading" });
  const { repost, openingId, dialog } = useRepost();
  const startedOnMount = React.useRef(false);

  usePageTitleFocus(titleRef, true);

  const load = React.useCallback(async () => {
    if (!userId) return;
    try {
      const all = await jobService.listForCustomer(userId);
      const past = all
        .filter((job) => !isActiveJob(job))
        .sort((a, b) => sortDate(b).localeCompare(sortDate(a)));
      setHistory({ status: "ready", jobs: past, lookup: await lookupWorkers(past) });
    } catch {
      setHistory({ status: "error", retrying: false });
    }
  }, [userId]);

  React.useEffect(() => {
    // Once per mount (Strict Mode runs effects twice; a second request would hide a ?mockError=1 failure).
    if (startedOnMount.current) return;
    startedOnMount.current = true;
    void load();
  }, [load]);

  const rows =
    history.status === "ready" ? history.jobs.map((job) => toRow(job, history.lookup)) : [];
  const onRepost = (job: Job) => repost({ kind: "job", job } satisfies RepostSource);

  return (
    <div>
      <PageHeader titleRef={titleRef} title={COPY.title} description={COPY.description} />

      {history.status === "loading" && (
        <LoadingState variant="rows" count={5} label={COPY.loading} />
      )}
      {history.status === "error" && (
        <ErrorState
          headingLevel={2}
          isRetrying={history.retrying}
          onRetry={() => {
            setHistory({ status: "error", retrying: true });
            void load();
          }}
        />
      )}
      {history.status === "ready" && rows.length === 0 && (
        <EmptyState
          headingLevel={2}
          icon={History}
          title={COPY.emptyTitle}
          description={COPY.emptyDescription}
          action={
            <Button asChild variant="outline">
              <Link href={JOBS_HREF}>{COPY.viewActive}</Link>
            </Button>
          }
        />
      )}
      {rows.length > 0 && (
        <>
          <HistoryTable rows={rows} openingId={openingId} onRepost={onRepost} />
          <HistoryCards rows={rows} openingId={openingId} onRepost={onRepost} />
        </>
      )}
      {dialog}
    </div>
  );
}

type Row = {
  job: Job;
  category: string;
  services: string;
  /** "Completed Oct 21, 2026" | "Posted Oct 2, 2026". */
  when: string;
  workerName: string | null;
  amount: string | null;
  completed: boolean;
  rated: number | undefined;
};

function toRow(job: Job, lookup: WorkerLookup): Row {
  const worker = jobWorker(job, lookup);
  const completed = job.status === "completed";
  const total = jobPrice(job).total;
  return {
    job,
    category: findCategory(job.category)?.name ?? job.category,
    services: servicesText(job) ?? "",
    when: completed
      ? COPY.completedOn(formatDate(sortDate(job)))
      : COPY.postedOn(formatDate(job.createdAt)),
    workerName: !worker
      ? null
      : worker.state === "ready"
        ? workerDisplayName(worker.summary)
        : COPY.workerFallback,
    // Cancelled jobs show no amount: the cancellation fee rule is still open.
    amount: completed && total !== null ? formatUsd(total) : null,
    completed,
    rated: job.customerRating,
  };
}

type RowsProps = {
  rows: Row[];
  openingId: string | null;
  onRepost: (job: Job) => void;
};

function WorkerCell({ row }: { row: Row }) {
  return (
    <>
      {row.workerName ? (
        <p className="text-body-sm font-semibold text-ink">{row.workerName}</p>
      ) : (
        <p className="text-body-sm text-ink-muted">{COPY.noWorker}</p>
      )}
      {row.completed && (
        <p className="text-body-sm text-ink-muted">
          {row.rated !== undefined ? COPY.rated(row.rated) : COPY.notRated}
        </p>
      )}
    </>
  );
}

function Amount({ row, className }: { row: Row; className: string }) {
  if (row.amount) return <p className={className}>{row.amount}</p>;
  return (
    <p className={className}>
      <span aria-hidden>—</span>
      <span className="sr-only">{COPY.noAmountSr}</span>
    </p>
  );
}

/** Re-post, Rate (completed, unrated) and View receipt (completed). */
function RowActions({
  row,
  openingId,
  onRepost,
  variant,
}: {
  row: Row;
  openingId: string | null;
  onRepost: (job: Job) => void;
  variant: "link" | "outline";
}) {
  const sr = <span className="sr-only">{COPY.rowSr(row.category, row.when)}</span>;
  const opening = openingId === row.job.id;
  const outline = variant === "outline";
  return (
    <>
      <Button
        type="button"
        variant={variant}
        size="sm"
        className={outline ? undefined : "min-h-11"}
        loading={opening}
        disabled={!!openingId && !opening}
        onClick={() => onRepost(row.job)}
      >
        {outline && !opening && <Repeat aria-hidden />}
        {opening ? COPY.reposting : COPY.repost}
        {sr}
      </Button>
      {row.completed && row.rated === undefined && (
        <Button asChild variant={variant} size="sm" className={outline ? undefined : "min-h-11"}>
          <Link href={jobDetailHref(row.job.id, "rate")}>
            {outline && <Star aria-hidden />}
            {COPY.rate}
            {sr}
          </Link>
        </Button>
      )}
      {row.completed && (
        <Button asChild variant={variant} size="sm" className={outline ? undefined : "min-h-11"}>
          <Link href={jobDetailHref(row.job.id, "receipt")}>
            {outline && <ReceiptText aria-hidden />}
            {COPY.viewReceipt}
            {sr}
          </Link>
        </Button>
      )}
    </>
  );
}

/** Tablet and desktop: a table that never scrolls sideways (open question 16). */
function HistoryTable({ rows, openingId, onRepost }: RowsProps) {
  const th = "px-4 py-3 text-body-sm font-semibold text-ink";
  return (
    <div className="hidden rounded-lg border border-border bg-surface md:block">
      <table className="w-full table-auto text-left">
        <caption className="sr-only">{COPY.caption}</caption>
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className={th}>
              {COPY.columns.job}
            </th>
            <th scope="col" className={th}>
              {COPY.columns.worker}
            </th>
            <th scope="col" className={`${th} text-right`}>
              {COPY.columns.amount}
            </th>
            <th scope="col" className={`${th} hidden xl:table-cell`}>
              {COPY.columns.status}
            </th>
            <th scope="col" className={th}>
              {COPY.columns.actions}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.job.id}>
              <td className="px-4 py-4 align-top">
                <h2 className="text-body font-semibold text-ink">
                  <Link
                    href={jobDetailHref(row.job.id)}
                    className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
                  >
                    {row.category}
                    <span className="sr-only">{COPY.titleSr(row.when)}</span>
                  </Link>
                </h2>
                <p className="line-clamp-2 text-body-sm break-words text-ink">{row.services}</p>
                <p className="text-body-sm text-ink-muted">{row.when}</p>
                <div className="mt-2 xl:hidden">
                  <StatusBadge status={row.job.status} />
                </div>
              </td>
              <td className="px-4 py-4 align-top">
                <WorkerCell row={row} />
              </td>
              <td className="px-4 py-4 text-right align-top">
                <Amount row={row} className="text-body font-semibold text-ink" />
              </td>
              <td className="hidden px-4 py-4 align-top xl:table-cell">
                <StatusBadge status={row.job.status} />
              </td>
              <td className="px-4 py-4 align-top">
                <div className="flex flex-col items-start xl:flex-row xl:flex-wrap xl:gap-x-4">
                  <RowActions row={row} openingId={openingId} onRepost={onRepost} variant="link" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Mobile: one card per job. */
function HistoryCards({ rows, openingId, onRepost }: RowsProps) {
  return (
    <ul className="flex flex-col gap-4 md:hidden">
      {rows.map((row) => (
        <li key={row.job.id}>
          <article className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <StatusBadge status={row.job.status} />
              <p className="text-body-sm text-ink-muted">{row.when}</p>
            </div>
            <div>
              <h2 className="text-body font-semibold text-ink">
                <Link
                  href={jobDetailHref(row.job.id)}
                  className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
                >
                  {row.category}
                  <span className="sr-only">{COPY.titleSr(row.when)}</span>
                </Link>
              </h2>
              <p className="line-clamp-2 text-body-sm break-words text-ink">{row.services}</p>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
              <div>
                <WorkerCell row={row} />
              </div>
              <Amount row={row} className="text-h4 font-semibold text-ink" />
            </div>
            <div className="flex flex-wrap gap-2 border-t border-border pt-3">
              <RowActions row={row} openingId={openingId} onRepost={onRepost} variant="outline" />
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
