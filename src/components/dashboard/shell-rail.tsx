"use client";

import * as React from "react";
import { createPortal } from "react-dom";

type ShellRailContextValue = {
  /** Shows the shell's rail with this accessible name; returns the cleanup. */
  register: (label: string) => () => void;
  /** The rail's content element, once the shell has drawn it. */
  target: HTMLElement | null;
};

export const ShellRailContext = React.createContext<ShellRailContextValue | null>(null);

type ShellRailProps = {
  /** The rail `aside`'s accessible name. */
  label: string;
  children: React.ReactNode;
};

/**
 * Fills the customer shell's right rail from a page (T8 UI plan §2). The
 * rail exists only while a `ShellRail` is mounted, so pages without one get
 * no `aside`. The content stays in the page's React tree (its state and
 * handlers) and is portalled into the rail.
 */
export function ShellRail({ label, children }: ShellRailProps) {
  const context = React.useContext(ShellRailContext);
  const register = context?.register;

  // Before paint, so the rail column never flashes in after the first frame.
  React.useLayoutEffect(() => register?.(label), [register, label]);

  return context?.target ? createPortal(children, context.target) : null;
}
