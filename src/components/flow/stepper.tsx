import { Check } from "lucide-react";

import { JOB_BUILDER_COPY } from "@/lib/constants";
import { cn } from "@/lib/utils";

type StepperProps = {
  steps: readonly { label: string }[];
  /** 1-based. */
  current: number;
  ariaLabel: string;
  /** Id of the "Step N of total" line, so the step heading can reference it. */
  statusId: string;
};

/* Static map: a computed `grid-cols-${n}` class would not be generated. */
const GRID_COLS: Record<number, string> = {
  5: "grid-cols-5",
  8: "grid-cols-8",
};

const COPY = JOB_BUILDER_COPY.stepper;

/**
 * Progress for a multi-step flow (T6; reused by T7 and T9): "Step N of
 * total", a segment per step and the step labels. Below `md` the labels are
 * screen-reader only and the visible line names the current and next steps.
 * No focusable elements; the step text always carries the information.
 */
export function Stepper({ steps, current, ariaLabel, statusId }: StepperProps) {
  const total = steps.length;
  const currentLabel = steps[current - 1]?.label ?? "";
  const nextLabel = steps[current]?.label;

  return (
    <nav aria-label={ariaLabel} className="w-full">
      <div className="flex items-baseline justify-between gap-4">
        <p id={statusId} className="text-body-sm font-semibold text-ink">
          {COPY.status(current, total)}
          <span className="sr-only">: {currentLabel}</span>
          <span className="md:hidden" aria-hidden>
            {" · "}
            {currentLabel}
          </span>
        </p>
        {nextLabel && (
          <p className="text-body-sm text-ink-muted md:hidden" aria-hidden>
            {COPY.next(nextLabel)}
          </p>
        )}
      </div>
      <ol className={cn("mt-3 grid gap-1 lg:gap-2", GRID_COLS[total] ?? "grid-cols-8")}>
        {steps.map((step, index) => {
          const number = index + 1;
          const state = number < current ? "done" : number === current ? "current" : "upcoming";
          return (
            <li
              key={step.label}
              aria-current={state === "current" ? "step" : undefined}
              className="flex min-w-0 flex-col gap-2"
            >
              <span
                aria-hidden
                className={cn("h-2 rounded-full", state === "upcoming" ? "bg-border" : "bg-brand")}
              />
              <span
                className={cn(
                  "sr-only md:not-sr-only md:flex md:items-center md:justify-center md:gap-1 md:text-center md:text-caption md:break-words lg:justify-start lg:text-left lg:text-body-sm",
                  state === "current" ? "font-semibold text-ink" : "text-ink-muted",
                )}
              >
                {state === "done" && (
                  <Check className="hidden size-4 shrink-0 text-ink md:block" aria-hidden />
                )}
                <span className="min-w-0">{step.label}</span>
                {state === "done" && <span className="sr-only">{COPY.done}</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
