"use client";

import * as React from "react";
import { ArrowRight, UserRoundPlus } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { CompleteProfileForm } from "@/components/auth/complete-profile-form";
import { LoginForm } from "@/components/auth/login-form";
import { LogoutButton } from "@/components/auth/logout-button";
import { RoleChip, SignUpForm } from "@/components/auth/sign-up-form";
import { SocialButtons } from "@/components/auth/social-buttons";
import {
  FormAlert,
  FormAlertFromData,
  nextAlertKey,
  type FormAlertData,
} from "@/components/forms/form-alert";
import { Button } from "@/components/ui/button";
import { forgotPasswordHref, isProfileComplete, loginHref } from "@/lib/auth/redirect";
import { AUTH_COPY, JOB_BUILDER_COPY } from "@/lib/constants";
import { stepRoute, REVIEW_STEP } from "@/lib/job-builder";
import { useSessionStore } from "@/lib/store";
import type { User } from "@/lib/types";

export const REVIEW_AUTH_ID = "review-auth";
export const REVIEW_AUTH_TITLE_ID = "review-auth-title";
export const POST_CARD_TITLE_ID = "post-card-title";
/** The Review form that "Continue to payment" submits from the Post card. */
export const REVIEW_FORM_ID = "review-form";

type Variant = "signup" | "login" | "incomplete" | "customer" | "other";

const COPY = JOB_BUILDER_COPY.review;
const REVIEW_ROUTE = stepRoute(REVIEW_STEP);

function initials(user: Pick<User, "firstName" | "lastName">) {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
}

/**
 * Step 6's account card (T7 decision 1). It never redirects: a guest signs
 * up (default) or logs in inline, a new social customer finishes the profile
 * inline, and a customer gets the Post card with "Continue to payment". A
 * worker who logs in here is shown the separate accounts notice by the
 * builder gate, and the draft is kept.
 *
 * Analytics trigger points for T11 (no events fire in T7): `signup_started`
 * is the first change in the sign-up form or `openSocial` in Sign up mode;
 * `signup_completed` is `handleSignedUp`.
 */
export function ReviewAuthPanel() {
  const user = useSessionStore((state) => state.session?.user ?? null);
  const [mode, setMode] = React.useState<"signup" | "login">("signup");
  // While a sign-up, login, social sign-in or profile save runs, the card it
  // started on stays put (the session changes before the call resolves).
  const [frozen, setFrozen] = React.useState<Variant | null>(null);
  const [alert, setAlert] = React.useState<{ data: FormAlertData; key: number } | null>(null);
  const [logoutError, setLogoutError] = React.useState<string | null>(null);

  const computed: Variant = !user
    ? mode
    : user.role !== "customer"
      ? "other"
      : !isProfileComplete(user)
        ? "incomplete"
        : "customer";
  const variant = frozen ?? computed;

  // Focus the new card's heading after a change in this view (auth done,
  // mode switch, log out), never on the first render.
  const previous = React.useRef<Variant | null>(null);
  React.useEffect(() => {
    const before = previous.current;
    previous.current = variant;
    if (before === null || before === variant) return;
    const id = variant === "customer" ? POST_CARD_TITLE_ID : REVIEW_AUTH_TITLE_ID;
    document.getElementById(id)?.focus();
  }, [variant]);

  function handlePendingChange(pending: boolean) {
    setFrozen(pending ? variant : null);
  }

  function handleAlert(data: FormAlertData | null) {
    setAlert(data ? { data, key: nextAlertKey() } : null);
  }

  function switchMode(next: "signup" | "login") {
    setAlert(null);
    setMode(next);
  }

  /** Sign-up, login and social sign-in resolved: show the card for the new session. */
  function handleSignedIn() {
    setAlert(null);
    setFrozen(null);
  }

  /** `signup_completed` trigger point (T11). */
  function handleSignedUp() {
    handleSignedIn();
  }

  const alertNode = alert && <FormAlertFromData key={alert.key} alert={alert.data} />;
  const busy = frozen !== null;

  if (variant === "other") return null;

  if (variant === "customer" && user) {
    return (
      <section id={REVIEW_AUTH_ID} aria-labelledby={POST_CARD_TITLE_ID} className="scroll-mt-4">
        <AuthCard
          headingLevel={2}
          titleId={POST_CARD_TITLE_ID}
          title={COPY.postTitle}
          description={COPY.postDescription}
          alert={logoutError && <FormAlert tone="error" message={logoutError} />}
          className="xl:p-8"
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-4 rounded-md border border-border bg-surface-alt p-4">
              <span
                aria-hidden
                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-body font-semibold text-ink"
              >
                {initials(user)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-body-sm text-ink-muted">{COPY.signedInAs}</p>
                <p className="text-body font-semibold text-ink">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-body-sm break-all text-ink-muted">{user.email}</p>
              </div>
              <div className="basis-full sm:basis-auto">
                <LogoutButton
                  appearance="link"
                  label={AUTH_COPY.completeProfile.notYou}
                  redirectTo={null}
                  onError={setLogoutError}
                />
              </div>
            </div>
            <Button type="submit" form={REVIEW_FORM_ID} className="w-full">
              {COPY.continue}
              <ArrowRight aria-hidden />
            </Button>
          </div>
        </AuthCard>
      </section>
    );
  }

  if (variant === "incomplete" && user) {
    return (
      <section id={REVIEW_AUTH_ID} aria-labelledby={REVIEW_AUTH_TITLE_ID} className="scroll-mt-4">
        <AuthCard
          headingLevel={2}
          titleId={REVIEW_AUTH_TITLE_ID}
          eyebrow={<RoleChip role="customer" />}
          title={AUTH_COPY.completeProfile.title}
          description={
            user.authProvider === "email"
              ? AUTH_COPY.completeProfile.descriptionEmail
              : AUTH_COPY.completeProfile.description(user.authProvider)
          }
          alert={alertNode}
          className="xl:p-8"
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-4 rounded-md border border-border bg-surface-alt p-4">
              <span
                aria-hidden
                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-body font-semibold text-ink"
              >
                {initials(user)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-body font-semibold text-ink">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-body-sm break-all text-ink-muted">{user.email}</p>
              </div>
              <div className="basis-full sm:basis-auto">
                <LogoutButton
                  appearance="link"
                  label={AUTH_COPY.completeProfile.notYou}
                  redirectTo={null}
                />
              </div>
            </div>
            <CompleteProfileForm
              user={user}
              onPendingChange={handlePendingChange}
              onAlertChange={handleAlert}
              onSuccess={handleSignedUp}
            />
          </div>
        </AuthCard>
      </section>
    );
  }

  const signUp = variant === "signup";

  return (
    <section
      id={REVIEW_AUTH_ID}
      aria-labelledby={REVIEW_AUTH_TITLE_ID}
      className="flex scroll-mt-4 flex-col gap-4"
    >
      <p className="flex items-start gap-3 text-body font-semibold text-ink">
        <UserRoundPlus className="mt-1 size-5 shrink-0" aria-hidden />
        {COPY.authLead}
      </p>
      <AuthCard
        headingLevel={2}
        titleId={REVIEW_AUTH_TITLE_ID}
        eyebrow={signUp ? <RoleChip role="customer" /> : undefined}
        title={signUp ? AUTH_COPY.signUp.title.customer : AUTH_COPY.login.title}
        description={
          <div className="flex flex-wrap items-center gap-x-1 text-body-sm text-ink">
            <span>{signUp ? AUTH_COPY.signUp.haveAccount : AUTH_COPY.login.noAccount}</span>
            <Button
              type="button"
              variant="link"
              size="sm"
              disabled={busy}
              onClick={() => switchMode(signUp ? "login" : "signup")}
            >
              {signUp ? AUTH_COPY.signUp.logIn : AUTH_COPY.login.signUpLink}
            </Button>
          </div>
        }
        alert={alertNode}
        className="xl:p-8"
      >
        <div className="flex flex-col gap-6">
          <SocialButtons
            role="customer"
            disabled={busy}
            onPendingChange={handlePendingChange}
            onSuccess={signUp ? handleSignedUp : handleSignedIn}
            onIncompleteProfile={handleSignedIn}
            emailFieldId={signUp ? "firstName" : undefined}
            logInHref={loginHref(REVIEW_ROUTE)}
          />
          {signUp ? (
            <SignUpForm
              role="customer"
              disabled={busy}
              onPendingChange={handlePendingChange}
              onAlertChange={handleAlert}
              onLogInInstead={() => switchMode("login")}
              onSuccess={handleSignedUp}
            />
          ) : (
            <LoginForm
              disabled={busy}
              onPendingChange={handlePendingChange}
              onAlertChange={handleAlert}
              onSignUpInstead={() => switchMode("signup")}
              forgotPasswordHref={forgotPasswordHref(new URLSearchParams({ next: REVIEW_ROUTE }))}
              onSuccess={handleSignedIn}
            />
          )}
        </div>
      </AuthCard>
    </section>
  );
}
