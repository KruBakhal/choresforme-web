"use client";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { loginHref } from "@/lib/auth/redirect";
import { useAuthParams } from "@/lib/auth/use-auth-params";
import { useRevisitKey } from "@/lib/hooks/use-revisit-key";

/** `/forgot-password` with "Back to log in" keeping `next`. Render inside `<Suspense>`. */
export function ForgotPasswordPageClient() {
  const { kept } = useAuthParams();
  // Back on the form (not "Check your email") on every visit.
  const revisitKey = useRevisitKey();
  return <ForgotPasswordForm key={revisitKey} logInHref={loginHref(null, kept)} />;
}
