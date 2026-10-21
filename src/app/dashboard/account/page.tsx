import { Suspense } from "react";
import type { Metadata } from "next";

import { AccountView } from "@/components/dashboard/account-view";
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
  title: DASHBOARD_COPY.meta.account,
  robots: { index: false, follow: false },
};

/* Account (T8): profile, payment details, favourite workers, templates and support. */
export default function CustomerAccountPage() {
  return (
    <Suspense fallback={<LoadingState variant="rows" count={3} />}>
      <AccountView />
    </Suspense>
  );
}
