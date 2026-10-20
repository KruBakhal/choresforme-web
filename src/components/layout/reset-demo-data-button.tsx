"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RESET_DEMO_COPY } from "@/lib/constants";
import { cn } from "@/lib/utils";

type ResetDemoDataButtonProps = {
  /** `footer-link` on the dark footer band; `button` on light surfaces. */
  appearance?: "footer-link" | "button";
  /** Applied to the button. The Footer passes its own link classes. */
  className?: string;
};

/**
 * "Reset demo data" (Tech Spec footer link, decision 20). Confirms, restores
 * the seed and clears the session, draft and onboarding stores, then reloads.
 */
export function ResetDemoDataButton({
  appearance = "footer-link",
  className,
}: ResetDemoDataButtonProps) {
  const [pending, setPending] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  async function handleClick() {
    if (!window.confirm(RESET_DEMO_COPY.confirm)) return;
    setFailed(false);
    setPending(true);
    try {
      /* Loaded on click so public pages with the Footer don't bundle the mock layer. */
      const { resetDemoData } = await import("@/lib/mock/services");
      await resetDemoData();
      window.location.reload();
    } catch {
      setPending(false);
      setFailed(true);
    }
  }

  const label = pending ? RESET_DEMO_COPY.resetting : RESET_DEMO_COPY.label;

  if (appearance === "button") {
    return (
      <div className="flex w-full flex-col gap-2 sm:w-auto">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("w-full sm:w-auto", className)}
          loading={pending}
          onClick={handleClick}
        >
          {!pending && <RotateCcw aria-hidden />}
          {label}
        </Button>
        {failed && (
          <p role="alert" className="text-body-sm text-danger">
            {RESET_DEMO_COPY.error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1 md:items-end">
      <button
        type="button"
        className={cn(
          className,
          "min-w-11 cursor-pointer gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-default disabled:opacity-50",
        )}
        disabled={pending}
        aria-busy={pending || undefined}
        onClick={handleClick}
      >
        {label}
      </button>
      {failed && (
        <p role="alert" className="text-body-sm text-surface">
          {RESET_DEMO_COPY.error}
        </p>
      )}
    </div>
  );
}
