"use client";

import * as React from "react";

import type { UploadState } from "@/components/forms/document-upload-field";
import type { VerificationStatus } from "@/lib/types";

export type UploadRow = { state: UploadState; progress: number };

/** The outcome of one upload call. */
export type UploadResult = { ok: true; status: VerificationStatus } | { ok: false };

const IDLE: UploadRow = { state: "idle", progress: 0 };
/** Simulated progress (T9 UI plan §4.7): rises towards 90 % while the call runs, 100 % on success. */
const TICK_MS = 100;
const TICK_STEP = 15;
const TICK_MAX = 90;

/**
 * Per-file upload rows for a document step (T9): each row is idle,
 * uploading (with simulated progress), failed or done. `run` uploads one
 * row; `stateOf` reads the latest state outside of render.
 */
export function useDocumentUploads<K extends string>(keys: readonly K[]) {
  const [rows, setRows] = React.useState<Record<K, UploadRow>>(
    () => Object.fromEntries(keys.map((key) => [key, IDLE])) as Record<K, UploadRow>,
  );
  const latest = React.useRef(rows);
  const timers = React.useRef(new Map<K, ReturnType<typeof setInterval>>());

  React.useEffect(() => {
    const running = timers.current;
    return () => running.forEach((timer) => clearInterval(timer));
  }, []);

  const setRow = React.useCallback((key: K, update: (row: UploadRow) => UploadRow) => {
    setRows((current) => {
      const next = { ...current, [key]: update(current[key]) };
      latest.current = next;
      return next;
    });
  }, []);

  const stopTimer = React.useCallback((key: K) => {
    const timer = timers.current.get(key);
    if (timer) clearInterval(timer);
    timers.current.delete(key);
  }, []);

  /** Back to idle (a new file was picked or removed). */
  const reset = React.useCallback(
    (key: K) => {
      stopTimer(key);
      setRow(key, () => IDLE);
    },
    [setRow, stopTimer],
  );

  const run = React.useCallback(
    async (key: K, call: () => Promise<VerificationStatus>): Promise<UploadResult> => {
      stopTimer(key);
      setRow(key, () => ({ state: "uploading", progress: 0 }));
      timers.current.set(
        key,
        setInterval(
          () =>
            setRow(key, (row) => ({
              ...row,
              progress: Math.min(TICK_MAX, row.progress + TICK_STEP),
            })),
          TICK_MS,
        ),
      );
      try {
        const status = await call();
        stopTimer(key);
        setRow(key, () => ({ state: "done", progress: 100 }));
        latest.current = { ...latest.current, [key]: { state: "done", progress: 100 } };
        return { ok: true, status };
      } catch {
        stopTimer(key);
        setRow(key, () => ({ state: "failed", progress: 0 }));
        latest.current = { ...latest.current, [key]: { state: "failed", progress: 0 } };
        return { ok: false };
      }
    },
    [setRow, stopTimer],
  );

  const stateOf = React.useCallback((key: K): UploadState => latest.current[key].state, []);

  return { rows, run, reset, stateOf };
}
