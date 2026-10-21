import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { SkipLink } from "@/components/layout/skip-link";

type AuthHeaderProps = {
  /**
   * T9: controls at the right (worker onboarding: Finish later, Log out).
   * With actions the logo shows the mark only below `sm`, and the header can
   * grow (for example under a Log out error line).
   */
  actions?: ReactNode;
};

/**
 * Minimal auth banner: skip link and logo, no nav or CTAs. Not sticky, so
 * phones keep more room for the form. Server-safe (also used by the guard).
 */
export function AuthHeader({ actions }: AuthHeaderProps = {}) {
  if (!actions) {
    return (
      <header className="h-16 border-b border-border bg-surface">
        <SkipLink />
        <Container className="h-full" innerClassName="flex h-full items-center">
          <Logo />
        </Container>
      </header>
    );
  }

  return (
    <header className="min-h-16 border-b border-border bg-surface">
      <SkipLink />
      <Container
        className="h-full"
        innerClassName="flex min-h-16 items-center justify-between gap-4"
      >
        <Logo variant="mark" className="sm:hidden" />
        <Logo className="hidden sm:inline-flex" />
        <div className="flex items-center gap-2">{actions}</div>
      </Container>
    </header>
  );
}
