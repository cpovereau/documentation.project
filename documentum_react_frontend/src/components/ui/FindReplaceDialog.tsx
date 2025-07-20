import React, { useState, useRef } from "react";
import { Button } from "components/ui/button";

interface FindReplaceDialogProps {
  findValue: string;
  replaceValue: string;
  onChangeFind: (value: string) => void;
  onChangeReplace: (value: string) => void;
  onFind: () => void;
  onReplace: () => void;
  onReplaceAll: () => void;
  onClose: () => void;
}

export const FindReplaceDialog: React.FC<FindReplaceDialogProps> = ({
  findValue,
  replaceValue,
  onChangeFind,
  onChangeReplace,
  onFind,
  onReplace,
  onReplaceAll,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({
    x: window.innerWidth / 2 - 300,
    y: 100,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = dialogRef.current?.getBoundingClientRect();
    if (rect) {
      setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/30">
      <div
        ref={dialogRef}
        style={{
          left: position.x,
          top: position.y,
          position: "absolute",
        }}
        className="bg-white rounded-2xl shadow-2xl p-6 w-[600px] max-w-[96vw] animate-in fade-in"
      >
        <div
          className="cursor-move text-lg font-semibold text-gray-900 mb-3 select-none"
          role="button"
          tabIndex={0}
          onMouseDown={handleMouseDown}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleMouseDown(e as unknown as React.MouseEvent);
            }
          }}
        >
          🔍 Rechercher / Remplacer
        </div>
        <div className="flex flex-col gap-3">
          <input
            className="border border-gray-200 focus:border-blue-500 outline-none rounded-lg px-3 py-2 text-base"
            placeholder="Rechercher…"
            value={findValue}
            autoFocus
            onChange={(e) => onChangeFind(e.target.value)}
          />
          <input
            className="border border-gray-200 focus:border-blue-500 outline-none rounded-lg px-3 py-2 text-base"
            placeholder="Remplacer par…"
            value={replaceValue}
            onChange={(e) => onChangeReplace(e.target.value)}
          />
          <div className="flex flex-row gap-3 mt-2 flex-wrap justify-end">
            <Button
              onClick={onFind}
              className="h-8 px-4 py-0 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Suivant
            </Button>
            <Button
              onClick={onReplace}
              className="h-8 px-4 py-0 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Remplacer
            </Button>
            <Button
              onClick={onReplaceAll}
              className="h-8 px-4 py-0 bg-blue-100 hover:bg-blue-200 text-blue-800"
            >
              Remplacer tout
            </Button>
            <Button
              onClick={onClose}
              className="h-8 px-4 py-0 bg-red-600 hover:bg-red-700 text-white font-semibold px-4"
            >
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
