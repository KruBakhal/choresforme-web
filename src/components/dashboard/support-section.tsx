import Link from "next/link";
import { CircleHelp, Mail, Phone } from "lucide-react";

import { SupportEmailText } from "@/components/layout/support-email-text";
import {
  DASHBOARD_COPY,
  FAQ_HREF,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_PHONE_HREF,
} from "@/lib/constants";

const COPY = DASHBOARD_COPY.account;
const link =
  "inline-flex min-h-11 items-center gap-2 text-body text-ink underline decoration-1 underline-offset-4 hover:decoration-2";

/** Account → Support: the single support email and phone, and the FAQ (PRD "Shared"). */
export function SupportSection() {
  return (
    <section
      id="support"
      aria-labelledby="support-title"
      className="rounded-lg border border-border bg-surface p-4 md:p-6"
    >
      <h2 id="support-title" className="text-h4 font-semibold text-ink">
        {COPY.supportTitle}
      </h2>
      <p className="mt-1 text-body-sm text-ink-muted">{COPY.supportIntro}</p>
      <ul className="mt-4 flex flex-col gap-1">
        <li>
          <a href={`mailto:${SUPPORT_EMAIL}`} className={link}>
            <Mail className="size-5 shrink-0" aria-hidden />
            <span className="min-w-0 break-words">
              <SupportEmailText />
            </span>
          </a>
        </li>
        <li>
          <a href={SUPPORT_PHONE_HREF} className={link}>
            <Phone className="size-5 shrink-0" aria-hidden />
            {COPY.callOrText(SUPPORT_PHONE)}
          </a>
        </li>
        <li>
          <Link href={FAQ_HREF} className={link}>
            <CircleHelp className="size-5 shrink-0" aria-hidden />
            {COPY.faq}
          </Link>
        </li>
      </ul>
    </section>
  );
}
