import { Editor } from "@tiptap/react";
import { Node as ProseMirrorNode } from "prosemirror-model";

export const useFindReplaceTipTap = (editor: Editor | null) => {
  const find = (searchText: string) => {
    if (!editor || !searchText) return;

    const doc = editor.state.doc;
    let found = false;

    doc.descendants((node: ProseMirrorNode, pos: number) => {
      if (!node.isText || !node.text) return true;

      const index = node.text.toLowerCase().indexOf(searchText.toLowerCase());
      if (index >= 0) {
        const from = pos + index;
        const to = from + searchText.length;

        editor.commands.setTextSelection({ from, to });
        editor.view.focus();

        found = true;
        return false; // stop traversal
      }

      return true;
    });

    if (!found) {
      alert("Aucune occurrence trouvée.");
    }
  };

  const replace = (searchText: string, replaceWith: string) => {
    if (!editor || !searchText) return;

    const doc = editor.state.doc;
    let replaced = false;

    doc.descendants((node: ProseMirrorNode, pos: number) => {
      if (!node.isText || !node.text) return true;

      const index = node.text.toLowerCase().indexOf(searchText.toLowerCase());
      if (index >= 0) {
        const from = pos + index;
        const to = from + searchText.length;

        editor.chain().focus().setTextSelection({ from, to }).insertContent(replaceWith).run();
        replaced = true;
        return false;
      }

      return true;
    });

    if (!replaced) {
      alert("Aucune occurrence à remplacer.");
    }
  };

  const replaceAll = (searchText: string, replaceWith: string) => {
    if (!editor || !searchText) return;

    const regex = new RegExp(searchText, "gi");
    const fullText = editor.state.doc.textContent;
    const newText = fullText.replace(regex, replaceWith);

    editor.commands.setContent(`<p>${newText}</p>`); // ou structure plus complexe si XML
  };

  return { find, replace, replaceAll };
};
