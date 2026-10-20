"use client";

import * as React from "react";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { SeparateAccountsNotice } from "@/components/auth/separate-accounts-notice";
import { FormAlert } from "@/components/forms/form-alert";
import { Button } from "@/components/ui/button";
import { dashboardFor, otherRole, signUpHref } from "@/lib/auth/redirect";
import { AUTH_COPY } from "@/lib/constants";
import type { Role } from "@/lib/types";

type RoleMismatchNoticeProps = {
  /** The signed-in account's role. */
  sessionRole: Role;
  focusOnMount?: boolean;
};

/**
 * The separate accounts notice for a signed-in user who opened the other
 * role's area or sign-up (decision 6): "Log out and create a … account", or
 * back to their own dashboard.
 */
export function RoleMismatchNotice({ sessionRole, focusOnMount = true }: RoleMismatchNoticeProps) {
  const [error, setError] = React.useState<string | null>(null);
  const target = otherRole(sessionRole);

  return (
    <SeparateAccountsNotice
      variant="page"
      headingLevel={1}
      body={AUTH_COPY.separate.body[sessionRole]}
      focusOnMount={focusOnMount}
      primary={
        <LogoutButton
          appearance="primary"
          label={AUTH_COPY.separate.logOutAndCreate(target)}
          redirectTo={signUpHref(target)}
          onError={setError}
        />
      }
      secondary={
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href={dashboardFor(sessionRole)}>{AUTH_COPY.separate.goToDashboard}</Link>
        </Button>
      }
      alert={error && <FormAlert tone="error" message={error} />}
    />
  );
}
