import { useState, useEffect } from "react";
import type { Editor } from "@tiptap/react";
import type { PopupProps } from "types/PopupSuggestion";

export type UseGrammarPopupApi = {
  popup: PopupProps | null;
  setPopup: React.Dispatch<React.SetStateAction<PopupProps | null>>;
};

/**
 * Gère la popup de suggestion grammaticale.
 * Écoute les clics sur les éléments marqués "grammar-error" dans l'éditeur
 * et expose l'état popup + son setter pour le rendu conditionnel.
 */
export const useGrammarPopup = (editor: Editor | null): UseGrammarPopupApi => {
  const [popup, setPopup] = useState<PopupProps | null>(null);

  useEffect(() => {
    if (!editor) return;
    let dom: HTMLElement;
    try {
      dom = editor.view.dom;
    } catch {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains("grammar-error")) {
        const message = target.getAttribute("data-message") || "";
        const suggestions = (target.getAttribute("data-suggestions") || "").split(",");
        const from = editor.view.posAtDOM(target, 0);
        const textContent = target.textContent ?? "";
        const to = from + textContent.length;
        setPopup({
          x: event.clientX,
          y: event.clientY,
          suggestions,
          message,
          from,
          to,
          onReplace: (text, from, to) => {
            editor.commands.insertContentAt({ from, to }, text);
            setPopup(null);
          },
        });
      } else {
        setPopup(null);
      }
    };

    dom.addEventListener("click", handleClick);
    return () => dom.removeEventListener("click", handleClick);
  }, [editor]);

  return { popup, setPopup };
};
