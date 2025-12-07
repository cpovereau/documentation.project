import React from "react";
import type { Editor } from "@tiptap/react";

interface InlineMenuProps {
  editor: Editor | null;
  logAction: (action: string, value?: string) => void;
}

const InlineMenu: React.FC<InlineMenuProps> = ({ editor, logAction }) => (
  <>
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
  </>
);

export default InlineMenu;
