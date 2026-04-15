import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import { Button } from "components/ui/button";
import { X } from "lucide-react";
import ExerciceItem from "./ExerciceItem";

type Exercice = {
  id?: string;
  titre: string;
  contenuXml: string;
  correctionXml: string;
  active: boolean;
};

interface Props {
  height: number;
  onResizeDockEditorHeight: (newHeight: number) => void;
  isLeftSidebarExpanded: boolean;
  isRightSidebarExpanded: boolean;
  isRightSidebarFloating: boolean;
  isPreviewMode: boolean;
  onClose: () => void;
}

export const ExerciceEditor: React.FC<Props> = ({
  height,
  onResizeDockEditorHeight,
  isLeftSidebarExpanded,
  isRightSidebarExpanded,
  isRightSidebarFloating,
  isPreviewMode,
  onClose,
}) => {
  const [exercices, setExercices] = useState<Exercice[]>([
    {
      titre: "Exercice 1",
      contenuXml: "<exercice>...</exercice>",
      correctionXml: "<correction>...</correction>",
      active: true,
    },
  ]);
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);

  const handleAddExercice = () => {
    setExercices((prev) => [
      ...prev,
      {
        titre: `Exercice ${prev.length + 1}`,
        contenuXml: "",
        correctionXml: "",
        active: true,
      },
    ]);
  };

  const handleUpdate = (
    index: number,
    field: keyof Exercice,
    value: string
  ) => {
    setExercices((prev) => {
      const updated = [...prev];
      (updated[index][field] as string) = value;
      return updated;
    });
  };

  const handleDelete = (index: number) => {
    if (exercices.length <= 1) return;
    setExercices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    console.log("Exercices à sauvegarder :", exercices);
    alert("Exercices enregistrés !");
  };

  // Barre d’outils unique pour l’éditeur actif
  const Toolbar = () => (
    <div className="flex gap-1 ml-auto">
      <Button
        variant="ghost"
        onClick={() => activeEditor?.chain().focus().undo().run()}
        title="Annuler"
        disabled={!activeEditor}
      >
        ↺
      </Button>
      <Button
        variant="ghost"
        onClick={() => activeEditor?.chain().focus().redo().run()}
        title="Rétablir"
        disabled={!activeEditor}
      >
        ↻
      </Button>
      <Button
        variant="ghost"
        onClick={() => activeEditor?.chain().focus().toggleBold().run()}
        title="Gras"
        disabled={!activeEditor}
      >
        <span className="font-bold">B</span>
      </Button>
      <Button
        variant="ghost"
        onClick={() => activeEditor?.chain().focus().toggleItalic().run()}
        title="Italique"
        disabled={!activeEditor}
      >
        <span className="italic">I</span>
      </Button>
      <Button
        variant="ghost"
        onClick={() => activeEditor?.chain().focus().toggleUnderline().run()}
        title="Souligné"
        disabled={!activeEditor}
      >
        <span className="underline">U</span>
      </Button>
    </div>
  );

  if (!exercices || exercices.length === 0) return null;

  return (
    <div
      style={{ height: `${height}px` }}
      className="flex flex-col flex-grow min-h-0 overflow-hidden p-4 bg-white border-t"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4 gap-x-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleAddExercice}
            className="h-11 px-2"
          >
            + Ajouter un exercice
          </Button>
          <Button
            onClick={handleSave}
            className="h-11 px-4 bg-green-600 text-white"
          >
            Enregistrer
          </Button>
        </div>
        <Toolbar />
        <Button
          variant="ghost"
          title="Fermer l’éditeur"
          onClick={onClose}
          className="text-gray-500 hover:text-black"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Liste des exercices */}
      <div className="flex flex-col gap-6 overflow-y-auto pr-1">
        {exercices.map((exo, i) =>
          exo && typeof exo.contenuXml === "string" ? (
            <ExerciceItem
              key={i}
              exercice={exo}
              index={i}
              canDelete={exercices.length > 1}
              onChange={(field, value) => handleUpdate(i, field, value)}
              onDelete={() => handleDelete(i)}
              setActiveEditor={setActiveEditor}
            />
          ) : null
        )}
      </div>
    </div>
  );
};
