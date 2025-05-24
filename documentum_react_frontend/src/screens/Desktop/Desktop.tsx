import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { TopBar } from "./components/TopBar/TopBar";
import { LeftSidebar } from "./components/LeftSidebar/LeftSidebar";
import { RightSidebar } from "./components/RightSidebar/RightSidebar";
import { CentralEditor } from "./components/CentralEditor/CentralEditor";
import { ProductDocSync } from "./components/ProductDocSync/ProductDocSync";

export const Desktop: React.FC = () => {
  const [isLeftSidebarExpanded, setIsLeftSidebarExpanded] = useState(true);
  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState(true);
  const [isRightSidebarFloating, setIsRightSidebarFloating] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previousLeftSidebarState, setPreviousLeftSidebarState] = useState(true);
  const [previousRightSidebarState, setPreviousRightSidebarState] = useState(true);

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

  return (
    <Router>
      <div className="bg-white flex flex-col h-screen w-full">
        <TopBar className="z-50" />
        <div className="flex flex-row flex-1 overflow-hidden relative">
          <Routes>
            <Route path="/" element={
              <>
                <LeftSidebar
                  isExpanded={isLeftSidebarExpanded}
                  onToggle={() => !isPreviewMode && setIsLeftSidebarExpanded(!isLeftSidebarExpanded)}
                  className="z-40"
                />
                <div 
                  className="flex-1 z-0 transition-all duration-300 ease-in-out"
                  style={{
                    marginLeft: isLeftSidebarExpanded ? '351px' : '6px',
                    marginRight: isRightSidebarExpanded && !isRightSidebarFloating ? '254px' : '6px',
                  }}
                >
                  <CentralEditor 
                    isPreviewMode={isPreviewMode}
                    onPreviewToggle={togglePreviewMode}
                    isLeftSidebarExpanded={isLeftSidebarExpanded}
                    isRightSidebarExpanded={isRightSidebarExpanded}
                    isRightSidebarFloating={isRightSidebarFloating}
                  />
                </div>
                <RightSidebar
                  isExpanded={isRightSidebarExpanded}
                  isFloating={isRightSidebarFloating}
                  onToggle={handleRightSidebarToggle}
                  onExpand={setIsRightSidebarExpanded}
                  className="z-40"
                />
              </>
            } />
            <Route 
              path="/product-doc-sync" 
              element={
                <div className="flex-1 flex">
                  <ProductDocSync />
                </div>
              } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};
