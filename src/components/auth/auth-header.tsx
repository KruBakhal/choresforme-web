import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { SkipLink } from "@/components/layout/skip-link";

/**
 * Minimal auth banner: skip link and logo, no nav or CTAs. Not sticky, so
 * phones keep more room for the form. Server-safe (also used by the guard).
 */
export function AuthHeader() {
  return (
    <header className="h-16 border-b border-border bg-surface">
      <SkipLink />
      <Container className="h-full" innerClassName="flex h-full items-center">
        <Logo />
      </Container>
    </header>
  );
}
