import type { JobCardWorker } from "@/components/job/job-card";
import { workers } from "@/lib/mock/services";
import type { Job, WorkerSummary } from "@/lib/types";

/** Worker summaries by id, or "failed" (cards then show "Your worker"). */
export type WorkerLookup = ReadonlyMap<string, WorkerSummary> | "failed";

/**
 * One `workers.getSummaries` call for the jobs' workers (T8 open question 3).
 * Never rejects: a failure is quiet and only drops the names.
 */
export async function lookupWorkers(jobs: readonly Job[]): Promise<WorkerLookup> {
  const ids = [...new Set(jobs.flatMap((job) => (job.workerId ? [job.workerId] : [])))];
  if (ids.length === 0) return new Map();
  try {
    const summaries = await workers.getSummaries(ids);
    return new Map(summaries.map((summary) => [summary.id, summary]));
  } catch {
    return "failed";
  }
}

/** Undefined when the job has no worker yet (on the job board). */
export function jobWorker(job: Job, lookup: WorkerLookup): JobCardWorker | undefined {
  if (!job.workerId) return undefined;
  const summary = lookup === "failed" ? undefined : lookup.get(job.workerId);
  return summary ? { state: "ready", summary } : { state: "fallback" };
}

export const ACTIVE_STATUSES: readonly Job["status"][] = ["open", "accepted", "in_progress"];

export function isActiveJob(job: Job): boolean {
  return ACTIVE_STATUSES.includes(job.status);
}
