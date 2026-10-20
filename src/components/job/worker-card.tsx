import * as React from "react";
import { Heart, Star } from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { CardIndicator, selectableCardClasses } from "@/components/flow/card-indicator";
import { Skeleton } from "@/components/ui/skeleton";
import { ID_CARD_PREVIEW_SAMPLE, JOB_BUILDER_COPY } from "@/lib/constants";
import { workerDisplayName, workerInitials } from "@/lib/job-builder";
import type { WorkerSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

type WorkerCardProps = {
  worker: WorkerSummary;
  favourite: boolean;
  invalid?: boolean;
  /** The group error id while an error shows. */
  describedBy?: string;
  ref?: React.Ref<HTMLButtonElement>;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
};

const COPY = JOB_BUILDER_COPY.match;
const [PHONE_ROW, ID_ROW, INSURANCE_ROW] = ID_CARD_PREVIEW_SAMPLE.rows;

function badgesFor(worker: WorkerSummary) {
  return [
    worker.phoneVerified && { ...PHONE_ROW, label: COPY.badges.phone },
    worker.idStatus === "verified" && { ...ID_ROW, label: COPY.badges.id },
    worker.insuranceStatus === "verified" && { ...INSURANCE_ROW, label: COPY.badges.insurance },
  ].filter((badge): badge is NonNullable<typeof badge> & object => !!badge);
}

const frame = "p-4 md:flex-col md:p-6";

/**
 * A verified worker on Step 5 (T6; T8 favourites): initials avatar, "Jordan
 * M.", rating and jobs done, ID-Card badges and a Favourite tag. A radio in
 * the worker `RadioGroup`; the same frame as `SelectableCard`.
 */
export function WorkerCard({
  worker,
  favourite,
  invalid,
  describedBy,
  ref,
  onBlur,
}: WorkerCardProps) {
  const nameId = `worker-${worker.id}-name`;
  const metaId = `worker-${worker.id}-meta`;

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      value={worker.id}
      onBlur={onBlur}
      aria-labelledby={nameId}
      aria-describedby={[metaId, describedBy].filter(Boolean).join(" ")}
      aria-invalid={invalid || undefined}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.closest("form")?.requestSubmit();
      }}
      className={cn(selectableCardClasses(invalid), "gap-4", frame)}
    >
      <span
        aria-hidden
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-body font-semibold text-ink group-data-[state=checked]/card:bg-surface"
      >
        {workerInitials(worker)}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-2 pr-8">
        {favourite && (
          <span className="inline-flex w-fit items-center gap-1 rounded-full border border-input bg-surface px-2 py-1 text-caption font-semibold text-ink">
            <Heart className="size-4" aria-hidden />
            {COPY.favourite}
          </span>
        )}
        <span id={nameId} className="text-body font-semibold text-ink">
          {workerDisplayName(worker)}
        </span>
        <span id={metaId} className="flex flex-col gap-2">
          {favourite && <span className="sr-only">{COPY.favouriteSr}. </span>}
          <span className="flex flex-wrap items-center gap-x-2 text-body-sm text-ink">
            <Star className="size-4 fill-warning text-warning" aria-hidden />
            <span>
              {worker.rating.toFixed(1)}
              <span className="sr-only">{COPY.ratingSr}</span>
            </span>
            <span className="text-ink-muted">· {COPY.jobsDone(worker.jobsCompleted)}</span>
          </span>
          <span role="list" aria-label={COPY.badgesLabel} className="flex flex-wrap gap-2">
            {badgesFor(worker).map(({ icon: Icon, label }) => (
              <span
                key={label}
                role="listitem"
                className="inline-flex items-center gap-1 rounded-full border border-input bg-surface px-2 py-1 text-caption text-ink"
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </span>
            ))}
          </span>
        </span>
      </span>
      <CardIndicator type="radio" className="absolute top-4 right-4 md:top-6 md:right-6" />
    </RadioGroupPrimitive.Item>
  );
}

/** Placeholder with the same frame as `WorkerCard`. */
export function WorkerCardSkeleton() {
  return (
    <div className={cn("flex w-full gap-4 rounded-lg border-2 border-border bg-surface", frame)}>
      <Skeleton className="size-12 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-1/4 rounded-full" />
          <Skeleton className="h-6 w-1/4 rounded-full" />
          <Skeleton className="h-6 w-1/4 rounded-full" />
        </div>
      </div>
    </div>
  );
}
