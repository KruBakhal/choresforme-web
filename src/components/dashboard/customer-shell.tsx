"use client";

import * as React from "react";

import { ShellRailContext } from "@/components/dashboard/shell-rail";
import { AppShell } from "@/components/layout/app-shell";

/**
 * The customer dashboard shell (T8): `AppShell` plus a rail slot that a page
 * fills with `ShellRail` (Home only). Stays mounted across dashboard pages,
 * so the shell never remounts on navigation.
 */
export function CustomerShell({ children }: { children: React.ReactNode }) {
  const [railLabel, setRailLabel] = React.useState<string | null>(null);
  const [target, setTarget] = React.useState<HTMLDivElement | null>(null);

  const register = React.useCallback((label: string) => {
    setRailLabel(label);
    return () => setRailLabel(null);
  }, []);
  const value = React.useMemo(() => ({ register, target }), [register, target]);

  return (
    <ShellRailContext value={value}>
      {railLabel !== null ? (
        <AppShell
          role="customer"
          rail={<div ref={setTarget} className="flex flex-col gap-6" />}
          railLabel={railLabel}
        >
          {children}
        </AppShell>
      ) : (
        <AppShell role="customer">{children}</AppShell>
      )}
    </ShellRailContext>
  );
}
