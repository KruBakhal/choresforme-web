import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-transparent font-semibold whitespace-nowrap transition-colors duration-150 select-none motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: "bg-brand text-brand-foreground hover:bg-brand/90",
        secondary: "bg-brand-soft text-ink hover:bg-brand-soft/80",
        outline: "border-input bg-surface text-ink hover:bg-surface-alt",
        ghost: "text-ink hover:bg-surface-alt",
        link: "h-auto px-0 text-ink underline decoration-1 underline-offset-4 hover:decoration-2",
        destructive: "bg-danger text-surface hover:bg-danger/90",
        inverse:
          "border-surface bg-transparent text-surface hover:bg-surface hover:text-ink focus-visible:outline-surface",
      },
      size: {
        sm: "h-11 px-4 text-body-sm",
        default: "h-12 px-6 text-body",
        lg: "h-14 px-8 text-body",
        icon: "size-11",
        "icon-lg": "size-12",
      },
    },
    compoundVariants: [
      { variant: "link", size: ["sm", "default", "lg"], className: "h-auto min-h-11 px-0" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Shows a spinner and disables the button. Ignored with `asChild`. */
    loading?: boolean;
  };

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, className }));

  if (asChild) {
    return (
      <Slot.Root
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={classes}
        {...props}
      >
        {children}
      </Slot.Root>
    );
  }

  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="size-5 motion-safe:animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
