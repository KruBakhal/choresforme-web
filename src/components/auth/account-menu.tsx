"use client";

import { UserRound } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { A11Y, AUTH_COPY } from "@/lib/constants";
import { useRevisitKey } from "@/lib/hooks/use-revisit-key";
import { selectSessionUser, useSessionHydrated, useSessionStore } from "@/lib/store";
import type { Role } from "@/lib/types";

type AccountMenuProps = {
  role: Role;
  /** Styleguide only: sample name, inert Log out. */
  preview?: boolean;
};

/**
 * Mobile top bar "Account" control: a bottom sheet with the account and Log
 * out (decision 11). Remounted on every visit to its route, so the sheet
 * never comes back open after logging out.
 */
export function AccountMenu(props: AccountMenuProps) {
  const revisitKey = useRevisitKey();
  return <AccountMenuView key={revisitKey} {...props} />;
}

function AccountMenuView({ role, preview = false }: AccountMenuProps) {
  const hydrated = useSessionHydrated();
  const sessionUser = useSessionStore(selectSessionUser);
  const user = hydrated && !preview ? sessionUser : null;

  const name = user ? `${user.firstName} ${user.lastName}` : AUTH_COPY.account.previewName;
  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : AUTH_COPY.account.previewName.charAt(0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <UserRound aria-hidden />
          <span className="sr-only">{AUTH_COPY.account.menu}</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        aria-describedby={undefined}
        closeLabel={A11Y.closeDialog}
        className="rounded-t-lg pb-safe"
      >
        <SheetTitle className="pr-12">{AUTH_COPY.account.menu}</SheetTitle>
        <div className="flex items-center gap-4 rounded-md border border-border bg-surface-alt p-4">
          <span
            aria-hidden
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-body font-semibold text-ink"
          >
            {initials}
          </span>
          <div className="min-w-0">
            <p className="text-body font-semibold text-ink">{name}</p>
            {user && <p className="text-body-sm break-all text-ink-muted">{user.email}</p>}
            <p className="text-caption text-ink-muted">{AUTH_COPY.account.roleLabel[role]}</p>
          </div>
        </div>
        <LogoutButton appearance="sheet" preview={preview} />
      </SheetContent>
    </Sheet>
  );
}
