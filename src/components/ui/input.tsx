import * as React from "react";

import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "bg-white dark:bg-gray-800 border-2 border-white/80 rounded-full px-4 py-2 text-base font-normal shadow-[0_2px_8px_0_rgba(80,120,255,0.08)] focus:border-primary focus:ring-2 focus:ring-primary transition-all duration-200 w-full disabled:cursor-not-allowed disabled:opacity-50 outline outline-1 outline-white/30",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
