import * as React from "react";
import type { HTMLAttributes } from "react";

interface ScrollAreaProps {
  children: React.ReactNode;
  maxHeight?: string;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({
  children,
  maxHeight,
}) => {
  return (
    <div
      className="scrollarea-rounded overflow-y-auto bg-white rounded-[15px] shadow-[inset_0px_4px_4px_#00000040] p-3 pb-20"
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
