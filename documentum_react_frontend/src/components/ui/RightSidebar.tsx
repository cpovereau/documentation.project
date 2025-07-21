import React, { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "components/ui/button";
import { ImportModal } from "components/ui/import-modal";
import { MediaPanel, MediaItem } from "components/ui/MediaPanel";
import { ArrowRightCircle, Move, ArrowLeftFromLine } from "lucide-react";

interface RightSidebarProps {
  isExpanded: boolean;
  isFloating: boolean;
  onToggle: (isFloating: boolean) => void;
  onExpand: (isExpanded: boolean) => void;
  className?: string;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  isExpanded,
  isFloating,
  onToggle,
  onExpand,
  className,
}) => {
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importType, setImportType] = useState<"image" | "video">("image");
  const [isImageMode, setIsImageMode] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [displayMode, setDisplayMode] = useState<"grid" | "small" | "list">(
    "grid"
  );
  const [position, setPosition] = useState({
    x: window.innerWidth - 248,
    y: 103,
  });
  const [size, setSize] = useState({ width: 248, height: "auto" });
  const floatingRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef({
    isResizing: false,
    edge: null as "left" | "right" | null,
  });

  const mediaItems: MediaItem[] = [
    {
      id: 1,
      title: "Demo vidéo",
      updatedText: "Updated yesterday",
      imageUrl: "https://placehold.co/150x90",
    },
    {
      id: 2,
      title: "Test image",
      updatedText: "Updated today",
      imageUrl: "https://placehold.co/150x90",
    },
    {
      id: 3,
      title: "Un autre média",
      updatedText: "Updated 2 days ago",
      imageUrl: "https://placehold.co/150x90",
    },
    {
      id: 4,
      title: "Vidéo projet",
      updatedText: "Updated 4 days ago",
      imageUrl: "https://placehold.co/150x90",
    },
    {
      id: 5,
      title: "Capture ADM menu",
      updatedText: "Updated 1 week ago",
      imageUrl: "https://placehold.co/150x90",
    },
    {
      id: 6,
      title: "BOU Export",
      updatedText: "Updated 3 days ago",
      imageUrl: "https://placehold.co/150x90",
    },
    {
      id: 7,
      title: "USA Paramètres",
      updatedText: "Updated yesterday",
      imageUrl: "https://placehold.co/150x90",
    },
    {
      id: 8,
      title: "PLA Planning",
      updatedText: "Updated today",
      imageUrl: "https://placehold.co/150x90",
    },
  ];

  const [setPage] = useState(1);

  const toggleSwitch = useCallback(() => setIsImageMode((prev) => !prev), []);

  const handleClearSearch = useCallback(() => setSearchText(""), []);

  const handleLabelClick = () =>
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));

  const handleImportClick = () => {
    setImportType(isImageMode ? "image" : "video");
    setImportModalOpen(true);
  };

  const toggleExpanded = useCallback(() => {
    if (typeof onExpand === "function") {
      onExpand(!isExpanded);
    } else {
      onToggle(!isExpanded);
    }
  }, [isExpanded, onExpand, onToggle]);

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX - position.x;
      const startY = e.clientY - position.y;

      const handleDrag = (e: MouseEvent) => {
        setPosition({
          x: e.clientX - startX,
          y: e.clientY - startY,
        });
      };

      const handleDragEnd = () => {
        document.removeEventListener("mousemove", handleDrag);
        document.removeEventListener("mouseup", handleDragEnd);
      };

      document.addEventListener("mousemove", handleDrag);
      document.addEventListener("mouseup", handleDragEnd);
    },
    [position]
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, edge: "left" | "right") => {
      e.preventDefault();
      resizingRef.current = { isResizing: true, edge };
      const startX = e.clientX;
      const startWidth = size.width;

      const handleResize = (e: MouseEvent) => {
        if (resizingRef.current.edge === "right") {
          const newWidth = startWidth + (e.clientX - startX);
          setSize((prev) => ({ ...prev, width: Math.max(248, newWidth) }));
        } else {
          const newWidth = startWidth - (e.clientX - startX);
          if (newWidth >= 248) {
            setSize((prev) => ({ ...prev, width: newWidth }));
            setPosition((prev) => ({
              ...prev,
              x: prev.x - (newWidth - startWidth),
            }));
          }
        }
      };

      const handleResizeEnd = () => {
        resizingRef.current = { isResizing: false, edge: null };
        document.removeEventListener("mousemove", handleResize);
        document.removeEventListener("mouseup", handleResizeEnd);
      };

      document.addEventListener("mousemove", handleResize);
      document.addEventListener("mouseup", handleResizeEnd);
    },
    [size.width]
  );

  const mediaPanel = (
    <MediaPanel
      mediaItems={mediaItems}
      isImageMode={isImageMode}
      searchText={searchText}
      sortOrder={sortOrder}
      displayMode={displayMode}
      onSearchChange={(text) => {
        setSearchText(text);
      }}
      onClearSearch={handleClearSearch}
      onToggleMode={toggleSwitch}
      onToggleType={(type) => setIsImageMode(type === "image")}
      onToggleSort={handleLabelClick}
      onToggleDisplayMode={() => {
        setDisplayMode((prev) =>
          prev === "grid" ? "small" : prev === "small" ? "list" : "grid"
        );
      }}
      onImportClick={handleImportClick}
    />
  );

  const floatingWindow = (
    <div
      ref={floatingRef}
      className="fixed bg-[#f7a900] rounded-[15px] shadow-lg overflow-hidden"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${size.width}px`,
        height: `calc(100vh - ${position.y}px)`,
        maxHeight: "90vh",
        zIndex: 9999,
      }}
    >
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div
            className="cursor-move p-2 rounded-md hover:bg-gray-200"
            role="button"
            tabIndex={0}
            onMouseDown={handleDragStart}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleDragStart(e as unknown as React.MouseEvent);
              }
            }}
          >
            <Move className="w-8 h-8 text-gray-600" />
          </div>
          <Button
            variant="ghost"
            className="p-0 h-16 w-16 flex items-center justify-center"
            onClick={() => onToggle(false)}
          >
            <ArrowLeftFromLine className="w-6 h-6 text-gray-600" />
          </Button>
        </div>
        <div className="flex-grow overflow-hidden">{mediaPanel}</div>
      </div>
      <div
        className="absolute top-0 left-0 w-1 h-full cursor-ew-resize"
        onMouseDown={(e) => handleResizeStart(e, "left")}
      />
      <div
        className="absolute top-0 right-0 w-1 h-full cursor-ew-resize"
        onMouseDown={(e) => handleResizeStart(e, "right")}
      />
    </div>
  );

  return (
    <>
      {!isFloating && (
        <div
          className={`fixed top-[103px] bottom-0 right-0 flex flex-col ${className}`}
          style={{ width: isExpanded ? "248px" : "0" }}
        >
          <div className="relative h-full flex flex-col">
            <div
              className="h-full bg-[#f7a900] rounded-l-[15px] flex flex-col"
              style={{
                width: "248px",
                transform: isExpanded ? "translateX(0)" : "translateX(248px)",
              }}
            >
              <div className="pt-20 px-4 h-full flex flex-col overflow-y-auto overflow-x-hidden">
                <div className="absolute top-3 right-3">
                  <Button
                    variant="ghost"
                    className="p-0 h-18 w-18 flex items-center justify-center"
                    onClick={() => onToggle(true)}
                  >
                    <Move className="w-9 h-9 text-gray-600" />
                  </Button>
                </div>
                {mediaPanel}
              </div>
            </div>
          </div>
        </div>
      )}
      {!isFloating && (
        <Button
          variant="ghost"
          className="fixed top-[120px] p-0 h-12 w-12 z-50 flex items-center justify-center rounded-full hover:bg-gray-200"
          style={{
            right: isExpanded ? "248px" : "0",
            transform: "translateX(50%)",
          }}
          onClick={toggleExpanded}
        >
          <ArrowRightCircle
            className={isExpanded ? "w-12 h-12" : "w-12 h-12 rotate-180"}
            aria-label="Rightbar toggle"
          />
        </Button>
      )}
      {isFloating && createPortal(floatingWindow, document.body)}
      <ImportModal
        open={importModalOpen}
        title={
          importType === "image" ? "Importer une image" : "Importer une vidéo"
        }
        accept={importType === "image" ? "image/*" : "video/*"}
        onClose={() => setImportModalOpen(false)}
        onNext={(file) => {
          console.log("Fichier importé :", file);
          setImportModalOpen(false);
        }}
      />
    </>
  );
};
