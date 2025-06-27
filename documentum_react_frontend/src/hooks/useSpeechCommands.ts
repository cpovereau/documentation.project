// hooks/useSpeechCommands.ts
import { Editor } from "@tiptap/react";

export function useSpeechCommands(editor: Editor | null) {
  const handleVoiceCommand = (cmd: string) => {
    if (!editor) return;

    editor.chain().focus().run();
    const { state, commands } = editor;
    const { from } = state.selection;

    switch (cmd) {
      case "deletePreviousWord": {
        if (!state.selection.empty) {
          commands.deleteSelection().run();
          return;
        }
        if (from <= 1) return;
        const textBefore = editor.getText().slice(0, from);
        const match = textBefore.match(/(\S+)\s*$/);
        if (match) {
          const start = from - match[0].length;
          commands
            .setTextSelection({ from: start, to: from })
            .deleteSelection()
            .run();
        } else {
          commands.deleteBackward().run();
        }
        return;
      }
      case "start":
        commands.setTextSelection({ from: 1 }).run();
        return;
      case "end":
        const end = state.doc.content.size || 1;
        commands.setTextSelection({ from: end }).run();
        return;
      case "newline":
        commands.insertContent("\n\n").run();
        return;
      case "selectAll":
        commands.selectAll().run();
        return;
      case "selectParagraph": {
        const { doc, selection } = state;
        const pos = selection.$from.pos;
        let start = pos;
        let end = pos;
        doc.descendants((node, posStart) => {
          if (node.type.name === "paragraph" || node.type.name === "heading") {
            if (pos >= posStart && pos <= posStart + node.nodeSize) {
              start = posStart + 1;
              end = posStart + node.nodeSize - 1;
              return false;
            }
          }
          return true;
        });
        commands.setTextSelection({ from: start, to: end }).run();
        return;
      }
      case "undo":
        commands.undo().run();
        return;
      case "redo":
        commands.redo().run();
        return;
      case "bold":
        commands.toggleBold().run();
        return;
      case "italic":
        commands.toggleItalic().run();
        return;
      case "underline":
        commands.toggleUnderline().run();
        return;
      case "cut":
        document.execCommand("cut");
        return;
      case "copy":
        document.execCommand("copy");
        return;
      case "paste":
        document.execCommand("paste");
        return;
      case "save":
        alert("💾 Sauvegarde simulée !");
        return;
      default:
        console.warn("Commande vocale inconnue :", cmd);
    }
  };

  return { handleVoiceCommand };
}
