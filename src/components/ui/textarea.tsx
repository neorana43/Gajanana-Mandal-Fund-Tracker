import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({
  className,
  glass = false,
  ...props
}: React.ComponentProps<"textarea"> & { glass?: boolean }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        glass ? "glass" : "",
        "px-3 py-2 text-sm rounded-full border-2 border-white bg-white/30 dark:bg-gray-800/30 backdrop-blur-md focus:border-primary focus:ring-2 focus:ring-primary transition-all duration-200 w-full min-h-16 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
