"use client";

import * as React from "react";
import { CircleAlert, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { STATE_COPY } from "@/lib/constants";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry: () => void;
  isRetrying?: boolean;
  retryLabel?: string;
  /** For example a "Back to dashboard" outline `Button`. */
  secondaryAction?: React.ReactNode;
  headingLevel?: 2 | 3 | 4;
  className?: string;
};

/** Error card with Retry. Announced with role="alert"; it never moves focus. */
export function ErrorState({
  title = STATE_COPY.errorTitle,
  message = STATE_COPY.errorMessage,
  onRetry,
  isRetrying = false,
  retryLabel = STATE_COPY.retry,
  secondaryAction,
  headingLevel = 2,
  className,
}: ErrorStateProps) {
  const Heading = headingLevel === 4 ? "h4" : headingLevel === 3 ? "h3" : "h2";

  return (
    <div
      role="alert"
      className={cn(
        "w-full rounded-lg border border-border bg-surface px-4 py-12 md:px-6 md:py-16",
        className,
      )}
    >
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-surface-alt">
          <CircleAlert className="size-6 text-danger" aria-hidden />
        </span>
        <Heading className="mt-4 text-h4 font-semibold text-ink">{title}</Heading>
        <p className="mt-2 text-body text-ink-muted">{message}</p>
        <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
          <Button onClick={onRetry} loading={isRetrying}>
            {!isRetrying && <RotateCw aria-hidden />}
            {isRetrying ? STATE_COPY.retrying : retryLabel}
          </Button>
          {secondaryAction}
        </div>
      </div>
    </div>
  );
}
