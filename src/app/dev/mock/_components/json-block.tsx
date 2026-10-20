import { cn } from "@/lib/utils";

type JsonBlockProps = {
  value: unknown;
  /** Accessible name of the scroll region. */
  label: string;
  className?: string;
};

/** Pretty JSON that scrolls inside its own box on both axes, never the page. Focusable for keyboard scrolling. */
export function JsonBlock({ value, label, className }: JsonBlockProps) {
  return (
    <pre
      tabIndex={0}
      role="region"
      aria-label={label}
      className={cn(
        "max-h-80 overflow-auto rounded-md border border-border bg-surface-alt p-4 font-mono text-body-sm whitespace-pre text-ink",
        className,
      )}
    >
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}
