"use client";

import * as React from "react";

import { isServiceError } from "@/lib/mock/services";

export type CallError = { message: string; code: string; isMock: boolean; ms: number };

export type CallState =
  | { status: "idle" }
  | { status: "loading"; previousError?: CallError }
  | { status: "success"; value: unknown; ms: number }
  | { status: "empty"; ms: number }
  | { status: "error"; error: CallError };

/** `[]` and `null` count as an empty result. */
function isEmptyResult(value: unknown) {
  return value === null || (Array.isArray(value) && value.length === 0);
}

/**
 * Runs one service call and tracks its state and duration. When the call
 * settles and focus has dropped to `body` (the disabled Run or unmounted Retry
 * button), focus returns to `focusTarget`.
 */
export function useServiceCall(
  run: () => Promise<unknown>,
  focusTarget: React.RefObject<HTMLElement | null>,
  isEmpty: (value: unknown) => boolean = isEmptyResult,
) {
  const [state, setState] = React.useState<CallState>({ status: "idle" });

  const execute = React.useCallback(async () => {
    setState((previous) => ({
      status: "loading",
      previousError: previous.status === "error" ? previous.error : undefined,
    }));
    const started = performance.now();
    const elapsed = () => Math.round(performance.now() - started);
    try {
      const value = await run();
      const ms = elapsed();
      setState(isEmpty(value) ? { status: "empty", ms } : { status: "success", value, ms });
    } catch (error) {
      const ms = elapsed();
      setState({
        status: "error",
        error: isServiceError(error)
          ? { message: error.message, code: error.code, isMock: error.isMock, ms }
          : {
              message: error instanceof Error ? error.message : String(error),
              code: "UNKNOWN",
              isMock: false,
              ms,
            },
      });
    } finally {
      requestAnimationFrame(() => {
        const active = document.activeElement;
        if (!active || active === document.body) focusTarget.current?.focus();
      });
    }
  }, [run, focusTarget, isEmpty]);

  return { state, execute };
}
