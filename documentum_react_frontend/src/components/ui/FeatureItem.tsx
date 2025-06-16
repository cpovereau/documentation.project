import React from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeatureItem as FeatureItemType } from "@/types/FeatureItem";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface FeatureItemProps {
  item: FeatureItemType;
  idx: number;
  selectedFeatureId: number | null;
  onSelect: (id: number) => void;
  features: FeatureItemType[];
  onToggleExpand: (id: number, expand: boolean) => void;
  onIndent: (id: number) => void;
  onOutdent: (id: number) => void;
}

function canIndent(
  item: FeatureItemType,
  idx: number,
  items: FeatureItemType[]
) {
  if (idx === 0) return false;
  return items[idx - 1].level >= item.level;
}

function canOutdent(item: FeatureItemType) {
  return item.level > 1;
}

function hasChildren(items: FeatureItemType[], idx: number): boolean {
  const parent = items[idx];
  const parentLevel = parent.level;

  for (let i = idx + 1; i < items.length; i++) {
    if (items[i].level <= parentLevel) break;
    if (items[i].level > parentLevel) return true;
  }

  return false;
}

export const FeatureItem: React.FC<FeatureItemProps> = ({
  item,
  idx,
  selectedFeatureId,
  onSelect,
  features,
  onToggleExpand,
  onIndent,
  onOutdent,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : "auto",
    background: isDragging ? "rgba(96,165,250,0.20)" : undefined,
    paddingLeft: `${item.level * 28}px`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "relative flex items-center h-[28px] px-1 rounded group transition cursor-pointer",
        selectedFeatureId === item.id
          ? "bg-blue-100 font-bold"
          : "hover:bg-gray-100"
      )}
      onClick={() => onSelect(item.id)}
    >
      {hasChildren(features, idx) && item.expanded !== false && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(item.id, false);
          }}
          className="mr-1"
        >
          <ChevronDown size={16} />
        </button>
      )}
      {hasChildren(features, idx) && item.expanded === false && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(item.id, true);
          }}
          className="mr-1"
        >
          <ChevronRight size={16} />
        </button>
      )}
      <div className="flex-1 text-xs text-[#515a6e] font-['Roboto',Helvetica] whitespace-nowrap">
        {item.name}
      </div>
      {item.hasUpdate && (
        <span
          className="w-2 h-2 bg-orange-500 rounded-full ml-2"
          title="Correctif ou évolution à traiter"
        />
      )}
      <div className="ml-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={(e) => {
            e.stopPropagation();
            canOutdent(item) && onOutdent(item.id);
          }}
          disabled={!canOutdent(item)}
          className={cn(
            "w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200",
            !canOutdent(item) && "opacity-30 cursor-not-allowed"
          )}
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            canIndent(item, idx, features) && onIndent(item.id);
          }}
          disabled={!canIndent(item, idx, features)}
          className={cn(
            "w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200",
            !canIndent(item, idx, features) && "opacity-30 cursor-not-allowed"
          )}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
