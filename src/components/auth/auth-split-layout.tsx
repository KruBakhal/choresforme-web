import * as React from "react";

import { cn } from "@/lib/utils";

type AuthSplitLayoutProps = {
  /** The form card (left column from lg). */
  children: React.ReactNode;
  /** Optional block at the top of the right column (the Demo accounts panel). */
  aside?: React.ReactNode;
  /** The brand panel (right column from lg, a strip under the card below lg). */
  brand: React.ReactNode;
  /** Keeps the brand panel in view next to a long form (lg and up). */
  stickyBrand?: boolean;
};

/**
 * Login and sign-up grid: form card left and brand panel right from lg; one
 * centred column (max-w-xl) at md; one full-width column on phones. DOM order
 * (card, aside, brand) is also the stacked and the focus order.
 */
export function AuthSplitLayout({ children, aside, brand, stickyBrand }: AuthSplitLayoutProps) {
  return (
    <div className="grid grid-cols-1 gap-8 md:mx-auto md:max-w-xl lg:mx-0 lg:max-w-none lg:grid-cols-12 lg:gap-8">
      <div className="min-w-0 lg:col-span-6 lg:row-span-2">{children}</div>
      {aside && <div className="min-w-0 lg:col-span-6 lg:col-start-7">{aside}</div>}
      <div
        className={cn(
          "min-w-0 lg:col-span-6 lg:col-start-7",
          stickyBrand && "lg:sticky lg:top-8 lg:self-start",
        )}
      >
        {brand}
      </div>
    </div>
  );
}
