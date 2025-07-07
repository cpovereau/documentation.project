import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "components/ui/button";
import { ArrowRightCircle } from "lucide-react";
import { AuthorInfo } from "./AuthorInfo";
import { MediaPanel, MediaItem } from "./MediaPanel";
import { ImportModal } from "components/ui/import-modal";

interface SyncRightSidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export const SyncRightSidebar: React.FC<SyncRightSidebarProps> = ({
  isExpanded,
  onToggle,
}) => {
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importType, setImportType] = useState<"image" | "video">("image");
  const [isImageMode, setIsImageMode] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [displayMode, setDisplayMode] = useState<"grid" | "small" | "list">(
    "grid"
  );

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
  ];

  const handleImportClick = () => {
    setImportType(isImageMode ? "image" : "video");
    setImportModalOpen(true);
  };

  return (
    <>
      <div
        className={cn(
          "bg-[#f7a900] h-full overflow-hidden transition-all duration-300 ease-in-out flex flex-col rounded-tl-2xl",
          isExpanded ? "w-[248px]" : "w-0"
        )}
      >
        <div className="pt-20 px-4 flex flex-col max-h-full min-h-0 h-full">
          <div className="space-y-4 mb-2">
            <AuthorInfo auteur="Jean Dupont" date="15/04/2023" />
          </div>
          <MediaPanel
            mediaItems={mediaItems}
            isImageMode={isImageMode}
            searchText={searchText}
            sortOrder={sortOrder}
            displayMode={displayMode}
            onSearchChange={(text) => {
              setSearchText(text);
            }}
            onClearSearch={() => setSearchText("")}
            onToggleMode={() => setIsImageMode((prev) => !prev)}
            onToggleType={(type) => setIsImageMode(type === "image")}
            onToggleSort={() =>
              setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
            }
            onToggleDisplayMode={() => {
              setDisplayMode((prev) =>
                prev === "grid" ? "small" : prev === "small" ? "list" : "grid"
              );
            }}
            onImportClick={handleImportClick}
          />
        </div>
      </div>

      <Button
        variant="ghost"
        className="fixed top-[120px] z-50 flex items-center justify-center rounded-full hover:bg-gray-200 transition-all duration-300 ease-in-out"
        style={{
          right: isExpanded ? "248px" : "0px",
          transform: "translateX(50%)",
        }}
        onClick={onToggle}
      >
        <ArrowRightCircle
          className={isExpanded ? "w-12 h-12" : "w-12 h-12 rotate-180"}
          aria-label="Rightbar toggle"
        />
      </Button>

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
