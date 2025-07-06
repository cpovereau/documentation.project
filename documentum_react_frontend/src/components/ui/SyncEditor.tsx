import React, { useState } from "react";
import { toast } from "sonner";
import { Card } from "components/ui/card";
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
import { FindReplaceDialog } from "components/ui/FindReplaceDialog";
import { useContentChangeTracker } from "hooks/useContentChangeTracker";
import { useGrammarChecker } from "hooks/useGrammarChecker";
import { useSpeechCommands } from "hooks/useSpeechCommands";
import { useEditorHistoryTracker } from "hooks/useEditorHistoryTracker";
import { useFindReplaceTipTap } from "hooks/useFindReplaceTipTap";

interface SyncEditorProps {
  selectedType: "evolution" | "correctif";
  onTypeChange: (type: "evolution" | "correctif") => void;
  height: number;
}

export const SyncEditor: React.FC<SyncEditorProps> = ({
  selectedType,
  onTypeChange,
  height,
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
          "prose max-w-none p-4 min-h-[400px] overflow-auto border-none outline-none",
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

  // Recherche et remplacement de texte
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [findValue, setFindValue] = useState("");
  const [replaceValue, setReplaceValue] = useState("");
  const { find, replace, replaceAll } = useFindReplaceTipTap(editor);

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
    <Card
      className="flex flex-col w-full overflow-hidden border-none shadow-none"
      style={{ height: `${height}px` }}
    >
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
      {/* Toolbar secondaire */}
      <div className="h-[50px] border-b px-4 mx-[30px] bg-[#fcfcfc] flex items-center gap-0">
        {/* Undo / Redo */}
        <button
          onClick={() => editor?.chain().focus().undo().run()}
          title="Annuler"
          className="w-8 h-10 text-[16px] font-semibold flex items-center justify-center hover:bg-gray-200"
        >
          ↺
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          title="Rétablir"
          className="w-8 h-10 text-[16px] font-semibold flex items-center justify-center hover:bg-gray-200"
        >
          ↻
        </button>

        {/* Séparateur */}
        <div className="border-l h-6 mx-2 border-gray-300" />

        {/* Mise en forme */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Gras"
          className={`w-8 h-10 text-[16px] font-semibold flex items-center justify-center hover:bg-gray-200 ${
            editor.isActive("bold") ? "bg-gray-200 font-bold" : ""
          }`}
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italique"
          className={`w-8 h-10 text-[16px] font-semibold flex items-center justify-center hover:bg-gray-200 ${
            editor.isActive("italic") ? "bg-gray-200 italic" : ""
          }`}
        >
          I
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Souligné"
          className={`w-8 h-10 text-[16px] font-semibold flex items-center justify-center hover:bg-gray-200 ${
            editor.isActive("underline") ? "bg-gray-200 underline" : ""
          }`}
        >
          U
        </button>

        {/* Séparateur */}
        <div className="border-l h-6 mx-2 border-gray-300" />

        {/* Alignements */}
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          title="Aligner à gauche"
          className="w-8 h-10 text-[16px] flex items-center justify-center hover:bg-gray-200"
        >
          ⯇
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          title="Centrer"
          className="w-8 h-10 text-[16px] flex items-center justify-center hover:bg-gray-200"
        >
          ≡
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          title="Aligner à droite"
          className="w-8 h-10 text-[16px] flex items-center justify-center hover:bg-gray-200"
        >
          ⯈
        </button>

        {/* Séparateur */}
        <div className="border-l h-6 mx-2 border-gray-300" />

        {/* Couleur */}
        <input
          type="color"
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
            editor.chain().focus().setColor(e.target.value).run();
          }}
          className="h-8 w-10 mt-[2px]"
        />

        {/* Séparateur */}
        <div className="border-l h-6 mx-2 border-gray-300" />

        {/* Recherche */}
        <button
          onClick={() => setIsFindOpen(true)}
          title="Rechercher / Remplacer"
          className="ml-2 px-3 py-1 rounded bg-gray-100 hover:bg-blue-100 text-gray-700"
        >
          🔍 Rechercher / Remplacer
        </button>

        {/* Enregistrement */}
        <div className="ml-auto mr-[36px]">
          <Button
            onClick={onSaveCorrection}
            disabled={!hasChanges}
            className={`px-5 h-11 mt-1 mb-1 py-0 rounded-xl border border-solid shadow-[0px_1px_2px_#1a1a1a14] transition-colors duration-300 ${
              hasChanges
                ? "bg-[#15803d] hover:bg-[#166534]"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Zone éditable principale */}
      <div className="flex-grow overflow-auto px-[30px]">
        <EditorContent
          editor={editor}
          className="h-full px-4"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
        />
      </div>

      {isFindOpen && (
        <FindReplaceDialog
          findValue={findValue}
          replaceValue={replaceValue}
          onChangeFind={setFindValue}
          onChangeReplace={setReplaceValue}
          onFind={() => find(findValue)}
          onReplace={() => replace(findValue, replaceValue)}
          onReplaceAll={() => replaceAll(findValue, replaceValue)}
          onClose={() => setIsFindOpen(false)}
        />
      )}
    </Card>
  );
};
