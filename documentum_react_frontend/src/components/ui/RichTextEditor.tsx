import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Task from "extensions/Task";
import Concept from "extensions/Concept";
import Reference from "extensions/Reference";
import Important from "extensions/Important";
import Note from "extensions/Note";
import Warning from "extensions/Warning";

interface RichTextEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content = "",
  onChange,
  className = "min-h-[200px] border rounded-md p-4",
}) => {
  const [wordCount, setWordCount] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link,
      Color,
      TextStyle,
      Task,
      Concept,
      Reference,
      Important,
      Note,
      Warning,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const updateWordCount = () => {
      const text = editor.getText();
      const words = text.trim().split(/\s+/).filter(Boolean);
      setWordCount(words.length === 1 && words[0] === "" ? 0 : words.length);
    };

    updateWordCount();
    editor.on("update", updateWordCount);

    const handleKeyDown = (event: KeyboardEvent) => {
      const { state, view } = editor;
      const { selection } = state;
      const pos = selection.$from.pos;
      const docText = editor.getText();
      const preceding = docText.slice(Math.max(0, pos - 3), pos);

      if (preceding.endsWith(". ") && /^[a-z]$/.test(event.key)) {
        event.preventDefault();
        view.dispatch(state.tr.insertText(event.key.toUpperCase(), pos));
      }

      if (event.key === "," && docText[pos] !== " ") {
        event.preventDefault();
        view.dispatch(state.tr.insertText(", ", pos));
      }
    };

    const dom = editor.view.dom;
    dom.addEventListener("keydown", handleKeyDown);

    return () => {
      editor.off("update", updateWordCount);
      dom.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor]);

  return (
    <div className="w-full">
      <EditorContent editor={editor} spellCheck={true} className={className} />
      <div className="text-sm text-right text-gray-500 mt-1">
        {wordCount} mot{wordCount > 1 ? "s" : ""}
      </div>
    </div>
  );
};

export default RichTextEditor;
