import React, { useState, useCallback, useRef, useEffect } from "react";

import { Card } from "components/ui/card";
import PopupSuggestion from "components/ui/PopupSuggestion";
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
import { useEditorShortcuts } from "@/hooks/useEditorShortcuts";
import { useGrammarChecker } from "@/hooks/useGrammarChecker";
import { useEditorHistoryTracker } from "@/hooks/useEditorHistoryTracker";
import { useXmlBufferSync } from "@/hooks/useXmlBufferSync";
import { useRubriqueSave } from "@/hooks/useSaveRubrique";
import { useXmlValidation } from "@/hooks/useXmlValidation";
import EditorHeader from "components/ui/CentralEditor/EditorHeader";
import EditorToolbar from "components/ui/CentralEditor/EditorToolbar";
import BlockTypeMenu from "components/ui/CentralEditor/BlockTypeMenu";
import HistoryPanel from "components/ui/CentralEditor/EditorPanels/HistoryPanel";
import FindReplacePanel from "./CentralEditor/EditorPanels/FindReplacePanel";
import XmlValidationPanel from "./CentralEditor/EditorPanels/XmlValidationPanel";
import useEditorDialogs from "components/ui/CentralEditor/hooks/useEditorDialogs";
import useEditorUIState from "components/ui/CentralEditor/hooks/useEditorUIState";
import { useDictation } from "components/ui/CentralEditor/hooks/useDictation";
import { useGrammarPopup } from "components/ui/CentralEditor/hooks/useGrammarPopup";
import usePendingMediaStore from "@/store/usePendingMediaStore";
import { getMediaUrl } from "@/lib/mediaUtils";

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
  rubriqueId: number | null;
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
  rubriqueId,
}) => {
  // États locaux liés directement au JSX
  const [findValue, setFindValue] = useState("");
  const [replaceValue, setReplaceValue] = useState("");
  const [batchMode, setBatchMode] = useState(false);

  const centralEditorRef = useRef<HTMLDivElement>(null);

  // États UI locaux (wordCount, isDragging, resize dock)
  const { ui, handleResizeStartWrapper } = useEditorUIState();
  const handleResizeStart = handleResizeStartWrapper(onResizeDockEditorHeight, dockEditorHeight);

  // Buffer XML global
  const getXml = useXmlBufferStore((state) => state.getXml);
  const xml = rubriqueId ? getXml(rubriqueId) : null;

  // Gestion des dialogues (find, history, xmlView)
  const dialogs = useEditorDialogs();

  // Instance TipTap — recréée uniquement au changement de rubrique
  const editor = useEditor(
    {
      extensions: getAllExtensions(),
      content: "<p></p>",
      onUpdate({ editor }) {
        const text = editor.getText();
        checkGrammar(text);
        ui.setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
      },
    },
    [rubriqueId],
  );

  // Insertion image depuis la médiathèque (RightSidebar → store → ici)
  const pendingImage = usePendingMediaStore((s) => s.pendingImage);
  const clearPendingImage = usePendingMediaStore((s) => s.clearPendingImage);

  useEffect(() => {
    if (!pendingImage || !editor) return;
    editor.chain().focus().setImage({
      src: getMediaUrl(pendingImage.nom_fichier),
      alt: pendingImage.nom_fichier,
    }).run();
    clearPendingImage();
  }, [pendingImage, editor, clearPendingImage]);

  // Synchronisation TipTap ↔ buffer XML
  useXmlBufferSync(editor, rubriqueId);

  // Chargement XML → TipTap au changement de rubrique
  const { isLoading } = useDitaLoader({ editor, rubriqueId });
  const { hasChanges, resetAfterSave } = useRubriqueChangeTracker(editor, rubriqueId);

  // Reset du tracker après chargement
  useEffect(() => {
    if (!isLoading && editor) {
      resetAfterSave();
    }
  }, [isLoading, editor]);

  // Sauvegarde backend
  const { saveRubrique, saving } = useRubriqueSave(rubriqueId);
  const onSaveRubrique = async () => {
    const success = await saveRubrique();
    // resetAfterSave uniquement en cas de succès confirmé par l'API
    if (success) {
      resetAfterSave();
    }
  };

  // Validation XML backend
  const { validating, result: validationResult, runValidation, clearResult: clearValidation } = useXmlValidation();
  const handleValidateXml = useCallback(async () => {
    if (!rubriqueId) return;
    const xmlString = getXml(rubriqueId);
    if (!xmlString || !xmlString.trim()) return;
    dialogs.openXmlView();
    await runValidation(xmlString);
  }, [rubriqueId, getXml, dialogs, runValidation]);

  const handleReturnToEdit = useCallback(() => {
    dialogs.returnToEdit();
    clearValidation();
  }, [dialogs, clearValidation]);

  // Vérification grammaticale
  const { checkGrammar } = useGrammarChecker(editor);

  // Recherche / remplacement
  const { find, replace, replaceAll } = useFindReplaceTipTap(editor);

  // Historique des actions
  const { historyLog, logAction, clearHistory } = useEditorHistoryTracker();

  // Dictée vocale (toasts, stop sur clic, callbacks)
  const {
    isRecording,
    isDictating,
    inputSourceRef,
    handleStartDictation,
    handleStopDictation,
  } = useDictation(editor);

  // Popup de suggestion grammaticale
  const { popup, setPopup } = useGrammarPopup(editor);

  // Raccourcis clavier
  useEditorShortcuts(editor, rubriqueId, isDictating, inputSourceRef);

  // Callbacks d'ouverture des panneaux
  const handleOpenFind = useCallback(() => dialogs.openDialog("find"), [dialogs]);
  const handleOpenHistory = useCallback(() => dialogs.openDialog("history"), [dialogs]);

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
        onValidateXml={handleValidateXml}
        onReturnToEdit={handleReturnToEdit}
        isPreviewMode={isPreviewMode}
        onPreviewToggle={onPreviewToggle}
        visibleDockEditor={visibleDockEditor}
        setVisibleDockEditor={setVisibleDockEditor}
        hasChanges={hasChanges}
        isSaving={saving}
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
            <>
              <XmlValidationPanel
                result={validationResult}
                validating={validating}
                onClose={clearValidation}
              />
              <pre className="bg-gray-100 rounded p-4 font-mono text-xs whitespace-pre-wrap">
                {xml}
              </pre>
            </>
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
            {ui.wordCount} mot{ui.wordCount > 1 ? "s" : ""}
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
