import { Suspense } from "react";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileCtaBar } from "@/components/layout/mobile-cta-bar";
import { MarketingMobileCta } from "@/components/marketing/marketing-mobile-cta";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Footer
        mobileCta={
          /* The pathname is not known in the shared layout shell, so the default bar is the fallback. */
          <Suspense fallback={<MobileCtaBar />}>
            <MarketingMobileCta />
          </Suspense>
        }
      />
    </>
  );
}
