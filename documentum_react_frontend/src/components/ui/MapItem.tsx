import React from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MapItem as MapItemType } from "@/types/MapItem";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface MapItemProps {
  item: MapItemType;
  idx: number;
  selectedMapItemId: number | null;
  onSelect: (id: number) => void;
  mapItems: MapItemType[];
  onRename: (itemId: number) => void;
  editing: boolean;
  onRenameSave: (itemId: number, newTitle: string) => void;
  onToggleExpand: (id: number, expand: boolean) => void;
  onIndent: (id: number) => void;
  onOutdent: (id: number) => void;
}

function canIndent(item: MapItemType, idx: number, items: MapItemType[]) {
  if (idx === 0) return false;
  return items[idx - 1].level >= item.level;
}

function canOutdent(item: MapItemType) {
  return item.level > 1;
}

function hasChildren(items: MapItemType[], idx: number): boolean {
  const parent = items[idx];
  const parentLevel = parent.level;

  for (let i = idx + 1; i < items.length; i++) {
    if (items[i].level <= parentLevel) break;
    if (items[i].level > parentLevel) return true;
  }

  return false;
}

export const MapItem: React.FC<MapItemProps> = ({
  item,
  idx,
  selectedMapItemId,
  onSelect,
  mapItems,
  onRename,
  onRenameSave,
  editing,
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
    isOver,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : "auto",
    background: isDragging ? "rgba(96,165,250,0.20)" : undefined,
    borderBottom: isOver ? "2px solid #2563eb" : undefined,
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
        selectedMapItemId === item.id
          ? "bg-blue-100 font-bold"
          : "hover:bg-gray-100"
      )}
      onClick={() => onSelect(item.id)}
    >
      {hasChildren(mapItems, idx) && item.expanded !== false && (
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
      {hasChildren(mapItems, idx) && item.expanded === false && (
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

      {/* ✅ Titre cliquable avec renommage */}
      {editing ? (
        <input
          autoFocus
          defaultValue={item.title}
          onClick={(e) => e.stopPropagation()}
          onBlur={(e) => onRenameSave(item.id, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onRenameSave(item.id, (e.target as HTMLInputElement).value);
            }
          }}
          className="text-xs px-1 py-0.5 border rounded w-full bg-white text-black"
        />
      ) : (
        <div
          onDoubleClick={(e) => {
            e.stopPropagation();
            onRename(item.id);
          }}
          className="cursor-text"
          title="Double-clic pour renommer"
        >
          {item.title}
          {item.isMaster && (
            <span className="ml-2 px-2 py-0.5 rounded bg-blue-200 text-blue-800 text-[10px] font-semibold">
              maître
            </span>
          )}
          {item.versionOrigine && (
            <span className="ml-2 text-[10px] text-gray-500">
              v{item.versionOrigine}
            </span>
          )}
        </div>
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
            canIndent(item, idx, mapItems) && onIndent(item.id);
          }}
          disabled={!canIndent(item, idx, mapItems)}
          className={cn(
            "w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200",
            !canIndent(item, idx, mapItems) && "opacity-30 cursor-not-allowed"
          )}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
