"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Stepper } from "@/components/flow/stepper";
import { Button } from "@/components/ui/button";
import { JOB_BUILDER_COPY } from "@/lib/constants";

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

function takeFocusRequest(): boolean {
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
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  /** Saves without validating, then navigates. */
  onBack: () => void;
  continueLabel?: string;
  /** Spinner on Continue (unused in T6; kept for T7). */
  loading?: boolean;
  /** The "Your job" summary panel. */
  summary: React.ReactNode;
  children: React.ReactNode;
};

const COPY = JOB_BUILDER_COPY;

/**
 * One flow step (T6; reused by T7 and T9): Stepper, heading, fields, the
 * summary and Back/Continue. From `lg` the summary is a sticky right column;
 * below `lg` it sits between the fields and the actions, and below `md` the
 * actions are a sticky footer.
 */
export function StepLayout({
  step,
  steps,
  titleId,
  title,
  description,
  onSubmit,
  onBack,
  continueLabel = COPY.actions.continue,
  loading = false,
  summary,
  children,
}: StepLayoutProps) {
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const statusId = `${titleId}-status`;

  React.useEffect(() => {
    if (takeFocusRequest()) headingRef.current?.focus();
  }, []);

  return (
    <div>
      <div className="mb-8 lg:mb-12">
        <Stepper
          steps={steps}
          current={step}
          ariaLabel={COPY.stepper.ariaLabel}
          statusId={statusId}
        />
      </div>
      <form
        noValidate
        onSubmit={onSubmit}
        className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:gap-y-8"
      >
        <div className="min-w-0 lg:col-span-8 lg:row-start-1 xl:col-span-7">
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
          <div className="mt-8 flex flex-col gap-8 *:scroll-mb-24 md:*:scroll-mb-0">{children}</div>
        </div>
        <div className="min-w-0 lg:sticky lg:top-8 lg:col-span-4 lg:row-span-2 lg:row-start-1 lg:self-start xl:col-start-9">
          {summary}
        </div>
        <div className="sticky bottom-0 z-40 -mx-4 flex gap-3 border-t border-border bg-surface px-4 pt-3 pb-safe md:static md:mx-0 md:justify-between md:px-0 md:pt-6 md:pb-0 lg:col-span-8 lg:row-start-2 xl:col-span-7">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowLeft aria-hidden />
            {COPY.actions.back}
          </Button>
          <Button type="submit" loading={loading} className="flex-1 md:flex-none">
            {continueLabel}
            {!loading && <ArrowRight aria-hidden />}
          </Button>
        </div>
      </form>
    </div>
  );
}
