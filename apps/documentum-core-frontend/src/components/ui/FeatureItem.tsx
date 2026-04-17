import React from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeatureItem as FeatureItemType } from "@/types/FeatureItem";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// NOTE(métier): Les fonctionnalités sont mono-niveau (cadrage 2026-04-16).
// La hiérarchie (indent/outdent, level > 1) est désactivée jusqu'à confirmation métier.
// Les fonctions hasChildren/expand/collapse sont conservées pour réactivation future si besoin.

interface FeatureItemProps {
  item: FeatureItemType;
  idx: number;
  selectedFeatureId: number | null;
  onSelect: (id: number) => void;
  features: FeatureItemType[];
  onToggleExpand: (id: number, expand: boolean) => void;
}

function hasChildren(items: FeatureItemType[], idx: number): boolean {
  const parentLevel = items[idx].level;
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
    // Pas d'indentation visuelle en mode mono-niveau.
    // paddingLeft basé sur level désactivé — réactiver si hiérarchie confirmée métier.
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "relative flex items-center h-[28px] px-2 rounded group transition cursor-pointer",
        selectedFeatureId === item.id
          ? "bg-blue-100 font-bold"
          : "hover:bg-gray-100"
      )}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(item.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(item.id);
        }
      }}
    >
      {/* Expand/collapse — dormant en mono-niveau (level=1 → pas d'enfants) */}
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

      {(item.hasEvolution || item.hasCorrectif) && (
        <div className="ml-2 flex gap-1">
          {item.hasEvolution && (
            <span className="text-[10px] px-1 rounded-full bg-blue-100 text-blue-800 opacity-70">
              Évo
            </span>
          )}
          {item.hasCorrectif && (
            <span className="text-[10px] px-1 rounded-full bg-red-100 text-red-800 opacity-70">
              Corr
            </span>
          )}
        </div>
      )}

      {item.hasUpdate && (
        <span
          className="w-2 h-2 bg-orange-500 rounded-full ml-2"
          title="Correctif ou évolution à traiter"
        />
      )}
    </div>
  );
};
