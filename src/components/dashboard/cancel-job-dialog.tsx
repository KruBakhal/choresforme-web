"use client";

import * as React from "react";
import { Info } from "lucide-react";

import { FormAlert, nextAlertKey } from "@/components/forms/form-alert";
import { ExternalLink } from "@/components/marketing/external-link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DASHBOARD_COPY, FAQ_HREF, SERVICE_MESSAGES } from "@/lib/constants";
import { findCategory } from "@/lib/job-builder";
import { isServiceError, jobs as jobService } from "@/lib/mock/services";
import type { Job } from "@/lib/types";

type CancelJobDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job;
  /** "Jordan M." for an accepted job, or null. */
  workerName: string | null;
  /** The job is cancelled: the dialog has closed. */
  onCancelled: (job: Job) => void;
  /** NOT_ALLOWED: the status changed meanwhile; the parent reloads the job behind the dialog. */
  onNotAllowed: () => void;
  /** After the dialog has fully closed (exit animation done), on success or after NOT_ALLOWED. */
  onClosedAfterChange: (result: "cancelled" | "notAllowed") => void;
};

const COPY = DASHBOARD_COPY.cancelDialog;
const KEEP_ID = "cancel-keep";

/**
 * Cancel a job (T8 decision 2; AC "Cancel shows a confirmation dialog noting
 * the fee rule is to be confirmed"). No amount is shown. Opens on "Keep
 * job"; Esc, the overlay and the close button do nothing while the request
 * runs.
 */
export function CancelJobDialog({
  open,
  onOpenChange,
  job,
  workerName,
  onCancelled,
  onNotAllowed,
  onClosedAfterChange,
}: CancelJobDialogProps) {
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<{ key: number; notAllowed: boolean } | null>(null);
  const result = React.useRef<"cancelled" | "notAllowed" | null>(null);
  // Opened without a DialogTrigger: remember the Cancel job button to return focus to it.
  const returnTo = React.useRef<HTMLElement | null>(null);

  // A fresh dialog every time it opens. Adjusted during render (React's
  // "storing information from previous renders" pattern), not in an effect.
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setError(null);
      setPending(false);
    }
  }

  const category = findCategory(job.category)?.name ?? job.category;
  const description =
    job.status === "accepted"
      ? COPY.descriptionAccepted(workerName ?? COPY.workerFallback)
      : COPY.descriptionOpen(category);
  const notAllowed = error?.notAllowed ?? false;

  async function confirm() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const updated = await jobService.cancel(job.id);
      result.current = "cancelled";
      setPending(false);
      onOpenChange(false);
      onCancelled(updated);
    } catch (caught) {
      setPending(false);
      const isNotAllowed = isServiceError(caught) && caught.code === "NOT_ALLOWED";
      setError({ key: nextAlertKey(), notAllowed: isNotAllowed });
      if (isNotAllowed) {
        result.current = "notAllowed";
        onNotAllowed();
      }
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) onOpenChange(next);
      }}
    >
      <DialogContent
        closeDisabled={pending}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          result.current = null;
          returnTo.current = document.activeElement as HTMLElement | null;
          document.getElementById(KEEP_ID)?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (!result.current) {
            // "Keep job": back to the Cancel job button.
            returnTo.current?.focus();
            return;
          }
          // The trigger no longer exists after a cancel: the parent moves focus.
          onClosedAfterChange(result.current);
          result.current = null;
        }}
      >
        <DialogHeader>
          <DialogTitle>{COPY.title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex items-start gap-3 rounded-md bg-brand-soft p-4 text-body-sm text-ink">
          <Info className="size-5 shrink-0" aria-hidden />
          <div className="flex flex-col gap-1">
            <p>{COPY.feeNote}</p>
            <ExternalLink
              href={`${FAQ_HREF}#${COPY.faqLink.id}`}
              className="inline-flex min-h-11 items-center gap-2 self-start text-body-sm text-ink underline underline-offset-4"
            >
              {COPY.faqLink.label}
            </ExternalLink>
          </div>
        </div>
        {error && (
          <FormAlert
            key={error.key}
            tone="error"
            message={error.notAllowed ? SERVICE_MESSAGES.notAllowed : SERVICE_MESSAGES.mockError}
          />
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button id={KEEP_ID} type="button" variant="outline" disabled={pending}>
              {notAllowed ? COPY.close : COPY.keep}
            </Button>
          </DialogClose>
          {!notAllowed && (
            <Button
              type="button"
              variant="destructive"
              loading={pending}
              onClick={() => void confirm()}
            >
              {pending ? COPY.cancelling : COPY.confirm}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
