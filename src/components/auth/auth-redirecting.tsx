import { Loader2 } from "lucide-react";

import { AUTH_COPY } from "@/lib/constants";

/** "Taking you to your dashboard…" while a signed-in visitor is sent on (decision 7). */
export function AuthRedirecting() {
  return (
    <p role="status" className="flex items-center gap-3 text-body text-ink">
      <Loader2 className="size-5 shrink-0 motion-safe:animate-spin" aria-hidden />
      {AUTH_COPY.login.redirecting}
    </p>
  );
}
