// hooks/useEditorShortcuts.ts
import { useEffect } from "react";
import { Editor } from "@tiptap/react";

export function useEditorShortcuts(
  editor: Editor | null,
  isDictating: boolean,
  inputSourceRef: React.MutableRefObject<string | null>
) {
  useEffect(() => {
    if (!editor || isDictating) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (inputSourceRef.current === "voice") return;

      const { state, view } = editor;
      const { selection } = state;
      const pos = selection.$from.pos;
      const docText = editor.getText();
      const preceding = docText.slice(Math.max(0, pos - 3), pos);

      // Majuscule automatique après un point + espace
      if (preceding.endsWith(". ") && /^[a-z]$/.test(event.key)) {
        event.preventDefault();
        const uppercase = event.key.toUpperCase();
        view.dispatch(state.tr.insertText(uppercase, pos));
      }

      // Insertion de ", " après une virgule non suivie d'espace
      if (event.key === "," && docText[pos] !== " ") {
        event.preventDefault();
        view.dispatch(state.tr.insertText(", ", pos));
      }
    };

    const dom = editor.view.dom;
    dom.addEventListener("keydown", handleKeyDown);

    return () => {
      dom.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, isDictating, inputSourceRef]);
}