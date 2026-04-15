import React from "react";

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

export const TooltipTrigger = ({ children }: { children: React.ReactNode }) => {
  return <span className="inline-block cursor-help">{children}</span>;
};

export const TooltipContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="absolute bg-black text-white text-xs p-2 rounded z-50 mt-2">
      {children}
    </div>
  );
};

export const Tooltip = ({ children }: { children: React.ReactNode }) => {
  return <div className="relative inline-block">{children}</div>;
};
