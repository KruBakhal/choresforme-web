"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";

import { EmptyJobsActions } from "@/components/dashboard/empty-jobs-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { usePageTitleFocus } from "@/components/dashboard/use-page-title-focus";
import {
  isActiveJob,
  jobWorker,
  lookupWorkers,
  type WorkerLookup,
} from "@/components/dashboard/worker-lookup";
import { JobCard } from "@/components/job/job-card";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { DASHBOARD_COPY, NAV_ITEMS } from "@/lib/constants";
import { useRevisitKey } from "@/lib/hooks/use-revisit-key";
import { jobs as jobService } from "@/lib/mock/services";
import { useSessionStore } from "@/lib/store";
import type { Job } from "@/lib/types";

type JobsState =
  | { status: "loading" }
  | { status: "error"; retrying: boolean }
  | { status: "ready"; total: number; active: Job[]; lookup: WorkerLookup };

const COPY = DASHBOARD_COPY.jobs;
const HISTORY_HREF = NAV_ITEMS.customer[2].href;

/** `/dashboard/jobs`: every active job, newest first. Keyed per visit (`useRevisitKey`). */
export function JobsList() {
  const revisitKey = useRevisitKey();
  return <JobsListView key={revisitKey} />;
}

function JobsListView() {
  const userId = useSessionStore((state) => state.session?.user.id ?? null);
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const [jobs, setJobs] = React.useState<JobsState>({ status: "loading" });
  const startedOnMount = React.useRef(false);

  usePageTitleFocus(titleRef, true);

  const load = React.useCallback(async () => {
    if (!userId) return;
    try {
      const all = await jobService.listForCustomer(userId);
      const active = all.filter(isActiveJob);
      setJobs({ status: "ready", total: all.length, active, lookup: await lookupWorkers(active) });
    } catch {
      setJobs({ status: "error", retrying: false });
    }
  }, [userId]);

  React.useEffect(() => {
    // Once per mount (Strict Mode runs effects twice; a second request would hide a ?mockError=1 failure).
    if (startedOnMount.current) return;
    startedOnMount.current = true;
    void load();
  }, [load]);

  return (
    <div>
      <PageHeader titleRef={titleRef} title={COPY.title} description={COPY.description}>
        <Button asChild variant="link" size="sm" className="min-h-11 self-start">
          <Link href={HISTORY_HREF}>
            {COPY.historyLink}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </PageHeader>

      <section aria-labelledby="page-title">
        {jobs.status === "loading" && <LoadingState variant="cards" label={COPY.loading} />}
        {jobs.status === "error" && (
          <ErrorState
            headingLevel={2}
            isRetrying={jobs.retrying}
            onRetry={() => {
              setJobs({ status: "error", retrying: true });
              void load();
            }}
          />
        )}
        {jobs.status === "ready" && jobs.active.length === 0 && (
          <EmptyState
            headingLevel={2}
            icon={ClipboardList}
            title={
              jobs.total === 0 ? DASHBOARD_COPY.home.emptyTitle : DASHBOARD_COPY.home.noActiveTitle
            }
            description={
              jobs.total === 0
                ? DASHBOARD_COPY.home.emptyDescription
                : DASHBOARD_COPY.home.noActiveDescription
            }
            action={<EmptyJobsActions withHistory={jobs.total > 0} />}
          />
        )}
        {jobs.status === "ready" && jobs.active.length > 0 && (
          <>
            <p role="status" className="text-body-sm text-ink-muted">
              {COPY.count(jobs.active.length)}
            </p>
            <ul className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {jobs.active.map((job) => (
                <li key={job.id}>
                  <JobCard job={job} worker={jobWorker(job, jobs.lookup)} headingLevel={2} />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
