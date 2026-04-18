import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "components/ui/button";
import { ArrowRightCircle } from "lucide-react";
import { AuthorInfo } from "./AuthorInfo";
import { MediaPanel } from "./MediaPanel";

interface SyncRightSidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export const SyncRightSidebar: React.FC<SyncRightSidebarProps> = ({
  isExpanded,
  onToggle,
}) => {
  const [isImageMode, setIsImageMode] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [displayMode, setDisplayMode] = useState<"grid" | "small" | "list">(
    "grid"
  );

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

    </>
  );
};
