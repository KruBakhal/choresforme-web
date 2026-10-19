import Link from "next/link";

import { Container } from "@/components/layout/container";
import { HeaderMenu } from "@/components/layout/header-menu";
import { Logo } from "@/components/layout/logo";
import { SkipLink } from "@/components/layout/skip-link";
import { Button } from "@/components/ui/button";
import { A11Y, HEADER_ACTIONS, HEADER_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

type HeaderProps = {
  /** Styleguide only: not sticky, no skip link. */
  preview?: boolean;
};

/** Marketing header. Pages using it must give their `main` the id "main". */
export function Header({ preview = false }: HeaderProps) {
  return (
    <header
      className={cn(
        "z-40 h-16 border-b border-border bg-surface",
        preview ? "relative" : "sticky top-0",
      )}
    >
      {!preview && <SkipLink />}
      <Container className="h-full" innerClassName="flex h-full items-center justify-between gap-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav aria-label={A11Y.mainNav} className="hidden lg:block">
            <ul className="flex gap-2">
              {HEADER_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex h-11 items-center rounded-md px-3 text-body text-ink underline-offset-4 hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 lg:flex">
            <Button asChild variant="ghost" size="sm">
              <Link href={HEADER_ACTIONS.logIn.href}>{HEADER_ACTIONS.logIn.label}</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={HEADER_ACTIONS.signUp.href}>{HEADER_ACTIONS.signUp.label}</Link>
            </Button>
            <Button asChild size="sm">
              <Link href={HEADER_ACTIONS.postJob.href}>{HEADER_ACTIONS.postJob.label}</Link>
            </Button>
          </div>
          <Button asChild size="sm" className="hidden md:inline-flex lg:hidden">
            <Link href={HEADER_ACTIONS.postJob.href}>{HEADER_ACTIONS.postJob.label}</Link>
          </Button>
          <HeaderMenu />
        </div>
      </Container>
    </header>
  );
}
