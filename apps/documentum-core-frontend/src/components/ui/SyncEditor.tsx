import React, { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { ImpactDocumentaire } from "@/api/impacts";
import { Card } from "components/ui/card";
import { ToolbarCorrection } from "./ToolbarCorrection";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import { Button } from "components/ui/button";
import { FindReplaceDialog } from "components/ui/FindReplaceDialog";
import { useState } from "react";
import { useContentChangeTracker } from "hooks/useContentChangeTracker";
import { useGrammarChecker } from "hooks/useGrammarChecker";
import { useEditorHistoryTracker } from "hooks/useEditorHistoryTracker";
import { useFindReplaceTipTap } from "hooks/useFindReplaceTipTap";
import EditorToolbar from "components/ui/CentralEditor/EditorToolbar";
import BlockTypeMenu from "components/ui/CentralEditor/BlockTypeMenu";
import HistoryPanel from "components/ui/CentralEditor/EditorPanels/HistoryPanel";
import { useDictation } from "components/ui/CentralEditor/hooks/useDictation";

interface SyncEditorProps {
  selectedType: "evolution" | "correctif";
  onTypeChange: (type: "evolution" | "correctif") => void;
  /** Type de l'EvolutionProduit sélectionnée — dérivé depuis l'API, lecture seule. */
  evolutionType: "evolution" | "correctif" | null;
  height: number;
  selectedImpact: ImpactDocumentaire | null;
  onNotesChange: (impactId: number, notes: string) => void;
}

export const SyncEditor: React.FC<SyncEditorProps> = ({
  selectedType,
  onTypeChange,
  evolutionType,
  height,
  selectedImpact,
  onNotesChange,
}) => {
  const isNotesMode = selectedImpact !== null;

  // ── Contenu TipTap (suivi pour dirty detection) ──────────────────────────
  const [content, setContent] = useState("");

  // Baseline pour la dirty detection en mode notes
  const notesBaselineRef = useRef<string>("");

  // ── Navigation ToolbarCorrection ─────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalCount] = useState(1);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < totalCount - 1;
  const handlePrevious = () => { if (currentIndex > 0) setCurrentIndex(currentIndex - 1); };
  const handleNext = () => { if (currentIndex < totalCount - 1) setCurrentIndex(currentIndex + 1); };
  const handleShowView = () => { alert("Affichage du suivi complet (à venir)"); };

  // ── Instance TipTap ──────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ bold: false, italic: false }),
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose max-w-none p-4 min-h-[200px] overflow-auto border-none outline-none",
      },
    },
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
  });

  // ── Chargement des notes dans TipTap à chaque changement d'impact ────────
  useEffect(() => {
    if (!editor || !isNotesMode) return;
    editor.commands.setContent(selectedImpact.notes || "");
    // Capture le HTML résultant comme baseline (setContent est synchrone ProseMirror)
    notesBaselineRef.current = editor.getHTML();
  }, [selectedImpact?.id, editor]); // eslint-disable-line react-hooks/exhaustive-deps

  const notesHasChanges = isNotesMode && content !== notesBaselineRef.current;

  // ── Hooks TipTap ──────────────────────────────────────────────────────────
  useGrammarChecker(editor);
  const { isRecording, handleStartDictation, handleStopDictation } = useDictation(editor);
  const { historyLog, logAction, clearHistory, isHistoryOpen, setIsHistoryOpen } =
    useEditorHistoryTracker();

  const [isFindOpen, setIsFindOpen] = useState(false);
  const [findValue, setFindValue] = useState("");
  const [replaceValue, setReplaceValue] = useState("");
  const { find, replace, replaceAll } = useFindReplaceTipTap(editor);

  const { hasChanges, resetInitialContent } = useContentChangeTracker(content);

  const onSaveCorrection = () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 800)), {
      loading: "Enregistrement du correctif...",
      success: "Correctif enregistré avec succès !",
      error: "Échec de l'enregistrement",
    });
    if (editor) resetInitialContent();
  };

  const handleSaveNotes = () => {
    if (!selectedImpact) return;
    onNotesChange(selectedImpact.id, content);
    notesBaselineRef.current = content;
  };

  if (!editor) return null;

  return (
    <Card
      className="flex flex-col w-full border-none shadow-none overflow-hidden"
      style={{ height }}
    >
      {/* ── Bandeau contextuel (mode notes uniquement) ─────────────────────── */}
      {isNotesMode && (
        <div className="border-b px-6 py-2 bg-blue-50 flex items-center gap-3 shrink-0">
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
            Notes de rédaction
          </span>
          <span className="text-sm text-gray-800 font-medium">
            {selectedImpact.rubrique_titre}
          </span>
          {evolutionType !== null && (
            <span className="ml-auto text-xs text-gray-400 italic">
              {evolutionType === "evolution" ? "Évolution" : "Correctif"}
            </span>
          )}
        </div>
      )}

      {/* ── ToolbarCorrection — toujours en lecture seule (indicateur API) ──── */}
      <div className="pointer-events-none">
        <ToolbarCorrection
          selectedType={evolutionType ?? "evolution"}
          onTypeChange={onTypeChange}
          currentIndex={currentIndex}
          totalCount={totalCount}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onShowView={handleShowView}
        />
      </div>

      {/* ── EditorToolbar — visible en mode notes, masqué en mode vide ──────── */}
      {isNotesMode && (
        <EditorToolbar
          editor={editor}
          isRecording={isRecording}
          onStartDictation={handleStartDictation}
          onStopDictation={handleStopDictation}
          openFindDialog={() => setIsFindOpen(true)}
          openHistoryDialog={() => setIsHistoryOpen(true)}
          logAction={logAction}
          BlockTypeMenu={<BlockTypeMenu editor={editor} />}
        />
      )}

      {/* ── Zone contenu : message (mode vide) ou éditeur (mode notes) ──────── */}
      {!isNotesMode ? (
        <div className="flex flex-1 items-center justify-center min-h-0">
          <p className="text-sm text-gray-400 italic">
            Sélectionnez une rubrique dans le tableau pour rédiger ses notes.
          </p>
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden px-[30px]">
          <EditorContent
            editor={editor}
            className="flex-1 min-h-0"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
          />
        </div>
      )}

      {/* ── Pied de carte ──────────────────────────────────────────────────── */}
      {isNotesMode ? (
        <div className="flex items-center justify-end px-6 py-2 border-t bg-[#fcfcfc] shrink-0">
          <Button
            onClick={handleSaveNotes}
            disabled={!notesHasChanges}
            className={`px-5 h-9 rounded-xl border shadow-sm transition-colors duration-300 ${
              notesHasChanges
                ? "bg-[#15803d] hover:bg-[#166534] text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Enregistrer les notes
          </Button>
        </div>
      ) : null}

      {/* ── Dialogs ──────────────────────────────────────────────────────────── */}
      {isFindOpen && (
        <FindReplaceDialog
          findValue={findValue}
          replaceValue={replaceValue}
          onChangeFind={setFindValue}
          onChangeReplace={setReplaceValue}
          onFind={() => find(findValue)}
          onReplace={() => replace(findValue, replaceValue)}
          onReplaceAll={() => replaceAll(findValue, replaceValue)}
          onClose={() => setIsFindOpen(false)}
        />
      )}

      {isHistoryOpen && (
        <HistoryPanel
          isOpen={true}
          onClose={() => setIsHistoryOpen(false)}
          history={historyLog}
          onClear={clearHistory}
        />
      )}
    </Card>
  );
};
