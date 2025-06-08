import React, { useState } from "react";
import { Button } from "components/ui/button";
import { Checkbox } from "components/ui/checkbox";
import { cn } from "lib/utils";
import { Editor } from "@tiptap/react";
import QuestionItem from "./QuestionItem";

type Answer = {
  id: string;
  answerText: string;
  correct: boolean;
};

type QuestionBlock = {
  id: string;
  questionText: string;
  answers: Answer[];
  active: boolean;
};

interface QuestionEditorProps {
  height: number;
  isLeftSidebarExpanded: boolean;
  isRightSidebarExpanded: boolean;
  isRightSidebarFloating: boolean;
  isPreviewMode: boolean;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  height,
  isLeftSidebarExpanded,
  isRightSidebarExpanded,
  isRightSidebarFloating,
  isPreviewMode,
}) => {
  const [questions, setQuestions] = useState<QuestionBlock[]>([
    {
      id: "q1",
      questionText: "Quelle est la capitale de la France ?",
      answers: [
        { id: "q1a", answerText: "Lyon", correct: false },
        { id: "q1b", answerText: "Marseille", correct: false },
        { id: "q1c", answerText: "Paris", correct: true },
      ],
      active: true,
    },
  ]);
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
  const [showXML, setShowXML] = useState(false);

  // Ajout d'une question
  const handleAddQuestion = () => {
    const newId = `q${questions.length + 1}`;
    setQuestions((prev) =>
      prev
        .map((q) => ({ ...q, active: false }))
        .concat({
          id: newId,
          questionText: "",
          answers: [
            { id: `${newId}a`, answerText: "", correct: false },
            { id: `${newId}b`, answerText: "", correct: false },
          ],
          active: true,
        })
    );
  };

  // Ajout d'une réponse à la question active
  const activeIndex = questions.findIndex((q) => q.active);
  const handleAddAnswer = () => {
    if (activeIndex === -1) return;
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === activeIndex
          ? {
              ...q,
              answers: [
                ...q.answers,
                {
                  id: `${q.id}${String.fromCharCode(97 + q.answers.length)}`,
                  answerText: "",
                  correct: false,
                },
              ],
            }
          : q
      )
    );
  };

  // Sélection de la question active
  const setActiveQuestion = (index: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) => ({ ...q, active: idx === index }))
    );
  };

  // Toggle bonne réponse
  const handleCorrectToggle = (qIndex: number, aIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qIndex
          ? {
              ...q,
              answers: q.answers.map((a, ai) =>
                ai === aIndex ? { ...a, correct: !a.correct } : a
              ),
            }
          : q
      )
    );
  };

  // Mise à jour du texte d'une question
  const handleQuestionTextChange = (qIndex: number, html: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qIndex ? { ...q, questionText: html } : q))
    );
  };

  // Mise à jour du texte d'une réponse
  const handleAnswerTextChange = (
    qIndex: number,
    aIndex: number,
    html: string
  ) => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qIndex
          ? {
              ...q,
              answers: q.answers.map((a, ai) =>
                ai === aIndex ? { ...a, answerText: html } : a
              ),
            }
          : q
      )
    );
  };

  // Génération XML
  function escapeXml(text: string): string {
    return text.replace(
      /[<>&'"]/g,
      (c) =>
        ({
          "<": "&lt;",
          ">": "&gt;",
          "&": "&amp;",
          "'": "&apos;",
          '"': "&quot;",
        }[c])
    );
  }
  function questionBlocksToXML(blocks: QuestionBlock[]): string {
    return blocks
      .map((q) => {
        // Utilise le texte HTML de la question/réponse, ou du texte brut si tu préfères
        return `
<question id="${q.id}" text="${escapeXml(
          q.questionText.replace(/<[^>]+>/g, "")
        )}">
  ${q.answers
    .map((a) => {
      return `<answer correct="${a.correct ? "true" : "false"}">${escapeXml(
        a.answerText.replace(/<[^>]+>/g, "")
      )}</answer>`;
    })
    .join("\n  ")}
</question>`;
      })
      .join("\n");
  }

  // Style
  const getStyle = (): React.CSSProperties => {
    let style: React.CSSProperties = {
      height: `${height}px`,
      backgroundColor: "white",
      transition: "all 0.3s ease-in-out",
    };

    // En mode Preview = aucune marge, on force full width
    if (isPreviewMode) {
      style.marginLeft = 0;
      style.marginRight = 0;
    } else {
      // Barre de gauche rétractée
      if (!isLeftSidebarExpanded) style.marginLeft = "0";
      else style.marginLeft = "0"; // ou "351px" si besoin pour compenser un padding du parent

      // Barre de droite rétractée OU flottante
      if (!isRightSidebarExpanded || isRightSidebarFloating)
        style.marginRight = "0";
      else style.marginRight = "0"; // ou "254px" idem

      // Si tu utilises un layout avec padding, adapte ici pour coller au layout réel
    }

    return style;
  };

  // Barre d’outils unique pour l’éditeur actif
  const Toolbar = () => (
    <div className="flex gap-1 ml-auto">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => activeEditor?.chain().focus().undo().run()}
        title="Annuler"
        disabled={!activeEditor}
      >
        ↺
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => activeEditor?.chain().focus().redo().run()}
        title="Rétablir"
        disabled={!activeEditor}
      >
        ↻
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => activeEditor?.chain().focus().toggleBold().run()}
        title="Gras"
        disabled={!activeEditor}
      >
        <span className="font-bold">B</span>
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => activeEditor?.chain().focus().toggleItalic().run()}
        title="Italique"
        disabled={!activeEditor}
      >
        <span className="italic">I</span>
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => activeEditor?.chain().focus().toggleUnderline().run()}
        title="Souligné"
        disabled={!activeEditor}
      >
        <span className="underline">U</span>
      </Button>
    </div>
  );

  return (
    <div style={getStyle()} className="overflow-auto flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleAddQuestion}
            className="bg-transparent hover:bg-gray-100"
          >
            Ajouter une question
          </Button>
          <Button
            variant="outline"
            onClick={handleAddAnswer}
            className="bg-transparent hover:bg-gray-100"
            disabled={activeIndex === -1}
          >
            Ajouter une réponse
          </Button>
        </div>
        <div className="flex gap-2 items-center">
          <Toolbar />
          <Button
            variant="ghost"
            onClick={() => setShowXML((v) => !v)}
            className="ml-3"
          >
            {showXML ? "Cacher XML" : "Voir XML généré"}
          </Button>
        </div>
      </div>

      {/* Questions dynamiques */}
      <div className="flex flex-col gap-6">
        {questions.map((q, i) => (
          <div
            key={q.id}
            className={cn(
              "p-4 rounded-xl transition-all border shadow-sm cursor-pointer",
              i % 2 === 1 ? "bg-gray-50" : "bg-white",
              q.active ? "border-2 border-blue-500" : "border border-gray-200"
            )}
            onClick={() => setActiveQuestion(i)}
          >
            {/* Champ Question */}
            <QuestionItem
              value={q.questionText}
              onChange={(html) => handleQuestionTextChange(i, html)}
              setActiveEditor={setActiveEditor}
              label={`Q${i + 1} :`}
              autoFocus={q.active}
            />
            {/* Réponses */}
            <div className="flex flex-col gap-2 ml-5 mt-2">
              {q.answers.map((a, j) => (
                <div key={a.id} className="flex items-center gap-2">
                  <Checkbox
                    id={a.id}
                    checked={a.correct}
                    onChange={() => handleCorrectToggle(i, j)}
                  />
                  <QuestionItem
                    value={a.answerText}
                    onChange={(html) => handleAnswerTextChange(i, j, html)}
                    setActiveEditor={setActiveEditor}
                    label=""
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* XML Viewer */}
      {showXML && (
        <div className="bg-gray-100 mt-5 p-4 rounded font-mono text-xs overflow-x-auto">
          <pre>{questionBlocksToXML(questions)}</pre>
        </div>
      )}
    </div>
  );
};

export default QuestionEditor;
