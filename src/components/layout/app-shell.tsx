import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { BottomNav } from "@/components/layout/bottom-nav";
import { Logo } from "@/components/layout/logo";
import { SideNav } from "@/components/layout/side-nav";
import { SkipLink } from "@/components/layout/skip-link";
import { Button } from "@/components/ui/button";
import { HEADER_ACTIONS } from "@/lib/constants";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

type AppShellProps = {
  role: Role;
  children: React.ReactNode;
  /** Overrides the current pathname for the active nav item. */
  activeHref?: string;
  /** Styleguide only: nothing fixed or sticky, no `main` landmark. */
  preview?: boolean;
} & (
  | { rail?: undefined; railLabel?: undefined }
  | {
      /** Right-rail content. A column from 1280 px; stacks under main below that. */
      rail: React.ReactNode;
      /** Accessible name of the rail `aside`. */
      railLabel: string;
    }
);

/**
 * Dashboard shell. Desktop: side nav (240 px), main and an optional right rail.
 * Tablet: icon-only side nav. Mobile: top bar, one column and the bottom nav.
 */
export function AppShell({
  role,
  children,
  rail,
  railLabel,
  activeHref,
  preview = false,
}: AppShellProps) {
  const Main = preview ? "div" : "main";

  return (
    <div className={cn("flex bg-surface-alt", preview ? "min-h-0" : "min-h-dvh")}>
      {!preview && <SkipLink />}
      <SideNav role={role} activeHref={activeHref} preview={preview} className="hidden md:flex" />

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className={cn(
            "z-40 flex h-16 items-center justify-between gap-2 border-b border-border bg-surface px-4 md:hidden",
            preview ? "relative" : "sticky top-0",
          )}
        >
          <Logo />
          {role === "customer" && (
            <Button asChild size="sm">
              <Link href={HEADER_ACTIONS.postJob.href}>
                <Plus aria-hidden />
                {HEADER_ACTIONS.postJob.label}
              </Link>
            </Button>
          )}
        </header>

        <div className={cn("flex flex-1 flex-col xl:flex-row", !preview && "pb-24 md:pb-0")}>
          <Main
            id={preview ? undefined : "main"}
            tabIndex={preview ? undefined : -1}
            className="min-w-0 flex-1 px-4 py-6 md:p-6 lg:p-8"
          >
            <div className="mx-auto w-full max-w-content">{children}</div>
          </Main>

          {rail && (
            <aside
              aria-label={railLabel}
              className={cn(
                "px-4 pb-6 md:px-6 md:pb-6 lg:px-8 lg:pb-8 xl:w-80 xl:shrink-0 xl:overflow-y-auto xl:border-l xl:border-border xl:bg-surface xl:p-6",
                !preview && "xl:sticky xl:top-0 xl:h-dvh",
              )}
            >
              <div className="mx-auto w-full max-w-content">{rail}</div>
            </aside>
          )}
        </div>

        <BottomNav
          role={role}
          activeHref={activeHref}
          preview={preview}
          className={preview ? "md:hidden" : undefined}
        />
      </div>
    </div>
  );
}
