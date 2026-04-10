// hooks/useEditorShortcuts.ts
import { useEffect, RefObject } from "react";
import { Editor } from "@tiptap/react";


export function useEditorShortcuts(
  editor: Editor | null,
  rubriqueId: number | null,
  isDictating: boolean,
  inputSourceRef: RefObject<string | null>
) {
  useEffect(() => {
    if (!editor || rubriqueId === null) return;

    // editor.view est un getter TipTap qui throw si la vue n'est pas encore
    // attachée au DOM (ex : transition rubriqueId → re-création de l'éditeur).
    // L'optional chaining ?. ne protège pas contre les erreurs levées.
    let dom: HTMLElement;
    try {
      dom = editor.view.dom;
    } catch {
      return;
    }
    if (!dom) return;

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
  
    dom.addEventListener("keydown", handleKeyDown);
    return () => {
      dom.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, rubriqueId, isDictating, inputSourceRef]);
}