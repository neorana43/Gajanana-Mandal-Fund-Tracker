import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base font-semibold shadow-xl transition-all duration-200 cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transform active:scale-95 hover:scale-[1.04] hover:-translate-y-0.5",
  {
    variants: {
      variant: {
        default:
          "glass bg-white/40 dark:bg-gray-800/40 text-black dark:text-white hover:bg-white/60 dark:hover:bg-gray-800/60 focus-visible:ring-4 focus-visible:ring-primary/30 focus-visible:shadow-2xl active:bg-white/70 dark:active:bg-gray-800/70 active:shadow-xl",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-4 focus-visible:ring-destructive/30 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 focus-visible:shadow-2xl active:shadow-xl",
        outline:
          "glass border-2 border-primary bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-primary/5 focus-visible:ring-4 focus-visible:ring-primary/30 dark:hover:bg-input/50 focus-visible:shadow-2xl active:shadow-xl",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-4 focus-visible:ring-secondary/30 focus-visible:shadow-2xl active:shadow-xl",
        ghost:
          "hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-accent/20 dark:hover:bg-accent/50 focus-visible:shadow-2xl active:shadow-xl",
        link: "text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary/20",
        glass:
          "glass bg-secondary/10 px-8 py-3 text-lg rounded-full shadow-xl transition-all duration-200 disabled:opacity-50 hover:shadow-2xl active:shadow-xl focus-visible:ring-4 focus-visible:ring-primary/30 focus-visible:shadow-2xl",
      },
      size: {
        default: "h-12 px-8 py-3 has-[>svg]:px-6 text-lg",
        sm: "h-10 gap-1.5 px-6 has-[>svg]:px-4 text-base",
        lg: "h-14 px-10 has-[>svg]:px-8 text-xl",
        icon: "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
