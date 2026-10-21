import { APP_PROMPT_COPY } from "@/lib/constants";
import { STORE_KEYS } from "@/lib/store/storage";

/*
 * App prompt dismissals (T7, reused by T11). "A dismissed prompt stays
 * hidden for 7 days" (PRD): the expiry is saved per app, so the customer
 * and worker prompts are independent. Client only; storage errors count as
 * "not dismissed". "Reset demo data" clears both keys (`clearStores`).
 */

export type PromptApp = "customer" | "worker";

const DAY_MS = 24 * 60 * 60 * 1000;

const KEYS: Record<PromptApp, string> = {
  customer: STORE_KEYS.appPromptCustomer,
  worker: STORE_KEYS.appPromptWorker,
};

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** True while a dismissal for this app has not expired. Event or effect time only. */
export function isAppPromptDismissed(app: PromptApp, now: number = Date.now()): boolean {
  try {
    const saved = storage()?.getItem(KEYS[app]);
    const until = saved ? Number(saved) : NaN;
    return Number.isFinite(until) && until > now;
  } catch {
    return false;
  }
}

/** Hides this app's prompt for 7 days. */
export function dismissAppPrompt(app: PromptApp, now: number = Date.now()): void {
  try {
    storage()?.setItem(KEYS[app], String(now + APP_PROMPT_COPY.dismissDays * DAY_MS));
  } catch {
    // Storage blocked: the prompt hides for this view only.
  }
}
