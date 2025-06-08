import React from "react";
import { Button } from "components/ui/button";
import { ScrollArea, ScrollBar } from "components/ui/scroll-area";
import { Separator } from "components/ui/separator";
import { ChevronDown, FilePlus, Download, Copy, Trash } from "lucide-react";
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

// --- TYPES ---

export type MapItem = {
  id: number;
  title: string;
  level: number;
  expanded?: boolean;
  active?: boolean;
};

export interface MapModuleProps {
  isExpanded: boolean;
  onToggle: () => void;
  mapItems: MapItem[];
  selectedMapItemId: number | null;
  onSelect: (itemId: number) => void;
  onAdd: () => void;
  onImportWord: () => void;
  onClone: (itemId: number) => void;
  onDelete: (itemId: number) => void;
  onLoad: () => void;
  onIndent: (itemId: number) => void;
  onOutdent: (itemId: number) => void;
  onReorder: (newItems: MapItem[]) => void;
  onToggleExpand: (itemId: number, expand: boolean) => void;
}

// -------- UTILS --------

function hasVisibleChildren(items: MapItem[], idx: number): boolean {
  const parent = items[idx];
  const nextIdx = idx + 1;
  if (nextIdx >= items.length) return false;
  return items[nextIdx].level > parent.level;
}

function getVisibleItems(items: MapItem[]): MapItem[] {
  const result: MapItem[] = [];
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

// ------- LIGNE D'ITEM --------

function SortableItem({
  item,
  idx,
  selectedMapItemId,
  onSelect,
  canOutdent,
  canIndent,
  onOutdent,
  onIndent,
  mapItems,
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
    paddingLeft: `${item.level * 30}px`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative flex items-center h-[28px] px-1 rounded group transition
        ${idx !== mapItems.length - 1 ? "mb-2" : ""}
        cursor-pointer
        ${
          selectedMapItemId === item.id
            ? "bg-blue-100 font-bold"
            : "hover:bg-gray-100"
        }
      `}
      onClick={() => onSelect(item.id)}
    >
      {/* --- Bouton pliage/dépliage --- */}
      {hasChildren && item.expanded !== false && (
        <button
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 mr-1 group-hover:opacity-100"
          style={{ opacity: 0.7, transition: "opacity .15s" }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(item.id, false);
          }}
          aria-label="Replier la rubrique"
          title="Replier la rubrique"
          tabIndex={0}
          type="button"
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
          aria-label="Déplier la rubrique"
          title="Déplier la rubrique"
          tabIndex={0}
          type="button"
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

      {/* --- Label --- */}
      <div className="flex-1 font-['Roboto',Helvetica] text-[#515a6e] text-xs tracking-[0] leading-normal whitespace-nowrap">
        {item.title}
      </div>
      {/* --- Boutons indent/outdent --- */}
      <div
        className={`
          flex gap-1 ml-1 indent-buttons 
          opacity-0 group-hover:opacity-100 transition-opacity
          ${selectedMapItemId === item.id ? "opacity-100" : ""}
        `}
      >
        <button
          className={`w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 focus:bg-blue-200 focus:outline-none
            ${
              canOutdent(item, idx, mapItems)
                ? ""
                : "opacity-30 cursor-not-allowed"
            }
          `}
          onClick={(e) => {
            e.stopPropagation();
            if (canOutdent(item, idx, mapItems)) onOutdent(item.id);
          }}
          disabled={!canOutdent(item, idx, mapItems)}
          aria-label="Monter d'un niveau"
          title={
            !canOutdent(item, idx, mapItems)
              ? "Impossible de monter d'un niveau"
              : "Monter d'un niveau"
          }
          tabIndex={0}
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 20 20">
            <path
              d="M13 16l-6-6 6-6"
              stroke="#888"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </button>
        <button
          className={`w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 focus:bg-blue-200 focus:outline-none
            ${
              canIndent(item, idx, mapItems)
                ? ""
                : "opacity-30 cursor-not-allowed"
            }
          `}
          onClick={(e) => {
            e.stopPropagation();
            if (canIndent(item, idx, mapItems)) onIndent(item.id);
          }}
          disabled={!canIndent(item, idx, mapItems)}
          aria-label="Descendre d'un niveau"
          title={
            !canIndent(item, idx, mapItems)
              ? "Impossible de descendre d'un niveau"
              : "Descendre d'un niveau"
          }
          tabIndex={0}
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 20 20">
            <path d="M7 4l6 6-6 6" stroke="#888" strokeWidth="2" fill="none" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ------- MAIN MAPMODULE --------

export const MapModule: React.FC<MapModuleProps> = ({
  isExpanded,
  onToggle,
  mapItems,
  selectedMapItemId,
  onSelect,
  onAdd,
  onImportWord,
  onClone,
  onDelete,
  onLoad,
  onIndent,
  onOutdent,
  onReorder,
  onToggleExpand,
}) => {
  const canOutdent = (item: MapItem, idx: number, items: MapItem[]) =>
    item.level > 1;
  const canIndent = (item: MapItem, idx: number, items: MapItem[]) => {
    if (idx === 0) return false;
    const prev = items[idx - 1];
    if (!prev) return false;
    return prev.level >= item.level;
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const visibleItems = getVisibleItems(mapItems);
      const oldIndex = visibleItems.findIndex((item) => item.id === active.id);
      const newIndex = visibleItems.findIndex((item) => item.id === over.id);
      const reorderedVisible = arrayMove(visibleItems, oldIndex, newIndex);
      // On suppose que toute la flatlist = visible, sinon il faut adapter pour garder la cohérence
      onReorder(reorderedVisible);
    }
  }

  const visibleItems = getVisibleItems(mapItems);

  return (
    <div
      className="relative w-[310px] transition-all duration-300 ease-in-out"
      style={{ height: isExpanded ? "auto" : "48px" }}
    >
      {/* --- EN-TÊTE --- */}
      <div className="relative w-[310px] h-12">
        <div className="absolute top-0.5 left-3 w-[298px]">
          <Separator className="h-px w-full" />
        </div>
        <Button
          variant="ghost"
          className="absolute w-14 h-14 top-0 left-0 p-0 flex items-center justify-center"
          onClick={onToggle}
          aria-label={isExpanded ? "Réduire" : "Déplier"}
          title={isExpanded ? "Réduire la section" : "Déplier la section"}
        >
          <ChevronDown
            className={`transition-transform duration-200 w-8 h-8 ${
              isExpanded ? "rotate-0" : "-rotate-90"
            }`}
          />
        </Button>
        <div className="absolute w-[134px] h-[26px] top-[11px] left-[47px] font-['Roboto',Helvetica] font-extrabold text-black text-[32px] tracking-[0] leading-normal whitespace-nowrap">
          Map
        </div>
      </div>
      {/* --- BARRE OUTILS --- */}
      {isExpanded && (
        <>
          <div className="flex items-center justify-between gap-2 bg-[#d9d9d94c] rounded-[15px] mt-2 mx-[5px] py-1 px-1">
            <Button
              variant="ghost"
              className="w-12 h-12 p-0 flex items-center justify-center rounded-xl transition
      hover:bg-blue-100/70 hover:text-blue-700 group"
              onClick={onAdd}
              title="Créer une rubrique"
            >
              <FilePlus
                className="w-8 h-8 transition group-hover:scale-110 group-hover:text-blue-700"
                strokeWidth={2.5}
              />
            </Button>
            <Button
              variant="ghost"
              className="w-12 h-12 p-0 flex items-center justify-center rounded-xl transition
      hover:bg-blue-100/70 hover:text-blue-700 group"
              onClick={onImportWord}
              title="Importer un document Word"
            >
              <img
                className="w-8 h-8 transition group-hover:scale-110 group-hover:text-blue-700"
                alt="Importer Word"
                src="/word-import2.svg"
              />
            </Button>
            <Button
              variant="ghost"
              className="w-12 h-12 p-0 flex items-center justify-center rounded-xl transition
      hover:bg-blue-100/70 hover:text-blue-700 group"
              onClick={onLoad}
              title="Charger une rubrique existante"
            >
              <Download
                className="w-8 h-8 transition group-hover:scale-110 group-hover:text-blue-700"
                strokeWidth={2.5}
              />
            </Button>
            <Button
              variant="ghost"
              className="w-12 h-12 p-0 flex items-center justify-center rounded-xl transition
      hover:bg-blue-100/70 hover:text-blue-700 group"
              onClick={() => selectedMapItemId && onClone(selectedMapItemId)}
              disabled={!selectedMapItemId}
              title="Dupliquer la rubrique sélectionnée"
            >
              <Copy
                className="w-8 h-8 transition group-hover:scale-110 group-hover:text-blue-700"
                strokeWidth={2.5}
              />
            </Button>
            <Button
              variant="ghost"
              className="w-12 h-12 p-0 flex items-center justify-center rounded-xl transition
      hover:bg-blue-100/70 hover:text-blue-700 group"
              onClick={() => selectedMapItemId && onDelete(selectedMapItemId)}
              disabled={!selectedMapItemId}
              title="Supprimer la rubrique sélectionnée"
            >
              <Trash
                className="w-8 h-8 transition group-hover:scale-110 group-hover:text-blue-700"
                strokeWidth={2.5}
              />
            </Button>
          </div>
          {/* --- LISTE AVEC SCROLL --- */}
          <div style={{ maxHeight: "450px", overflowY: "auto" }}>
            <ScrollArea className="w-full">
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
                    {visibleItems.map((item) => {
                      // Trouver l'index du même item dans la flatlist d'origine
                      const origIdx = mapItems.findIndex(
                        (x) => x.id === item.id
                      );
                      return (
                        <SortableItem
                          key={item.id}
                          item={item}
                          idx={origIdx}
                          selectedMapItemId={selectedMapItemId}
                          onSelect={onSelect}
                          canOutdent={canOutdent}
                          canIndent={canIndent}
                          onOutdent={onOutdent}
                          onIndent={onIndent}
                          mapItems={visibleItems}
                          onToggleExpand={onToggleExpand}
                          hasChildren={hasVisibleChildren(mapItems, origIdx)}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
              <ScrollBar
                orientation="vertical"
                className="w-2.5 bg-[#d9d9d9] rounded-[15px] shadow-[inset_0px_4px_4px_#00000040] blur-[2px]"
              >
                <div className="w-2.5 h-[45px] mt-6 ml-0.5 bg-black rounded-[15px]" />
              </ScrollBar>
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  );
};
