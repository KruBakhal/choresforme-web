"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown } from "lucide-react";

import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthRedirecting } from "@/components/auth/auth-redirecting";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import {
  DEMO_ACCOUNTS_ID,
  DEMO_ACCOUNTS_TITLE_ID,
  DemoAccountsPanel,
} from "@/components/auth/demo-accounts-panel";
import { LoginForm, type LoginFormHandle } from "@/components/auth/login-form";
import { SocialButtons } from "@/components/auth/social-buttons";
import { FormAlertFromData, nextAlertKey, type FormAlertData } from "@/components/forms/form-alert";
import { Button } from "@/components/ui/button";
import { forgotPasswordHref, routeAfterAuth, signUpHref } from "@/lib/auth/redirect";
import { useAuthParams, type AuthParams } from "@/lib/auth/use-auth-params";
import { useRevisitKey } from "@/lib/hooks/use-revisit-key";
import { AUTH_COPY, DEMO_PASSWORD } from "@/lib/constants";
import { isSessionActive, useSessionHydrated, useSessionStore } from "@/lib/store";
import type { User } from "@/lib/types";

const TITLE_ID = "login-title";

/** Params before the URL is known (the prerendered Suspense fallback). */
const NO_AUTH_PARAMS: AuthParams = { role: null, next: null, kept: new URLSearchParams() };

/** `/login` with the URL's `next` and `utm_*`. Render inside `<Suspense>`. */
export function LoginPageClient() {
  const params = useAuthParams();
  // A fresh view on every visit: Cache Components keeps /login mounted (and
  // its "Logging in…" state) while the user is elsewhere.
  const revisitKey = useRevisitKey();
  return <LoginView key={revisitKey} params={params} />;
}

/** The Suspense fallback: the same page before the URL's params are known. */
export function LoginPageFallback() {
  return <LoginView params={NO_AUTH_PARAMS} />;
}

/**
 * Login page body: social buttons, the email form, the Demo accounts panel
 * and the brand panel. A visitor who is already signed in is sent to `next`
 * or their dashboard (decision 7), but only after the session has loaded.
 */
function LoginView({ params }: { params: AuthParams }) {
  const { next, kept } = params;
  const router = useRouter();
  const hydrated = useSessionHydrated();
  const session = useSessionStore((state) => state.session);

  const formRef = React.useRef<LoginFormHandle>(null);
  const [busy, setBusy] = React.useState(false);
  const [navigating, setNavigating] = React.useState(false);
  const [pendingEmail, setPendingEmail] = React.useState<string | null>(null);
  const [alert, setAlert] = React.useState<{ data: FormAlertData; key: number } | null>(null);

  // Signed in on arrival (not a login that just happened on this page).
  const arrivalTarget =
    hydrated && session && !busy && !navigating
      ? routeAfterAuth(session.user, next, { kept })
      : null;

  React.useEffect(() => {
    if (arrivalTarget && isSessionActive(useSessionStore.getState().session)) {
      router.replace(arrivalTarget);
    }
  }, [arrivalTarget, router]);

  function handlePendingChange(pending: boolean) {
    setBusy(pending);
    if (!pending) setPendingEmail(null);
  }

  function goOn(user: User) {
    setNavigating(true);
    router.replace(routeAfterAuth(user, next, { kept }));
  }

  function handleAlert(data: FormAlertData | null) {
    setAlert(data ? { data, key: nextAlertKey() } : null);
  }

  function selectDemo(email: string) {
    setPendingEmail(email);
    formRef.current?.submitWith(email, DEMO_PASSWORD);
  }

  function jumpToDemo(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    document.getElementById(DEMO_ACCOUNTS_ID)?.scrollIntoView({ block: "start" });
    document.getElementById(DEMO_ACCOUNTS_TITLE_ID)?.focus({ preventScroll: true });
  }

  const signUpLink = signUpHref(null, kept);
  const disabled = busy || navigating;

  return (
    <AuthSplitLayout
      aside={
        <DemoAccountsPanel
          onSelect={selectDemo}
          pendingEmail={pendingEmail}
          disabled={disabled || !!arrivalTarget}
        />
      }
      brand={<AuthBrandPanel audience="trust" />}
    >
      <AuthCard
        titleId={TITLE_ID}
        title={AUTH_COPY.login.title}
        description={AUTH_COPY.login.description}
        alert={alert && <FormAlertFromData key={alert.key} alert={alert.data} />}
        footer={
          <div className="flex flex-wrap items-center gap-x-1">
            <span>{AUTH_COPY.login.noAccount}</span>
            <Button asChild variant="link" size="sm">
              <Link href={signUpLink}>{AUTH_COPY.login.signUpLink}</Link>
            </Button>
          </div>
        }
      >
        {arrivalTarget ? (
          <AuthRedirecting />
        ) : (
          <div className="flex flex-col gap-6">
            <Button asChild variant="link" size="sm" className="self-start lg:hidden">
              <a href={`#${DEMO_ACCOUNTS_ID}`} onClick={jumpToDemo}>
                <ArrowDown className="size-4" aria-hidden />
                {AUTH_COPY.login.demoJump}
              </a>
            </Button>
            <SocialButtons
              disabled={disabled}
              onPendingChange={handlePendingChange}
              onSuccess={goOn}
              onIncompleteProfile={goOn}
            />
            <LoginForm
              ref={formRef}
              disabled={disabled}
              onSuccess={goOn}
              onPendingChange={handlePendingChange}
              onAlertChange={handleAlert}
              signUpHref={signUpLink}
              forgotPasswordHref={forgotPasswordHref(kept)}
            />
          </div>
        )}
      </AuthCard>
    </AuthSplitLayout>
  );
}
