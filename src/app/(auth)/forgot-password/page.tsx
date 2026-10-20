import { Suspense } from "react";
import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { ForgotPasswordPageClient } from "@/components/auth/forgot-password-page-client";
import { AUTH_COPY } from "@/lib/constants";

export const metadata: Metadata = {
  title: AUTH_COPY.meta.forgotPassword,
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto w-full max-w-lg">
      {/* The fallback is the same form, with "Back to log in" before `next` is known. */}
      <Suspense fallback={<ForgotPasswordForm />}>
        <ForgotPasswordPageClient />
      </Suspense>
    </div>
  );
}
