import React from "react";
import type { Editor } from "@tiptap/react";
import { Button } from "components/ui/button";
import useEditorDialogs from "components/ui/CentralEditor/hooks/useEditorDialogs";
import EditorMenuBar from "components/ui/CentralEditor/EditorMenuBar";

interface EditorHeaderProps {
  editor: Editor | null;
  dialogs: ReturnType<typeof useEditorDialogs>;
  batchMode: boolean;
  setBatchMode: React.Dispatch<React.SetStateAction<boolean>>;
  isXmlView: boolean;
  onValidateXml: () => void;
  onReturnToEdit: () => void;
  isPreviewMode: boolean;
  onPreviewToggle: () => void;
  visibleDockEditor: "question" | "exercice" | null;
  setVisibleDockEditor: React.Dispatch<React.SetStateAction<"question" | "exercice" | null>>;
  hasChanges: boolean;
  onSaveRubrique: () => void;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  editor,
  dialogs,
  batchMode,
  setBatchMode,
  isXmlView,
  onValidateXml,
  onReturnToEdit,
  isPreviewMode,
  onPreviewToggle,
  visibleDockEditor,
  setVisibleDockEditor,
  hasChanges,
  onSaveRubrique,
}) => (
  <header className="flex items-center justify-between px-6 py-3 bg-[#fcfcfc] border-b border-[#e1e1e2]">
    <EditorMenuBar
      editor={editor}
      dialogs={dialogs}
      batchMode={batchMode}
      setBatchMode={setBatchMode}
    />
    <div className="flex items-center gap-2">
      {isXmlView ? (
        <button
          className="h-11 px-4 py-0 rounded-xl border border-solid shadow-[0px_1px_2px_#1a1a1a14] transition-colors duration-300 bg-[#f59e42] hover:bg-[#f97316] text-white font-semibold"
          onClick={onReturnToEdit}
        >
          Retour à la saisie
        </button>
      ) : (
        <button
          className="h-11 px-4 py-0 rounded-xl border border-solid shadow-[0px_1px_2px_#1a1a1a14] transition-colors duration-300 bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold"
          onClick={onValidateXml}
        >
          Valider XML
        </button>
      )}
      <Button
        className={`h-11 px-4 py-0 rounded-xl border border-solid shadow-[0px_1px_2px_#1a1a1a14] transition-colors duration-300 ${
          isPreviewMode ? "bg-[#eb4924] hover:bg-[#d13d1d]" : "bg-[#2463eb] hover:bg-[#1d4ed8]"
        }`}
        onClick={onPreviewToggle}
      >
        {isPreviewMode ? "Cancel Preview" : "Preview"}
      </Button>
      <Button
        className="h-11 px-4 py-0 rounded-xl border border-solid shadow-[0px_1px_2px_#1a1a1a14] transition-colors duration-300 bg-[#2463eb] hover:bg-[#1d4ed8]"
        onClick={() => setVisibleDockEditor((prev) => (prev === "question" ? null : "question"))}
        disabled={visibleDockEditor === "exercice"}
      >
        Q\R
      </Button>
      <Button
        className="h-11 px-4 py-0 rounded-xl border border-solid shadow-[0px_1px_2px_#1a1a1a14] transition-colors duration-300 bg-[#2463eb] hover:bg-[#1d4ed8]"
        onClick={() => setVisibleDockEditor((prev) => (prev === "exercice" ? null : "exercice"))}
        disabled={visibleDockEditor === "question"}
      >
        Exercices
      </Button>
      <Button
        className={`h-11 px-5 py-0 rounded-xl border border-solid shadow-[0px_1px_2px_#1a1a1a14] transition-colors duration-300 ${
          hasChanges ? "bg-[#15803d] hover:bg-[#166534]" : "bg-gray-400 cursor-not-allowed"
        }`}
        onClick={onSaveRubrique}
        disabled={!hasChanges}
      >
        Enregistrer
      </Button>
    </div>
  </header>
);

export default EditorHeader;
