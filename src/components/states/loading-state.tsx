import { WorkerCardSkeleton } from "@/components/job/worker-card";
import { Skeleton } from "@/components/ui/skeleton";
import { STATE_COPY } from "@/lib/constants";
import { cn } from "@/lib/utils";

type LoadingVariant = "cards" | "rows" | "detail" | "summary" | "workers" | "confirmation";

type LoadingStateProps = {
  /** Pick the variant that matches the final layout of the screen. */
  variant: LoadingVariant;
  /** Number of cards or rows. Defaults: 3 cards (and workers), 5 rows. */
  count?: number;
  /** Screen-reader label. */
  label?: string;
  className?: string;
};

const card = "rounded-lg border border-border bg-surface p-6";

function CardsSkeleton({ count }: { count: number }) {
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

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Actions card: on top at md, below on mobile, on the right from lg. */}
      <div className="order-2 md:order-1 lg:order-2 lg:w-80 lg:shrink-0">
        <div className={cn(card, "flex flex-col gap-3")}>
          <Skeleton className="size-12 rounded-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="mt-3 h-12 w-full" />
        </div>
      </div>
      <div className="order-1 flex flex-1 flex-col gap-6 md:order-2 lg:order-1">
        <Skeleton className="h-8 w-1/2" />
        <div className={cn(card, "flex flex-col gap-3")}>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
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
  label = STATE_COPY.loading,
  className,
}: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={cn("w-full", className)}>
      <span className="sr-only">{label}</span>
      <div aria-hidden>
        {variant === "cards" && <CardsSkeleton count={count ?? 3} />}
        {variant === "rows" && <RowsSkeleton count={count ?? 5} />}
        {variant === "detail" && <DetailSkeleton />}
        {variant === "summary" && <SummarySkeleton />}
        {variant === "workers" && <WorkersSkeleton count={count ?? 3} />}
        {variant === "confirmation" && <ConfirmationSkeleton />}
      </div>
    </div>
  );
}
