import React from "react";
import { Button } from "components/ui/button";
import { Card, CardContent } from "components/ui/card";
import { ScrollArea } from "components/ui/scroll-area";
import { Separator } from "components/ui/separator";

interface MapModuleProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export const MapModule: React.FC<MapModuleProps> = ({
  isExpanded,
  onToggle,
}) => {
  const mapItems = [
    { id: 1, level: 0, title: "Racine", expanded: true },
    { id: 2, level: 1, title: "Introduction", expanded: false },
    { id: 3, level: 1, title: "Connexion à l'application", expanded: false },
    {
      id: 4,
      level: 1,
      title: "Dossier de l'Usager",
      expanded: true,
      active: true,
    },
    { id: 5, level: 2, title: "Administratif", expanded: true },
    { id: 6, level: 3, title: "Etablissement", expanded: false },
    { id: 7, level: 3, title: "Etat Civil", expanded: false },
  ];

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
            <button className="w-8 h-8 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none">
              <img
                className="w-full h-full"
                alt="Rubrique create"
                src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriquecreate.png"
              />
            </button>
            <button className="relative w-[31px] h-[31px] cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none">
              <img
                className="absolute w-[31px] h-1 top-0 left-0"
                alt="Vector"
                src="https://c.animaapp.com/macke9kyh9ZtZh/img/vector-59.svg"
              />
              <div className="absolute w-2 h-[7px] top-[17px] left-2.5 [-webkit-text-stroke:1px_#2e26c1] font-['SeoulHangang-EB',Helvetica] font-normal text-[#2e26c1] text-[10px] tracking-[0] leading-normal whitespace-nowrap">
                W
              </div>
              <img
                className="absolute w-[25px] h-[31px] top-0 left-[3px]"
                alt="Rectangle"
                src="https://c.animaapp.com/macke9kyh9ZtZh/img/rectangle-4144.svg"
              />
              <img
                className="absolute w-2.5 h-2.5 top-5 left-[18px]"
                alt="Vector"
                src="https://c.animaapp.com/macke9kyh9ZtZh/img/vector-298.svg"
              />
              <img
                className="absolute w-0.5 h-2.5 top-[7px] left-3.5"
                alt="Vector"
                src="https://c.animaapp.com/macke9kyh9ZtZh/img/vector-296.svg"
              />
              <img
                className="absolute w-[11px] h-1.5 top-[5px] left-2.5"
                alt="Vector"
                src="https://c.animaapp.com/macke9kyh9ZtZh/img/vector-297.svg"
              />
            </button>
            <button className="w-8 h-8 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none">
              <img
                className="w-full h-full"
                alt="Rubrique load"
                src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriqueload.svg"
              />
            </button>
            <button className="w-8 h-8 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none">
              <img
                className="w-full h-full"
                alt="Rubrique clone"
                src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriqueclone.svg"
              />
            </button>
            <button className="w-8 h-8 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none">
              <img
                className="w-full h-full"
                alt="Rubrique delete"
                src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriquedelete.svg"
              />
            </button>
          </div>

          <ScrollArea
            className="h-full overflow-hidden"
            style={{ maxHeight: "calc(100vh - 250px)" }}
          >
            <div className="p-4">
              {mapItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`relative flex items-center h-[21px] ${
                    index !== mapItems.length - 1 ? "mb-2" : ""
                  }`}
                  style={{ paddingLeft: `${item.level * 16}px` }}
                >
                  {item.expanded && (
                    <img
                      className="w-4 h-4 mr-1 cursor-pointer"
                      alt="Nbtree collapse"
                      src="https://c.animaapp.com/macke9kyh9ZtZh/img/nbtree-collapse.svg"
                    />
                  )}
                  <div
                    className={`font-['Roboto',Helvetica] ${
                      item.active ? "font-extrabold" : "font-normal"
                    } text-[#515a6e] text-xs tracking-[0] leading-normal whitespace-nowrap cursor-pointer`}
                  >
                    {item.title}
                  </div>
                  {item.active && (
                    <img
                      className="absolute w-6 h-6 right-0"
                      alt="Rubrique active"
                      src="https://c.animaapp.com/macke9kyh9ZtZh/img/rubriqueactive.svg"
                    />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
};
