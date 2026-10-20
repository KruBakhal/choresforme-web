"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { setLogoutDestination } from "@/lib/auth/redirect";
import { useRevisitKey } from "@/lib/hooks/use-revisit-key";
import { auth } from "@/lib/mock/services";
import { AUTH_COPY, AUTH_ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type LogoutButtonProps = {
  /**
   * `sidenav`: the last SideNav item (pass `itemClassName` / `labelClassName`
   * for the nav mode). `sheet`: full-width outline button in the Account
   * sheet. `link`: a link button. `primary`: a wrap-safe primary button.
   */
  appearance: "sidenav" | "sheet" | "link" | "primary";
  /** Defaults to "Log out". */
  label?: string;
  itemClassName?: string;
  labelClassName?: string;
  /** Adds a `title` tooltip (icon-only nav). */
  showTitle?: boolean;
  /** Where to go after logging out; `null` stays on the page. Default `/login`. */
  redirectTo?: string | null;
  onLoggedOut?: () => void;
  /** When set, the caller shows the error (the button does not). */
  onError?: (message: string | null) => void;
  /** Styleguide only: inert. */
  preview?: boolean;
  className?: string;
};

/**
 * Calls `auth.logout()` (the session is cleared, the demo data stays), then
 * navigates. Remounted on every visit to its route, so a page kept by Cache
 * Components never comes back stuck on "Logging out…".
 */
export function LogoutButton(props: LogoutButtonProps) {
  const revisitKey = useRevisitKey();
  return <LogoutButtonView key={revisitKey} {...props} />;
}

function LogoutButtonView({
  appearance,
  label = AUTH_COPY.account.logOut,
  itemClassName,
  labelClassName,
  showTitle = false,
  redirectTo = AUTH_ROUTES.login,
  onLoggedOut,
  onError,
  preview = false,
  className,
}: LogoutButtonProps) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  async function handleClick() {
    if (preview || pending) return;
    setPending(true);
    setFailed(false);
    onError?.(null);
    // Read by the route guard, which sees the session disappear first.
    setLogoutDestination(redirectTo);
    try {
      await auth.logout();
      onLoggedOut?.();
      if (redirectTo) {
        router.replace(redirectTo);
      } else {
        setPending(false);
      }
      window.setTimeout(() => setLogoutDestination(null), 1000);
    } catch {
      setLogoutDestination(null);
      setPending(false);
      if (onError) {
        onError(AUTH_COPY.account.logoutError);
      } else {
        setFailed(true);
      }
    }
  }

  const text = pending ? AUTH_COPY.account.loggingOut : label;
  const showIcon = appearance === "sidenav" || appearance === "sheet";

  const button =
    appearance === "sidenav" ? (
      <Button
        type="button"
        variant="ghost"
        loading={pending}
        title={showTitle ? text : undefined}
        onClick={handleClick}
        className={cn(
          "gap-3 rounded-md px-0 text-body font-normal text-ink-muted hover:bg-surface-alt hover:text-ink",
          itemClassName,
          className,
        )}
      >
        {!pending && showIcon && <LogOut className="size-5 shrink-0" aria-hidden />}
        <span className={labelClassName}>{text}</span>
      </Button>
    ) : appearance === "sheet" ? (
      <Button
        type="button"
        variant="outline"
        loading={pending}
        onClick={handleClick}
        className={cn("w-full", className)}
      >
        {!pending && <LogOut aria-hidden />}
        {text}
      </Button>
    ) : appearance === "link" ? (
      <Button
        type="button"
        variant="link"
        size="sm"
        loading={pending}
        onClick={handleClick}
        className={className}
      >
        {text}
      </Button>
    ) : (
      <Button
        type="button"
        loading={pending}
        onClick={handleClick}
        className={cn(
          "h-auto min-h-12 w-full py-3 text-center whitespace-normal sm:w-auto",
          className,
        )}
      >
        {text}
      </Button>
    );

  if (!failed) return button;

  return (
    <div className="flex flex-col">
      {button}
      <p
        role="alert"
        className={cn(
          "mt-2 text-danger",
          appearance === "sidenav"
            ? "text-center text-caption lg:text-left"
            : "text-left text-body-sm",
        )}
      >
        {AUTH_COPY.account.logoutError}
      </p>
    </div>
  );
}
