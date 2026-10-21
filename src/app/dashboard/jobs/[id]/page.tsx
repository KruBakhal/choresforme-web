import { Suspense } from "react";
import type { Metadata } from "next";

import { JobDetailRoute } from "@/components/dashboard/job-detail-view";
import { LoadingState } from "@/components/states/loading-state";
import { DASHBOARD_COPY } from "@/lib/constants";

/*
 * The client guard (RequireRole, in the dashboard layout) renders this page
 * only after the session has loaded in the browser, so it is never part of
 * the prerendered shell. Opt it out of instant-navigation validation, which
 * would otherwise report it as a dropped segment (as T5 does on /dashboard).
 */
export const instant = false;

export const metadata: Metadata = {
  title: DASHBOARD_COPY.meta.detail,
  robots: { index: false, follow: false },
};

/* Job detail (T8): the id is read on the client inside the guarded view. */
export default function CustomerJobDetailPage() {
  return (
    <Suspense fallback={<LoadingState variant="detail" />}>
      <JobDetailRoute />
    </Suspense>
  );
}
