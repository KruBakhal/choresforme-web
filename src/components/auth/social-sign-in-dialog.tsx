"use client";

import * as React from "react";
import Link from "next/link";
import { flushSync } from "react-dom";

import { RolePicker } from "@/components/auth/role-picker";
import { SeparateAccountsNotice } from "@/components/auth/separate-accounts-notice";
import { FormAlert } from "@/components/forms/form-alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isProfileComplete, otherRole } from "@/lib/auth/redirect";
import { auth, isServiceError } from "@/lib/mock/services";
import { AUTH_COPY, DEMO_SOCIAL_IDENTITIES, SERVICE_MESSAGES } from "@/lib/constants";
import type { Role, SocialProvider, User } from "@/lib/types";

type View = "confirm" | "role" | "mismatch";

type SocialSignInDialogProps = {
  provider: SocialProvider;
  /** The role chosen on sign-up; none on login (decision 3). */
  role?: Role;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (user: User) => void;
  /** A new or unfinished social user: they complete mobile, DOB and Terms next. */
  onIncompleteProfile: (user: User) => void;
  onPendingChange?: (pending: boolean) => void;
  /** Where focus returns on close (the button that opened the dialog). */
  returnFocusTo: HTMLElement | null;
  /** "Sign up with email instead" focuses this field (sign-up only). */
  emailFieldId?: string;
  /** "Log in instead" (sign-up only). */
  logInHref?: string;
};

function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * "Signing in with Google (demo)" (Tech Spec). The demo identity is
 * prefilled and read-only (decision 3). No SDK, script, iframe or image is
 * loaded. Views: confirm, choose a role (`ROLE_REQUIRED`) and separate
 * accounts (`ROLE_MISMATCH`).
 */
export function SocialSignInDialog({
  provider,
  role,
  open,
  onOpenChange,
  onSuccess,
  onIncompleteProfile,
  onPendingChange,
  returnFocusTo,
  emailFieldId,
  logInHref = "/login",
}: SocialSignInDialogProps) {
  const identity = DEMO_SOCIAL_IDENTITIES[provider];
  const fullName = `${identity.firstName} ${identity.lastName}`;

  const [view, setView] = React.useState<View>("confirm");
  const [pending, setPending] = React.useState(false);
  const [pendingRole, setPendingRole] = React.useState<Role | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const primaryRef = React.useRef<HTMLButtonElement>(null);
  const roleTitleRef = React.useRef<HTMLParagraphElement>(null);
  const focusEmailOnClose = React.useRef(false);

  function setBusy(value: boolean) {
    setPending(value);
    onPendingChange?.(value);
  }

  async function signIn(chosenRole: Role | undefined) {
    setError(null);
    setBusy(true);
    if (view === "role" && chosenRole) setPendingRole(chosenRole);
    try {
      const user = await auth.loginWithProvider(provider, chosenRole);
      onOpenChange(false);
      if (isProfileComplete(user)) {
        onSuccess(user);
      } else {
        onIncompleteProfile(user);
      }
    } catch (caught) {
      const code = isServiceError(caught) ? caught.code : null;
      flushSync(() => {
        setBusy(false);
        setPendingRole(null);
        if (code === "ROLE_REQUIRED") {
          setView("role");
        } else if (code === "ROLE_MISMATCH") {
          setView("mismatch");
        } else {
          setError(isServiceError(caught) ? caught.message : SERVICE_MESSAGES.mockError);
        }
      });
      // The mismatch heading focuses itself on mount.
      if (code === "ROLE_REQUIRED") roleTitleRef.current?.focus();
      else if (code !== "ROLE_MISMATCH") primaryRef.current?.focus();
    }
  }

  function blockWhilePending(event: Event) {
    if (pending) event.preventDefault();
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent
        closeDisabled={pending}
        onEscapeKeyDown={blockWhilePending}
        onInteractOutside={blockWhilePending}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          primaryRef.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (focusEmailOnClose.current && emailFieldId) {
            document.getElementById(emailFieldId)?.focus();
          } else {
            returnFocusTo?.focus();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{AUTH_COPY.social.dialogTitle(provider)}</DialogTitle>
          <DialogDescription>{AUTH_COPY.social.dialogDescription(provider)}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <p className="text-body-sm font-semibold text-ink">{AUTH_COPY.social.identityLabel}</p>
          <div className="flex items-center gap-4 rounded-md border border-border bg-surface-alt p-4">
            <span
              aria-hidden
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-body font-semibold text-ink"
            >
              {initials(identity.firstName, identity.lastName)}
            </span>
            <div className="min-w-0">
              <p className="text-body font-semibold text-ink">{fullName}</p>
              <p className="text-body-sm break-all text-ink-muted">{identity.email}</p>
            </div>
          </div>
        </div>

        {view === "confirm" && (
          <>
            {error && <FormAlert tone="error" message={error} autoFocus={false} />}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={pending}
                onClick={() => onOpenChange(false)}
              >
                {AUTH_COPY.social.cancel}
              </Button>
              <Button
                ref={primaryRef}
                type="button"
                className="w-full sm:w-auto"
                loading={pending}
                onClick={() => void signIn(role)}
              >
                {pending
                  ? AUTH_COPY.social.confirming
                  : AUTH_COPY.social.confirm(identity.firstName)}
              </Button>
            </DialogFooter>
          </>
        )}

        {view === "role" && (
          <>
            <div className="flex flex-col gap-3">
              <p
                ref={roleTitleRef}
                tabIndex={-1}
                className="text-body font-semibold text-ink outline-none focus-visible:outline-2"
              >
                {AUTH_COPY.picker.title}
              </p>
              <p className="text-body-sm text-ink-muted">{AUTH_COPY.social.roleBody(provider)}</p>
              <RolePicker
                variant="compact"
                pendingRole={pendingRole}
                onSelect={(chosen) => void signIn(chosen)}
              />
            </div>
            {error && <FormAlert tone="error" message={error} autoFocus={false} />}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={pending}
                onClick={() => onOpenChange(false)}
              >
                {AUTH_COPY.social.cancel}
              </Button>
            </DialogFooter>
          </>
        )}

        {view === "mismatch" && role && (
          <SeparateAccountsNotice
            variant="inline"
            headingLevel={3}
            focusOnMount
            body={AUTH_COPY.social.mismatchBody(fullName, otherRole(role), role)}
            secondary={
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href={logInHref}>{AUTH_COPY.social.logInInstead}</Link>
              </Button>
            }
            primary={
              <Button
                type="button"
                className="h-auto min-h-12 w-full py-3 text-center whitespace-normal sm:w-auto"
                onClick={() => {
                  focusEmailOnClose.current = true;
                  onOpenChange(false);
                }}
              >
                {AUTH_COPY.social.signUpWithEmail}
              </Button>
            }
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
