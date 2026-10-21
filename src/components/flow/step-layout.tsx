"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Stepper } from "@/components/flow/stepper";
import { Button } from "@/components/ui/button";
import { JOB_BUILDER_COPY } from "@/lib/constants";
import { cn } from "@/lib/utils";

/*
 * Focus on step change (T6 UI plan §4.4): Back, Continue and in-flow links
 * call `markStepNavigation()` before navigating; the next step's heading takes
 * focus when it mounts. A hard load, a reload or a guard redirect never moves
 * focus. The request expires (the next route may still be compiling in dev)
 * and is dropped shortly after the first heading takes it, not at once,
 * because a route restored by Cache Components remounts its view right after
 * it is shown.
 */
const FOCUS_REQUEST_MS = 10_000;
const FOCUS_SETTLE_MS = 500;
let focusHeadingUntil = 0;

export function markStepNavigation(): void {
  focusHeadingUntil = Date.now() + FOCUS_REQUEST_MS;
}

/**
 * True once after `markStepNavigation()`: the view that takes it focuses its
 * heading. Exported for flow views without `StepLayout` (T7 Confirmation).
 */
export function takeFocusRequest(): boolean {
  if (Date.now() >= focusHeadingUntil) return false;
  const until = focusHeadingUntil;
  setTimeout(() => {
    if (focusHeadingUntil === until) focusHeadingUntil = 0;
  }, FOCUS_SETTLE_MS);
  return true;
}

type StepLayoutProps = {
  step: number;
  steps: readonly { label: string }[];
  titleId: string;
  title: string;
  description?: React.ReactNode;
  /** Under the description (T7: Review's "Create an account to continue" jump link). */
  afterDescription?: React.ReactNode;
  /**
   * `form` (default) wraps the step in one `<form>`. `div` (T7 Review) lets
   * the step render its own form and other forms in the aside, which cannot
   * nest inside one.
   */
  as?: "form" | "div";
  /** Required with `as="form"`. */
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  /** Saves without validating, then navigates. Omitted (T9 Your area): no Back button. */
  onBack?: () => void;
  backDisabled?: boolean;
  continueLabel?: string;
  /** Spinner on Continue (T7 Payment: "Posting your job…"). */
  loading?: boolean;
  /** T7 Payment: nothing to submit while the saved cards load or failed. */
  continueDisabled?: boolean;
  /** Back only (T7 Review: Continue lives on the Post card). */
  hideContinue?: boolean;
  /** `summary` (default, 4 columns) or `wide` (T7 Review: 6 at lg, 5 at xl). */
  asideWidth?: "summary" | "wide";
  /** Sticky aside from `lg` (default true). */
  asideSticky?: boolean;
  /** Below `lg`, the aside comes before the fields (T7 Payment). */
  summaryFirst?: boolean;
  /** The "Your job" summary panel (or T7 Review's auth panel). */
  summary: React.ReactNode;
  /** The Stepper's accessible name (default "Job progress"; T9 "Onboarding progress"). */
  stepperLabel?: string;
  /** Passed to `Stepper` (T9: steps done in any order). */
  stepperDoneSteps?: readonly number[];
  /** Passed to `Stepper` (T9: a step outside the count, with `step={0}`). */
  stepperStatusText?: string;
  children: React.ReactNode;
};

const COPY = JOB_BUILDER_COPY;

/* Static class maps: computed class strings would not be generated. */
const MAIN_COLUMN = {
  summary: "min-w-0 lg:col-span-8 lg:col-start-1 lg:row-start-1 xl:col-span-7",
  wide: "min-w-0 lg:col-span-6 lg:col-start-1 lg:row-start-1 xl:col-span-7",
} as const;

const ASIDE_COLUMN = {
  summary: "min-w-0 lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1 lg:self-start",
  wide: "min-w-0 lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:self-start xl:col-span-5 xl:col-start-8",
} as const;

/*
 * `lg:self-start`: the aside spans both rows, so when it is taller than the
 * fields (T9 "Your progress") row 2 grows; the actions keep their own height
 * instead of stretching (and stretching the wrap-safe Continue with them).
 */
const ACTIONS_COLUMN = {
  summary: "lg:col-span-8 lg:col-start-1 lg:row-start-2 lg:self-start xl:col-span-7",
  wide: "lg:col-span-6 lg:col-start-1 lg:row-start-2 lg:self-start xl:col-span-7",
} as const;

const GRID = "flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:gap-y-8";

/**
 * One flow step (T6; reused by T7 and T9): Stepper, heading, fields, the
 * summary and Back/Continue. From `lg` the summary is a sticky right column;
 * below `lg` it sits between the fields and the actions (or before the
 * fields with `summaryFirst`), and below `md` the actions are a sticky
 * footer.
 */
export function StepLayout({
  step,
  steps,
  titleId,
  title,
  description,
  afterDescription,
  as = "form",
  onSubmit,
  onBack,
  backDisabled = false,
  continueLabel = COPY.actions.continue,
  loading = false,
  continueDisabled = false,
  hideContinue = false,
  asideWidth = "summary",
  asideSticky = true,
  summaryFirst = false,
  summary,
  stepperLabel = COPY.stepper.ariaLabel,
  stepperDoneSteps,
  stepperStatusText,
  children,
}: StepLayoutProps) {
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const statusId = `${titleId}-status`;

  React.useEffect(() => {
    if (takeFocusRequest()) headingRef.current?.focus();
  }, []);

  const main = (
    <div className={MAIN_COLUMN[asideWidth]}>
      <h1
        ref={headingRef}
        id={titleId}
        tabIndex={-1}
        aria-describedby={statusId}
        className="text-h3 outline-none focus-visible:outline-2 md:text-h2"
      >
        {title}
      </h1>
      {description && <p className="mt-2 text-body text-ink-muted">{description}</p>}
      {afterDescription}
      <div className="mt-8 flex flex-col gap-8 *:scroll-mb-24 md:*:scroll-mb-0">{children}</div>
    </div>
  );

  const aside = (
    <div className={cn(ASIDE_COLUMN[asideWidth], asideSticky && "lg:sticky lg:top-8")}>
      {summary}
    </div>
  );

  const actions = (
    <div
      className={cn(
        "sticky bottom-0 z-40 -mx-4 flex gap-3 border-t border-border bg-surface px-4 pt-3 pb-safe md:static md:mx-0 md:justify-between md:px-0 md:pt-6 md:pb-0",
        !onBack && "md:justify-end",
        ACTIONS_COLUMN[asideWidth],
      )}
    >
      {onBack && (
        <Button type="button" variant="outline" onClick={onBack} disabled={backDisabled}>
          <ArrowLeft aria-hidden />
          {COPY.actions.back}
        </Button>
      )}
      {!hideContinue && (
        <Button
          type="submit"
          loading={loading}
          disabled={continueDisabled}
          className="h-auto min-h-12 flex-1 py-3 text-center whitespace-normal md:flex-none"
        >
          {continueLabel}
          {!loading && <ArrowRight aria-hidden />}
        </Button>
      )}
    </div>
  );

  const body = summaryFirst ? (
    <>
      {aside}
      {main}
      {actions}
    </>
  ) : (
    <>
      {main}
      {aside}
      {actions}
    </>
  );

  return (
    <div>
      <div className="mb-8 lg:mb-12">
        <Stepper
          steps={steps}
          current={step}
          ariaLabel={stepperLabel}
          statusId={statusId}
          doneSteps={stepperDoneSteps}
          statusText={stepperStatusText}
        />
      </div>
      {as === "form" ? (
        <form noValidate onSubmit={onSubmit} className={GRID}>
          {body}
        </form>
      ) : (
        <div className={GRID}>{body}</div>
      )}
    </div>
  );
}
