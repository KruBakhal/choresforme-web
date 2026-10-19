import * as React from "react";

type SgSectionProps = {
  id: string;
  title: string;
  intro: string;
  children: React.ReactNode;
};

export function SgSection({ id, title, intro, children }: SgSectionProps) {
  const headingId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={headingId} className="scroll-mt-8">
      <h2 id={headingId} className="text-h2 font-semibold text-ink">
        {title}
      </h2>
      <p className="mt-2 text-body text-ink-muted">{intro}</p>
      <div className="mt-8">{children}</div>
    </section>
  );
}
