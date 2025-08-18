// =====================================================
// 📂 Fichier : MediaPanel.tsx
// 🔎 Description : Composant de sélection des images et vidéos commun à l'application
// 🗣️ Tous les commentaires doivent être écrits en français.
// =====================================================

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "components/ui/button";
import { Separator } from "components/ui/separator";
import { MediaCard } from "components/ui/MediaCard";
import {
  Camera,
  Video,
  Upload,
  Search,
  ArrowUpDown,
  LayoutGrid,
  List,
  Text,
  Filter,
} from "lucide-react";
import { useAllDictionnaireData } from "@/hooks/useAllDictionnaireData";
import { useImportModal } from "@/hooks/useImportModal";
import { useMedias } from "@/hooks/useMedias";

interface MediaPanelProps {
  isImageMode: boolean;
  searchText: string;
  sortOrder: "asc" | "desc";
  displayMode: "grid" | "small" | "list";
  onSearchChange: (text: string) => void;
  onClearSearch: () => void;
  onToggleMode: () => void;
  onToggleType: (type: "image" | "video") => void;
  onToggleSort: () => void;
  onToggleDisplayMode: () => void;
  isFloating?: boolean;
}

export const MediaPanel: React.FC<MediaPanelProps> = ({
  isImageMode,
  searchText,
  sortOrder,
  displayMode,
  onSearchChange,
  onClearSearch,
  onToggleMode,
  onToggleType,
  onToggleSort,
  onToggleDisplayMode,
  isFloating = false,
}) => {
  type MediaFilterType = "produit" | "fonctionnalite" | "item";
  const [activeFilter, setActiveFilter] = useState<MediaFilterType | null>(
    null
  );
  const [filterKeyword, setFilterKeyword] = useState<string>("");

  const { data, isLoading } = useAllDictionnaireData();

  // chargement des produits
  const produitId =
    activeFilter === "produit"
      ? data.produits.find((p) => p.abreviation === filterKeyword)?.id
      : undefined;

  // chargement des fonctionnalités
  const fonctionnaliteCode =
    activeFilter === "fonctionnalite"
      ? data.fonctionnalites.find((f) => f.code === filterKeyword)?.code
      : undefined;

  // chargement des éléments d'interface
  const interfaceCode =
    activeFilter === "item"
      ? data.interfaces.find((i) => i.code === filterKeyword)?.code
      : undefined;

  // initialisation de la recherche
  const isFreeTextSearch = activeFilter === null;
  const searchTerm = isFreeTextSearch ? searchText : "";

  //  Actualisation suite import d'image
  const [mediaRefreshKey, setMediaRefreshKey] = useState(0);

  const { medias } = useMedias({
    produitId,
    fonctionnaliteCode,
    interfaceCode,
    searchTerm,
    mediaRefreshKey,
  });

  // tri
  const filteredMedia = medias.sort((a, b) =>
    sortOrder === "asc"
      ? a.nom_fichier.localeCompare(b.nom_fichier)
      : b.nom_fichier.localeCompare(a.nom_fichier)
  );

  const getGridClass = () => {
    if (displayMode === "grid") return "grid gap-2 grid-cols-1";
    if (displayMode === "small") return "grid gap-2 grid-cols-2";
    if (displayMode === "list")
      return "flex flex-col gap-3 text-sm leading-tight";
    return "grid-cols-1";
  };

  const { openImportModal } = useImportModal();

  // Appel de la fonction d'import
  const handleImportClick = () => {
    openImportModal({
      context: "media",
      title: isImageMode ? "Importer une image" : "Importer une vidéo",
      produits: data.produits,
      fonctionnalites: data.fonctionnalites,
      interfaces: data.interfaces,
      onConfirm: (params) => {
        console.log("📤 Média importé :", params);
        setMediaRefreshKey((k) => k + 1);
      },
    });
  };

  return (
    <>
      <div className="relative w-full h-12">
        <div className="absolute top-0.5 left-0 w-full">
          <Separator />
        </div>
        <div className="absolute font-bold text-black text-[32px] top-[11px] left-0">
          Médias
        </div>
      </div>

      {/* Ligne actions */}
      <div className="flex items-center justify-between mt-4 mb-2">
        <Button
          variant="ghost"
          className="p-2"
          onClick={handleImportClick}
          title={isImageMode ? "Importer photo" : "Importer vidéo"}
        >
          <Upload className="w-6 h-6" />
        </Button>
        <div className="flex items-center gap-3">
          <Camera
            className="w-7 h-7 cursor-pointer"
            onClick={() => onToggleType("image")}
          />
          <button
            type="button"
            className="relative w-10 h-6 bg-gray-300 rounded-full cursor-pointer focus:outline-none"
            onClick={onToggleMode}
            aria-label="Toggle mode"
          >
            <span
              className={`absolute w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                isImageMode ? "translate-x-0" : "translate-x-full"
              }`}
              style={{ top: "2px", left: "2px" }}
            />
          </button>
          <Video
            className="w-7 h-7 cursor-pointer"
            onClick={() => onToggleType("video")}
          />
        </div>
      </div>

      {/* Recherche */}
      <div className="relative w-full group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          <Search className="text-gray-400 w-5 h-5 pointer-events-none" />

          {/* Menu filtre */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "w-5 h-5 transition-opacity duration-150",
                  activeFilter
                    ? "text-primary opacity-100"
                    : "text-gray-400 opacity-0 group-hover:opacity-100",
                  "focus:outline-none"
                )}
                title="Filtrer"
              >
                <Filter className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="z-50 w-40 bg-white shadow-md"
            >
              <DropdownMenuItem onClick={() => setActiveFilter("produit")}>
                Produit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setActiveFilter("fonctionnalite")}
              >
                Fonctionnalité
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter("item")}>
                Item
              </DropdownMenuItem>
              {activeFilter && (
                <DropdownMenuItem
                  onClick={() => {
                    setActiveFilter(null);
                    setFilterKeyword("");
                    onClearSearch();
                  }}
                  className="text-red-500"
                >
                  Réinitialiser le filtre
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Champ dynamique selon filtre */}
        {activeFilter === "produit" && (
          <select
            className="w-full pl-14 pr-10 py-2 rounded-lg border border-[#65558f] bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#65558f]"
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
          >
            <option value="">-- Choisir un produit --</option>
            {data.produits.map((p) => (
              <option key={p.id} value={p.abreviation}>
                {p.abreviation} - {p.nom}
              </option>
            ))}
          </select>
        )}

        {activeFilter === "fonctionnalite" && (
          <select
            key="fonctionnalite-select"
            className="w-full pl-14 pr-10 py-2 rounded-lg border border-[#65558f] bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#65558f]"
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
          >
            <option value="">-- Choisir une fonctionnalité --</option>
            {data.fonctionnalites.map((f) => (
              <option key={f.id} value={f.code}>
                {f.code} - {f.nom}
              </option>
            ))}
          </select>
        )}

        {activeFilter === "item" && (
          <select
            className="w-full pl-14 pr-10 py-2 rounded-lg border border-[#65558f] bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#65558f]"
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
          >
            <option value="">-- Choisir une fonctionnalité --</option>
            {data.interfaces.map((f) => (
              <option key={f.id} value={f.code}>
                {f.code} - {f.nom}
              </option>
            ))}
          </select>
        )}

        {activeFilter === null && (
          <input
            type="text"
            placeholder="Recherche"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-14 pr-10 py-2 rounded-lg border border-[#65558f] bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#65558f]"
          />
        )}
      </div>

      <div className="h-3" />

      {/* Tri + mode */}
      <div className="flex justify-between mb-2">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={onToggleSort}
        >
          <ArrowUpDown className="w-4 h-4" />
          <span className="text-sm">
            Label {sortOrder === "asc" ? "▲" : "▼"}
          </span>
        </Button>
        <Button variant="ghost" onClick={onToggleDisplayMode}>
          {displayMode === "grid" && <LayoutGrid className="w-6 h-6" />}
          {displayMode === "small" && <List className="w-6 h-6" />}
          {displayMode === "list" && <Text className="w-6 h-6" />}
        </Button>
      </div>

      <div
        className="media-container-style"
        style={{ marginBottom: isFloating ? 0 : "1rem" }}
      >
        <div className={getGridClass()}>
          {filteredMedia.map((item) => (
            <MediaCard
              key={item.id}
              title={item.nom_fichier}
              updatedText={item.description ?? ""}
              imageUrl={item.chemin_acces}
              isListMode={displayMode === "list"}
            />
          ))}
        </div>
      </div>
    </>
  );
};
