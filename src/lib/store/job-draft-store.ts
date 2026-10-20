"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { browserStorage, STORE_KEYS, useStoresHydratedFor } from "@/lib/store/storage";
import type { JobDraft } from "@/lib/types";

/*
 * Job builder draft. Saved at every step and kept through reloads and Back
 * ("Back never clears entered data"). T7 clears it after `jobs.create`
 * succeeds.
 */

export const EMPTY_JOB_DRAFT: JobDraft = { lastStep: 0 };

type JobDraftState = {
  draft: JobDraft;
  setDraft: (draft: JobDraft) => void;
  /** Merges step values into the draft. */
  patchDraft: (patch: Partial<JobDraft>) => void;
  /** Records the furthest step reached; going Back never lowers it. */
  completeStep: (step: number) => void;
  clear: () => void;
};

export const useJobDraftStore = create<JobDraftState>()(
  persist(
    (set) => ({
      draft: EMPTY_JOB_DRAFT,
      setDraft: (draft) => set({ draft }),
      patchDraft: (patch) => set((state) => ({ draft: { ...state.draft, ...patch } })),
      completeStep: (step) =>
        set((state) => ({
          draft: { ...state.draft, lastStep: Math.max(state.draft.lastStep, step) },
        })),
      clear: () => set({ draft: EMPTY_JOB_DRAFT }),
    }),
    {
      name: STORE_KEYS.jobDraft,
      version: 1,
      storage: browserStorage,
      skipHydration: true,
      partialize: (state) => ({ draft: state.draft }),
    },
  ),
);

const JOB_DRAFT_STORES = [useJobDraftStore] as const;

/** False on the server and until the draft has loaded from localStorage. */
export function useJobDraftHydrated(): boolean {
  return useStoresHydratedFor(JOB_DRAFT_STORES);
}

export function isJobDraftEmpty(draft: JobDraft): boolean {
  return (
    Object.entries(draft).every(([key, value]) => key === "lastStep" || value === undefined) &&
    draft.lastStep === 0
  );
}
