import type { ReactNode } from "react";

import { GuardLoading } from "@/components/auth/guard-loading";
import { RequireRole } from "@/components/auth/require-role";
import { AppShell } from "@/components/layout/app-shell";

/* Customer area: client-side guard around the customer shell (T5 decision 3). */
export default function CustomerDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole
      role="customer"
      loading={
        <AppShell role="customer">
          <GuardLoading />
        </AppShell>
      }
    >
      <AppShell role="customer">{children}</AppShell>
    </RequireRole>
  );
}
