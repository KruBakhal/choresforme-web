"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { browserStorage, STORE_KEYS, useStoresHydratedFor } from "@/lib/store/storage";
import type { Session, User } from "@/lib/types";

/*
 * Mock session (Tech Spec "Mock auth behaviour"). The mock auth services set
 * and clear it; screens read it. Sessions last 30 days on the same device
 * unless the user logs out; an expired session is dropped on rehydration and
 * ignored by the services.
 */

type SessionState = {
  session: Session | null;
  setSession: (session: Session) => void;
  /** Keeps the signed-in user in sync after a profile change. */
  updateUser: (patch: Partial<User>) => void;
  clear: () => void;
};

/** Call at event time only (it reads the clock). */
export function isSessionActive(session: Session | null): session is Session {
  return !!session && Date.parse(session.expiresAt) > Date.now();
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      updateUser: (patch) =>
        set((state) =>
          state.session
            ? { session: { ...state.session, user: { ...state.session.user, ...patch } } }
            : state,
        ),
      clear: () => set({ session: null }),
    }),
    {
      name: STORE_KEYS.session,
      version: 1,
      storage: browserStorage,
      skipHydration: true,
      partialize: (state) => ({ session: state.session }),
      merge: (persisted, current) => {
        const saved = (persisted as Partial<SessionState> | undefined)?.session ?? null;
        return { ...current, session: isSessionActive(saved) ? saved : null };
      },
    },
  ),
);

const SESSION_STORES = [useSessionStore] as const;

/** False on the server and until the session has loaded from localStorage. */
export function useSessionHydrated(): boolean {
  return useStoresHydratedFor(SESSION_STORES);
}

export const selectSessionUser = (state: SessionState) => state.session?.user ?? null;
