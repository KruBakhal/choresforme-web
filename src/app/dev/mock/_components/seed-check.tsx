"use client";

import * as React from "react";
import { CircleAlert, CircleCheck, Database, Play } from "lucide-react";

import { useServiceCall } from "@/app/dev/mock/_components/use-service-call";
import { ResetDemoDataButton } from "@/components/layout/reset-demo-data-button";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import {
  DEV_MOCK_COPY,
  JOB_STATUS_LABELS,
  JOB_STATUSES,
  VERIFICATION_STATUS_LABELS,
} from "@/lib/constants";
import { getSeedSummary } from "@/lib/mock/services";
import type { SeedCounts, SeedSummary, VerificationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const C = DEV_MOCK_COPY;
const T = DEV_MOCK_COPY.seed.tiles;

type TileKey = keyof typeof T;

const TILE_KEYS: readonly TileKey[] = [
  "categories",
  "customers",
  "workers",
  "jobs",
  "templates",
  "paymentMethods",
];

/** Worker breakdown order: "4 verified · 1 under review · 1 rejected". */
const WORKER_STATUS_ORDER: readonly VerificationStatus[] = [
  "verified",
  "under_review",
  "rejected",
  "not_started",
];

function breakdown(counts: SeedCounts, key: TileKey): string | null {
  if (key === "workers") {
    return WORKER_STATUS_ORDER.filter((status) => counts.workersByStatus[status] > 0)
      .map(
        (status) =>
          `${counts.workersByStatus[status]} ${VERIFICATION_STATUS_LABELS[status].toLowerCase()}`,
      )
      .join(" · ");
  }
  if (key === "jobs") {
    return JOB_STATUSES.filter((status) => counts.jobsByStatus[status] > 0)
      .map((status) => `${counts.jobsByStatus[status]} ${JOB_STATUS_LABELS[status].toLowerCase()}`)
      .join(" · ");
  }
  return null;
}

const isEmptySummary = (value: unknown) =>
  TILE_KEYS.every((key) => (value as SeedSummary).current[key] === 0);

function Tile({ summary, tileKey }: { summary: SeedSummary; tileKey: TileKey }) {
  const current = summary.current[tileKey];
  const expected = summary.expected[tileKey];
  const matches = current === expected;
  const detail = breakdown(summary.current, tileKey);

  return (
    <li className="flex min-w-0 flex-col gap-1 rounded-lg border border-border bg-surface-alt p-4">
      <span className="text-body-sm break-words text-ink-muted">{T[tileKey]}</span>
      <span className="text-h3 font-semibold text-ink">{current}</span>
      <span className="text-caption text-ink-muted">{C.seed.expected(expected)}</span>
      <span className="mt-1 flex items-center gap-1 text-caption text-ink">
        {matches ? (
          <CircleCheck className="size-4 shrink-0 text-success" aria-hidden />
        ) : (
          <CircleAlert className="size-4 shrink-0 text-warning" aria-hidden />
        )}
        {matches ? C.seed.matches : C.seed.changed}
      </span>
      {detail && <span className="text-caption break-words text-ink-muted">{detail}</span>}
    </li>
  );
}

/** Loads the seed counts through `getSeedSummary()` and compares them with the seed. */
export function SeedCheck({ className }: { className?: string }) {
  const runButton = React.useRef<HTMLButtonElement>(null);
  const { state, execute } = useServiceCall(getSeedSummary, runButton, isEmptySummary);
  const loading = state.status === "loading";

  return (
    <section
      id="seed"
      aria-labelledby="seed-title"
      className={cn("scroll-mt-8 rounded-lg border border-border bg-surface p-4 md:p-6", className)}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 id="seed-title" className="text-h3">
            {C.seed.title}
          </h2>
          <p className="mt-1 text-body-sm text-ink-muted">{C.seed.intro}</p>
        </div>
        <Button
          ref={runButton}
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          loading={loading}
          onClick={execute}
        >
          {!loading && <Play aria-hidden />}
          {loading ? C.running : C.run}
          <span className="sr-only"> getSeedSummary</span>
        </Button>
      </div>

      <div className="mt-6">
        {state.status === "idle" && <p className="text-body-sm text-ink-muted">{C.seed.idle}</p>}
        {loading && !state.previousError && (
          <LoadingState variant="summary" label={C.seed.loading} />
        )}
        {(state.status === "error" || (loading && state.previousError)) && (
          <ErrorState
            headingLevel={3}
            className="py-8 md:py-8"
            title={C.serviceErrorTitle}
            message={state.status === "error" ? state.error.message : state.previousError?.message}
            onRetry={execute}
            isRetrying={loading}
          />
        )}
        {state.status === "empty" && (
          <EmptyState
            headingLevel={3}
            icon={Database}
            className="py-8 md:py-8"
            title={C.seed.emptyTitle}
            action={<ResetDemoDataButton appearance="button" />}
          />
        )}
        {state.status === "success" && (
          <div className="flex flex-col gap-3">
            <p role="status" className="text-body-sm text-ink-muted">
              {C.resolvedIn(state.ms)}
            </p>
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {TILE_KEYS.map((key) => (
                <Tile key={key} summary={state.value as SeedSummary} tileKey={key} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
