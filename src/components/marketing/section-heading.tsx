import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  id: string;
  title: string;
  eyebrow?: string;
  intro?: string;
  align?: "start" | "center";
  as?: "h1" | "h2";
  className?: string;
};

/** Eyebrow, heading and intro line, so section headings stay consistent. */
export function SectionHeading({
  id,
  title,
  eyebrow,
  intro,
  align = "start",
  as: Heading = "h2",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="text-body-sm font-semibold text-ink-muted">{eyebrow}</p>}
      <Heading id={id} className={cn(eyebrow && "mt-2")}>
        {title}
      </Heading>
      {intro && <p className="mt-4 text-body text-ink-muted">{intro}</p>}
    </div>
  );
}
