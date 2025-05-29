import React, { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { ScrollArea, ScrollBar } from "components/ui/scroll-area";
import { Separator } from "components/ui/separator";
import { MediaCard } from "./MediaCard";
import {
  X as XIcon,
  Move,
  ArrowLeftFromLine,
  Search,
  LayoutGrid,
  List,
  Text,
} from "lucide-react";

interface MediaItem {
  id: number;
  title: string;
  updatedText: string;
  imageUrl: string;
}

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
  const resizingRef = useRef<{
    isResizing: boolean;
    edge: "left" | "right" | null;
  }>({ isResizing: false, edge: null });

  // --- Exemples de médias ---
  const mediaItems: MediaItem[] = [
    {
      id: 1,
      title: "Test image",
      updatedText: "Updated today",
      imageUrl: "https://c.animaapp.com/macke9kyh9ZtZh/img/image-2.png",
    },
    {
      id: 2,
      title: "Demo vidéo",
      updatedText: "Updated yesterday",
      imageUrl: "https://c.animaapp.com/macke9kyh9ZtZh/img/image-2.png",
    },
    {
      id: 3,
      title: "Un autre média",
      updatedText: "Updated 2 days ago",
      imageUrl: "https://c.animaapp.com/macke9kyh9ZtZh/img/image-2.png",
    },
    {
      id: 4,
      title: "Vidéo projet",
      updatedText: "Updated 4 days ago",
      imageUrl: "https://c.animaapp.com/macke9kyh9ZtZh/img/image-2.png",
    },
  ];

  // --- Filtrage, tri, modes d'affichage ---
  const filteredMedia = mediaItems
    .filter((item) =>
      item.title.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title)
    );

  // --- Responsive / grid ---
  const getGridClass = () => {
    if (displayMode === "grid") return "grid gap-2 grid-cols-1 sm:grid-cols-1";
    if (displayMode === "small") return "grid gap-2 grid-cols-2 sm:grid-cols-2";
    if (displayMode === "list") return "flex flex-col gap-5";
    return "grid-cols-1";
  };

  // --- Event handlers ---
  const toggleSwitch = useCallback(() => setIsImageMode((prev) => !prev), []);
  const handleClearSearch = useCallback(() => setSearchText(""), []);
  const handleLabelClick = () =>
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  const handleModeClick = () =>
    setDisplayMode((prev) =>
      prev === "grid" ? "small" : prev === "small" ? "list" : "grid"
    );
  const handleImportClick = () =>
    alert(isImageMode ? "Importer une image" : "Importer une vidéo");
  const toggleFloating = useCallback(() => {
    onToggle(!isFloating);
    if (!isFloating) {
      setPosition({ x: window.innerWidth - 248, y: 103 });
      setSize({ width: 248, height: "auto" });
    }
  }, [isFloating, onToggle]);

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

  //  --- Rendu du contenu principal ---
  const renderContent = useCallback(
    () => (
      <>
        {/* Titre & séparateur */}
        <div className="relative w-full h-12">
          <div className="absolute top-0.5 left-0 w-full">
            <Separator className="h-px w-full" />
          </div>
          <h2 className="absolute w-[134px] h-[26px] top-[11px] left-[5px] font-['Roboto',Helvetica] font-extrabold text-black text-[32px] leading-normal whitespace-nowrap">
            Médias
          </h2>
        </div>
        {/* Switch images/vidéos */}
        <div
          className={`my-6 ${
            isFloating ? "flex justify-start" : "flex justify-center"
          }`}
        >
          <div className="relative flex items-center justify-center gap-3 w-[175px]">
            <img
              className={`w-8 h-8 cursor-pointer transition-opacity duration-300 ${
                isImageMode ? "opacity-100" : "opacity-50"
              }`}
              alt="Images"
              src="https://c.animaapp.com/macke9kyh9ZtZh/img/images.svg"
              onClick={() => setIsImageMode(true)}
            />
            <div
              className="relative w-10 h-6 bg-gray-300 rounded-full cursor-pointer"
              onClick={toggleSwitch}
            >
              <div
                className={`absolute w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                  isImageMode ? "translate-x-0" : "translate-x-full"
                }`}
                style={{ top: "2px", left: "2px" }}
              />
            </div>
            <img
              className={`w-8 h-8 cursor-pointer transition-opacity duration-300 ${
                !isImageMode ? "opacity-100" : "opacity-50"
              }`}
              alt="Video"
              src="https://c.animaapp.com/macke9kyh9ZtZh/img/video.svg"
              onClick={() => setIsImageMode(false)}
            />
          </div>
        </div>
        {/* Barre de recherche améliorée */}
        <div className="relative w-full">
          {/* Icône loupe */}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          {/* Champ texte */}
          <input
            type="text"
            placeholder="Recherche"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-10 py-2 rounded-lg border border-[#65558f] bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#65558f]"
          />
          {/* Croix */}
          {searchText && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchText("")}
              tabIndex={-1}
              aria-label="Effacer la recherche"
            >
              <XIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="h-3" />

        {/* Boutons de tri et mode affichage */}
        <div className="flex justify-between">
          <Button
            variant="ghost"
            className="flex items-center gap-2 pl-3 pr-4 py-2.5 h-10 rounded-[100px]"
            onClick={handleLabelClick}
            title="Trier A-Z / Z-A"
          >
            <img
              className="w-[18px] h-[18px]"
              alt="Filter icon"
              src="https://c.animaapp.com/macke9kyh9ZtZh/img/icon-9.svg"
            />
            <span className="font-m3-label-large text-m-3syslightprimary">
              Label {sortOrder === "asc" ? "▲" : "▼"}
            </span>
          </Button>

          <Button
            variant="ghost"
            className="p-2 h-10 rounded-[100px]"
            onClick={handleModeClick}
            title="Changer l'affichage"
          >
            {displayMode === "grid" && (
              <LayoutGrid className="w-6 h-6 text-gray-700" />
            )}
            {displayMode === "small" && (
              <List className="w-6 h-6 text-gray-700" /> // ou une autre icône si tu préfères
            )}
            {displayMode === "list" && (
              <Text className="w-6 h-6 text-gray-700" />
            )}
          </Button>
        </div>

        {/* ScrollArea médias */}
        <div className="flex flex-col" style={{ height: "560px" }}>
          {" "}
          <ScrollArea className="flex-1 min-h-0">
            <div className={getGridClass()}>
              {filteredMedia.map((card) => (
                <MediaCard
                  key={card.id}
                  {...card}
                  className={
                    displayMode === "grid"
                      ? "w-full h-[180px]"
                      : displayMode === "small"
                      ? "w-full h-[100px]"
                      : "w-full h-[60px]"
                  }
                  isListMode={displayMode === "list"}
                />
              ))}
            </div>
            <ScrollBar /* ... */ />
          </ScrollArea>
        </div>
        <div className="flex justify-center mt-4 mb-2">
          <Button
            className="w-full max-w-xs h-12 rounded-lg bg-[#2563eb] text-white font-semibold text-base hover:bg-[#1e40af] transition-colors"
            onClick={handleImportClick}
          >
            {isImageMode ? "Importer une image" : "Importer une vidéo"}
          </Button>
        </div>
        <div className="h-2" />
      </>
    ),
    [
      isImageMode,
      searchText,
      sortOrder,
      displayMode,
      size.width,
      isFloating,
      handleClearSearch,
      toggleSwitch,
    ]
  );

  const floatingWindow = (
    <div
      ref={floatingRef}
      className="fixed bg-[#f7a900] rounded-[15px] shadow-lg overflow-hidden"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${size.width}px`,
        height: size.height,
        zIndex: 9999,
      }}
    >
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div
            className="cursor-move p-2 rounded-md hover:bg-gray-200 transition-colors duration-200"
            onMouseDown={handleDragStart}
          >
            <Move className="w-8 h-8 text-gray-600" />
          </div>
          <Button
            variant="ghost"
            className="flex items-center justify-center p-0 h-16 w-16 hover:bg-gray-200 transition-colors duration-200"
            onClick={() => onToggle(false)}
            title="Dock sidebar"
          >
            <ArrowLeftFromLine className="w-6 h-6 text-gray-600" />
          </Button>
        </div>
        <div className="flex-grow overflow-hidden">{renderContent()}</div>
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

  // --- Layout principal, responsive, plein écran ---
  return (
    <>
      {!isFloating && (
        <div
          className={`fixed top-[103px] bottom-0 right-0 transition-all duration-300 ease-in-out flex flex-col ${className}`}
          style={{ width: isExpanded ? "248px" : "0" }}
        >
          <div className="relative h-full flex flex-col">
            <div
              className={`h-full bg-[#f7a900] rounded-l-[15px] transition-all duration-300 ease-in-out flex flex-col`}
              style={{
                width: "248px",
                transform: isExpanded ? "translateX(0)" : "translateX(248px)",
              }}
            >
              <div className="pt-20 px-4 h-full flex flex-col overflow-hidden">
                <div className="absolute top-4 right-4">
                  <Button
                    variant="ghost"
                    className="flex items-center justify-center p-0 h-18 w-18 hover:bg-gray-200 transition-colors duration-200"
                    onClick={() => onToggle(true)}
                    title="Detach sidebar"
                  >
                    <Move className="w-6 h-6 text-gray-600" />
                  </Button>
                </div>
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      )}
      {!isFloating && (
        <Button
          variant="ghost"
          className={`fixed top-[120px] p-0 h-18 w-18 z-50 transition-all duration-300 ease-in-out hover:bg-gray-200`}
          style={{
            right: isExpanded ? "248px" : "0",
            transform: "translateX(50%)",
          }}
          onClick={toggleExpanded}
          title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <img
            className={`w-12 h-12 transition-transform duration-300 ${
              isExpanded ? "" : "rotate-180"
            }`}
            alt="Rightbar toggle"
            src="https://c.animaapp.com/macke9kyh9ZtZh/img/rightbar-collapse.svg"
          />
        </Button>
      )}
      {isFloating && createPortal(floatingWindow, document.body)}
    </>
  );
};
