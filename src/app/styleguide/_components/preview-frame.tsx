import * as React from "react";

import { cn } from "@/lib/utils";

type PreviewFrameProps = {
  caption: string;
  bg?: "surface" | "surface-alt";
  className?: string;
  bodyClassName?: string;
  /** Below md, run edge to edge so the preview gets the real device width. */
  bleed?: boolean;
  children: React.ReactNode;
};

/** Framed preview. Everything inside renders in preview mode (nothing fixed). */
export function PreviewFrame({
  caption,
  bg = "surface",
  className,
  bodyClassName,
  bleed = false,
  children,
}: PreviewFrameProps) {
  return (
    <figure className={cn("min-w-0", bleed && "-mx-4 md:mx-0", className)}>
      <figcaption
        className={cn("mb-3 text-body-sm font-semibold text-ink", bleed && "px-4 md:px-0")}
      >
        {caption}
      </figcaption>
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-input",
          bleed && "rounded-none border-x-0 md:rounded-lg md:border-x",
          bg === "surface-alt" ? "bg-surface-alt" : "bg-surface",
          bodyClassName,
        )}
      >
        {children}
      </div>
    </figure>
  );
}
