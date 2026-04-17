import * as React from "react";
import type { HTMLAttributes } from "react";
import { cn } from "lib/utils";

interface ScrollAreaProps {
  children: React.ReactNode;
  maxHeight?: string;
  className?: string;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({
  children,
  maxHeight,
  className,
}) => {
  return (
    <div
      className={cn(
        "scrollarea-rounded overflow-y-auto bg-white rounded-[15px] shadow-[inset_0px_4px_4px_#00000040] p-3 pb-20",
        className
      )}
      style={{ maxHeight: maxHeight ?? undefined }}
    >
      {children}
    </div>
  );
};

interface ScrollBarProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal";
}

export const ScrollBar = (_props: ScrollBarProps) => null;

ScrollBar.displayName = "ScrollBar";
