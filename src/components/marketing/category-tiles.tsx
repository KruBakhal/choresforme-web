import { CategoryTile } from "@/components/marketing/category-tile";
import type { Category, CategoryId } from "@/lib/types";
import { cn } from "@/lib/utils";

type CategoryTilesProps = {
  categories: readonly Category[];
  /** Without it the tiles are plain cards. */
  hrefFor?: (id: CategoryId) => string;
  descriptionFor?: (category: Category) => string;
  actionLabel?: string;
  layout?: "four" | "three";
  className?: string;
};

const layoutClasses = {
  four: "grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4 lg:gap-8",
  three: "grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 lg:gap-8",
} as const;

export function CategoryTiles({
  categories,
  hrefFor,
  descriptionFor,
  actionLabel,
  layout = "four",
  className,
}: CategoryTilesProps) {
  return (
    <ul className={cn(layoutClasses[layout], className)}>
      {categories.map((category) => (
        <li key={category.id} className="min-w-0">
          <CategoryTile
            category={category}
            href={hrefFor?.(category.id)}
            description={descriptionFor?.(category)}
            actionLabel={actionLabel}
          />
        </li>
      ))}
    </ul>
  );
}
