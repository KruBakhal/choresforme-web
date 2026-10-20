import * as React from "react";

type PhoneFrameProps = { children: React.ReactNode };

/** Token-styled phone mockup (decorative chrome around an illustration). */
export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="mx-auto w-full max-w-xs min-w-0 rounded-lg border-4 border-ink bg-surface-alt p-3">
      <span aria-hidden className="mx-auto mb-3 block h-4 w-16 rounded-full bg-ink" />
      {children}
    </div>
  );
}
