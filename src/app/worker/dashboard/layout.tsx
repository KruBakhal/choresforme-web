import type { ReactNode } from "react";

import { GuardLoading } from "@/components/auth/guard-loading";
import { RequireRole } from "@/components/auth/require-role";
import { AppShell } from "@/components/layout/app-shell";

/* Worker area: client-side guard around the worker shell (T5 decision 3). */
export default function WorkerDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole
      role="worker"
      loading={
        <AppShell role="worker">
          <GuardLoading />
        </AppShell>
      }
    >
      <AppShell role="worker">{children}</AppShell>
    </RequireRole>
  );
}
