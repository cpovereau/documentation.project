import React from "react";
import { Button } from "components/ui/button";
import { ScrollArea } from "components/ui/scroll-area";
import { Separator } from "components/ui/separator";
import { Copy, Trash, Plus, ClipboardPaste } from "lucide-react";
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
import { FeatureItemComponent } from "@/components/ui/FeatureItem";
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
      <ScrollArea maxHeight="600px">
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
                <FeatureItemComponent
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
