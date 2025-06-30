import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex w-full rounded-2xl border-2 border-accent bg-background px-5 py-3 text-base placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 min-h-16",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
