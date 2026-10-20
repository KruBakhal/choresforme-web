"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { revokePhotoUrls } from "@/lib/job-builder";
import { browserStorage, STORE_KEYS, useStoresHydratedFor } from "@/lib/store/storage";
import type { JobDraft } from "@/lib/types";

/*
 * Job builder draft. Saved at every step and kept through reloads and Back
 * ("Back never clears entered data"). T7 clears it after `jobs.create`
 * succeeds.
 *
 * Photos are object URLs, which do not survive a reload (T6 decision 3): they
 * stay in memory for the tab's lifetime and are left out of the saved copy.
 * URLs that leave the draft (replaced or cleared) are revoked.
 */

export const EMPTY_JOB_DRAFT: JobDraft = { lastStep: 0 };

/** Revokes the photo URLs that `next` no longer holds. */
function revokeDropped(previous: JobDraft, next: JobDraft): void {
  if (!previous.photos?.length || previous.photos === next.photos) return;
  const kept = new Set(next.photos ?? []);
  revokePhotoUrls(previous.photos.filter((url) => !kept.has(url)));
}

function withoutPhotos(draft: JobDraft): JobDraft {
  const saved = { ...draft };
  delete saved.photos;
  return saved;
}

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
    (set, get) => ({
      draft: EMPTY_JOB_DRAFT,
      setDraft: (draft) => {
        revokeDropped(get().draft, draft);
        set({ draft });
      },
      patchDraft: (patch) => {
        const previous = get().draft;
        const draft = { ...previous, ...patch };
        if ("photos" in patch) revokeDropped(previous, draft);
        set({ draft });
      },
      completeStep: (step) =>
        set((state) => ({
          draft: { ...state.draft, lastStep: Math.max(state.draft.lastStep, step) },
        })),
      clear: () => {
        revokePhotoUrls(get().draft.photos);
        set({ draft: EMPTY_JOB_DRAFT });
      },
    }),
    {
      name: STORE_KEYS.jobDraft,
      version: 1,
      storage: browserStorage,
      skipHydration: true,
      partialize: (state) => ({ draft: withoutPhotos(state.draft) }),
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
