import { A11Y } from "@/lib/constants";

type SkipLinkProps = { targetId?: string };

/** Keyboard skip link. The page's `main` needs the matching id. */
export function SkipLink({ targetId = "main" }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:z-50 focus:inline-flex focus:h-11 focus:items-center focus:rounded-md focus:bg-surface focus:px-4 focus:text-ink"
    >
      {A11Y.skipToContent}
    </a>
  );
}
