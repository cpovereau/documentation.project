import React from "react";
import type { Editor } from "@tiptap/react";
import { Button } from "components/ui/button";

interface EditorToolbarProps {
  editor: Editor | null;
  isRecording: boolean;
  onStartDictation: () => void;
  onStopDictation: () => void;
  openFindDialog: () => void;
  openHistoryDialog: () => void;
  logAction: (action: string, value?: string) => void;
  BlockTypeMenu: React.ReactNode;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  isRecording,
  onStartDictation,
  onStopDictation,
  openFindDialog,
  openHistoryDialog,
  logAction,
  BlockTypeMenu,
}) => (
  <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b bg-[#fcfcfc]">
    <button
      onClick={() => editor?.chain().focus().undo().run()}
      title="Annuler"
      className="icon-btn"
    >
      ↺
    </button>
    <button
      onClick={() => editor?.chain().focus().redo().run()}
      title="Rétablir"
      className="icon-btn"
    >
      ↻
    </button>
    <div className="h-5 border-l border-gray-300 mx-2"></div>
    <button
      onClick={() => {
        editor?.chain().focus().toggleBold().run();
        logAction("Texte mis en gras");
      }}
      title="Gras"
      className={`icon-btn ${editor?.isActive("bold") ? "bg-blue-100" : ""}`}
    >
      B
    </button>
    <button
      onClick={() => {
        editor?.chain().focus().toggleItalic().run();
        logAction("Texte mis en italique");
      }}
      title="Italique"
      className={`icon-btn ${editor?.isActive("italic") ? "bg-blue-100" : ""}`}
    >
      I
    </button>
    <button
      onClick={() => {
        editor?.chain().focus().toggleItalic().run();
        logAction("Texte souligné");
      }}
      title="Souligné"
      className={`icon-btn ${editor?.isActive("underline") ? "bg-blue-100" : ""}`}
    >
      U
    </button>
    <div className="h-5 border-l border-gray-300 mx-2"></div>
    <button
      onClick={() => editor?.chain().focus().setTextAlign("left").run()}
      title="Aligner à gauche"
      className={`icon-btn ${editor?.isActive({ textAlign: "left" }) ? "bg-blue-100" : ""}`}
    >
      ⯇
    </button>
    <button
      onClick={() => editor?.chain().focus().setTextAlign("center").run()}
      title="Centrer"
      className={`icon-btn ${editor?.isActive({ textAlign: "center" }) ? "bg-blue-100" : ""}`}
    >
      ≡
    </button>
    <button
      onClick={() => editor?.chain().focus().setTextAlign("right").run()}
      title="Aligner à droite"
      className={`icon-btn ${editor?.isActive({ textAlign: "right" }) ? "bg-blue-100" : ""}`}
    >
      ⯈
    </button>
    <button
      onClick={() => editor?.chain().focus().setTextAlign("justify").run()}
      title="Justifier"
      className={`icon-btn ${editor?.isActive({ textAlign: "justify" }) ? "bg-blue-100" : ""}`}
    >
      ☰
    </button>
    <div className="h-5 border-l border-gray-300 mx-2"></div>
    <input
      type="color"
      onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
      value={editor?.getAttributes("textStyle").color || "#000000"}
      title="Changer la couleur"
      className="ml-2"
    />
    <div className="h-5 border-l border-gray-300 mx-2"></div>
    <button
      onClick={() => {
        const url = prompt("Entrez l'URL :");
        if (url) editor?.chain().focus().setLink({ href: url }).run();
      }}
      className={`icon-btn ${editor?.isActive("link") ? "bg-blue-100" : ""}`}
    >
      🔗
    </button>
    <button
      onClick={() => editor?.chain().focus().unsetLink().run()}
      className="icon-btn"
      title="Supprimer le lien"
    >
      ❌
    </button>
    {/* Menus bloqués et inline customisés */}
    {BlockTypeMenu}
    <div className="border-l h-6 mx-2 border-gray-300" />
    <Button
      onClick={isRecording ? onStopDictation : onStartDictation}
      className={`ml-2 border-l px-3 py-1 font-semibold rounded-xl transition duration-200
      ${
        isRecording
          ? "bg-red-600 hover:bg-red-700 text-white border border-red-700"
          : "bg-blue-600 hover:bg-blue-700 text-white border border-blue-700"
      }
    `}
    >
      🎙️ {isRecording ? "Arrêter" : "Dicter"}
    </Button>
    <button
      className="ml-2 px-3 py-1 rounded bg-gray-100 hover:bg-blue-100 text-gray-700"
      onClick={openFindDialog}
    >
      🔍 Rechercher / Remplacer
    </button>
    <button
      className="ml-2 px-3 py-1 rounded bg-gray-100 hover:bg-blue-100 text-gray-700"
      onClick={openHistoryDialog}
    >
      🕑 Historique
    </button>
  </div>
);

export default EditorToolbar;
