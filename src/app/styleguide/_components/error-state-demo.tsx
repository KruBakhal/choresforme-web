"use client";

import * as React from "react";
import Link from "next/link";

import { ErrorState } from "@/components/states/error-state";
import { Button } from "@/components/ui/button";
import { STYLEGUIDE_COPY } from "@/lib/constants";

type DemoState = "error" | "retrying" | "loaded";

/** Retry demo only: waits ~800 ms and makes no service call. */
export function ErrorStateDemo() {
  const [state, setState] = React.useState<DemoState>("error");
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function retry() {
    setState("retrying");
    timer.current = setTimeout(() => setState("loaded"), 800);
  }

  if (state === "loaded") {
    return (
      <div className="flex flex-col items-start gap-3 rounded-lg border border-border bg-surface p-6">
        <p role="status" className="text-body text-ink">
          {STYLEGUIDE_COPY.demo.loaded}
        </p>
        <Button variant="ghost" size="sm" onClick={() => setState("error")}>
          {STYLEGUIDE_COPY.demo.showErrorAgain}
        </Button>
      </div>
    );
  }

  return (
    <ErrorState
      headingLevel={3}
      onRetry={retry}
      isRetrying={state === "retrying"}
      secondaryAction={
        <Button asChild variant="outline">
          <Link href={STYLEGUIDE_COPY.samples.errorSecondaryHref}>
            {STYLEGUIDE_COPY.samples.errorSecondary}
          </Link>
        </Button>
      }
    />
  );
}
