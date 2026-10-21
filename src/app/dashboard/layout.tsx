import { Suspense, type ReactNode } from "react";

import { GuardLoading } from "@/components/auth/guard-loading";
import { RequireRole } from "@/components/auth/require-role";
import { CustomerShell } from "@/components/dashboard/customer-shell";
import { AppShell } from "@/components/layout/app-shell";

/*
 * Customer area: client-side guard around the customer shell (T5 decision 3).
 * T8: the shell has a rail slot that Home fills (`ShellRail`).
 *
 * The guard and the shell's navs read the pathname, which is unknown while
 * the job routes (`/dashboard/jobs/[id]`) are prerendered with Cache
 * Components. The Suspense boundary lets those routes render in the browser;
 * its fallback reads no pathname, and static routes never show it.
 */
export default function CustomerDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-surface-alt px-4 py-6 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-content">
            <GuardLoading />
          </div>
        </div>
      }
    >
      <RequireRole
        role="customer"
        loading={
          <AppShell role="customer">
            <GuardLoading />
          </AppShell>
        }
      >
        <CustomerShell>{children}</CustomerShell>
      </RequireRole>
    </Suspense>
  );
}
