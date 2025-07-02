import * as React from "react";

import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  glass = false,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { glass?: boolean }) {
  return (
    <input
      type={type}
      className={cn(
        glass
          ? "glass px-3 py-2 text-sm rounded-full border-2 border-white focus:border-primary focus:ring-2 focus:ring-primary transition-all duration-200 w-full disabled:cursor-not-allowed disabled:opacity-50"
          : "px-3 py-2 text-sm rounded-full border-2 border-white bg-white/30 dark:bg-gray-800/30 backdrop-blur-md focus:border-primary focus:ring-2 focus:ring-primary transition-all duration-200 w-full disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
