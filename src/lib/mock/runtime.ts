import { LIMITS, SERVICE_MESSAGES } from "@/lib/constants";
import { ServiceError } from "@/lib/mock/service-error";

/*
 * Shared behaviour of every mock service call (internal to src/lib/mock):
 * a 400–800 ms simulated delay, the one-shot `?mockError=1` failure, the
 * one-shot `?mockUploadError=1` upload failure, and a deep copy of the result
 * so callers never hold references into the mock DB.
 */

/**
 * One-shot URL switches (decision 15): the first matching service call after
 * the page loads with the parameter rejects; later calls, Retry included,
 * succeed. A full reload, or navigating to another URL that has the
 * parameter, arms it again.
 */
const consumedForUrl: Record<string, string | null> = {};

function takeOneShot(param: string): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get(param) !== "1") return false;
  const url = window.location.href;
  if (consumedForUrl[param] === url) return false;
  consumedForUrl[param] = url;
  return true;
}

/** `?mockError=1`: the first service call of any kind fails. */
function takeMockError(): boolean {
  return takeOneShot("mockError");
}

/**
 * `?mockUploadError=1` (mock only, T9 orchestrator decision 2): the first
 * `workers.uploadDocument` call after the page loads with the parameter
 * rejects with "Upload failed", so the per-file "Upload failed" + Retry state
 * can be shown (`?mockError=1` always lands on the step's `getProfile`).
 * Other calls are not affected. Works the same way as `?mockError=1`.
 */
function takeMockUploadError(): boolean {
  return takeOneShot("mockUploadError");
}

function delay(): Promise<void> {
  const ms =
    LIMITS.mockDelayMinMs + Math.random() * (LIMITS.mockDelayMaxMs - LIMITS.mockDelayMinMs);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type RunOptions = {
  /** Skip the `?mockError=1` failure (resetDemoData and getSeedSummary only). */
  exemptFromMockError?: boolean;
  /** Subject to `?mockUploadError=1` (workers.uploadDocument only). */
  upload?: boolean;
};

/** Runs a mock operation after the simulated delay. Business rules throw `ServiceError`. */
export async function runService<T>(
  operation: () => T | Promise<T>,
  options: RunOptions = {},
): Promise<T> {
  // Decided at call time, so of several parallel calls only the first one fails.
  const shouldFail = !options.exemptFromMockError && takeMockError();
  const shouldFailUpload = !shouldFail && !!options.upload && takeMockUploadError();
  await delay();
  if (shouldFail) throw new ServiceError("MOCK_ERROR", SERVICE_MESSAGES.mockError);
  if (shouldFailUpload) throw new ServiceError("UPLOAD_FAILED", SERVICE_MESSAGES.uploadFailed);
  const result = await operation();
  return result === undefined ? result : structuredClone(result);
}
