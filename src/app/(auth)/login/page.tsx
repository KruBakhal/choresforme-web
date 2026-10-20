import { Suspense } from "react";
import type { Metadata } from "next";

import { LoginPageClient, LoginPageFallback } from "@/components/auth/login-page-client";
import { AUTH_COPY } from "@/lib/constants";

export const metadata: Metadata = {
  title: AUTH_COPY.meta.login,
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    // The URL's `next` is only known in the browser; the fallback is the same page without it.
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageClient />
    </Suspense>
  );
}
