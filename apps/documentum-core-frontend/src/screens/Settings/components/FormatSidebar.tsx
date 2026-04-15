import React from "react";
import { cn } from "lib/utils";

interface FormatSidebarProps {
  activeType: "DTD" | "XSLT";
  onSelect: (type: "DTD" | "XSLT") => void;
}

const FormatSidebar: React.FC<FormatSidebarProps> = ({
  activeType,
  onSelect,
}) => {
  return (
    <div className="w-48 bg-orange-100 p-4 flex flex-col gap-2">
      {["DTD", "XSLT"].map((type) => (
        <button
          key={type}
          onClick={() => onSelect(type as "DTD" | "XSLT")}
          className={cn(
            "text-left px-3 py-2 rounded font-medium text-sm",
            activeType === type
              ? "bg-white text-orange-600 shadow"
              : "text-gray-700 hover:bg-orange-200"
          )}
        >
          {type}
        </button>
      ))}
    </div>
  );
};

export default FormatSidebar;
