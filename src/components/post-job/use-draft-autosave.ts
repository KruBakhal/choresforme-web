"use client";

import * as React from "react";

const AUTOSAVE_DELAY_MS = 300;

/**
 * Saves a step's form values to the draft while the user edits (rule 9),
 * debounced. Values that are not valid yet are saved too; the step guard
 * treats that step as incomplete. A pending save is flushed when the route
 * is hidden or unmounted, so leaving by any link keeps what was typed.
 *
 * Returns `flush` (save now) and `cancel` (drop the pending save, for
 * Continue, which saves the validated values itself).
 */
export function useDraftAutosave<T>(values: T, save: (values: T) => void) {
  const saveRef = React.useRef(save);
  const pending = React.useRef<{ timer: ReturnType<typeof setTimeout>; values: T } | null>(null);
  const lastKey = React.useRef<string | null>(null);

  React.useEffect(() => {
    saveRef.current = save;
  });

  const cancel = React.useCallback(() => {
    if (pending.current) clearTimeout(pending.current.timer);
    pending.current = null;
  }, []);

  const flush = React.useCallback(() => {
    const current = pending.current;
    if (!current) return;
    clearTimeout(current.timer);
    pending.current = null;
    saveRef.current(current.values);
  }, []);

  React.useEffect(() => {
    const key = JSON.stringify(values);
    // The first values come from the draft: nothing to save.
    if (lastKey.current === null || lastKey.current === key) {
      lastKey.current = key;
      return;
    }
    lastKey.current = key;
    if (pending.current) clearTimeout(pending.current.timer);
    const timer = setTimeout(() => {
      pending.current = null;
      saveRef.current(values);
    }, AUTOSAVE_DELAY_MS);
    pending.current = { timer, values };
  }, [values]);

  // Activity hides a route by running effect cleanups: save before it goes.
  React.useEffect(() => flush, [flush]);

  return { flush, cancel };
}
