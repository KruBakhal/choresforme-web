import type { ReactNode } from "react";

import { AuthHeader } from "@/components/auth/auth-header";
import { RequireRole } from "@/components/auth/require-role";
import { StepSkeleton } from "@/components/flow/step-skeleton";
import { Container } from "@/components/layout/container";
import { Footer } from "@/components/layout/footer";
import { OnboardingHeaderActions } from "@/components/worker-onboarding/onboarding-header-actions";

function OnboardingMain({ children }: { children: ReactNode }) {
  return (
    <main id="main" tabIndex={-1} className="flex-1 bg-surface outline-none">
      <Container className="py-8 md:py-12">{children}</Container>
    </main>
  );
}

/*
 * Worker onboarding shell (T9): the worker guard (no session → log in; a
 * customer sees the separate accounts notice), the minimal header with
 * Finish later and Log out, the step, and the Footer without the mobile CTA
 * bar, which would cover Continue. The Footer sits outside the guard so it
 * also shows under the notice.
 */
export default function WorkerOnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <RequireRole
        role="worker"
        loading={
          <>
            <AuthHeader />
            <OnboardingMain>
              <StepSkeleton segments={4} asideFirst />
            </OnboardingMain>
          </>
        }
      >
        <AuthHeader actions={<OnboardingHeaderActions />} />
        <OnboardingMain>{children}</OnboardingMain>
      </RequireRole>
      <Footer showMobileCta={false} />
    </>
  );
}
