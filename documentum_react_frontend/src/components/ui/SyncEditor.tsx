import React, { useState } from "react";
import { toast } from "sonner";
import { ToolbarCorrection } from "./ToolbarCorrection";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import { Button } from "components/ui/button";
import { useContentChangeTracker } from "hooks/useContentChangeTracker";
import { useGrammarChecker } from "hooks/useGrammarChecker";
import { useSpeechCommands } from "hooks/useSpeechCommands";
import { useEditorHistoryTracker } from "hooks/useEditorHistoryTracker";
import { useFindReplaceTipTap } from "hooks/useFindReplaceTipTap";

interface SyncEditorProps {
  selectedType: "evolution" | "correctif";
  onTypeChange: (type: "evolution" | "correctif") => void;
}

export const SyncEditor: React.FC<SyncEditorProps> = ({
  selectedType,
  onTypeChange,
}) => {
  const [color, setColor] = useState("#000000");

  // État pour le contenu de l'éditeur
  const [content, setContent] = useState("");

  // État pour la navigation dans les corrections
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(1); // ou 0 par défaut

  // Fonctions pour la navigation dans les corrections
  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < totalCount - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleShowView = () => {
    alert("Affichage du suivi complet (à venir)");
  };

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < totalCount - 1;

  // Initialisation de l'éditeur avec les extensions nécessaires
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose max-w-none p-4 min-h-[300px] border rounded overflow-auto",
      },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  useGrammarChecker(editor);
  useSpeechCommands(editor);
  useFindReplaceTipTap(editor);
  useEditorHistoryTracker(editor);

  // Fonction pour sauvegarder le contenu de l'éditeur
  const handleSave = () => {
    const html = editor?.getHTML();
    console.log("Contenu sauvegardé:", html);
    alert("Correctif enregistré (mock)");
  };

  const { hasChanges, resetInitialContent } = useContentChangeTracker(content);

  // Fonction pour gérer l'enregistrement du correctif
  const onSaveCorrection = () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 800)), {
      loading: "Enregistrement du correctif...",
      success: "Correctif enregistré avec succès !",
      error: "Échec de l’enregistrement",
    });

    if (editor) {
      const current = editor.getHTML();
      resetInitialContent(); // pour désactiver le bouton
    }
  };

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full bg-white">
      <ToolbarCorrection
        selectedType={selectedType}
        onTypeChange={onTypeChange}
        currentIndex={currentIndex}
        totalCount={totalCount}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onShowView={handleShowView}
      />
      <div className="flex items-center gap-2 border-b px-4 py-2 mx-[30px]">
        <button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().undo().run()}
        >
          ↺
        </button>
        <button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().redo().run()}
        >
          ↻
        </button>
        <button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-gray-200" : ""}
        >
          B
        </button>
        <button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-gray-200" : ""}
        >
          I
        </button>
        <button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "bg-gray-200" : ""}
        >
          U
        </button>
        <button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          ◧
        </button>
        <button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          ⊶
        </button>
        <button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          ◨
        </button>
        <input
          type="color"
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
            editor.chain().focus().setColor(e.target.value).run();
          }}
          className="h-8 w-10 border border-gray-300 rounded"
        />
        <button
          size="sm"
          variant="ghost"
          onClick={() => alert("Recherche / Remplacement...")}
        >
          🔍 Rechercher / Remplacer
        </button>
        <div className="ml-auto mr-[36px]">
          <Button
            onClick={onSaveCorrection}
            disabled={!hasChanges}
            className={`h-11 px-5 py-0 rounded-xl border border-solid shadow-[0px_1px_2px_#1a1a1a14] transition-colors duration-300 ${
              hasChanges
                ? "bg-[#15803d] hover:bg-[#166534]"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Enregistrer
          </Button>
        </div>
      </div>
      <EditorContent editor={editor} className="flex-grow" />
    </div>
  );
};
