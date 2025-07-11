"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {}

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    ref={ref}
    className={cn(
      "peer inline-block w-11 h-6 rounded-full bg-gray-300 transition-colors duration-200 data-[state=checked]:bg-blue-600",
      className
    )}
    {...props}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "block w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 transform translate-x-1",
        "data-[state=checked]:translate-x-5"
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = "Switch";

export { Switch };
