/*
 * In-memory hand-offs between the last builder steps (T7). Nothing here is
 * persisted: a reload starts empty, and every screen still works without it.
 *
 * - The picked worker's name, resolved on Review, so Payment and
 *   Confirmation can show it without another lookup.
 * - The Save As Template result of a post, keyed by job id, so Confirmation
 *   can say "Saved as template" or offer it again (open question 13).
 */

const workerNames = new Map<string, string>();

export function rememberWorkerName(workerId: string, name: string): void {
  workerNames.set(workerId, name);
}

export function rememberedWorkerName(workerId: string | undefined): string | undefined {
  return workerId ? workerNames.get(workerId) : undefined;
}

export type TemplateResult =
  { status: "saved"; name: string } | { status: "failed"; name: string } | { status: "none" };

const templateResults = new Map<string, TemplateResult>();

export function rememberTemplateResult(jobId: string, result: TemplateResult): void {
  templateResults.set(jobId, result);
}

export function rememberedTemplateResult(jobId: string): TemplateResult | undefined {
  return templateResults.get(jobId);
}
