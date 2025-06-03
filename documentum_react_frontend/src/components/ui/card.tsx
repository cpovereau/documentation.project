import * as React from "react";
import { cn } from "../../lib/utils";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={cn("bg-white rounded-xl shadow", className)}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = "Card";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className = "", ...props }, ref) => (
  <div ref={ref} className={`p-2 ${className}`} {...props}>
    {children}
  </div>
));
CardContent.displayName = "CardContent";
