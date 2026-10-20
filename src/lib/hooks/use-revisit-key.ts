"use client";

import * as React from "react";

/**
 * A number that changes each time this route is shown again after a
 * client-side navigation away from it.
 *
 * With `cacheComponents` on, Next keeps visited routes mounted inside a
 * hidden React `<Activity>` and restores them, state included, on the next
 * client-side visit. A flow page (login, sign-up, a multi-step form) usually
 * wants a fresh start instead: no stale "Logging in…", no frozen view. Use the
 * key on the flow's view so it remounts on every revisit:
 *
 *   const revisitKey = useRevisitKey();
 *   return <LoginView key={revisitKey} … />;
 *
 * Call it in a component that stays mounted for the route's lifetime (the
 * keyed view's parent), never in the keyed view itself.
 *
 * How it works: Activity runs effect cleanups when it hides a route and runs
 * the effects again when it shows it. React Strict Mode (development) also
 * runs cleanup + effect right after the first mount, but synchronously in the
 * same commit; a microtask tells the two apart, so Strict Mode never counts
 * as a revisit.
 */
export function useRevisitKey(): number {
  const [revisit, setRevisit] = React.useState(0);
  const hiding = React.useRef(false);
  const hidden = React.useRef(false);

  React.useEffect(() => {
    if (hidden.current) setRevisit((value) => value + 1);
    hiding.current = false;
    hidden.current = false;

    return () => {
      hiding.current = true;
      queueMicrotask(() => {
        // Still hidden after the commit: a real hide, not a Strict Mode re-run.
        if (hiding.current) hidden.current = true;
      });
    };
  }, []);

  return revisit;
}
