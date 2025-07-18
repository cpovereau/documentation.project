import React, { useState } from "react";
import { Button } from "components/ui/button";
import { Checkbox } from "components/ui/checkbox";
import { Trash2, X } from "lucide-react";
import { cn } from "lib/utils";
import { Editor } from "@tiptap/react";
import QuestionItem from "./QuestionItem";

// Type pour les réponses
type Answer = {
  id: string;
  answerText: string;
  correct: boolean;
};

// Type pour les blocs de questions
type QuestionBlock = {
  id: string;
  questionText: string;
  answers: Answer[];
  active: boolean;
};

// Props pour le composant QuestionEditor
interface QuestionEditorProps {
  height: number;
  onResizeDockEditorHeight: (newHeight: number) => void;
  isLeftSidebarExpanded: boolean;
  isRightSidebarExpanded: boolean;
  isRightSidebarFloating: boolean;
  isPreviewMode: boolean;
  onClose: () => void;
}

// Composant QuestionEditor
export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  height,
  onClose,
  onResizeDockEditorHeight,
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

  // SUPPRESSION d'une réponse
  const handleDeleteAnswer = (qIndex, aIndex) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        const answerToDelete = q.answers[aIndex];
        const isCorrect = answerToDelete.correct;
        const answersRemaining = q.answers.length;
        const otherCorrect = q.answers.some(
          (a, i) => i !== aIndex && a.correct
        );

        if (answersRemaining <= 1 || (isCorrect && !otherCorrect)) return q;

        return {
          ...q,
          answers: q.answers.filter((_, i) => i !== aIndex),
        };
      })
    );
  };

  // SUPPRESSION d'une question entière
  const handleDeleteQuestion = (qIndex: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => {
      const newQuestions = prev.filter((_, i) => i !== qIndex);
      // Réactive une autre question si celle supprimée était active
      if (prev[qIndex].active && newQuestions.length)
        newQuestions[0].active = true;
      return newQuestions;
    });
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

  const validHeight =
    typeof height === "number" && !isNaN(height) && height > 0
      ? `${height}px`
      : undefined;

  const style: React.CSSProperties = {
    ...(validHeight && { height: validHeight }),
    backgroundColor: "white",
    transition: "all 0.3s ease-in-out",
  };

  // Barre d’outils unique pour l’éditeur actif
  const Toolbar = () => (
    <div className="flex gap-1 ml-auto">
      <Button
        variant="ghost"
        onClick={() => activeEditor?.chain().focus().undo().run()}
        title="Annuler"
        disabled={!activeEditor}
      >
        ↺
      </Button>
      <Button
        variant="ghost"
        onClick={() => activeEditor?.chain().focus().redo().run()}
        title="Rétablir"
        disabled={!activeEditor}
      >
        ↻
      </Button>
      <Button
        variant="ghost"
        onClick={() => activeEditor?.chain().focus().toggleBold().run()}
        title="Gras"
        disabled={!activeEditor}
      >
        <span className="font-bold">B</span>
      </Button>
      <Button
        variant="ghost"
        onClick={() => activeEditor?.chain().focus().toggleItalic().run()}
        title="Italique"
        disabled={!activeEditor}
      >
        <span className="italic">I</span>
      </Button>
      <Button
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
    <div
      style={{ height: `${height}px`, minHeight: "180px" }}
      className="flex flex-col flex-grow min-h-0 overflow-hidden p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleAddQuestion}
            className="h-11 min-w-[160px] bg-transparent hover:bg-gray-100"
          >
            Ajouter une question
          </Button>
          <Button
            variant="outline"
            onClick={handleAddAnswer}
            className="h-11 min-w-[160px] bg-transparent hover:bg-gray-100"
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
            className="h-11 min-w-[140px] ml-3"
          >
            {showXML ? "Cacher XML" : "Voir XML généré"}
          </Button>
          <Button
            variant="ghost"
            title="Fermer l’éditeur"
            onClick={onClose}
            className="text-gray-500 hover:text-black"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Questions dynamiques */}
      <div className="flex flex-col gap-6 flex-grow min-h-0 overflow-y-auto">
        {questions.map((q, i) => (
          <div
            key={q.id}
            className={cn(
              "relative p-4 rounded-xl transition-all border shadow-sm cursor-pointer",
              i % 2 === 1 ? "bg-gray-50" : "bg-white",
              q.active ? "border-2 border-blue-500" : "border border-gray-200"
            )}
            onClick={() => setActiveQuestion(i)}
          >
            {/* Bouton suppression question */}
            {questions.length > 1 && (
              <Button
                variant="ghost"
                title="Supp. Question"
                className="absolute top-2 right-2 opacity-100 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteQuestion(i);
                }}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            )}
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
              {q.answers.map((a, j) => {
                const cannotDelete =
                  q.answers.length <= 1 ||
                  (a.correct &&
                    q.answers.filter((ans) => ans.correct).length === 1);
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-2 group relative"
                  >
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
                    {!cannotDelete && (
                      <Button
                        variant="ghost"
                        className="absolute right-3 opacity-0 group-hover:opacity-100"
                        title="Supp. Réponse"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAnswer(i, j);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                );
              })}
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
