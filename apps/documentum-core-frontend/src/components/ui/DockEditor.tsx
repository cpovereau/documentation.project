import React from "react";
import { QuestionEditor } from "./QuestionEditor";
import { ExerciceEditor } from "./ExerciceEditor";

interface DockEditorProps {
  visibleDockEditor: "question" | "exercice" | null;
  dockEditorHeight: number;
  onResizeDockEditorHeight: (newHeight: number) => void;
  isLeftSidebarExpanded: boolean;
  isRightSidebarExpanded: boolean;
  isRightSidebarFloating: boolean;
  isPreviewMode: boolean;
  onClose: () => void;
}

export const DockEditor: React.FC<DockEditorProps> = ({
  visibleDockEditor,
  dockEditorHeight,
  onResizeDockEditorHeight,
  isLeftSidebarExpanded,
  isRightSidebarExpanded,
  isRightSidebarFloating,
  isPreviewMode,
  onClose,
}) => {
  if (!visibleDockEditor) return null;

  if (visibleDockEditor === "question") {
    return (
      <QuestionEditor
        height={dockEditorHeight}
        onResizeDockEditorHeight={onResizeDockEditorHeight}
        isLeftSidebarExpanded={isLeftSidebarExpanded}
        isRightSidebarExpanded={isRightSidebarExpanded}
        isRightSidebarFloating={isRightSidebarFloating}
        isPreviewMode={isPreviewMode}
        onClose={onClose}
      />
    );
  }

  if (visibleDockEditor === "exercice") {
    return (
      <ExerciceEditor
        height={dockEditorHeight}
        onResizeDockEditorHeight={onResizeDockEditorHeight}
        isLeftSidebarExpanded={isLeftSidebarExpanded}
        isRightSidebarExpanded={isRightSidebarExpanded}
        isRightSidebarFloating={isRightSidebarFloating}
        isPreviewMode={isPreviewMode}
        onClose={onClose}
      />
    );
  }

  return null;
};
