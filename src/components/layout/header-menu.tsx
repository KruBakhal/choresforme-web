"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { HeaderAuthActions } from "@/components/layout/header-auth-actions";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { A11Y, HEADER_ACTIONS, HEADER_NAV } from "@/lib/constants";

/**
 * Tablet and mobile menu (< 1024 px). Esc, the overlay and the close button
 * close it, and choosing any link closes it too. Radix returns focus to the
 * trigger on close.
 */
export function HeaderMenu() {
  const [open, setOpen] = React.useState(false);

  function closeOnLinkClick(event: React.MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("a")) setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu aria-hidden />
          <span className="sr-only">{A11Y.openMenu}</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        aria-describedby={undefined}
        closeLabel={A11Y.closeMenu}
        onClick={closeOnLinkClick}
      >
        <SheetTitle className="sr-only">{A11Y.menuTitle}</SheetTitle>
        <div className="flex min-h-11 items-center pr-12">
          <Logo />
        </div>

        <nav aria-label={A11Y.mainNav}>
          <ul className="mt-6 flex flex-col gap-1">
            {HEADER_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex h-12 items-center rounded-md px-4 text-body font-semibold text-ink transition-colors duration-150 hover:bg-surface-alt focus-visible:-outline-offset-2 motion-reduce:transition-none"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Separator className="my-6" />

        <div className="flex flex-col gap-3">
          <HeaderAuthActions layout="stacked" />
          <Button asChild className="w-full">
            <Link href={HEADER_ACTIONS.postJob.href}>{HEADER_ACTIONS.postJob.label}</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
