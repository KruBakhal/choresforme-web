"use client";

import * as React from "react";

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
import { DASHBOARD_COPY } from "@/lib/constants";

type RepostConfirmDialogProps = {
  open: boolean;
  /** "You have a job in progress. Re-posting … replaces it." */
  description: string;
  /** Replace is running: the dialog stays open with a spinner until the route changes. */
  replacing: boolean;
  onKeep: () => void;
  onReplace: () => void;
};

const COPY = DASHBOARD_COPY.repostDialog;
const KEEP_ID = "repost-keep";

/**
 * "Replace the job you're building?" (T8 open question 6). Opens on "Keep
 * my current job" (the least harmful choice); Keep changes nothing and focus
 * returns to the Re-post button. Esc and the overlay are ignored while
 * Replace runs.
 */
export function RepostConfirmDialog({
  open,
  description,
  replacing,
  onKeep,
  onReplace,
}: RepostConfirmDialogProps) {
  // Opened without a DialogTrigger: remember the Re-post button to return focus to it.
  const returnTo = React.useRef<HTMLElement | null>(null);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !replacing) onKeep();
      }}
    >
      <DialogContent
        closeDisabled={replacing}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          returnTo.current = document.activeElement as HTMLElement | null;
          document.getElementById(KEEP_ID)?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnTo.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>{COPY.title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button id={KEEP_ID} type="button" variant="outline" disabled={replacing}>
              {COPY.keep}
            </Button>
          </DialogClose>
          <Button type="button" loading={replacing} onClick={onReplace}>
            {replacing ? COPY.replacing : COPY.replace}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
