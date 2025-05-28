import React from "react";
import { Button } from "components/ui/button";
import { ScrollArea, ScrollBar } from "components/ui/scroll-area";
import { Separator } from "components/ui/separator";

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
  onClone: (itemId: number) => void;
  onDelete: (itemId: number) => void;
  onLoad: () => void;
}

export const MapModule: React.FC<MapModuleProps> = ({
  isExpanded,
  onToggle,
  mapItems,
  selectedMapItemId,
  onSelect,
  onAdd,
  onClone,
  onDelete,
  onLoad,
}) => {
  return (
    <div
      className="relative w-[310px] transition-all duration-300 ease-in-out"
      style={{ height: isExpanded ? "auto" : "48px" }}
    >
      <div className="relative w-[310px] h-12">
        <div className="absolute top-0.5 left-3 w-[298px]">
          <Separator className="h-px w-full" />
        </div>
        <Button
          variant="ghost"
          className="absolute w-16 h-16 top-0 left-0 p-0"
          onClick={onToggle}
        >
          <img
            className={`w-full h-full transition-transform duration-300 ${
              isExpanded ? "" : "rotate-90"
            }`}
            alt="Map toggle"
            src="https://c.animaapp.com/macke9kyh9ZtZh/img/mapcollapsebutton.svg"
          />
        </Button>
        <h2 className="absolute w-[134px] h-[26px] top-[11px] left-[47px] font-['Roboto',Helvetica] font-extrabold text-black text-[32px] tracking-[0] leading-normal whitespace-nowrap">
          Map
        </h2>
      </div>

      {isExpanded && (
        <>
          <div className="flex items-center justify-between mt-2 mb-2 bg-[#d9d9d94c] rounded-[15px] p-2">
            <button className="w-8 h-8" onClick={onAdd}>
              <img
                className="w-full h-full"
                alt="Rubrique create"
                src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriquecreate.png"
              />
            </button>
            <button className="w-8 h-8" onClick={onLoad}>
              <img
                className="w-full h-full"
                alt="Rubrique load"
                src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriqueload.svg"
              />
            </button>
            <button
              className="w-8 h-8"
              onClick={() => selectedMapItemId && onClone(selectedMapItemId)}
              disabled={!selectedMapItemId}
            >
              <img
                className="w-full h-full"
                alt="Rubrique clone"
                src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriqueclone.svg"
              />
            </button>
            <button
              className="w-8 h-8"
              onClick={() => selectedMapItemId && onDelete(selectedMapItemId)}
              disabled={!selectedMapItemId}
            >
              <img
                className="w-full h-full"
                alt="Rubrique delete"
                src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriquedelete.svg"
              />
            </button>
          </div>
          <div style={{ maxHeight: "450px", overflowY: "auto" }}>
            <ScrollArea className="w-full">
              <div>
                {mapItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`relative flex items-center h-[25px] ${
                      idx !== mapItems.length - 1 ? "mb-2" : ""
                    } cursor-pointer
                      ${
                        selectedMapItemId === item.id
                          ? "bg-blue-100 font-bold"
                          : "hover:bg-gray-100"
                      }`}
                    style={{ paddingLeft: `${item.level * 16}px` }}
                    onClick={() => onSelect(item.id)}
                  >
                    {item.expanded && (
                      <img
                        className="w-4 h-4 mr-1 cursor-pointer"
                        alt="Collapse"
                        src="https://c.animaapp.com/macke9kyh9ZtZh/img/nbtree-collapse.svg"
                      />
                    )}
                    <div className="font-['Roboto',Helvetica] text-[#515a6e] text-xs tracking-[0] leading-normal whitespace-nowrap">
                      {item.title}
                    </div>
                    {selectedMapItemId === item.id && (
                      <img
                        className="absolute w-6 h-6 right-0"
                        alt="Rubrique active"
                        src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriqueactive.svg"
                      />
                    )}
                  </div>
                ))}
              </div>
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
