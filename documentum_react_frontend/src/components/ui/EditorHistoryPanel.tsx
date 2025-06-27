// components/EditorHistoryPanel.tsx
import React from "react";
import { HistoryEntry } from "@/hooks/useEditorHistoryTracker";

interface EditorHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  onClear?: () => void;
}

export const EditorHistoryPanel: React.FC<EditorHistoryPanelProps> = ({
  isOpen,
  onClose,
  history,
  onClear,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[430px] max-w-[96vw] animate-in fade-in slide-in-from-top-4">
        <h3 className="font-semibold mb-3">Historique des actions</h3>
        <div className="max-h-[400px] overflow-y-auto flex flex-col gap-2">
          {history.length === 0 ? (
            <div className="text-gray-500">Aucune action enregistrée.</div>
          ) : (
            history
              .slice()
              .reverse()
              .map((item, i) => (
                <div key={i} className="flex flex-col text-sm">
                  <span className="font-medium text-gray-800">
                    {new Date(item.ts).toLocaleTimeString()} — {item.action}
                  </span>
                  {item.content && (
                    <span className="text-gray-500 line-clamp-1">
                      {item.content}
                    </span>
                  )}
                </div>
              ))
          )}
        </div>
        <div className="flex justify-between mt-4">
          <button
            className="px-4 py-1.5 rounded bg-gray-200 hover:bg-gray-300"
            onClick={onClose}
          >
            Fermer
          </button>
          {onClear && (
            <button
              className="px-4 py-1.5 rounded bg-red-100 hover:bg-red-200 text-red-800"
              onClick={onClear}
            >
              Effacer l'historique
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
