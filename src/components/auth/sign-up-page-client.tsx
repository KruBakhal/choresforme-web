"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthCardSkeleton } from "@/components/auth/auth-card-skeleton";
import { AuthRedirecting } from "@/components/auth/auth-redirecting";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { CompleteProfileForm } from "@/components/auth/complete-profile-form";
import { LogoutButton } from "@/components/auth/logout-button";
import { RoleMismatchNotice } from "@/components/auth/role-mismatch-notice";
import { RolePicker } from "@/components/auth/role-picker";
import { RoleChip, SignUpForm } from "@/components/auth/sign-up-form";
import { SocialButtons } from "@/components/auth/social-buttons";
import { FormAlertFromData, nextAlertKey, type FormAlertData } from "@/components/forms/form-alert";
import { Button } from "@/components/ui/button";
import { isProfileComplete, loginHref, routeAfterAuth, signUpHref } from "@/lib/auth/redirect";
import { useAuthParams } from "@/lib/auth/use-auth-params";
import { useRevisitKey } from "@/lib/hooks/use-revisit-key";
import { AUTH_COPY } from "@/lib/constants";
import { isSessionActive, useSessionHydrated, useSessionStore } from "@/lib/store";
import type { Role, User } from "@/lib/types";

type View =
  | { kind: "picker" }
  | { kind: "loading" }
  | { kind: "form"; role: Role }
  | { kind: "complete"; role: Role; user: User }
  | { kind: "mismatch"; sessionRole: Role }
  | { kind: "redirect"; to: string; status: boolean };

const TITLE_ID = "signup-title";
const PICKER_TITLE_ID = "picker-title";

function initials(user: Pick<User, "firstName" | "lastName">) {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
}

/**
 * `/signup`: the role picker without a valid `?role=` (decision 8); the
 * sign-up form for that role; the complete-profile form for an unfinished
 * social sign-up (decision 4); the separate accounts notice for a signed-in
 * user of the other role (decision 6); otherwise a signed-in visitor is sent
 * on (decision 7). Render inside `<Suspense>`.
 */
export function SignUpPageClient() {
  // A fresh view on every visit: Cache Components keeps /signup mounted (and
  // a frozen view) while the user is elsewhere.
  const revisitKey = useRevisitKey();
  return <SignUpView key={revisitKey} />;
}

function SignUpView() {
  const { role, next, kept } = useAuthParams();
  const router = useRouter();
  const hydrated = useSessionHydrated();
  const session = useSessionStore((state) => state.session);
  const user = hydrated ? (session?.user ?? null) : null;

  // While a sign-up, social sign-in or profile save runs (and while its
  // redirect runs), the view it started on stays put.
  const [frozen, setFrozen] = React.useState<View | null>(null);
  const [alert, setAlert] = React.useState<{ data: FormAlertData; key: number } | null>(null);

  let computed: View;
  if (!role) {
    if (user && !isProfileComplete(user)) {
      computed = { kind: "redirect", to: signUpHref(user.role, kept), status: false };
    } else if (user) {
      computed = { kind: "redirect", to: routeAfterAuth(user, next, { kept }), status: true };
    } else {
      computed = { kind: "picker" };
    }
  } else if (!hydrated) {
    computed = { kind: "loading" };
  } else if (!user) {
    computed = { kind: "form", role };
  } else if (!isProfileComplete(user)) {
    computed =
      user.role === role
        ? { kind: "complete", role, user }
        : { kind: "redirect", to: signUpHref(user.role, kept), status: false };
  } else if (user.role !== role) {
    computed = { kind: "mismatch", sessionRole: user.role };
  } else {
    computed = { kind: "redirect", to: routeAfterAuth(user, next, { kept }), status: true };
  }

  const view = frozen ?? computed;
  const redirectTo = view.kind === "redirect" ? view.to : null;

  React.useEffect(() => {
    if (redirectTo && isSessionActive(useSessionStore.getState().session)) {
      router.replace(redirectTo);
    }
  }, [redirectTo, router]);

  // Focus the new view's h1 after a client-side change (picker → form, form
  // → complete profile, complete profile → form), never on the first view.
  const previousKind = React.useRef<View["kind"] | null>(null);
  React.useEffect(() => {
    const kind = view.kind;
    const previous = previousKind.current;
    if (kind === "loading" || kind === "redirect") return;
    previousKind.current = kind;
    if (previous === null || previous === kind) return;
    const titleId = kind === "picker" ? PICKER_TITLE_ID : TITLE_ID;
    document.getElementById(titleId)?.focus();
  }, [view.kind]);

  function handlePendingChange(pending: boolean) {
    setFrozen(pending ? view : null);
  }

  function handleAlert(data: FormAlertData | null) {
    setAlert(data ? { data, key: nextAlertKey() } : null);
  }

  function goTo(href: string) {
    setFrozen(view);
    router.replace(href);
  }

  /** A new or unfinished social user: the complete-profile form for their role. */
  function handleIncompleteProfile(signedIn: User) {
    setAlert(null);
    if (signedIn.role === role) {
      // Same URL: the page re-renders with the complete-profile form.
      setFrozen(null);
      return;
    }
    goTo(signUpHref(signedIn.role, kept));
  }

  const logIn = loginHref(next, kept);
  const alertNode = alert && <FormAlertFromData key={alert.key} alert={alert.data} />;

  switch (view.kind) {
    case "picker":
    case "redirect":
      if (view.kind === "redirect" && view.status) {
        return (
          <div className="mx-auto w-full max-w-xl">
            <AuthRedirecting />
          </div>
        );
      }
      return (
        <div className="mx-auto w-full max-w-3xl">
          <div className="text-center">
            <h1
              id={PICKER_TITLE_ID}
              tabIndex={-1}
              className="text-h3 outline-none focus-visible:outline-2 md:text-h2"
            >
              {AUTH_COPY.picker.title}
            </h1>
            <p className="mt-2 text-body text-ink-muted">{AUTH_COPY.picker.description}</p>
          </div>
          <div className="mt-8 md:mt-12">
            <RolePicker variant="page" hrefFor={(picked) => signUpHref(picked, kept)} />
          </div>
          <p className="mt-8 flex flex-wrap items-center justify-center gap-x-1 text-center text-body-sm text-ink">
            <span>{AUTH_COPY.picker.haveAccount}</span>
            <Button asChild variant="link" size="sm">
              <Link href={logIn}>{AUTH_COPY.picker.logIn}</Link>
            </Button>
          </p>
        </div>
      );

    case "loading":
      return <AuthCardSkeleton />;

    case "mismatch":
      return <RoleMismatchNotice sessionRole={view.sessionRole} />;

    case "complete": {
      const { user: incomplete } = view;
      return (
        <AuthSplitLayout
          stickyBrand
          brand={<AuthBrandPanel audience={view.role === "worker" ? "worker" : "trust"} />}
        >
          <AuthCard
            titleId={TITLE_ID}
            eyebrow={<RoleChip role={view.role} />}
            title={AUTH_COPY.completeProfile.title}
            description={
              incomplete.authProvider === "email"
                ? AUTH_COPY.completeProfile.descriptionEmail
                : AUTH_COPY.completeProfile.description(incomplete.authProvider)
            }
            alert={alertNode}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-4 rounded-md border border-border bg-surface-alt p-4">
                <span
                  aria-hidden
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-body font-semibold text-ink"
                >
                  {initials(incomplete)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-body font-semibold text-ink">
                    {incomplete.firstName} {incomplete.lastName}
                  </p>
                  <p className="text-body-sm break-all text-ink-muted">{incomplete.email}</p>
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
                user={incomplete}
                onPendingChange={handlePendingChange}
                onAlertChange={handleAlert}
                onSuccess={(saved) =>
                  goTo(routeAfterAuth(saved, next, { afterSignUp: true, kept }))
                }
              />
            </div>
          </AuthCard>
        </AuthSplitLayout>
      );
    }

    case "form":
      return (
        <AuthSplitLayout
          stickyBrand
          brand={<AuthBrandPanel audience={view.role === "worker" ? "worker" : "trust"} />}
        >
          <AuthCard
            titleId={TITLE_ID}
            eyebrow={<RoleChip role={view.role} changeHref={signUpHref(null, kept)} />}
            title={AUTH_COPY.signUp.title[view.role]}
            description={AUTH_COPY.signUp.description[view.role]}
            alert={alertNode}
            footer={
              <div className="flex flex-wrap items-center gap-x-1">
                <span>{AUTH_COPY.signUp.haveAccount}</span>
                <Button asChild variant="link" size="sm">
                  <Link href={logIn}>{AUTH_COPY.signUp.logIn}</Link>
                </Button>
              </div>
            }
          >
            <div className="flex flex-col gap-6">
              <SocialButtons
                role={view.role}
                disabled={frozen !== null}
                onPendingChange={handlePendingChange}
                onSuccess={(signedIn) => goTo(routeAfterAuth(signedIn, next, { kept }))}
                onIncompleteProfile={handleIncompleteProfile}
                emailFieldId="firstName"
                logInHref={logIn}
              />
              <SignUpForm
                role={view.role}
                disabled={frozen !== null}
                onPendingChange={handlePendingChange}
                onAlertChange={handleAlert}
                logInHref={logIn}
                onSuccess={(created) =>
                  goTo(routeAfterAuth(created, next, { afterSignUp: true, kept }))
                }
              />
            </div>
          </AuthCard>
        </AuthSplitLayout>
      );
  }
}
