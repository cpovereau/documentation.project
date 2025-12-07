import React, { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useSpeechToText } from "hooks/useSpeechToText";
import { Button } from "components/ui/button";
import { Card } from "components/ui/card";
import { Checkbox } from "components/ui/checkbox"; // À intégrer dans la barre d'outils plus tard
import PopupSuggestion from "components/ui/PopupSuggestion";
import type { PopupProps } from "types/PopupSuggestion";
import type { Editor } from "@tiptap/react";
import { GripVertical } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import useXmlBufferStore from "@/store/xmlBufferStore";
import { getAllExtensions } from "@/extensions/allExtensions";
import { VerticalDragHandle } from "components/ui/VerticalDragHandle";
import { QuestionEditor } from "./QuestionEditor";
import { ExerciceEditor } from "./ExerciceEditor";
import { useFindReplaceTipTap } from "@/hooks/useFindReplaceTipTap";
import { useRubriqueChangeTracker } from "@/hooks/useRubriqueChangeTracker";
import { useDitaLoader } from "@/hooks/useDitaLoader";
import { useSpeechCommands } from "@/hooks/useSpeechCommands";
import { useEditorShortcuts } from "@/hooks/useEditorShortcuts";
import { useGrammarChecker } from "@/hooks/useGrammarChecker";
import { useEditorHistoryTracker } from "@/hooks/useEditorHistoryTracker";
import { useXmlBufferSync } from "@/hooks/useXmlBufferSync";
import EditorHeader from "components/ui/CentralEditor/EditorHeader";
import EditorToolbar from "components/ui/CentralEditor/EditorToolbar";
import BlockTypeMenu from "components/ui/CentralEditor/BlockTypeMenu";
import HistoryPanel from "components/ui/CentralEditor/EditorPanels/HistoryPanel";
import FindReplacePanel from "./CentralEditor/EditorPanels/FindReplacePanel";
import useEditorDialogs from "components/ui/CentralEditor/hooks/useEditorDialogs";

// Props du composant
interface CentralEditorProps {
  isPreviewMode: boolean;
  onPreviewToggle: () => void;
  isLeftSidebarExpanded: boolean;
  isRightSidebarExpanded: boolean;
  isRightSidebarFloating: boolean;
  visibleDockEditor: "question" | "exercice" | null;
  setVisibleDockEditor: React.Dispatch<React.SetStateAction<"question" | "exercice" | null>>;
  onToggleQuestionEditor: () => void;
  onToggleExerciceEditor: () => void;
  dockEditorHeight: number;
  onResizeDockEditorHeight: (newHeight: number) => void;
  selectedMapItemId: number | null;
}

// Début du composant CentralEditor
export const CentralEditor: React.FC<CentralEditorProps> = ({
  isPreviewMode,
  onPreviewToggle,
  isLeftSidebarExpanded,
  isRightSidebarExpanded,
  isRightSidebarFloating,
  visibleDockEditor,
  setVisibleDockEditor,
  onToggleQuestionEditor,
  onToggleExerciceEditor,
  dockEditorHeight,
  onResizeDockEditorHeight,
  selectedMapItemId,
}) => {
  console.log("🧩 CentralEditor monté");

  // États pour la gestion de l'éditeur
  const [initialContent, setInitialContent] = useState<string>("");
  const inputSourceRef = useRef<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [findValue, setFindValue] = useState("");
  const [replaceValue, setReplaceValue] = useState("");
  const [batchMode, setBatchMode] = useState(false);

  // Référence pour l'éditeur central
  const MIN_QUESTION_EDITOR_HEIGHT = 200;
  const MIN_EXERCICE_EDITOR_HEIGHT = 300;
  const centralEditorRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Fonctions pour redimensionner la barre de séparation horizontale
  const handleResizeStart = (e: React.MouseEvent) => {
    const startY = e.clientY;

    const startHeight = dockEditorHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientY - startY;
      const newHeight = Math.max(150, startHeight - delta);
      onResizeDockEditorHeight(newHeight);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.userSelect = "";
      setIsDragging(false);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.userSelect = "none";
    setIsDragging(true);
  };

  // Debug selectedMapItemId
  useEffect(() => {
    console.log("🧭 selectedMapItemId dans CentralEditor :", selectedMapItemId);
  }, [selectedMapItemId]);

  // 🔁 On récupère le XML initial depuis le buffer pour la rubrique sélectionnée
  const getXml = useXmlBufferStore((state) => state.getXml);
  const xml = selectedMapItemId ? getXml(selectedMapItemId) : null;

  const dialogs = useEditorDialogs({
    getXml,
    selectedMapItemId,
    toast,
  });

  // L’éditeur ne dépend plus du contenu XML
  const editor = useEditor(
    {
      extensions: getAllExtensions(),
      content: "<p></p>", // contenu placeholder, le vrai XML sera injecté par useDitaLoader
      onUpdate({ editor }) {
        checkGrammar(editor.getText());
      },
    },
    [selectedMapItemId], // on recrée seulement quand on change de rubrique
  );

  //
  const { startSync, stopSync } = useXmlBufferSync(editor, selectedMapItemId);

  useEffect(() => {
    if (editor) startSync();
    return () => stopSync();
  }, [editor, selectedMapItemId]);

  // Référence pour le suivi de la source d'entrée (clavier, voix, etc.)
  const { hasChanges, resetInitialContent } = useRubriqueChangeTracker(editor, selectedMapItemId);

  // Chargement initial du XML dans l’éditeur
  // ❌ À commenter le temps de stabiliser la chaîne
  //useEffect(() => {
  //  if (editor && xml) {
  //    console.log("✅ Injection initiale dans l’éditeur :", xml);
  //    resetInitialContent();
  // }
  //}, [editor, xml, resetInitialContent]);

  // ✅ Injection automatique du contenu XML depuis le buffer au changement de rubrique
  const { isLoading } = useDitaLoader({ editor, selectedMapItemId });

  // Fonctions pour copier, coller, couper
  function handleCut(editor: Editor | null) {
    if (!editor) return;
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      "\n",
    );
    navigator.clipboard.writeText(selectedText);
    editor.commands.deleteSelection();
    logAction("Texte coupé", selectedText);
  }

  function handleCopy(editor: Editor | null) {
    if (!editor) return;
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      "\n",
    );
    navigator.clipboard.writeText(selectedText);
    logAction("Texte copié", selectedText);
  }

  function handlePaste(editor: Editor | null) {
    if (!editor) return;
    navigator.clipboard.readText().then((text) => {
      editor.commands.insertContent(text);
      logAction("Texte collé", text);
    });
  }

  // Recherche et remplacement de texte
  const { find, replace, replaceAll } = useFindReplaceTipTap(editor);

  // Gestion de l'historique de l'éditeur
  const { historyLog, logAction, clearHistory } = useEditorHistoryTracker();

  // Gestion des commandes vocales
  const { handleVoiceCommand } = useSpeechCommands(editor);

  // Etat initial de l'éditeur (bouton "Enregistrer" désactivé)
  useEffect(() => {
    if (editor) {
      resetInitialContent();
    }
  }, [editor]);

  // Fonctions pour enregistrer une rubrique
  const onSaveRubrique = () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 800)), {
      loading: "Enregistrement en cours...",
      success: "Rubrique enregistrée avec succès !",
      error: "Échec de l’enregistrement",
    });

    if (editor) {
      const current = editor.getHTML();
      resetInitialContent();
    }
  };

  //Vérification de la grammaire
  const { checkGrammar } = useGrammarChecker(editor);

  // État de la dictée vocale
  const [isDictating, setIsDictating] = useState(false);

  const { start, stop, isRecording, isStopping, error } = useSpeechToText({
    onResult: (text) => {
      if (!editor) return;

      inputSourceRef.current = "voice";

      const { state, view } = editor;

      const pos = state.selection.$from.pos;
      const needsSpace = pos > 0 && !/\s$/.test(state.doc.textBetween(pos - 1, pos));

      const tr = state.tr.insertText((needsSpace ? " " : "") + text, pos);
      view.dispatch(tr);

      setTimeout(() => {
        inputSourceRef.current = null;
      }, 100);
    },

    onCommand: handleVoiceCommand,
  });

  // Toast au lancement de la dictée vocale
  useEffect(() => {
    if (isRecording) {
      toast.success("🎙️ Dictée en cours…", {
        duration: 3000,
        id: "dictate-start",
      });
    }
  }, [isRecording]);

  // Sortie de la dictée vocale en cas de click
  useEffect(() => {
    if (!editor || !isRecording) return;

    const dom = editor.view.dom;

    const handleManualInteraction = () => {
      stop(); // stop dictation
    };

    dom.addEventListener("mousedown", handleManualInteraction);

    return () => {
      dom.removeEventListener("mousedown", handleManualInteraction);
    };
  }, [editor, isRecording, stop]);

  // Toast en cas de sortie de dictée vocale
  useEffect(() => {
    if (isStopping && isRecording) {
      toast.info("⏳ Arrêt de la dictée en cours…", { duration: 8000 });
    }
  }, [isStopping]);

  // Gestion des raccourcis clavier de l'éditeur
  useEditorShortcuts(editor, selectedMapItemId, isDictating, inputSourceRef);

  // Callbacks mémorisés pour éviter les rerenders inutiles
  const handleStartDictation = useCallback(() => {
    start();
  }, [start]);

  const handleStopDictation = useCallback(() => {
    stop();
  }, [stop]);

  const handleOpenFind = useCallback(() => {
    dialogs.openDialog("find");
  }, [dialogs]);

  const handleOpenHistory = useCallback(() => {
    dialogs.openDialog("history");
  }, [dialogs]);

  // Compteur de mots
  useEffect(() => {
    const dom = editor?.view.dom;
    if (!dom) return;

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

  const [popup, setPopup] = useState<null | PopupProps>(null);

  return (
    <Card
      ref={centralEditorRef}
      style={{ height: "100%" }}
      className="flex flex-col h-full w-full min-h-0 border border-[#e1e1e2] shadow-shadow-md rounded-xl overflow-hidden"
    >
      <EditorHeader
        editor={editor}
        dialogs={dialogs}
        batchMode={batchMode}
        setBatchMode={setBatchMode}
        isXmlView={dialogs.isDialogOpen("xmlView")}
        onValidateXml={dialogs.validateXml}
        onReturnToEdit={dialogs.returnToEdit}
        isPreviewMode={isPreviewMode}
        onPreviewToggle={onPreviewToggle}
        visibleDockEditor={visibleDockEditor}
        setVisibleDockEditor={setVisibleDockEditor}
        hasChanges={hasChanges}
        onSaveRubrique={onSaveRubrique}
      />
      <EditorToolbar
        editor={editor}
        isRecording={isRecording}
        onStartDictation={handleStartDictation}
        onStopDictation={handleStopDictation}
        openFindDialog={handleOpenFind}
        openHistoryDialog={handleOpenHistory}
        logAction={logAction}
        BlockTypeMenu={<BlockTypeMenu editor={editor} />}
      />
      <div className="flex flex-col flex-grow min-h-0 overflow-hidden">
        <div className="h-full overflow-auto p-4 bg-white relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
              <span className="text-sm text-gray-600 animate-pulse">
                Chargement de la rubrique...
              </span>
            </div>
          )}
          {dialogs.isDialogOpen("xmlView") && xml ? (
            <pre className="bg-gray-100 rounded p-4 font-mono text-xs whitespace-pre-wrap">
              {xml}
            </pre>
          ) : (
            <EditorContent
              editor={editor}
              className="no-border-editor"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
            />
          )}
          {popup && (
            <PopupSuggestion
              {...popup}
              onReplace={(text, from, to) => {
                editor?.commands.insertContentAt({ from, to }, text);
                setPopup(null);
              }}
            />
          )}
        </div>
        <footer className="flex h-10 items-center justify-between px-4 py-0 bg-[#fcfcfc] border-t border-[#e1e1e2]">
          <div className="font-text-base-font-medium text-[#1a1a1ab2] text-center whitespace-nowrap">
            {wordCount} mot{wordCount > 1 ? "s" : ""}
          </div>
          <GripVertical className="w-6 h-6" aria-label="Handler" />
        </footer>
        {visibleDockEditor && (
          <>
            <VerticalDragHandle onResizeStart={handleResizeStart} />
            <div className="flex flex-col flex-grow min-h-0 overflow-hidden">
              {visibleDockEditor === "question" && (
                <QuestionEditor
                  height={dockEditorHeight}
                  onResizeDockEditorHeight={onResizeDockEditorHeight}
                  isLeftSidebarExpanded={isLeftSidebarExpanded}
                  isRightSidebarExpanded={isRightSidebarExpanded}
                  isRightSidebarFloating={isRightSidebarFloating}
                  isPreviewMode={isPreviewMode}
                  onClose={onToggleQuestionEditor}
                />
              )}
              {visibleDockEditor === "exercice" && (
                <ExerciceEditor
                  height={dockEditorHeight}
                  onResizeDockEditorHeight={onResizeDockEditorHeight}
                  isLeftSidebarExpanded={isLeftSidebarExpanded}
                  isRightSidebarExpanded={isRightSidebarExpanded}
                  isRightSidebarFloating={isRightSidebarFloating}
                  isPreviewMode={isPreviewMode}
                  onClose={onToggleExerciceEditor}
                />
              )}
            </div>
          </>
        )}
      </div>
      {dialogs.isDialogOpen("history") && (
        <HistoryPanel
          isOpen={true}
          onClose={() => dialogs.closeDialog()}
          history={historyLog}
          onClear={clearHistory}
        />
      )}
      {dialogs.isDialogOpen("find") && (
        <FindReplacePanel
          isOpen={true}
          onClose={() => dialogs.closeDialog()}
          findValue={findValue}
          replaceValue={replaceValue}
          onChangeFind={setFindValue}
          onChangeReplace={setReplaceValue}
          onFind={() => find(findValue)}
          onReplace={() => replace(findValue, replaceValue)}
          onReplaceAll={() => replaceAll(findValue, replaceValue)}
        />
      )}
    </Card>
  );
};
