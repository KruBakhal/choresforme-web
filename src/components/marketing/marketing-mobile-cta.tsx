"use client";

import { usePathname } from "next/navigation";

import { MobileCtaBar } from "@/components/layout/mobile-cta-bar";
import { WORKERS_HREF, WORKERS_PAGE_COPY } from "@/lib/constants";

/**
 * Marketing sticky mobile bar (T4 decision 9): "Create worker account" on
 * /workers, "Post a job" everywhere else.
 */
export function MarketingMobileCta() {
  const pathname = usePathname();

  if (pathname === WORKERS_HREF) {
    return <MobileCtaBar {...WORKERS_PAGE_COPY.mobileCta} />;
  }

  return <MobileCtaBar />;
}
