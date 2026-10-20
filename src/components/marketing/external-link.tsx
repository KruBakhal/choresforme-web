import * as React from "react";
import { ExternalLink as ExternalLinkIcon } from "lucide-react";

import { A11Y } from "@/lib/constants";

type ExternalLinkProps = Omit<React.ComponentProps<"a">, "target" | "rel"> & {
  href: string;
  /** Trailing "external" icon. Off where space is tight (Footer app buttons). */
  showIcon?: boolean;
};

/** Opens in a new tab, with `rel="noopener noreferrer"` and a screen-reader hint. */
export function ExternalLink({ children, showIcon = true, ...props }: ExternalLinkProps) {
  return (
    <a target="_blank" rel="noopener noreferrer" {...props}>
      {children}
      {showIcon && <ExternalLinkIcon className="size-4" aria-hidden />}
      <span className="sr-only"> {A11Y.newTab}</span>
    </a>
  );
}
