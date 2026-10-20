import type { Metadata } from "next";

import { DashboardPlaceholder } from "@/components/auth/dashboard-placeholder";
import { AUTH_COPY } from "@/lib/constants";

/*
 * The client guard (RequireRole) renders this page only after the session has
 * loaded in the browser, so it is never part of the prerendered shell. Opt it
 * out of instant-navigation validation, which would otherwise report it as a
 * dropped segment.
 */
export const instant = false;

export const metadata: Metadata = {
  title: AUTH_COPY.meta.dashboard,
  robots: { index: false, follow: false },
};

/* Placeholder behind the guard; T10 replaces the content. */
export default function WorkerDashboardPage() {
  return <DashboardPlaceholder role="worker" />;
}
