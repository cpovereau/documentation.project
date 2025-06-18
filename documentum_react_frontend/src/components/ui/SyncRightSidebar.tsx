import React, { useState } from "react";
import { Button } from "components/ui/button";
import { ArrowRightCircle } from "lucide-react";
import { AuthorInfo } from "./AuthorInfo";
import { MediaPanel, MediaItem } from "./MediaPanel";
import { ScrollArea } from "@radix-ui/react-scroll-area";
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

  const [page, setPage] = useState(1);

  const handleImportClick = () => {
    setImportType(isImageMode ? "image" : "video");
    setImportModalOpen(true);
  };

  return (
    <>
      <div
        className={`bg-[#f7a900] fixed top-[103px] bottom-0 right-0 overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "w-[248px]" : "w-0"
        } overflow-hidden`}
      >
        <div className="pt-20 px-4 flex flex-col max-h-full min-h-0 h-full">
          <div className="space-y-4 mb-2">
            <AuthorInfo auteur="Jean Dupont" date="15/04/2023" />
          </div>

          <ScrollArea className="flex-1 min-h-0 scrollarea-rounded">
            <MediaPanel
              page={page}
              setPage={setPage}
              mediaItems={mediaItems}
              isImageMode={isImageMode}
              searchText={searchText}
              sortOrder={sortOrder}
              displayMode={displayMode}
              onSearchChange={(text) => {
                setPage(1);
                setSearchText(text);
              }}
              onClearSearch={() => setSearchText("")}
              onToggleMode={() => setIsImageMode((prev) => !prev)}
              onToggleType={(type) => setIsImageMode(type === "image")}
              onToggleSort={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              onToggleDisplayMode={() => {
                setPage(1);
                setDisplayMode((prev) =>
                  prev === "grid" ? "small" : prev === "small" ? "list" : "grid"
                );
              }}
              onImportClick={handleImportClick}
            />
          </ScrollArea>
        </div>
      </div>

      <Button
        variant="ghost"
        className={`fixed top-[120px] z-50 flex items-center justify-center rounded-full hover:bg-gray-200 transition-all duration-300 ease-in-out`}
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
