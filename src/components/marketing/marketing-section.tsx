import * as React from "react";

import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

type MarketingSectionProps = {
  id?: string;
  /** Id of the section's heading. Without it the band renders as a `div`. */
  labelledBy?: string;
  tone: "surface" | "alt";
  /** `section` is the standard rhythm; `intro` is for the hero and page intros. */
  spacing?: "section" | "intro";
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
};

/** A full-width band: background tone, vertical rhythm and the page Container. */
export function MarketingSection({
  id,
  labelledBy,
  tone,
  spacing = "section",
  className,
  innerClassName,
  children,
}: MarketingSectionProps) {
  const Element = labelledBy ? "section" : "div";

  return (
    <Element
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        tone === "alt" ? "bg-surface-alt" : "bg-surface",
        id && "scroll-mt-16",
        className,
      )}
    >
      <Container
        className={spacing === "intro" ? "pt-8 pb-12 md:py-16" : "py-12 md:py-16 lg:py-24"}
        innerClassName={innerClassName}
      >
        {children}
      </Container>
    </Element>
  );
}
