"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";

import { EmptyJobsActions } from "@/components/dashboard/empty-jobs-actions";
import { PageHeader, PAGE_TITLE_ID } from "@/components/dashboard/page-header";
import { ShellRail } from "@/components/dashboard/shell-rail";
import { TemplateList, type TemplatesState } from "@/components/dashboard/template-list";
import { usePageTitleFocus } from "@/components/dashboard/use-page-title-focus";
import { useRepost } from "@/components/dashboard/use-repost";
import {
  isActiveJob,
  jobWorker,
  lookupWorkers,
  type WorkerLookup,
} from "@/components/dashboard/worker-lookup";
import { JobCard } from "@/components/job/job-card";
import { AppPrompt } from "@/components/layout/app-prompt";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { APP_PROMPT_COPY, AUTH_COPY, DASHBOARD_COPY, NAV_ITEMS } from "@/lib/constants";
import { useAppPromptState } from "@/lib/hooks/use-app-prompt";
import { useRevisitKey } from "@/lib/hooks/use-revisit-key";
import { jobs as jobService, templates as templateService } from "@/lib/mock/services";
import { selectSessionUser, useSessionStore } from "@/lib/store";
import type { Job } from "@/lib/types";

type JobsState =
  | { status: "loading" }
  | { status: "error"; retrying: boolean }
  | { status: "ready"; total: number; active: Job[]; lookup: WorkerLookup };

const COPY = DASHBOARD_COPY.home;
const HOME_MAX_JOBS = 3;
const ACTIVE_TITLE_ID = "home-active-title";
const TEMPLATES_TITLE_ID = "templates-title";
const JOBS_HREF = NAV_ITEMS.customer[1].href;

/** No-op trigger points for T11 (`app_prompt_shown`, `app_prompt_clicked`): nothing is tracked in T8. */
const noop = () => {};

/**
 * Customer Home (`/dashboard`). Stays mounted for the route's lifetime and
 * keys the view with `useRevisitKey`, so a revisit loads current data.
 */
export function CustomerHome() {
  const revisitKey = useRevisitKey();
  return <CustomerHomeView key={revisitKey} />;
}

function CustomerHomeView() {
  const user = useSessionStore(selectSessionUser);
  const userId = user?.id ?? null;
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const [jobs, setJobs] = React.useState<JobsState>({ status: "loading" });
  const [templates, setTemplates] = React.useState<TemplatesState>({ status: "loading" });
  const [promptDismissed, setPromptDismissed] = React.useState(false);
  const prompt = useAppPromptState("customer");
  const { repost, openingId, dialog } = useRepost();
  const startedOnMount = React.useRef(false);

  usePageTitleFocus(titleRef, true);

  const loadJobs = React.useCallback(async () => {
    if (!userId) return;
    try {
      const all = await jobService.listForCustomer(userId);
      const active = all.filter(isActiveJob).slice(0, HOME_MAX_JOBS);
      const lookup = await lookupWorkers(active);
      setJobs({ status: "ready", total: all.length, active, lookup });
    } catch {
      setJobs({ status: "error", retrying: false });
    }
  }, [userId]);

  const loadTemplates = React.useCallback(async () => {
    if (!userId) return;
    try {
      setTemplates({ status: "ready", templates: await templateService.list(userId) });
    } catch {
      setTemplates({ status: "error", retrying: false });
    }
  }, [userId]);

  React.useEffect(() => {
    // Once per mount (Strict Mode runs effects twice; a second request would hide a ?mockError=1 failure).
    if (startedOnMount.current) return;
    startedOnMount.current = true;
    // Jobs first, so `?mockError=1` always hits `jobs.listForCustomer`.
    void loadJobs();
    void loadTemplates();
  }, [loadJobs, loadTemplates]);

  const templatesShown = templates.status !== "ready" || templates.templates.length > 0;
  const promptShown = prompt.status === "visible" && !promptDismissed;
  const railShown = templatesShown || promptShown;

  function handlePromptDismissed() {
    setPromptDismissed(true);
    // Never drop focus to body: the templates heading, else the page title.
    (
      document.getElementById(TEMPLATES_TITLE_ID) ?? document.getElementById(PAGE_TITLE_ID)
    )?.focus();
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        className="mb-0"
        titleRef={titleRef}
        title={user ? AUTH_COPY.dashboard.greeting(user.firstName) : AUTH_COPY.dashboard.comingSoon}
        description={COPY.description}
      />

      <section aria-labelledby={ACTIVE_TITLE_ID}>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <h2
            id={ACTIVE_TITLE_ID}
            tabIndex={-1}
            className="text-h4 font-semibold text-ink outline-none focus-visible:outline-2"
          >
            {COPY.activeTitle}
          </h2>
          {jobs.status === "ready" && jobs.active.length > 0 && (
            <Button asChild variant="link" size="sm" className="min-h-11">
              <Link href={JOBS_HREF}>
                {COPY.viewAll}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          )}
        </div>
        <div className="mt-4">
          {jobs.status === "loading" && (
            <LoadingState variant="cards" columns={1} count={3} label={COPY.loading} />
          )}
          {jobs.status === "error" && (
            <ErrorState
              headingLevel={3}
              isRetrying={jobs.retrying}
              onRetry={() => {
                setJobs({ status: "error", retrying: true });
                void loadJobs();
              }}
            />
          )}
          {jobs.status === "ready" && jobs.active.length === 0 && (
            <EmptyState
              headingLevel={3}
              icon={ClipboardList}
              title={jobs.total === 0 ? COPY.emptyTitle : COPY.noActiveTitle}
              description={jobs.total === 0 ? COPY.emptyDescription : COPY.noActiveDescription}
              action={<EmptyJobsActions withHistory={jobs.total > 0} />}
            />
          )}
          {jobs.status === "ready" && jobs.active.length > 0 && (
            <ul className="flex flex-col gap-4">
              {jobs.active.map((job) => (
                <li key={job.id}>
                  <JobCard job={job} worker={jobWorker(job, jobs.lookup)} headingLevel={3} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {railShown && (
        <ShellRail label={COPY.railLabel}>
          <TemplateList
            variant="rail"
            titleId={TEMPLATES_TITLE_ID}
            state={templates}
            repostingId={openingId}
            onRepost={(template) => repost({ kind: "template", template })}
            onRetry={() => {
              setTemplates({ status: "error", retrying: true });
              void loadTemplates();
            }}
          />
          <AppPrompt
            app="customer"
            layout="rail"
            androidTitle={APP_PROMPT_COPY.customer.androidTitle}
            androidBody={APP_PROMPT_COPY.customer.androidBody}
            installLabel={APP_PROMPT_COPY.customer.install}
            updatesText={APP_PROMPT_COPY.customer.updates}
            onShown={noop}
            onInstallClick={noop}
            onDismissed={handlePromptDismissed}
          />
        </ShellRail>
      )}
      <span role="status" className="sr-only">
        {promptDismissed ? COPY.promptHidden : ""}
      </span>
      {dialog}
    </div>
  );
}
