import type { MarketingPoint } from "@/lib/constants";
import { cn } from "@/lib/utils";

type FeatureListProps = {
  items: readonly MarketingPoint[];
  layout: "stack" | "columns";
  className?: string;
};

/** Icon, title and body points (trust block, worker section, /workers). */
export function FeatureList({ items, layout, className }: FeatureListProps) {
  const isColumns = layout === "columns";

  return (
    <ul
      className={cn(
        isColumns
          ? "grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6 lg:gap-8"
          : "flex flex-col gap-6",
        className,
      )}
    >
      {items.map(({ icon: Icon, title, body }) => (
        <li key={title} className={cn("flex gap-4", isColumns && "md:flex-col md:gap-0")}>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-soft">
            <Icon className="size-5 text-ink" aria-hidden />
          </span>
          <div className={cn("min-w-0", isColumns && "md:mt-4")}>
            <h3 className={isColumns ? "text-h4" : "text-body font-semibold"}>{title}</h3>
            <p
              className={
                isColumns ? "mt-2 text-body text-ink-muted" : "mt-1 text-body-sm text-ink-muted"
              }
            >
              {body}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
