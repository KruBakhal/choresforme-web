"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { RepostConfirmDialog } from "@/components/dashboard/repost-confirm-dialog";
import { markStepNavigation } from "@/components/flow/step-layout";
import { DASHBOARD_COPY } from "@/lib/constants";
import { findCategory, jobToDraft, REVIEW_STEP, stepRoute } from "@/lib/job-builder";
import { hydrateStores, isJobDraftEmpty, useJobDraftStore } from "@/lib/store";
import type { Job, Template } from "@/lib/types";

/** What can be re-posted: a saved template, or a completed or cancelled job. */
export type RepostSource = { kind: "template"; template: Template } | { kind: "job"; job: Job };

export function repostSourceId(source: RepostSource): string {
  return source.kind === "template" ? source.template.id : source.job.id;
}

function dialogDescription(source: RepostSource): string {
  if (source.kind === "template") {
    return DASHBOARD_COPY.repostDialog.descriptionTemplate(source.template.name);
  }
  const category = findCategory(source.job.category)?.name ?? source.job.category;
  return DASHBOARD_COPY.repostDialog.descriptionJob(category);
}

/**
 * Re-post (T8 rule 21, decision 5): loads the template or past job into the
 * job draft (no photos, Save As Template unticked, `lastStep` 5) and opens
 * Review. A draft in progress is never replaced without asking. Render
 * `dialog` once in the view; `openingId` is the source whose button shows
 * "Opening…" until the route changes.
 */
export function useRepost() {
  const router = useRouter();
  const [openingId, setOpeningId] = React.useState<string | null>(null);
  const [confirm, setConfirm] = React.useState<RepostSource | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const busy = React.useRef(false);

  const open = React.useCallback(
    (source: RepostSource) => {
      const store = useJobDraftStore.getState();
      store.setDraft(jobToDraft(source.kind === "template" ? source.template.job : source.job));
      store.setTemplateName(undefined);
      setOpeningId(repostSourceId(source));
      // Review's heading takes focus when it mounts.
      markStepNavigation();
      router.push(stepRoute(REVIEW_STEP));
    },
    [router],
  );

  const repost = React.useCallback(
    async (source: RepostSource) => {
      if (busy.current) return;
      busy.current = true;
      // The trigger stays enabled (and focused) until the draft check is done, so
      // the dialog returns focus to it on "Keep".
      await hydrateStores();
      if (isJobDraftEmpty(useJobDraftStore.getState().draft)) {
        open(source);
        return;
      }
      busy.current = false;
      setConfirm(source);
      setDialogOpen(true);
    },
    [open],
  );

  const replacing = confirm !== null && openingId === repostSourceId(confirm);

  const dialog = (
    <RepostConfirmDialog
      open={dialogOpen}
      description={confirm ? dialogDescription(confirm) : ""}
      replacing={replacing}
      onKeep={() => setDialogOpen(false)}
      onReplace={() => {
        if (!confirm || busy.current) return;
        busy.current = true;
        open(confirm);
      }}
    />
  );

  return {
    repost: (source: RepostSource) => void repost(source),
    /** The source being opened from its own button (not from the dialog). */
    openingId: replacing ? null : openingId,
    dialog,
  };
}
