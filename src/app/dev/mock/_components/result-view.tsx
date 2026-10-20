"use client";

import { Inbox } from "lucide-react";

import { JsonBlock } from "@/app/dev/mock/_components/json-block";
import type { CallError, CallState } from "@/app/dev/mock/_components/use-service-call";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { DEV_MOCK_COPY as C } from "@/lib/constants";

type ResultViewProps = {
  name: string;
  state: CallState;
  onRetry: () => void;
};

const compactCard = "py-8 md:py-8";

function StatusLine({ children }: { children: string }) {
  return (
    <p role="status" className="text-body-sm text-ink-muted">
      {children}
    </p>
  );
}

function CallErrorView({
  error,
  retrying,
  onRetry,
}: {
  error: CallError;
  retrying: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <StatusLine>{C.rejectedIn(error.ms, error.code)}</StatusLine>
      <ErrorState
        headingLevel={4}
        className={compactCard}
        title={error.isMock ? C.mockErrorTitle : C.serviceErrorTitle}
        message={error.isMock ? undefined : error.message}
        onRetry={onRetry}
        isRetrying={retrying}
      />
    </div>
  );
}

/** The result area of one service call: idle, loading, success, empty or error. */
export function ResultView({ name, state, onRetry }: ResultViewProps) {
  switch (state.status) {
    case "idle":
      return <p className="text-body-sm text-ink-muted">{C.idle}</p>;
    case "loading":
      return state.previousError ? (
        <CallErrorView error={state.previousError} retrying onRetry={onRetry} />
      ) : (
        <LoadingState variant="rows" count={2} label={C.runningLabel(name)} />
      );
    case "success":
      return (
        <div>
          <StatusLine>
            {state.value === undefined
              ? `${C.resolvedIn(state.ms)} · ${C.noValue}`
              : C.resolvedIn(state.ms)}
          </StatusLine>
          {state.value !== undefined && (
            <JsonBlock value={state.value} label={C.resultLabel(name)} className="mt-3" />
          )}
        </div>
      );
    case "empty":
      return (
        <div className="flex flex-col gap-3">
          <StatusLine>{C.resolvedIn(state.ms)}</StatusLine>
          <EmptyState
            headingLevel={4}
            icon={Inbox}
            className={compactCard}
            title={C.emptyTitle}
            description={C.emptyDescription}
          />
        </div>
      );
    case "error":
      return <CallErrorView error={state.error} retrying={false} onRetry={onRetry} />;
  }
}
