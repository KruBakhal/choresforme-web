import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DASHBOARD_COPY, HEADER_ACTIONS, NAV_ITEMS } from "@/lib/constants";

const HISTORY_HREF = NAV_ITEMS.customer[2].href;

/**
 * The empty states' actions on Home and Jobs: Post a job, plus "View
 * history" when the customer has only finished jobs (T8 open question 5).
 */
export function EmptyJobsActions({ withHistory }: { withHistory: boolean }) {
  const postJob = (
    <Button asChild className="w-full sm:w-auto">
      <Link href={HEADER_ACTIONS.postJob.href}>
        <Plus aria-hidden />
        {HEADER_ACTIONS.postJob.label}
      </Link>
    </Button>
  );
  if (!withHistory) return postJob;
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
      {postJob}
      <Button asChild variant="outline" className="w-full sm:w-auto">
        <Link href={HISTORY_HREF}>{DASHBOARD_COPY.home.viewHistory}</Link>
      </Button>
    </div>
  );
}
