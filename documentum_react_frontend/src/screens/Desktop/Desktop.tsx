import React, { useState } from "react";
import { TopBar } from "components/ui/TopBar";
import { LeftSidebar } from "components/ui/LeftSidebar";
import { RightSidebar } from "components/ui/RightSidebar";
import { CentralEditor } from "components/ui/CentralEditor";
import type { MapItem } from "@/types/MapItem";

export const initialMapItems: MapItem[] = [
  {
    id: 1,
    title: "Vue principale",
    isMaster: true,
    level: 0,
    expanded: true,
    versionOrigine: "1.0.0",
  },
  {
    id: 2,
    title: "Introduction",
    isMaster: false,
    level: 1,
    expanded: true,
    versionOrigine: "1.0.0",
  },
  {
    id: 3,
    title: "Fonctionnalités générales",
    isMaster: false,
    level: 1,
    expanded: true,
    versionOrigine: "1.1.0",
  },
  {
    id: 4,
    title: "Connexion",
    isMaster: false,
    level: 2,
    expanded: true,
    versionOrigine: "1.1.0",
  },
  {
    id: 5,
    title: "Paramétrage",
    isMaster: false,
    level: 2,
    expanded: true,
    versionOrigine: "1.2.0",
  },
];

export const Desktop: React.FC = () => {
  const [isLeftSidebarExpanded, setIsLeftSidebarExpanded] = useState(true);
  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState(true);
  const [isRightSidebarFloating, setIsRightSidebarFloating] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previousLeftSidebarState, setPreviousLeftSidebarState] =
    useState(true);
  const [previousRightSidebarState, setPreviousRightSidebarState] =
    useState(true);
  const [mapItems, setMapItems] = useState<MapItem[]>(initialMapItems);
  const [selectedMapItemId, setSelectedMapItemId] = useState<number | null>(
    null
  );

  const [visibleDockEditor, setVisibleDockEditor] = useState<
    "question" | "exercice" | null
  >(null);
  const [dockEditorHeight, setDockEditorHeight] = useState(250);

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

  const handleToggleExpandMapNode = (itemId: number, expand: boolean) => {
    setMapItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, expanded: expand } : item
      )
    );
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
          selectedMapItemId={selectedMapItemId}
          setSelectedMapItemId={setSelectedMapItemId}
          isExpanded={isLeftSidebarExpanded}
          onToggle={() =>
            !isPreviewMode && setIsLeftSidebarExpanded(!isLeftSidebarExpanded)
          }
          className="z-40"
          onToggleExpand={handleToggleExpandMapNode}
        />
        <div
          className="flex-1 z-0 flex flex-col min-h-0 h-full"
          style={{
            marginLeft: isLeftSidebarExpanded ? "351px" : "6px",
            marginRight:
              isRightSidebarExpanded && !isRightSidebarFloating
                ? "254px"
                : "6px",
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
            selectedMapItemId={selectedMapItemId}
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
