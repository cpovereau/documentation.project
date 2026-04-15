import React from "react";

interface VerticalDragHandleProps {
  onResizeStart: (e: React.MouseEvent) => void;
}

export const VerticalDragHandle: React.FC<VerticalDragHandleProps> = ({
  onResizeStart,
}) => {
  return (
    <div
      onMouseDown={onResizeStart}
      className="
        h-2 cursor-row-resize bg-gray-300
        hover:bg-gray-400
        transition-colors duration-200 ease-in-out
        w-full rounded-md
        z-10
      "
      title="Redimensionner"
    />
  );
};
