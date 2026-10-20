import Link from "next/link";
import { Smartphone } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { MobileCtaBar } from "@/components/layout/mobile-cta-bar";
import { ResetDemoDataButton } from "@/components/layout/reset-demo-data-button";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  A11Y,
  BRAND_TAGLINE,
  FOOTER,
  PLAY_STORE_CUSTOMER_URL_PLACEHOLDER,
  PLAY_STORE_WORKER_URL_PLACEHOLDER,
  SUPPORT_EMAIL,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

type FooterProps = {
  /** Render the sticky mobile "Post a job" bar as the last child. */
  showMobileCta?: boolean;
  /** Styleguide only: the CTA bar renders in flow and at every width. */
  preview?: boolean;
};

const linkClass =
  "inline-flex min-h-11 items-center rounded-md text-body text-surface underline-offset-4 hover:underline focus-visible:outline-surface";

const appLinks = [
  { label: FOOTER.customerAppLabel, href: PLAY_STORE_CUSTOMER_URL_PLACEHOLDER },
  { label: FOOTER.workerAppLabel, href: PLAY_STORE_WORKER_URL_PLACEHOLDER },
];

/* Cached with the prerendered page, so the year is fixed at build time (a rebuild updates it). */
async function getCopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function Footer({ showMobileCta = true, preview = false }: FooterProps) {
  const year = await getCopyrightYear();

  return (
    <footer className="bg-surface-dark text-surface">
      <Container
        className={cn("pt-12 md:pt-16 md:pb-12", showMobileCta && !preview ? "pb-24" : "pb-12")}
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-8 md:gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="md:col-span-8 lg:col-span-4">
            <Logo tone="onDark" />
            <p className="mt-4 text-body-sm text-surface">{BRAND_TAGLINE}</p>
          </div>

          <nav
            aria-label={A11Y.footerNav}
            className="grid grid-cols-1 gap-8 md:col-span-8 md:grid-cols-8 md:gap-6 lg:gap-8"
          >
            <div className="md:col-span-3">
              <h2 className="text-body font-semibold text-surface">{FOOTER.appHeading}</h2>
              <ul className="mt-4 flex flex-col items-start gap-3">
                {appLinks.map((app) => (
                  <li key={app.label} className="w-full md:w-auto">
                    <Button asChild variant="inverse" size="sm" className="w-full md:w-auto">
                      <a href={app.href}>
                        <Smartphone aria-hidden />
                        {app.label}
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-3">
              <h2 className="text-body font-semibold text-surface">{FOOTER.supportHeading}</h2>
              <ul className="mt-4 flex flex-col gap-1">
                <li>
                  <a href={`mailto:${SUPPORT_EMAIL}`} className={cn(linkClass, "break-all")}>
                    {SUPPORT_EMAIL}
                  </a>
                </li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h2 className="text-body font-semibold text-surface">{FOOTER.legalHeading}</h2>
              <ul className="mt-4 flex flex-col gap-1">
                <li>
                  <Link href={FOOTER.privacy.href} className={linkClass}>
                    {FOOTER.privacy.label}
                  </Link>
                </li>
                <li>
                  <Link href={FOOTER.terms.href} className={linkClass}>
                    {FOOTER.terms.label}
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <Separator className="my-8 bg-surface/20" />
        <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-body-sm text-surface">{FOOTER.copyright(year)}</p>
          <ResetDemoDataButton className={linkClass} />
        </div>
      </Container>
      {showMobileCta && <MobileCtaBar preview={preview} />}
    </footer>
  );
}
