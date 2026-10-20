import type { ReactNode } from "react";

import { AuthHeader } from "@/components/auth/auth-header";
import { Container } from "@/components/layout/container";
import { Footer } from "@/components/layout/footer";
import { JobBuilderGate } from "@/components/post-job/job-builder-gate";

/*
 * Job builder shell (T6): the minimal auth header (skip link and logo), the
 * step, and the Footer without the mobile "Post a job" bar, which would cover
 * Continue. The gate waits for the draft and session to load and shows the
 * separate accounts notice to a worker session.
 */
export default function PostJobLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AuthHeader />
      <main id="main" tabIndex={-1} className="flex-1 bg-surface outline-none">
        <Container className="py-8 md:py-12">
          <JobBuilderGate>{children}</JobBuilderGate>
        </Container>
      </main>
      <Footer showMobileCta={false} />
    </>
  );
}
