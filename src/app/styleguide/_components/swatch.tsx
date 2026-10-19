import type { SwatchData } from "@/app/styleguide/_data/tokens";
import { cn } from "@/lib/utils";

export function Swatch({ token, hex, use, blockClass, pairing, note }: SwatchData) {
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-border">
      <div className={cn("h-24 border-b border-border", blockClass)} />
      <div className="flex flex-col gap-1 p-4">
        <p className="text-body font-semibold break-words text-ink">{token}</p>
        <p className="text-body-sm text-ink-muted">{hex}</p>
        <p className="text-body-sm text-ink">{use}</p>
        {pairing ? (
          <p
            className={cn(
              "mt-2 inline-flex self-start rounded-sm border border-border px-2 py-1 text-body-sm font-semibold",
              pairing.chipClass,
            )}
          >
            Aa {pairing.ratio}
          </p>
        ) : (
          note && <p className="mt-2 text-body-sm text-ink-muted">{note}</p>
        )}
      </div>
    </div>
  );
}
