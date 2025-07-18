import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useEffect } from "react";
import { Trash2 } from "lucide-react";
import { Textarea } from "components/ui/textarea";
import { Button } from "components/ui/button";

type Exercice = {
  titre: string;
  contenuXml: string;
  correctionXml: string;
};

interface ExerciceItemProps {
  exercice: Exercice;
  index: number;
  canDelete: boolean;
  onChange: (field: keyof Exercice, value: string) => void;
  onDelete: () => void;
  setActiveEditor: (editor: Editor) => void;
}

const ExerciceItem: React.FC<ExerciceItemProps> = ({
  exercice,
  index,
  canDelete,
  onChange,
  onDelete,
  setActiveEditor,
}) => {
  const contenuEditor = useEditor({
    extensions: [StarterKit],
    content: exercice.contenuXml,
    onUpdate: ({ editor }) => {
      onChange("contenuXml", editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "border px-2 py-1 rounded min-h-[120px] bg-white",
      },
    },
  });

  const correctionEditor = useEditor({
    extensions: [StarterKit],
    content: exercice.correctionXml,
    onUpdate: ({ editor }) => {
      onChange("correctionXml", editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "border px-2 py-1 rounded min-h-[120px] bg-white",
      },
    },
  });

  useEffect(() => {
    if (!contenuEditor?.view) return;

    const dom = contenuEditor.view.dom;
    const handleFocus = () => setActiveEditor(contenuEditor);

    dom.addEventListener("focusin", handleFocus);

    return () => {
      dom.removeEventListener("focusin", handleFocus);
    };
  }, [contenuEditor]);

  useEffect(() => {
    if (!correctionEditor?.view) return;

    const dom = correctionEditor.view.dom;
    const handleFocus = () => setActiveEditor(correctionEditor);

    dom.addEventListener("focusin", handleFocus);

    return () => {
      dom.removeEventListener("focusin", handleFocus);
    };
  }, [correctionEditor]);

  if (!exercice || typeof exercice.contenuXml !== "string") {
    return null;
  }

  return (
    <div className="relative p-4 rounded-xl border border-blue-400 bg-[#f9fafb] shadow-sm">
      {/* Supprimer */}
      {canDelete && (
        <Button
          variant="ghost"
          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
          onClick={onDelete}
          title="Supprimer cet exercice"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}

      <div className="flex justify-between items-start mb-3">
        <input
          type="text"
          value={exercice.titre}
          onChange={(e) => onChange("titre", e.target.value)}
          className="text-base font-semibold border-none bg-transparent focus:outline-none flex-grow"
          style={{ fontSize: "1.05rem" }}
          placeholder={`Exercice ${index + 1}`}
        />
      </div>

      <label className="text-sm font-medium">Enoncé :</label>
      <div className="bg-white px-2 py-1 mb-4 min-h-[120px]">
        <EditorContent editor={contenuEditor} />
      </div>

      <label className="text-sm font-medium">Correction :</label>
      <div className="bg-white px-2 py-1 min-h-[120px]">
        <EditorContent editor={correctionEditor} />
      </div>
    </div>
  );
};

export default ExerciceItem;
