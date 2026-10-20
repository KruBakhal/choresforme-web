import { LIMITS, SERVICE_MESSAGES } from "@/lib/constants";
import { ServiceError } from "@/lib/mock/service-error";

/*
 * Shared behaviour of every mock service call (internal to src/lib/mock):
 * a 400–800 ms simulated delay, the one-shot `?mockError=1` failure, and a
 * deep copy of the result so callers never hold references into the mock DB.
 */

/**
 * `?mockError=1` is one-shot per URL load (decision 15): the first service
 * call after the page loads with the parameter rejects; later calls, Retry
 * included, succeed. A full reload, or navigating to another URL that has the
 * parameter, arms it again.
 */
let consumedForUrl: string | null = null;

function takeMockError(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get("mockError") !== "1") return false;
  const url = window.location.href;
  if (consumedForUrl === url) return false;
  consumedForUrl = url;
  return true;
}

function delay(): Promise<void> {
  const ms =
    LIMITS.mockDelayMinMs + Math.random() * (LIMITS.mockDelayMaxMs - LIMITS.mockDelayMinMs);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type RunOptions = {
  /** Skip the `?mockError=1` failure (resetDemoData and getSeedSummary only). */
  exemptFromMockError?: boolean;
};

/** Runs a mock operation after the simulated delay. Business rules throw `ServiceError`. */
export async function runService<T>(
  operation: () => T | Promise<T>,
  options: RunOptions = {},
): Promise<T> {
  // Decided at call time, so of several parallel calls only the first one fails.
  const shouldFail = !options.exemptFromMockError && takeMockError();
  await delay();
  if (shouldFail) throw new ServiceError("MOCK_ERROR", SERVICE_MESSAGES.mockError);
  const result = await operation();
  return result === undefined ? result : structuredClone(result);
}
