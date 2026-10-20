import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthCardSkeleton } from "@/components/auth/auth-card-skeleton";
import { SignUpPageClient } from "@/components/auth/sign-up-page-client";
import { AUTH_COPY } from "@/lib/constants";

export const metadata: Metadata = {
  title: AUTH_COPY.meta.signUp,
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    // `?role=` is only known in the browser on this prerendered page.
    <Suspense fallback={<AuthCardSkeleton />}>
      <SignUpPageClient />
    </Suspense>
  );
}
