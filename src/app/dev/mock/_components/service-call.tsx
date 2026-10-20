"use client";

import * as React from "react";
import { Play } from "lucide-react";

import { ResultView } from "@/app/dev/mock/_components/result-view";
import { useServiceCall } from "@/app/dev/mock/_components/use-service-call";
import type { ServiceCallDef } from "@/app/dev/mock/_data/service-calls";
import { Button } from "@/components/ui/button";
import { DEV_MOCK_COPY as C } from "@/lib/constants";

/** One service call card: name, sample arguments, Run and the result area. */
export function ServiceCall({ call }: { call: ServiceCallDef }) {
  const runButton = React.useRef<HTMLButtonElement>(null);
  const { state, execute } = useServiceCall(call.run, runButton);
  const loading = state.status === "loading";
  const headingId = `call-${call.id}`;

  return (
    <li>
      <article
        aria-labelledby={headingId}
        className="min-w-0 rounded-lg border border-border bg-surface p-4 md:p-6"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h3 id={headingId} className="text-body font-semibold break-all text-ink">
              {call.name}
            </h3>
            <p className="mt-1 text-body-sm break-words text-ink-muted">{call.argsLabel}</p>
            {call.expectLabel && (
              <p className="mt-1 text-caption text-ink-muted">{call.expectLabel}</p>
            )}
          </div>
          <Button
            ref={runButton}
            type="button"
            variant="outline"
            size="sm"
            className="w-full shrink-0 sm:w-auto"
            loading={loading}
            onClick={execute}
          >
            {!loading && <Play aria-hidden />}
            {loading ? C.running : C.run}
            <span className="sr-only"> {call.name}</span>
          </Button>
        </div>
        <div className="mt-4">
          <ResultView name={call.name} state={state} onRetry={execute} />
        </div>
      </article>
    </li>
  );
}
