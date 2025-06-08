import React, { useEffect } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";

interface QuestionItemProps {
  value: string;
  onChange: (html: string) => void;
  setActiveEditor: (editor: Editor) => void;
  label?: string;
  autoFocus?: boolean;
}

const QuestionItem: React.FC<QuestionItemProps> = ({
  value,
  onChange,
  setActiveEditor,
  label,
  autoFocus = false,
}) => {
  const editor = useEditor({
    content: value,
    extensions: [StarterKit, Underline],
    autofocus: autoFocus,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Mise à jour de l’éditeur actif au focus
  useEffect(() => {
    if (!editor) return;
    const handleFocus = () => setActiveEditor(editor);
    const dom = editor.view.dom;
    dom.addEventListener("focusin", handleFocus);
    return () => {
      dom.removeEventListener("focusin", handleFocus);
    };
  }, [editor, setActiveEditor]);

  return (
    <div className="flex items-center w-full">
      {label && <span className="font-semibold mr-2">{label}</span>}
      <div className="flex-1 border-b border-blue-200 px-2 py-1 bg-transparent">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default QuestionItem;
