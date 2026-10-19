import * as React from "react";

import { cn } from "@/lib/utils";

type ContainerProps = React.ComponentProps<"div"> & {
  /** Classes for the inner, max-width (1200 px) wrapper. */
  innerClassName?: string;
};

/** Page gutters (16 / 24 / 32 px) around a centred 1200 px content column. */
export function Container({ className, innerClassName, children, ...props }: ContainerProps) {
  return (
    <div className={cn("w-full px-4 md:px-6 lg:px-8", className)} {...props}>
      <div className={cn("mx-auto w-full max-w-content", innerClassName)}>{children}</div>
    </div>
  );
}
