import { Mail, MessageCircleQuestion, Phone } from "lucide-react";

import { SupportEmailText } from "@/components/layout/support-email-text";
import { FAQ_COPY, SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_PHONE_HREF } from "@/lib/constants";
import { cn } from "@/lib/utils";

type FaqContactCardProps = {
  headingLevel: 2 | 3;
  /** `aside` on /faq, where the card is complementary content. */
  as?: "div" | "aside";
  className?: string;
};

const HEADING_ID = "faq-contact-title";

const linkClass =
  "inline-flex min-h-11 items-center gap-2 rounded-md text-body text-ink underline decoration-1 underline-offset-4 hover:decoration-2";

/** "Still have questions?" with the support email and phone. */
export function FaqContactCard({ headingLevel, as = "div", className }: FaqContactCardProps) {
  const Wrapper = as;
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <Wrapper
      aria-labelledby={as === "aside" ? HEADING_ID : undefined}
      className={cn("rounded-lg border border-border bg-surface p-6 md:p-8", className)}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-brand-soft">
        <MessageCircleQuestion className="size-6 text-ink" aria-hidden />
      </span>
      <Heading id={HEADING_ID} className="mt-4 text-h4">
        {FAQ_COPY.contact.title}
      </Heading>
      <p className="mt-2 text-body text-ink-muted">{FAQ_COPY.contact.body}</p>
      <ul className="mt-6 flex flex-col gap-2">
        <li className="min-w-0">
          <a href={`mailto:${SUPPORT_EMAIL}`} className={cn(linkClass, "break-words")}>
            <Mail className="size-5 shrink-0" aria-hidden />
            <span className="min-w-0">
              <SupportEmailText />
            </span>
          </a>
        </li>
        <li>
          <a href={SUPPORT_PHONE_HREF} className={linkClass}>
            <Phone className="size-5 shrink-0" aria-hidden />
            {SUPPORT_PHONE}
          </a>
        </li>
      </ul>
    </Wrapper>
  );
}
