import React from "react";
import { Button } from "components/ui/button";
import { ScrollArea, ScrollBar } from "components/ui/scroll-area";
import { Separator } from "components/ui/separator";
import {
  ChevronDown,
  FilePlus,
  FolderSearch,
  Download,
  Copy,
  Trash,
} from "lucide-react";
import { MapItem as MapItemComponent } from "components/ui/MapItem";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import type { MapItem } from "@/types/MapItem";

export interface MapModuleProps {
  isExpanded: boolean;
  onToggle: () => void;
  mapItems: MapItem[];
  selectedMapItemId: number | null;
  onRename: (itemId: number) => void;
  editingItemId: number | null;
  onRenameSave: (itemId: number, newTitle: string) => void;
  setLoadMapOpen: (open: boolean) => void;
  onLoadMapDialog: () => void;
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

export const MapModule: React.FC<MapModuleProps> = ({
  isExpanded,
  onToggle,
  mapItems,
  selectedMapItemId,
  setLoadMapOpen,
  onLoadMapDialog,
  onSelect,
  onRename,
  editingItemId,
  onRenameSave,
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
          <Separator />
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
        <div className="absolute w-[134px] h-[26px] top-[11px] left-[47px] font-bold text-black text-[32px] leading-normal">
          Map
        </div>
      </div>
      {/* --- BARRE OUTILS --- */}
      {isExpanded && (
        <>
          <div className="flex items-center justify-between gap-2 bg-[#d9d9d94c] rounded-[15px] mt-2 mx-[5px] py-1 px-1">
            <Button
              variant="ghost"
              className="w-12 h-12 p-0 flex items-center justify-center rounded-xl transition hover:bg-blue-100/70 hover:text-blue-700 group"
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
              className="w-12 h-12 p-0 flex items-center justify-center rounded-xl transition hover:bg-blue-100/70 hover:text-blue-700 group"
              onClick={onLoadMapDialog}
              title="Charger une map existante"
            >
              <FolderSearch
                className="w-8 h-8 transition group-hover:scale-110 group-hover:text-blue-700"
                strokeWidth={2.5}
              />
            </Button>
            <Button
              variant="ghost"
              className="w-12 h-12 p-0 flex items-center justify-center rounded-xl transition hover:bg-blue-100/70 hover:text-blue-700 group"
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
              className="w-12 h-12 p-0 flex items-center justify-center rounded-xl transition hover:bg-blue-100/70 hover:text-blue-700 group"
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
              className="w-12 h-12 p-0 flex items-center justify-center rounded-xl transition hover:bg-blue-100/70 hover:text-blue-700 group"
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
              className="w-12 h-12 p-0 flex items-center justify-center rounded-xl transition hover:bg-blue-100/70 hover:text-blue-700 group"
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
          <div style={{ maxHeight: "380px", overflowY: "auto" }}>
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
                    {visibleItems.map((item) => {
                      const origIdx = mapItems.findIndex(
                        (x) => x.id === item.id
                      );
                      return (
                        <MapItemComponent
                          key={item.id}
                          item={item}
                          idx={origIdx}
                          selectedMapItemId={selectedMapItemId}
                          onSelect={onSelect}
                          onRename={onRename}
                          editing={editingItemId === item.id}
                          onRenameSave={onRenameSave}
                          mapItems={mapItems}
                          onToggleExpand={onToggleExpand}
                          onIndent={onIndent}
                          onOutdent={onOutdent}
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
