// hooks/useGrammarChecker.ts
import { useCallback } from "react";
import { Editor } from "@tiptap/react";
import debounce from "lodash.debounce";
import { useLanguageTool } from "@/hooks/useLanguageTool";

export function useGrammarChecker(editor: Editor | null) {
  const { checkText } = useLanguageTool();

  const checkGrammar = useCallback(
    debounce(async (text: string) => {
      if (!editor || text.trim().length < 5) return;

      try {
        const matches = await checkText(text);

        const decorations = matches.map((m: any) => ({
          from: m.offset,
          to: m.offset + m.length,
          message: m.message,
        }));

        editor.view.dispatch(
          editor.state.tr.setMeta("grammarHighlightErrors", decorations)
        );
      } catch (error) {
        console.warn("Erreur LanguageTool :", error);
      }
    }, 1500),
    [editor]
  );

  return { checkGrammar };
}
