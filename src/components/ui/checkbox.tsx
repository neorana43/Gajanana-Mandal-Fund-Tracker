"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({
  className,
  glass = false,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & { glass?: boolean }) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        glass ? "glass" : "",
        "size-4 rounded-full border-2 border-accent bg-white/30 dark:bg-gray-800/30 backdrop-blur-md focus:border-primary focus:ring-2 focus:ring-primary transition-all duration-200 shrink-0 outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
