import React from "react";
import { Button } from "components/ui/button";
import { Checkbox } from "components/ui/checkbox";

interface BottomBarProps {
  height: number;
  isLeftSidebarExpanded: boolean;
  isRightSidebarExpanded: boolean;
  isRightSidebarFloating: boolean;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  height,
  isLeftSidebarExpanded,
  isRightSidebarExpanded,
  isRightSidebarFloating,
}) => {
  const getStyle = () => {
    let style: React.CSSProperties = {
      height: `${height}px`,
      backgroundColor: "white",
      transition: "all 0.3s ease-in-out",
    };

    if (!isLeftSidebarExpanded) {
      style.marginLeft = "-345px";
    }

    if (!isRightSidebarExpanded || isRightSidebarFloating) {
      style.marginRight = "-248px";
    }

    return style;
  };

  const toolbarIcons = [
    { src: "https://c.animaapp.com/macke9kyh9ZtZh/img/undo.svg", alt: "Undo" },
    { src: "https://c.animaapp.com/macke9kyh9ZtZh/img/redo.svg", alt: "Redo" },
    { src: "https://c.animaapp.com/macke9kyh9ZtZh/img/bold.svg", alt: "Bold" },
    {
      src: "https://c.animaapp.com/macke9kyh9ZtZh/img/italic.svg",
      alt: "Italic",
    },
    {
      src: "https://c.animaapp.com/macke9kyh9ZtZh/img/underline.svg",
      alt: "Underline",
    },
    {
      src: "https://c.animaapp.com/macke9kyh9ZtZh/img/textcolor.svg",
      alt: "Text color",
    },
    {
      src: "https://c.animaapp.com/macke9kyh9ZtZh/img/indent-left.svg",
      alt: "Indent left",
    },
    {
      src: "https://c.animaapp.com/macke9kyh9ZtZh/img/indentright.svg",
      alt: "Indent right",
    },
  ];

  return (
    <div style={getStyle()} className="overflow-auto flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {toolbarIcons.map((icon) => (
            <Button key={icon.alt} variant="ghost" className="p-1">
              <img src={icon.src} alt={icon.alt} className="w-6 h-6" />
            </Button>
          ))}
          <div className="flex items-center gap-1 ml-2">
            <span className="text-sm font-medium">Font Size:</span>
            <select className="bg-transparent border border-gray-300 rounded px-2 py-1">
              {[10, 12, 14, 16, 18, 20, 22, 24].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="bg-transparent hover:bg-gray-100 text-[#1a1a1ab2] font-text-base-font-semibold"
          >
            Insérer une balise Question
          </Button>
          <Button
            variant="outline"
            className="bg-transparent hover:bg-gray-100 text-[#1a1a1ab2] font-text-base-font-semibold"
          >
            Insérer une balise Réponse
          </Button>
        </div>
      </div>
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="flex justify-end mb-2">
          <Button variant="ghost" className="text-blue-600 hover:bg-blue-100">
            Copier
          </Button>
          <Button
            variant="ghost"
            className="text-blue-600 hover:bg-blue-100 ml-2"
          >
            Modifier
          </Button>
        </div>
        <div className="space-y-2">
          <p className="font-medium">Q1 : Lorem Ipsum... (20 mots)</p>
          <div className="flex items-center">
            <Checkbox id="r1a" className="mr-2" />
            <label htmlFor="r1a" className="text-sm">
              R1a : Mauvaise réponse
            </label>
          </div>
          <div className="flex items-center">
            <Checkbox id="r1b" className="mr-2" checked />
            <label htmlFor="r1b" className="text-sm">
              R1b : Bonne réponse
            </label>
          </div>
          <div className="flex items-center">
            <Checkbox id="r1c" className="mr-2" />
            <label htmlFor="r1c" className="text-sm">
              R1c : Mauvaise réponse
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
