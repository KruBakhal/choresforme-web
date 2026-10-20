"use client";

import Link from "next/link";
import { LayoutDashboard, Plus } from "lucide-react";

import { EmptyState } from "@/components/states/empty-state";
import { Button } from "@/components/ui/button";
import { AUTH_COPY, HEADER_ACTIONS, WORKERS_HREF } from "@/lib/constants";
import { selectSessionUser, useSessionStore } from "@/lib/store";
import type { Role } from "@/lib/types";

type DashboardPlaceholderProps = { role: Role };

/** "Dashboard coming soon" behind the guard. T8 and T10 replace the page content. */
export function DashboardPlaceholder({ role }: DashboardPlaceholderProps) {
  const user = useSessionStore(selectSessionUser);

  return (
    <>
      <h1 className="text-h3 md:text-h2">
        {user ? AUTH_COPY.dashboard.greeting(user.firstName) : AUTH_COPY.dashboard.comingSoon}
      </h1>
      <p className="mt-2 text-body text-ink-muted">{AUTH_COPY.dashboard.roleLine[role]}</p>
      <EmptyState
        className="mt-8"
        headingLevel={2}
        icon={LayoutDashboard}
        title={AUTH_COPY.dashboard.comingSoon}
        description={AUTH_COPY.dashboard.description[role]}
        action={
          role === "customer" ? (
            <Button asChild>
              <Link href={HEADER_ACTIONS.postJob.href}>
                <Plus aria-hidden />
                {HEADER_ACTIONS.postJob.label}
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href={WORKERS_HREF}>{AUTH_COPY.dashboard.workerAction}</Link>
            </Button>
          )
        }
      />
    </>
  );
}
