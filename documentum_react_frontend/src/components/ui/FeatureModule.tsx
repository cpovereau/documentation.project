import React from "react";
import { Button } from "components/ui/button";
import { ScrollArea } from "components/ui/scroll-area";
import { Separator } from "components/ui/separator";
import { ChevronDown, Copy, Trash, Plus, ClipboardPaste } from "lucide-react";
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
import { CSS } from "@dnd-kit/utilities";

// Types
export type FeatureItem = {
  id: number;
  name: string;
  level: number;
  expanded?: boolean;
  active?: boolean;
  hasUpdate?: boolean; // Pour le point orange correctif/évolution
};

export interface FeatureModuleProps {
  isExpanded: boolean;
  onToggle: () => void;
  features: FeatureItem[];
  selectedFeatureId: number | null;
  onSelect: (id: number) => void;
  onAdd: () => void;
  onDelete: (id: number) => void;
  onCopy: (id: number) => void;
  onPaste: () => void;
  onReorder: (items: FeatureItem[]) => void;
  onToggleExpand: (id: number, expand: boolean) => void;
}

// Helpers pour arborescence
function hasVisibleChildren(items: FeatureItem[], idx: number): boolean {
  const parent = items[idx];
  const nextIdx = idx + 1;
  if (nextIdx >= items.length) return false;
  return items[nextIdx].level > parent.level;
}

function getVisibleItems(items: FeatureItem[]): FeatureItem[] {
  const result: FeatureItem[] = [];
  let hideLevel: number | null = null;
  for (const item of items) {
    if (hideLevel !== null) {
      if (item.level > hideLevel) continue;
      else hideLevel = null;
    }
    result.push(item);
    if (item.expanded === false) hideLevel = item.level;
  }
  return result;
}

// Ligne unique (Sortable)
function SortableFeatureItem({
  item,
  idx,
  selectedFeatureId,
  onSelect,
  features,
  onToggleExpand,
  hasChildren,
}: any) {
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
      className={`relative flex items-center h-[28px] px-1 rounded group transition
        ${idx !== features.length - 1 ? "mb-2" : ""}
        cursor-pointer
        ${
          selectedFeatureId === item.id
            ? "bg-blue-100 font-bold"
            : "hover:bg-gray-100"
        }
      `}
      onClick={() => onSelect(item.id)}
    >
      {/* Pliage/dépliage */}
      {hasChildren && item.expanded !== false && (
        <button
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 mr-1"
          style={{ opacity: 0.7, transition: "opacity .15s" }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(item.id, false);
          }}
          aria-label="Replier la fonctionnalité"
        >
          {/* Icône moins */}
          <svg width="14" height="14" viewBox="0 0 20 20">
            <path d="M4 10h12" stroke="#888" strokeWidth="2" fill="none" />
          </svg>
        </button>
      )}
      {hasChildren && item.expanded === false && (
        <button
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 mr-1"
          style={{ opacity: 1, transition: "opacity .15s" }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(item.id, true);
          }}
          aria-label="Déplier la fonctionnalité"
        >
          {/* Icône plus */}
          <svg width="14" height="14" viewBox="0 0 20 20">
            <path
              d="M10 4v12M4 10h12"
              stroke="#888"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </button>
      )}
      {/* Label */}
      <div className="flex-1 text-xs text-[#515a6e] font-['Roboto',Helvetica] whitespace-nowrap">
        {item.name}
      </div>
      {/* Point correctif/évolution */}
      {item.hasUpdate && (
        <span
          className="w-2 h-2 bg-orange-500 rounded-full ml-2"
          title="Correctif ou évolution à traiter"
        />
      )}
    </div>
  );
}

// --- Composant principal ---
export const FeatureModule: React.FC<FeatureModuleProps> = ({
  isExpanded,
  onToggle,
  features,
  selectedFeatureId,
  onSelect,
  onAdd,
  onDelete,
  onCopy,
  onPaste,
  onReorder,
  onToggleExpand,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const visibleItems = getVisibleItems(features);
      const oldIndex = visibleItems.findIndex((item) => item.id === active.id);
      const newIndex = visibleItems.findIndex((item) => item.id === over.id);
      const reorderedVisible = arrayMove(visibleItems, oldIndex, newIndex);
      onReorder(reorderedVisible);
    }
  }

  const visibleItems = getVisibleItems(features);

  return (
    <div className="relative w-full">
      {/* Séparateur avant Fonctionnalités */}
      <Separator />
      {/* --- EN-TÊTE --- */}
      <h2 className="h-[26px] font-['Roboto',Helvetica] font-extrabold text-black text-[32px] tracking-[0] leading-normal m-0">
        Fonctionnalités
      </h2>
      {/* Pas de toggle ici car non contractable */}

      {/* --- BARRE OUTILS --- */}
      <div className="flex items-center justify-between gap-2 bg-[#d9d9d94c] rounded-[15px] mt-6 mx-[5px] py-2 px-1">
        <Button
          variant="ghost"
          onClick={onAdd}
          title="Ajouter une fonctionnalité"
        >
          <Plus
            className="w-9 h-9 p-0 flex items-center justify-center rounded-xl transition
      hover:bg-blue-100/70 hover:text-blue-700 group"
            strokeWidth={2.5}
          />
        </Button>
        <Button
          variant="ghost"
          onClick={onPaste}
          title="Coller correctif/évolution"
        >
          <ClipboardPaste
            className="w-9 h-9 p-0 flex items-center justify-center rounded-xl transition
      hover:bg-blue-100/70 hover:text-blue-700 group"
            strokeWidth={2.5}
          />
        </Button>
        <Button
          variant="ghost"
          onClick={() => selectedFeatureId && onCopy(selectedFeatureId)}
          disabled={!selectedFeatureId}
          title="Copier le correctif/évolution"
        >
          <Copy
            className="w-9 h-9 p-0 flex items-center justify-center rounded-xl transition
      hover:bg-blue-100/70 hover:text-blue-700 group"
            strokeWidth={2.5}
          />
        </Button>
        <Button
          variant="ghost"
          onClick={() => selectedFeatureId && onDelete(selectedFeatureId)}
          disabled={!selectedFeatureId}
          title="Supprimer la fonctionnalité"
        >
          <Trash
            className="w-9 h-9 p-0 flex items-center justify-center rounded-xl transition
      hover:bg-blue-100/70 hover:text-blue-700 group"
            strokeWidth={2.5}
          />
        </Button>
        {/* Tu peux ajouter d’autres actions ici si besoin */}
      </div>
      {/* --- LISTE AVEC SCROLL --- */}
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
              {visibleItems.map((item, idx) => {
                const origIdx = features.findIndex((x) => x.id === item.id);
                return (
                  <SortableFeatureItem
                    key={item.id}
                    item={item}
                    idx={origIdx}
                    selectedFeatureId={selectedFeatureId}
                    onSelect={onSelect}
                    features={visibleItems}
                    onToggleExpand={onToggleExpand}
                    hasChildren={hasVisibleChildren(features, origIdx)}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      </ScrollArea>
    </div>
  );
};
