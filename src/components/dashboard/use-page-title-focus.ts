"use client";

import * as React from "react";

/*
 * Route-change focus for the dashboard (T8 UI plan §0.4): after a client-side
 * navigation into a dashboard page, focus moves to the page `h1` once it has
 * rendered. A hard load or a reload never moves focus, so the skip link stays
 * the first Tab stop.
 *
 * A view counts as reached by client-side navigation when another dashboard
 * view has already mounted in this document, or when the URL differs from
 * the one the document was loaded with (for example after logging in).
 */

let dashboardViewMounted = false;

const withoutHash = (url: string) => url.split("#")[0];

function loadedWithDifferentUrl(): boolean {
  const entry = performance.getEntriesByType?.("navigation")[0];
  if (!entry?.name) return false;
  return withoutHash(entry.name) !== withoutHash(window.location.href);
}

/**
 * Focuses `ref` once `ready` is true, when the view was reached by a
 * client-side navigation. `skip` hands the focus to something else (a
 * success message, a `#rate` target).
 */
export function usePageTitleFocus(
  ref: React.RefObject<HTMLElement | null>,
  ready: boolean,
  skip = false,
): void {
  const pending = React.useRef<boolean | null>(null);

  React.useEffect(() => {
    // Once per mount (Strict Mode runs effects twice; refs survive the re-run).
    if (pending.current !== null) return;
    pending.current = dashboardViewMounted || loadedWithDifferentUrl();
    dashboardViewMounted = true;
  }, []);

  React.useEffect(() => {
    if (!ready || !pending.current) return;
    pending.current = false;
    if (!skip) ref.current?.focus();
  }, [ready, skip, ref]);
}
