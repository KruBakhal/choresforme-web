"use client";

import { useJobDraftStore } from "@/lib/store/job-draft-store";
import { useOnboardingStore } from "@/lib/store/onboarding-store";
import { useSessionStore } from "@/lib/store/session-store";
import { hydrateStore, STORE_KEYS, useStoresHydratedFor } from "@/lib/store/storage";

export * from "@/lib/store/job-draft-store";
export * from "@/lib/store/onboarding-store";
export * from "@/lib/store/session-store";
export { STORE_KEYS } from "@/lib/store/storage";

const ALL_STORES = [useSessionStore, useJobDraftStore, useOnboardingStore] as const;

/** False on the server and until every persisted store has loaded from localStorage. */
export function useStoresHydrated(): boolean {
  return useStoresHydratedFor(ALL_STORES);
}

/** Loads every store from localStorage (client only). */
export function hydrateStores(): Promise<void> {
  return Promise.all(ALL_STORES.map(hydrateStore)).then(() => undefined);
}

/**
 * Clears the session, job draft and onboarding stores and their saved
 * copies, plus the app prompt dismissals (T7).
 */
export function clearStores(): void {
  useSessionStore.getState().clear();
  useJobDraftStore.getState().clear();
  useOnboardingStore.getState().clear();
  ALL_STORES.forEach((store) => store.persist.clearStorage());
  clearAppPromptDismissals();
}

function clearAppPromptDismissals(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORE_KEYS.appPromptCustomer);
    window.localStorage.removeItem(STORE_KEYS.appPromptWorker);
  } catch {
    // Storage blocked: nothing was saved.
  }
}
