import { useCallback } from "react";
import type { Editor } from "@tiptap/react";

type LogAction = (action: string, detail?: string) => void;

export type UseClipboardActionsApi = {
  handleCut: (editor: Editor | null) => void;
  handleCopy: (editor: Editor | null) => void;
  handlePaste: (editor: Editor | null) => void;
};

/**
 * Regroupe les actions clipboard (couper / copier / coller)
 * avec traçabilité via logAction.
 */
export const useClipboardActions = (logAction: LogAction): UseClipboardActionsApi => {
  const handleCut = useCallback(
    (editor: Editor | null) => {
      if (!editor) return;
      const selectedText = editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to,
        "\n",
      );
      navigator.clipboard.writeText(selectedText);
      editor.commands.deleteSelection();
      logAction("Texte coupé", selectedText);
    },
    [logAction],
  );

  const handleCopy = useCallback(
    (editor: Editor | null) => {
      if (!editor) return;
      const selectedText = editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to,
        "\n",
      );
      navigator.clipboard.writeText(selectedText);
      logAction("Texte copié", selectedText);
    },
    [logAction],
  );

  const handlePaste = useCallback(
    (editor: Editor | null) => {
      if (!editor) return;
      navigator.clipboard.readText().then((text) => {
        editor.commands.insertContent(text);
        logAction("Texte collé", text);
      });
    },
    [logAction],
  );

  return { handleCut, handleCopy, handlePaste };
};
