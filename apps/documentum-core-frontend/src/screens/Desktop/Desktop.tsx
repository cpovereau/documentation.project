import React, { useState } from "react";
import { TopBar } from "components/ui/TopBar";
import { LeftSidebar } from "components/ui/LeftSidebar";
import { RightSidebar } from "components/ui/RightSidebar";
import { CentralEditor } from "components/ui/CentralEditor";
import useSelectionStore from "@/store/selectionStore";

export const Desktop: React.FC = () => {
  const [isLeftSidebarExpanded, setIsLeftSidebarExpanded] = useState(true);
  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState(true);
  const [isRightSidebarFloating, setIsRightSidebarFloating] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previousLeftSidebarState, setPreviousLeftSidebarState] = useState(true);
  const [previousRightSidebarState, setPreviousRightSidebarState] = useState(true);

  const [visibleDockEditor, setVisibleDockEditor] = useState<"question" | "exercice" | null>(null);
  const [dockEditorHeight, setDockEditorHeight] = useState(250);

  // 🎯 Source de vérité unique pour la rubrique active
  const selectedRubriqueId = useSelectionStore((s) => s.selectedRubriqueId);

  const togglePreviewMode = () => {
    if (!isPreviewMode) {
      setPreviousLeftSidebarState(isLeftSidebarExpanded);
      setPreviousRightSidebarState(isRightSidebarExpanded);
      setIsLeftSidebarExpanded(false);
      setIsRightSidebarExpanded(false);
    } else {
      setIsLeftSidebarExpanded(previousLeftSidebarState);
      setIsRightSidebarExpanded(previousRightSidebarState);
    }
    setIsPreviewMode(!isPreviewMode);
  };

  const handleRightSidebarToggle = (isFloating: boolean) => {
    setIsRightSidebarFloating(isFloating);
    if (!isFloating) {
      setIsRightSidebarExpanded(true);
    }
  };

  const handleResizeDockEditorHeight = (newHeight: number) => {
    setDockEditorHeight(newHeight);
  };

  const toggleQuestionEditor = () => {
    setVisibleDockEditor((prev) => (prev === "question" ? null : "question"));
  };

  const toggleExerciceEditor = () => {
    setVisibleDockEditor((prev) => (prev === "exercice" ? null : "exercice"));
  };

  return (
    <div className="bg-white flex flex-col h-screen w-full">
      <TopBar currentScreen="desktop" />
      <div className="flex flex-row flex-1 min-h-0 relative overflow-hidden">
        <LeftSidebar
          isExpanded={isLeftSidebarExpanded}
          onToggle={() => !isPreviewMode && setIsLeftSidebarExpanded(!isLeftSidebarExpanded)}
          className="z-40"
        />
        <div
          className="flex-1 z-0 flex flex-col min-h-0 h-full"
          style={{
            marginLeft: isLeftSidebarExpanded ? "351px" : "6px",
            marginRight: isRightSidebarExpanded && !isRightSidebarFloating ? "254px" : "6px",
          }}
        >
          <CentralEditor
            isPreviewMode={isPreviewMode}
            onPreviewToggle={togglePreviewMode}
            isLeftSidebarExpanded={isLeftSidebarExpanded}
            isRightSidebarExpanded={isRightSidebarExpanded}
            isRightSidebarFloating={isRightSidebarFloating}
            visibleDockEditor={visibleDockEditor}
            setVisibleDockEditor={setVisibleDockEditor}
            onToggleQuestionEditor={toggleQuestionEditor}
            onToggleExerciceEditor={toggleExerciceEditor}
            dockEditorHeight={dockEditorHeight}
            onResizeDockEditorHeight={handleResizeDockEditorHeight}
            rubriqueId={selectedRubriqueId}
          />
        </div>
        <RightSidebar
          isExpanded={isRightSidebarExpanded}
          isFloating={isRightSidebarFloating}
          onToggle={handleRightSidebarToggle}
          onExpand={setIsRightSidebarExpanded}
          className="z-40"
        />
      </div>
    </div>
  );
};
