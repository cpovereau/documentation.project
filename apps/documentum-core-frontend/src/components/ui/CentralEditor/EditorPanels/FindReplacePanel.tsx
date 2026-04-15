import React from "react";
import { Button } from "components/ui/button";

interface FindReplacePanelProps {
  isOpen: boolean;
  onClose: () => void;
  findValue: string;
  replaceValue: string;
  onChangeFind: (value: string) => void;
  onChangeReplace: (value: string) => void;
  onFind: () => void;
  onReplace: () => void;
  onReplaceAll: () => void;
}

const FindReplacePanel: React.FC<FindReplacePanelProps> = ({
  isOpen,
  onClose,
  findValue,
  replaceValue,
  onChangeFind,
  onChangeReplace,
  onFind,
  onReplace,
  onReplaceAll,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/30">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[600px] max-w-[96vw] animate-in fade-in mx-auto mt-24">
        <div className="text-lg font-semibold text-gray-900 mb-3 select-none"
          tabIndex={0}
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

export default FindReplacePanel;
