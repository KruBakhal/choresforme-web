import { Suspense } from "react";
import type { Metadata } from "next";

import { CustomerHome } from "@/components/dashboard/customer-home";
import { LoadingState } from "@/components/states/loading-state";
import { AUTH_COPY } from "@/lib/constants";

/*
 * The client guard (RequireRole, in the dashboard layout) renders this page
 * only after the session has loaded in the browser, so it is never part of
 * the prerendered shell. Opt it out of instant-navigation validation, which
 * would otherwise report it as a dropped segment (as T5 does on /dashboard).
 */
export const instant = false;

export const metadata: Metadata = {
  title: AUTH_COPY.meta.dashboard,
  robots: { index: false, follow: false },
};

/* Customer Home (T8): active jobs, Saved Templates and the app banner in the rail. */
export default function CustomerDashboardPage() {
  return (
    <Suspense fallback={<LoadingState variant="cards" columns={1} />}>
      <CustomerHome />
    </Suspense>
  );
}
