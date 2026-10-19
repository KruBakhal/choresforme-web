"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isNavActive } from "@/components/layout/is-nav-active";
import { A11Y, NAV_ITEMS } from "@/lib/constants";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

type BottomNavProps = {
  role: Role;
  /** Overrides the current pathname for the active item. */
  activeHref?: string;
  /** Styleguide only: render in flow and at every width. */
  preview?: boolean;
  className?: string;
};

/** Mobile (< 768 px) dashboard navigation, fixed to the bottom of the viewport. */
export function BottomNav({ role, activeHref, preview = false, className }: BottomNavProps) {
  const pathname = usePathname();
  const current = activeHref ?? pathname;

  return (
    <nav
      aria-label={A11Y.dashboardNav}
      className={cn(
        "border-t border-border bg-surface pb-safe",
        preview ? "static" : "fixed inset-x-0 bottom-0 z-40 md:hidden",
        className,
      )}
    >
      <ul className="grid grid-cols-4">
        {NAV_ITEMS[role].map((item) => {
          const active = isNavActive(current, item);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-caption focus-visible:-outline-offset-2",
                  active ? "font-semibold text-ink" : "text-ink-muted",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-16 items-center justify-center rounded-full transition-colors duration-150 motion-reduce:transition-none",
                    active && "bg-brand-soft",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
