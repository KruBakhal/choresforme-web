import * as React from "react";
import { Heart, Star } from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { CardIndicator, selectableCardClasses } from "@/components/flow/card-indicator";
import { Skeleton } from "@/components/ui/skeleton";
import { ID_CARD_PREVIEW_SAMPLE, JOB_BUILDER_COPY } from "@/lib/constants";
import { workerDisplayName, workerInitials } from "@/lib/job-builder";
import type { WorkerSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

type RadioWorkerCardProps = {
  /** A radio item in the Step 5 worker `RadioGroup` (default). */
  variant?: "radio";
  worker: WorkerSummary;
  favourite: boolean;
  invalid?: boolean;
  /** The group error id while an error shows. */
  describedBy?: string;
  ref?: React.Ref<HTMLButtonElement>;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
};

type DisplayWorkerCardProps = {
  /** T8: a plain, non-interactive card (Job detail, Favourite Workers). */
  variant: "display";
  worker: WorkerSummary;
  favourite: boolean;
  /** Own border and padding (default). False inside a card that already has a frame. */
  bordered?: boolean;
  /** The caller's button(s), below the details (never inside a control). */
  action?: React.ReactNode;
  className?: string;
};

type WorkerCardProps = RadioWorkerCardProps | DisplayWorkerCardProps;

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

/** Favourite tag, name, rating, jobs done and ID-Card badges (both variants). */
function WorkerDetails({ worker, favourite }: { worker: WorkerSummary; favourite: boolean }) {
  const nameId = `worker-${worker.id}-name`;
  const metaId = `worker-${worker.id}-meta`;
  return (
    <>
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
    </>
  );
}

/**
 * A verified worker on Step 5 (T6; T8 favourites): initials avatar, "Jordan
 * M.", rating and jobs done, ID-Card badges and a Favourite tag. By default a
 * radio in the worker `RadioGroup`, with the same frame as `SelectableCard`;
 * `variant="display"` is a plain card with optional action buttons (T8).
 */
export function WorkerCard(props: WorkerCardProps) {
  if (props.variant === "display") return <DisplayWorkerCard {...props} />;

  const { worker, favourite, invalid, describedBy, ref, onBlur } = props;
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
        <WorkerDetails worker={worker} favourite={favourite} />
      </span>
      <CardIndicator type="radio" className="absolute top-4 right-4 md:top-6 md:right-6" />
    </RadioGroupPrimitive.Item>
  );
}

/** Always a row (avatar left, details right), with no hover and no control semantics. */
function DisplayWorkerCard({
  worker,
  favourite,
  bordered = true,
  action,
  className,
}: DisplayWorkerCardProps) {
  return (
    <div
      className={cn(
        "flex w-full items-start gap-4",
        bordered && "rounded-lg border border-border bg-surface p-4",
        className,
      )}
    >
      <span
        aria-hidden
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-body font-semibold text-ink"
      >
        {workerInitials(worker)}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <WorkerDetails worker={worker} favourite={favourite} />
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
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
