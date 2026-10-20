import type { Metadata } from "next";

import { LegalPlaceholder } from "@/components/marketing/legal-placeholder";
import { MARKETING_META } from "@/lib/constants";

/* Placeholder until the final web text arrives, so it stays out of search (T4 decision 8). */
export const metadata: Metadata = { ...MARKETING_META.terms, robots: { index: false } };

export default function TermsPage() {
  return <LegalPlaceholder kind="terms" />;
}
