import React from "react";
import { Button } from "components/ui/button";
import { ScrollArea } from "components/ui/scroll-area";
import { Separator } from "components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Copy,
  Trash,
  Plus,
  ClipboardPaste,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { CSS } from "@dnd-kit/utilities";
import type { FeatureItem } from "@/types/FeatureItem";

export interface FeatureModuleProps {
  features: FeatureItem[];
  selectedFeatureId: number | null;
  onSelectFeature: (id: number) => void;
  onAdd: () => void;
  onDelete: (id: number) => void;
  onCopy: (id: number) => void;
  onPaste: () => void;
  onReorderFeatures: (items: FeatureItem[]) => void;
  onToggleExpand: (id: number, expand: boolean) => void;
  onIndent: (id: number) => void;
  onOutdent: (id: number) => void;
}

function hasChildren(items: FeatureItem[], idx: number): boolean {
  const parent = items[idx];
  const parentLevel = parent.level;

  for (let i = idx + 1; i < items.length; i++) {
    if (items[i].level <= parentLevel) break;
    if (items[i].level > parentLevel) return true;
  }

  return false;
}

function getVisibleItems(items: FeatureItem[]): FeatureItem[] {
  const result: FeatureItem[] = [];
  let hideLevel: number | null = null;
  for (const item of items) {
    if (hideLevel !== null && item.level > hideLevel) continue;
    if (hideLevel !== null && item.level <= hideLevel) hideLevel = null;
    result.push(item);
    if (item.expanded === false) hideLevel = item.level;
  }
  return result;
}

function canIndent(item: FeatureItem, idx: number, items: FeatureItem[]) {
  if (idx === 0) return false;
  return items[idx - 1].level >= item.level;
}

function canOutdent(item: FeatureItem) {
  return item.level > 1;
}

function SortableFeatureItem({
  item,
  idx,
  selectedFeatureId,
  onSelectFeature,
  features,
  onToggleExpand,
  onIndent,
  onOutdent,
}: {
  item: FeatureItem;
  idx: number;
  selectedFeatureId: number | null;
  onSelectFeature: (id: number) => void;
  features: FeatureItem[];
  onToggleExpand: (id: number, expand: boolean) => void;
  onIndent: (id: number) => void;
  onOutdent: (id: number) => void;
}) {
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
      className={`relative flex items-center h-[28px] px-1 rounded group transition cursor-pointer ${
        selectedFeatureId === item.id
          ? "bg-blue-100 font-bold"
          : "hover:bg-gray-100"
      }`}
      onClick={() => onSelectFeature(item.id)}
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
}

export const FeatureModule: React.FC<FeatureModuleProps> = ({
  features,
  selectedFeatureId,
  onSelectFeature,
  onAdd,
  onDelete,
  onCopy,
  onPaste,
  onReorderFeatures,
  onToggleExpand,
  onIndent,
  onOutdent,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const visibleItems = getVisibleItems(features);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = visibleItems.findIndex((item) => item.id === active.id);
    const newIndex = visibleItems.findIndex((item) => item.id === over.id);
    const reorderedVisible = arrayMove(visibleItems, oldIndex, newIndex);
    onReorderFeatures(reorderedVisible);
  }

  return (
    <div className="relative w-full">
      <Separator />
      <h2 className="h-[26px] font-['Roboto',Helvetica] font-extrabold text-black text-[32px] leading-normal m-0">
        Fonctionnalités
      </h2>
      <div className="flex items-center justify-between gap-2 bg-[#d9d9d94c] rounded-[15px] mt-6 mx-[5px] py-1 px-1">
        <Button
          variant="ghost"
          className="w-12 h-12 p-0 flex items-center justify-center"
          onClick={onAdd}
          title="Ajouter"
        >
          <Plus
            className="w-8 h-8 transition group-hover:scale-110 group-hover:text-blue-700"
            strokeWidth={2.5}
          />
        </Button>
        <Button
          variant="ghost"
          className="w-12 h-12 p-0 flex items-center justify-center"
          onClick={() => selectedFeatureId && onCopy(selectedFeatureId)}
          disabled={!selectedFeatureId}
          title="Copier"
        >
          <Copy className="w-8 h-8" strokeWidth={2.5} />
        </Button>
        <Button
          variant="ghost"
          className="w-12 h-12 p-0 flex items-center justify-center"
          onClick={onPaste}
          title="Coller"
        >
          <ClipboardPaste className="w-8 h-8" strokeWidth={2.5} />
        </Button>

        <Button
          variant="ghost"
          className="w-12 h-12 p-0 flex items-center justify-center"
          onClick={() => selectedFeatureId && onDelete(selectedFeatureId)}
          disabled={!selectedFeatureId}
          title="Supprimer"
        >
          <Trash className="w-8 h-8" strokeWidth={2.5} />
        </Button>
      </div>
      <ScrollArea>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={visibleItems.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div>
              {visibleItems.map((item, idx) => (
                <SortableFeatureItem
                  key={item.id}
                  item={item}
                  idx={idx}
                  selectedFeatureId={selectedFeatureId}
                  onSelectFeature={onSelectFeature}
                  features={features}
                  onToggleExpand={onToggleExpand}
                  onIndent={onIndent}
                  onOutdent={onOutdent}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </ScrollArea>
    </div>
  );
};
