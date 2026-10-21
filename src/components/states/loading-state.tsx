import { WorkerCardSkeleton } from "@/components/job/worker-card";
import { Skeleton } from "@/components/ui/skeleton";
import { STATE_COPY } from "@/lib/constants";
import { cn } from "@/lib/utils";

type LoadingVariant = "cards" | "rows" | "detail" | "summary" | "workers" | "confirmation" | "form";

type LoadingStateProps = {
  /** Pick the variant that matches the final layout of the screen. */
  variant: LoadingVariant;
  /** Number of cards or rows. Defaults: 3 cards (and workers), 5 rows. */
  count?: number;
  /** `cards` only: 3 (the responsive grid, default) or 1 (a single column of job cards, T8 Home). */
  columns?: 1 | 3;
  /** Screen-reader label. */
  label?: string;
  className?: string;
};

const card = "rounded-lg border border-border bg-surface p-6";

function CardsSkeleton({ count, columns }: { count: number; columns: 1 | 3 }) {
  if (columns === 1) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: count }, (_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={cn(card, "flex flex-col gap-3")}>
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-3 h-11 w-1/3" />
        </div>
      ))}
    </div>
  );
}

/** The `JobCard` shape (T8): status line, title, two lines and the footer. */
function JobCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 md:p-6">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex items-start gap-4">
        <Skeleton className="size-10 shrink-0 rounded-md md:size-12" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
      <div className="flex items-end justify-between gap-6 border-t border-border pt-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-7 w-16" />
      </div>
    </div>
  );
}

/** Step 5 Pick a Worker (T6): worker cards in the worker grid. */
function WorkersSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <WorkerCardSkeleton key={i} />
      ))}
    </div>
  );
}

function RowsSkeleton({ count }: { count: number }) {
  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-surface">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4 md:px-6">
          <Skeleton className="size-11 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <Skeleton className="h-4 w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}

/**
 * T8 Job detail: the header, then the side card (DOM first; on the right
 * from lg) and the detail sections, in the real layout's order.
 */
function DetailSkeleton() {
  return (
    <div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <div className="mt-8 flex flex-col gap-6 lg:flex-row-reverse lg:items-start lg:gap-8">
        <div className="lg:w-80 lg:shrink-0">
          <div className={cn(card, "flex flex-col gap-3")}>
            <Skeleton className="size-12 rounded-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="mt-3 h-8 w-1/3" />
            <Skeleton className="mt-3 h-12 w-full" />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div className={cn(card, "flex flex-col gap-3")}>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className={cn(card, "flex flex-col gap-3")}>
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** T8 Edit job: three section cards of labelled fields. */
function FormSkeleton() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-8">
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 md:p-6"
        >
          <Skeleton className="h-6 w-1/3" />
          {Array.from({ length: 2 }, (_, j) => (
            <div key={j} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className={cn(card, "flex flex-col gap-3")}>
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-2/3" />
          </div>
        ))}
      </div>
      <div className="mt-8">
        <RowsSkeleton count={3} />
      </div>
    </div>
  );
}

/** Step 8 Confirmation (T7): the centred column. */
function ConfirmationSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <div>
        <Skeleton className="size-12 rounded-full" />
        <Skeleton className="mt-4 h-8 w-1/2" />
        <Skeleton className="mt-2 h-4 w-2/3" />
      </div>
      <div className="flex flex-col gap-4 rounded-lg bg-surface-alt p-4 md:p-6">
        <Skeleton className="h-6 w-1/3" />
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      <div className="flex flex-col gap-4 rounded-lg border border-border p-4 md:p-6">
        <Skeleton className="h-6 w-1/3" />
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-4 w-2/3" />
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-12 w-full sm:w-1/3" />
        <Skeleton className="h-12 w-full sm:w-1/3" />
      </div>
    </div>
  );
}

/** Skeleton placeholder that matches the final layout of a data screen. */
export function LoadingState({
  variant,
  count,
  columns = 3,
  label = STATE_COPY.loading,
  className,
}: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={cn("w-full", className)}>
      <span className="sr-only">{label}</span>
      <div aria-hidden>
        {variant === "cards" && <CardsSkeleton count={count ?? 3} columns={columns} />}
        {variant === "rows" && <RowsSkeleton count={count ?? 5} />}
        {variant === "detail" && <DetailSkeleton />}
        {variant === "summary" && <SummarySkeleton />}
        {variant === "workers" && <WorkersSkeleton count={count ?? 3} />}
        {variant === "confirmation" && <ConfirmationSkeleton />}
        {variant === "form" && <FormSkeleton />}
      </div>
    </div>
  );
}
