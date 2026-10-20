"use client";

import * as React from "react";
import { createJSONStorage, type StateStorage } from "zustand/middleware";

/*
 * SSR- and hydration-safe persistence for the Zustand stores.
 *
 * - On the server there is no localStorage, so a no-op storage is used and
 *   nothing is read or written.
 * - Every persisted store sets `skipHydration: true`. The server render and
 *   the first client render therefore both use the initial state (no
 *   hydration mismatch); `useStoreHydrated` rehydrates from localStorage after
 *   mount and flips its flag once that is done.
 */

export const STORE_KEYS = {
  session: "cfm-session",
  jobDraft: "cfm-job-draft",
  onboarding: "cfm-worker-onboarding",
} as const;

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

function getBrowserStorage(): StateStorage {
  if (typeof window === "undefined") return noopStorage;
  try {
    return window.localStorage;
  } catch {
    // Storage blocked (privacy mode, sandboxed iframe): keep state in memory only.
    return noopStorage;
  }
}

export const browserStorage = createJSONStorage(getBrowserStorage);

/** The part of a persisted store's API that hydration needs. */
export type PersistedStore = {
  persist: {
    hasHydrated: () => boolean;
    rehydrate: () => Promise<void> | void;
    onFinishHydration: (listener: () => void) => () => void;
    clearStorage: () => void;
  };
};

const pending = new WeakMap<PersistedStore, Promise<void>>();

/** Rehydrates a store from localStorage once. Safe to call many times; no-op on the server. */
export function hydrateStore(store: PersistedStore): Promise<void> {
  if (typeof window === "undefined" || store.persist.hasHydrated()) return Promise.resolve();
  let promise = pending.get(store);
  if (!promise) {
    promise = Promise.resolve(store.persist.rehydrate()).finally(() => pending.delete(store));
    pending.set(store, promise);
  }
  return promise;
}

const serverSnapshot = () => false;

/**
 * True once every given store has rehydrated. Always false on the server and
 * during the hydration render, so guards (T5) never redirect too early.
 * Starts the rehydration after mount.
 */
export function useStoresHydratedFor(stores: readonly PersistedStore[]): boolean {
  const subscribe = React.useCallback(
    (listener: () => void) => {
      const unsubscribers = stores.map((store) => store.persist.onFinishHydration(listener));
      return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
    },
    [stores],
  );
  const getSnapshot = React.useCallback(
    () => stores.every((store) => store.persist.hasHydrated()),
    [stores],
  );

  const hydrated = React.useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);

  React.useEffect(() => {
    stores.forEach((store) => void hydrateStore(store));
  }, [stores]);

  return hydrated;
}
