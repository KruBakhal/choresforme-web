"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { isNavActive } from "@/components/layout/is-nav-active";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { A11Y, AUTH_COPY, HEADER_ACTIONS, NAV_ITEMS } from "@/lib/constants";
import { selectSessionUser, useSessionHydrated, useSessionStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export type SideNavMode = "responsive" | "full" | "icon";

type SideNavProps = {
  role: Role;
  /** `responsive`: icon only from md, full (240 px) from lg. */
  mode?: SideNavMode;
  /** Overrides the current pathname for the active item. */
  activeHref?: string;
  /** Styleguide only: not sticky, no full-height. */
  preview?: boolean;
  className?: string;
};

const MODE = {
  responsive: {
    width: "w-20 lg:w-60",
    top: "justify-center lg:justify-start lg:px-4",
    logo: "responsive",
    label: "sr-only lg:not-sr-only",
    item: "mx-auto size-12 justify-center lg:mx-0 lg:h-12 lg:w-full lg:justify-start lg:px-3",
    cta: "w-12 px-0 lg:w-full lg:px-6",
    ctaWrap: "flex justify-center lg:block",
    user: "sr-only lg:not-sr-only lg:mb-3 lg:px-3",
  },
  full: {
    width: "w-60",
    top: "px-4",
    logo: "lockup",
    label: "",
    item: "h-12 w-full px-3",
    cta: "w-full",
    ctaWrap: "",
    user: "mb-3 px-3",
  },
  icon: {
    width: "w-20",
    top: "justify-center",
    logo: "mark",
    label: "sr-only",
    item: "mx-auto size-12 justify-center",
    cta: "w-12 px-0",
    ctaWrap: "flex justify-center",
    user: "sr-only",
  },
} as const;

export function SideNav({
  role,
  mode = "responsive",
  activeHref,
  preview = false,
  className,
}: SideNavProps) {
  const pathname = usePathname();
  const current = activeHref ?? pathname;
  const m = MODE[mode];
  const showTitle = mode !== "full";
  const hydrated = useSessionHydrated();
  const sessionUser = useSessionStore(selectSessionUser);
  const userName = preview
    ? AUTH_COPY.account.previewName
    : hydrated && sessionUser
      ? `${sessionUser.firstName} ${sessionUser.lastName}`
      : null;

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col border-r border-border bg-surface",
        m.width,
        preview ? "relative self-stretch" : "sticky top-0 h-dvh",
        className,
      )}
    >
      <div className={cn("flex h-16 items-center", m.top)}>
        <Logo variant={m.logo} />
      </div>

      {role === "customer" && (
        <div className={cn("px-4 pt-2", m.ctaWrap)}>
          <Button asChild className={m.cta}>
            <Link
              href={HEADER_ACTIONS.postJob.href}
              title={showTitle ? HEADER_ACTIONS.postJob.label : undefined}
            >
              <Plus aria-hidden />
              <span className={m.label}>{HEADER_ACTIONS.postJob.label}</span>
            </Link>
          </Button>
        </div>
      )}

      <nav aria-label={A11Y.dashboardNav} className="px-4 py-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS[role].map((item) => {
            const active = isNavActive(current, item);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={showTitle ? item.label : undefined}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md text-body transition-colors duration-150 motion-reduce:transition-none",
                    m.item,
                    active
                      ? "bg-brand-soft font-semibold text-ink"
                      : "text-ink-muted hover:bg-surface-alt hover:text-ink",
                  )}
                >
                  <Icon className="size-5 shrink-0" aria-hidden />
                  <span className={m.label}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Account and Log out (T5 decision 11): the last item, under a rule. */}
      <div className="mt-auto border-t border-border px-4 py-4">
        {userName && (
          <div className={m.user}>
            <p className="truncate text-body-sm font-semibold text-ink">{userName}</p>
            <p className="text-caption text-ink-muted">{AUTH_COPY.account.roleLabel[role]}</p>
          </div>
        )}
        <LogoutButton
          appearance="sidenav"
          preview={preview}
          showTitle={showTitle}
          itemClassName={m.item}
          labelClassName={m.label}
        />
      </div>
    </div>
  );
}
