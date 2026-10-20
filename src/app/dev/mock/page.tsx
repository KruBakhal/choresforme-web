import type { Metadata } from "next";

import { DevMockPanel } from "@/app/dev/mock/_components/dev-mock-panel";
import { DEV_MOCK_COPY } from "@/lib/constants";

/* Dev test page for the mock layer (T3). Not linked from anywhere; noindex like /styleguide. */
export const metadata: Metadata = {
  title: DEV_MOCK_COPY.metaTitle,
  robots: { index: false, follow: false },
};

export default function DevMockPage() {
  return <DevMockPanel />;
}
