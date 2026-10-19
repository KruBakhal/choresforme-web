import Image from "next/image";
import Link from "next/link";

import { BRAND_LOGO_MARK_SRC, BRAND_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

type LogoProps = {
  /** `mark` hides the wordmark visually; `responsive` shows it from lg up. */
  variant?: "lockup" | "mark" | "responsive";
  tone?: "onLight" | "onDark";
  size?: "md" | "xl";
  /** Tile colour. `dark` is for the styleguide "mark on surface-dark" swatch. */
  tileTone?: "brand" | "dark";
  /** Link target. `null` renders a plain span. */
  href?: string | null;
  className?: string;
};

export function Logo({
  variant = "lockup",
  tone = "onLight",
  size = "md",
  tileTone = "brand",
  href = "/",
  className,
}: LogoProps) {
  const isXl = size === "xl";
  const markPx = isXl ? 64 : 28;

  const content = (
    <>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center",
          isXl ? "size-24 rounded-lg" : "size-10 rounded-md",
          tileTone === "dark" ? "bg-surface-dark" : "bg-brand",
        )}
      >
        <Image
          src={BRAND_LOGO_MARK_SRC}
          width={markPx}
          height={markPx}
          alt=""
          className={isXl ? "size-16" : "size-7"}
        />
      </span>
      <span
        className={cn(
          "text-h4 font-semibold whitespace-nowrap",
          tone === "onDark" ? "text-surface" : "text-ink",
          variant === "mark" && "sr-only",
          variant === "responsive" && "sr-only lg:not-sr-only lg:whitespace-nowrap",
        )}
      >
        {BRAND_NAME}
      </span>
    </>
  );

  const classes = cn(
    "inline-flex min-h-11 items-center gap-3 rounded-md",
    tone === "onDark" && "focus-visible:outline-surface",
    className,
  );

  if (href === null) {
    return <span className={classes}>{content}</span>;
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
