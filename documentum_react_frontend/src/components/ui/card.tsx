import * as React from "react";

export const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`bg-white shadow p-4 rounded-md ${className}`}>
      {children}
    </div>
  );
};

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className = "", ...props }, ref) => (
  <div ref={ref} className={`p-2 ${className}`} {...props}>
    {children}
  </div>
));
CardContent.displayName = "CardContent";
