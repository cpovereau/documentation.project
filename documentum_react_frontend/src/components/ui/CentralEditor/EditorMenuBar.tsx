import React from "react";
import type { Editor } from "@tiptap/react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "components/ui/navigation-menu";
import useEditorDialogs from "components/ui/CentralEditor/hooks/useEditorDialogs";

interface EditorMenuBarProps {
  editor: Editor | null;
  dialogs: ReturnType<typeof useEditorDialogs>;
  batchMode: boolean;
  setBatchMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditorMenuBar: React.FC<EditorMenuBarProps> = ({
  editor,
  dialogs,
  batchMode,
  setBatchMode,
}) => (
  <NavigationMenu>
    <NavigationMenuList>
      {/* --- Menu ÉDITION --- */}
      <NavigationMenuItem>
        <NavigationMenuTrigger>Édition</NavigationMenuTrigger>
        <NavigationMenuContent>
          <div className="flex flex-col p-3 w-48">
            <button
              className="px-3 py-1 text-left hover:bg-gray-100 rounded"
              onClick={() => editor?.chain().focus().undo().run()}
            >
              Annuler
            </button>

            <button
              className="px-3 py-1 text-left hover:bg-gray-100 rounded"
              onClick={() => editor?.chain().focus().redo().run()}
            >
              Rétablir
            </button>

            <button
              className="px-3 py-1 text-left hover:bg-gray-100 rounded"
              onClick={() => dialogs.openDialog("find")}
            >
              Rechercher / Remplacer
            </button>

            <button
              className="px-3 py-1 text-left hover:bg-gray-100 rounded"
              onClick={() => dialogs.openDialog("history")}
            >
              Historique des actions
            </button>
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>

      {/* --- Menu INSÉRER --- */}
      <NavigationMenuItem>
        <NavigationMenuTrigger>Insérer</NavigationMenuTrigger>
        <NavigationMenuContent>
          <div className="flex flex-col p-3 w-48">
            <button
              className="px-3 py-1 text-left hover:bg-gray-100 rounded"
              onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            >
              Ligne horizontale
            </button>

            <button
              className="px-3 py-1 text-left hover:bg-gray-100 rounded"
              onClick={() => editor?.chain().focus().setParagraph().run()}
            >
              Paragraphe
            </button>

            <button
              className="px-3 py-1 text-left hover:bg-gray-100 rounded"
              onClick={() => editor?.chain().focus().setHeading({ level: 2 }).run()}
            >
              Titre niveau 2
            </button>

            <button
              className="px-3 py-1 text-left hover:bg-gray-100 rounded"
              onClick={() => editor?.chain().focus().insertContent({ type: "image" }).run()}
            >
              Image
            </button>
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>

      {/* --- Menu OUTILS --- */}
      <NavigationMenuItem>
        <NavigationMenuTrigger>Outils</NavigationMenuTrigger>
        <NavigationMenuContent>
          <div className="flex flex-col p-3 w-48">
            <button
              className="px-3 py-1 text-left hover:bg-gray-100 rounded"
              onClick={() => dialogs.validateXml()}
            >
              Valider le XML
            </button>

            <button
              className="px-3 py-1 text-left hover:bg-gray-100 rounded"
              onClick={() => setBatchMode(!batchMode)}
            >
              Mode lot (batch)
            </button>

            <button
              className="px-3 py-1 text-left hover:bg-gray-100 rounded"
              onClick={() => alert("Bientôt : statistiques")}
            >
              Statistiques doc
            </button>
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
);

export default EditorMenuBar;


