// documentum_react_frontend/src/components/ui/checkbox.tsx
import * as React from "react";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <input
      type="checkbox"
      ref={ref}
      className={
        "h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 " +
        (className ?? "")
      }
      {...props}
    />
  )
);

Checkbox.displayName = "Checkbox";
