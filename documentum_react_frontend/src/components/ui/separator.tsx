import * as React from "react";
import { cn } from "@/lib/utils";

interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> {}

export const Separator = React.forwardRef<HTMLHRElement, SeparatorProps>(
  ({ className = "", ...props }, ref) => (
    <hr
      ref={ref}
      className={cn("my-2 border-t border-gray-300", className)}
      {...props}
    />
  )
);

Separator.displayName = "Separator";
