"use client";

import * as React from "react";

import { SocialSignInDialog } from "@/components/auth/social-sign-in-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AUTH_COPY } from "@/lib/constants";
import type { Role, SocialProvider, User } from "@/lib/types";

const PROVIDERS: readonly SocialProvider[] = ["google", "facebook"];

type SocialButtonsProps = {
  /** The sign-up role; none on login. */
  role?: Role;
  onSuccess: (user: User) => void;
  onIncompleteProfile: (user: User) => void;
  onPendingChange?: (pending: boolean) => void;
  disabled?: boolean;
  /** Sign-up: the field "Sign up with email instead" focuses. */
  emailFieldId?: string;
  /** Sign-up: "Log in instead" in the separate accounts view. */
  logInHref?: string;
};

/**
 * "Continue with Google / Facebook", then the "or" divider. Each opens the
 * demo sign-in dialog; no external SDK is loaded (AGENTS.md rule 3).
 */
export function SocialButtons({
  role,
  onSuccess,
  onIncompleteProfile,
  onPendingChange,
  disabled = false,
  emailFieldId,
  logInHref,
}: SocialButtonsProps) {
  const [provider, setProvider] = React.useState<SocialProvider>("google");
  const [open, setOpen] = React.useState(false);
  // A new dialog instance per opening, so it always starts at the confirm view.
  const [session, setSession] = React.useState(0);
  const [trigger, setTrigger] = React.useState<HTMLElement | null>(null);

  function openFor(next: SocialProvider, element: HTMLElement) {
    setProvider(next);
    setTrigger(element);
    setSession((value) => value + 1);
    setOpen(true);
  }

  return (
    <div className="flex flex-col gap-3">
      {PROVIDERS.map((item) => (
        <Button
          key={item}
          type="button"
          variant="outline"
          className="w-full"
          disabled={disabled}
          aria-haspopup="dialog"
          onClick={(event) => openFor(item, event.currentTarget)}
        >
          <span
            aria-hidden
            className="flex size-6 items-center justify-center rounded-full border border-input text-caption font-semibold text-ink"
          >
            {AUTH_COPY.social.monogram[item]}
          </span>
          {AUTH_COPY.social[item]}
        </Button>
      ))}

      <div className="my-2 flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-body-sm text-ink-muted">{AUTH_COPY.social.divider}</span>
        <Separator className="flex-1" />
      </div>

      <SocialSignInDialog
        key={session}
        provider={provider}
        role={role}
        open={open}
        onOpenChange={setOpen}
        onSuccess={onSuccess}
        onIncompleteProfile={onIncompleteProfile}
        onPendingChange={onPendingChange}
        returnFocusTo={trigger}
        emailFieldId={emailFieldId}
        logInHref={logInHref}
      />
    </div>
  );
}
