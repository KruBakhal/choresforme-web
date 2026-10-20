import * as React from "react";

import { cn } from "@/lib/utils";

/** Multi-line text field. Height comes from `rows`; the user can resize it vertically. */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full min-w-0 resize-y rounded-md border border-input bg-surface px-4 py-3 text-body text-ink transition-colors duration-150 placeholder:text-ink-muted disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
