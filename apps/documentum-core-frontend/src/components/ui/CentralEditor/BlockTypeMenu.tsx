import React from "react";
import type { Editor } from "@tiptap/react";

interface BlockTypeMenuProps {
  editor: Editor | null;
}

const BlockTypeMenu: React.FC<BlockTypeMenuProps> = ({ editor }) => (
  <div className="relative">
    <select
      className="border rounded px-2 py-1"
      value={
        editor?.isActive("heading", { level: 1 })
          ? "heading1"
          : editor?.isActive("heading", { level: 2 })
          ? "heading2"
          : editor?.isActive("heading", { level: 3 })
          ? "heading3"
          : editor?.isActive("note", { type: "important" })
          ? "important"
          : editor?.isActive("note", { type: "note" })
          ? "note"
          : editor?.isActive("note", { type: "warning" })
          ? "warning"
          : "paragraph"
      }
      onChange={e => {
        const value = e.target.value;

        if (value === "paragraph") {
          if (
            editor?.isActive("note", { type: "important" }) ||
            editor?.isActive("note", { type: "note" }) ||
            editor?.isActive("note", { type: "warning" })
          ) {
            const text = editor?.state.doc.textBetween(
              editor?.state.selection.from,
              editor?.state.selection.to,
              " "
            );
            editor
              ?.chain()
              .focus()
              .deleteSelection()
              .setParagraph()
              .insertContent(text)
              .run();
          } else {
            editor?.chain().focus().setParagraph().run();
          }
        }

        if (value === "heading1") editor?.chain().focus().toggleHeading({ level: 1 }).run();
        if (value === "heading2") editor?.chain().focus().toggleHeading({ level: 2 }).run();
        if (value === "heading3") editor?.chain().focus().toggleHeading({ level: 3 }).run();

        if (["important", "note", "warning"].includes(value)) {
          editor
            ?.chain()
            .focus()
            .insertContent({
              type: "note",
              attrs: { type: value },
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: `Texte ${value}...`,
                    },
                  ],
                },
              ],
            })
            .run();
        }
      }}
    >
      <option value="paragraph">Paragraphe</option>
      <option value="heading1">Titre 1</option>
      <option value="heading2">Titre 2</option>
      <option value="heading3">Titre 3</option>
      <option value="important">Important</option>
      <option value="note">Note</option>
      <option value="warning">Warning</option>
    </select>
  </div>
);

export default BlockTypeMenu;
