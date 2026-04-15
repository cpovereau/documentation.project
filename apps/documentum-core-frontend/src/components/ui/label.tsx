import * as React from "react";
import { Label as ShadLabel } from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof ShadLabel>,
    VariantProps<typeof labelVariants> {
  className?: string;
}

const Label = React.forwardRef<
  React.ComponentRef<typeof ShadLabel>,
  LabelProps
>(({ className, ...props }, ref) => (
  <ShadLabel ref={ref} className={cn(labelVariants(), className)} {...props} />
));
Label.displayName = "Label";

export { Label };
