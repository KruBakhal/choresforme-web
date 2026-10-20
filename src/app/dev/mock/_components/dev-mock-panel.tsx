"use client";

import * as React from "react";
import { Bug } from "lucide-react";

import { JumpNav } from "@/app/dev/mock/_components/jump-nav";
import { MockErrorNotice } from "@/app/dev/mock/_components/mock-error-notice";
import { SeedCheck } from "@/app/dev/mock/_components/seed-check";
import { ServiceGroup } from "@/app/dev/mock/_components/service-group";
import { StoreViewer } from "@/app/dev/mock/_components/store-viewer";
import { SERVICE_GROUPS } from "@/app/dev/mock/_data/service-calls";
import { Container } from "@/components/layout/container";
import { ResetDemoDataButton } from "@/components/layout/reset-demo-data-button";
import { Button } from "@/components/ui/button";
import { DEV_MOCK_COPY as C } from "@/lib/constants";

const DEV_MOCK_PATH = "/dev/mock";

// The URL is read on the client only (no search-param hook, nothing at render on the server).
const subscribeToNothing = () => () => {};
const readArmed = () => new URLSearchParams(window.location.search).get("mockError") === "1";
const serverArmed = () => false;

/** Dev page: calls every mock service, shows the seed check and the persisted stores. */
export function DevMockPanel() {
  const armed = React.useSyncExternalStore(subscribeToNothing, readArmed, serverArmed);

  return (
    <main id="main" className="flex-1">
      <Container className="py-12">
        <div className="flex flex-col gap-4">
          <h1>{C.title}</h1>
          <p className="max-w-3xl text-body text-ink-muted">{C.intro}</p>
          <p className="text-body-sm text-ink-muted">{C.mockErrorHint}</p>
          {armed && <MockErrorNotice />}

          <div className="flex flex-wrap items-center gap-3">
            {/* Full page loads (not next/link) so the one-shot ?mockError=1 re-arms. */}
            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
              <a href={`${DEV_MOCK_PATH}?mockError=1`}>
                <Bug aria-hidden />
                {C.loadWithError}
              </a>
            </Button>
            {armed && (
              <Button asChild variant="ghost" size="sm" className="w-full sm:w-auto">
                <a href={DEV_MOCK_PATH}>{C.loadWithoutError}</a>
              </Button>
            )}
            <ResetDemoDataButton appearance="button" />
          </div>

          <JumpNav />
        </div>

        <SeedCheck className="mt-12" />

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="flex min-w-0 flex-col gap-12 lg:col-span-8">
            {SERVICE_GROUPS.map((group) => (
              <ServiceGroup key={group.id} group={group} />
            ))}
          </div>
          <aside className="min-w-0 lg:sticky lg:top-8 lg:col-span-4 lg:self-start">
            <StoreViewer />
          </aside>
        </div>
      </Container>
    </main>
  );
}
