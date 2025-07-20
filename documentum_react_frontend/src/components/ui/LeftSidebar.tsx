import React, { useState, useEffect } from "react";
import { Button } from "components/ui/button";
import { ProjectModule } from "components/ui/ProjectModule";
import { MapModule } from "components/ui/MapModule";
import type { MapItem } from "@/types/MapItem";
import type { ProjectItem } from "@/types/ProjectItem";
import { LoadMapDialog } from "components/ui/LoadMapDialog";
import { ImportModal } from "components/ui/import-modal";
import { ArrowLeftCircle } from "lucide-react";

interface LeftSidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  className?: string;
  onToggleExpand: (itemId: number, expand: boolean) => void;
}

const initialProjects: ProjectItem[] = [
  {
    id: 1,
    title: "Documentation Utilisateur - Planning",
    gamme: "Planning",
    mapItems: [
      {
        id: 101,
        title: "Vue d’ensemble",
        isMaster: true,
        level: 0,
        expanded: true,
        versionOrigine: "2.0.0",
      },
      {
        id: 102,
        title: "Module RDV",
        isMaster: false,
        level: 1,
        expanded: true,
        versionOrigine: "2.0.0",
      },
    ],
  },
  {
    id: 2,
    title: "Documentation Utilisateur - Usager",
    gamme: "Usager",
    mapItems: [
      {
        id: 201,
        title: "Vue globale",
        isMaster: true,
        level: 0,
        expanded: true,
        versionOrigine: "1.3.0",
      },
      {
        id: 202,
        title: "Module AN",
        isMaster: false,
        level: 1,
        expanded: false,
        versionOrigine: "1.3.0",
      },
    ],
  },
];

const availableMaps = [
  {
    id: 5001,
    title: "Carte Profil Planning",
    isMaster: true,
    versionOrigine: "2.0.0",
    projet: "Profil Utilisateur",
    gamme: "Planning",
  },
  {
    id: 5002,
    title: "Vue Établissement",
    isMaster: false,
    versionOrigine: "2.1.0",
    projet: "Dossier Usager",
    gamme: "Usager",
  },
];

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  isExpanded,
  onToggle,
  className,

  onToggleExpand,
}) => {
  const [isProjectExpanded, setIsProjectExpanded] = useState(true);
  const [isMapExpanded, setIsMapExpanded] = useState(true);

  const toggleProjectExpand = () => setIsProjectExpanded(!isProjectExpanded);
  const toggleMapExpand = () => setIsMapExpanded(!isMapExpanded);

  const [loadMapOpen, setLoadMapOpen] = useState(false);
  const [importWordOpen, setImportWordOpen] = useState(false);

  // Ajoute l’état des projets et sélection
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    projects[0]?.id ?? null
  );
  const [selectedMapItemId, setSelectedMapItemId] = useState<number | null>(
    projects.find((p) => p.id === selectedProjectId)?.mapItems[0]?.id ?? null
  );

  const [mapItems, setMapItems] = useState<MapItem[]>(
    projects.find((p) => p.id === selectedProjectId)?.mapItems ?? []
  );

  const [showExportCard, setShowExportCard] = useState(false);

  // callbacks pour gestion
  const handleSelect = (id: number) => setSelectedProjectId(id);
  const handleAdd = () => {
    const newId = projects.length
      ? Math.max(...projects.map((p) => p.id)) + 1
      : 1;
    setProjects([
      ...projects,
      {
        id: newId,
        title: `Nouveau Projet ${newId}`,
        gamme: "Nouvelle Gamme",
        mapItems: [],
      },
    ]);
    setSelectedProjectId(newId);
  };
  const handleClone = (id: number) => {
    const p = projects.find((x) => x.id === id);
    if (p) {
      const newId = Math.max(...projects.map((x) => x.id)) + 1;
      setProjects([
        ...projects,
        {
          ...p,
          id: newId,
          title: p.title + " (Clone)",
          mapItems: [...p.mapItems],
        },
      ]);
      setSelectedProjectId(newId);
    }
  };
  const handleDelete = (id: number) => {
    setProjects(projects.filter((x) => x.id !== id));
    setSelectedProjectId(projects.length > 1 ? projects[0].id : null);
  };
  const handlePublish = (id: number) => {
    setShowExportCard(true);
  };
  const handleLoad = () => alert("Charger projet (à implémenter)");

  // Les callbacks d'interaction MapModule
  const handleSelectMapItem = (id: number) => setSelectedMapItemId(id);

  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  const handleRename = (itemId: number) => {
    setEditingItemId(itemId); // active le champ <input>
  };

  const handleRenameSave = (itemId: number, newTitle: string) => {
    setMapItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, title: newTitle } : item
      )
    );
    setEditingItemId(null);
  };

  const handleAddMapItem = () => {
    const newId = mapItems.length
      ? Math.max(...mapItems.map((i) => i.id)) + 1
      : 1;
    setMapItems([
      ...mapItems,
      {
        id: newId,
        title: `Nouvelle rubrique ${newId}`,
        level: 1,
        isMaster: false,
        expanded: false,
        versionOrigine: "",
      },
    ]);
    setSelectedMapItemId(newId);
  };
  const handleCloneMapItem = (id: number) => {
    const item = mapItems.find((i) => i.id === id);
    if (item) {
      const newId = Math.max(...mapItems.map((i) => i.id)) + 1;
      setMapItems([
        ...mapItems,
        { ...item, id: newId, title: item.title + " (Clone)" },
      ]);
      setSelectedMapItemId(newId);
    }
  };
  const handleDeleteMapItem = (id: number) => {
    setMapItems(mapItems.filter((i) => i.id !== id));
    setSelectedMapItemId(null);
  };
  const handleLoadMap = () => alert("Charger map");

  const handleIndent = (itemId: number) => {
    setMapItems((prev) =>
      prev.map((item, i, arr) => {
        if (item.id === itemId) {
          if (i === 0) return item;
          const prevLevel = arr[i - 1].level;
          return { ...item, level: Math.min(item.level + 1, prevLevel + 1) };
        }
        return item;
      })
    );
  };

  const handleOutdent = (itemId: number) => {
    setMapItems((prev) =>
      prev.map((item) =>
        item.id === itemId && item.level > 1
          ? { ...item, level: item.level - 1 }
          : item
      )
    );
  };

  // Expand/collapse handler
  const handleToggleExpand = (itemId: number, expand: boolean) => {
    setMapItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, expanded: expand } : item
      )
    );
  };

  // Drag & drop reorder handler
  const handleReorder = (newItems: MapItem[]) => setMapItems(newItems);

  //Synchronisation des mapItems avec le projet sélectionné
  useEffect(() => {
    const selected = projects.find((p) => p.id === selectedProjectId);
    setMapItems(selected?.mapItems ?? []);
    setSelectedMapItemId(selected?.mapItems[0]?.id ?? null);
  }, [selectedProjectId, projects]);

  return (
    <>
      <ImportModal
        open={importWordOpen}
        title="Importer une map Word"
        accept=".doc,.docx"
        onClose={() => setImportWordOpen(false)}
        onNext={(file) => {
          // Appelle ici la logique de conversion/import Word → DITA
          console.log("Fichier Word sélectionné :", file);
          setImportWordOpen(false);
        }}
      />
      ;
      <LoadMapDialog
        open={loadMapOpen}
        onClose={() => setLoadMapOpen(false)}
        availableMaps={availableMaps}
        onLoad={(newMapItems) => {
          setMapItems(newMapItems);
          setSelectedMapItemId(newMapItems[0]?.id ?? null);
        }}
      />
      ;
      <div
        className={`fixed top-[103px] bottom-0 left-0 transition-all duration-300 ease-in-out ${className}`}
        style={{ width: isExpanded ? "345px" : "0" }}
      >
        <div className="relative h-full">
          <div
            className={`h-full bg-[#f7a900] rounded-r-[15px] transition-all duration-300 ease-in-out`}
            style={{
              width: "345px",
              transform: isExpanded ? "translateX(0)" : "translateX(-345px)",
            }}
          >
            <div className="pt-20 px-4 overflow-hidden">
              <div className="min-h-[48px]">
                <ProjectModule
                  isExpanded={isProjectExpanded}
                  onToggle={toggleProjectExpand}
                  sidebarExpanded={isExpanded}
                  projects={projects}
                  selectedProjectId={selectedProjectId}
                  onSelect={handleSelect}
                  onAdd={handleAdd}
                  onLoad={handleLoad}
                  onClone={handleClone}
                  onDelete={handleDelete}
                  onPublish={handlePublish}
                  showExportCard={showExportCard}
                  setShowExportCard={setShowExportCard}
                />
              </div>
              {isExpanded && (
                <div className="mt-[10px] min-h-[48px]">
                  <MapModule
                    isExpanded={isMapExpanded}
                    onToggle={toggleMapExpand}
                    mapItems={mapItems}
                    selectedMapItemId={selectedMapItemId}
                    setLoadMapOpen={setLoadMapOpen}
                    onLoadMapDialog={() => setLoadMapOpen(true)}
                    onReorder={handleReorder}
                    onSelect={handleSelectMapItem}
                    onRename={handleRename}
                    editingItemId={editingItemId}
                    onRenameSave={handleRenameSave}
                    onAdd={handleAddMapItem}
                    onImportWord={() => setImportWordOpen(true)}
                    onClone={handleCloneMapItem}
                    onDelete={handleDeleteMapItem}
                    onLoad={handleLoadMap}
                    onIndent={handleIndent}
                    onOutdent={handleOutdent}
                    onToggleExpand={handleToggleExpand}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        className={`fixed top-[120px] p-0 h-17 w-17 z-50 flex items-center justify-center rounded-full transition-all duration-300 ease-in-out hover:bg-gray-200`}
        style={{
          left: isExpanded ? "345px" : "0",
          transform: "translateX(-50%)",
        }}
        onClick={onToggle}
      >
        <ArrowLeftCircle
          className={isExpanded ? "w-12 h-12" : "w-12 h-12 rotate-180"}
          aria-label="Leftbar toggle"
        />
      </Button>
    </>
  );
};
