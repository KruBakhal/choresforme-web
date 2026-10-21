/*
 * One-shot, in-memory hand-off from Edit job to Job detail (T8): Edit sets it
 * right before navigating, and Job detail shows "Your changes are saved."
 * once. Nothing is persisted, so a reload shows nothing.
 */

const savedJobs = new Set<string>();

export function rememberJobSaved(jobId: string): void {
  savedJobs.add(jobId);
}

/** True once after `rememberJobSaved(jobId)`. */
export function takeJobSaved(jobId: string): boolean {
  return savedJobs.delete(jobId);
}
