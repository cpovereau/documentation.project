import React, { useState } from "react";
import { Button } from "components/ui/button";
import { ProjectModule } from "components/ui/ProjectModule";
import { MapModule } from "components/ui/MapModule";
import { ProjectItem } from "components/ui/ProjectModule";
import { MapItem } from "components/ui/MapModule";

interface LeftSidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  className?: string;
}

const initialProjects: ProjectItem[] = [
  { id: 1, title: "Documentation Utilisateur Planning", gamme: "Planning" },
  { id: 2, title: "Documentation Utilisateur", gamme: "Usager" },
];

const initialMapItems: MapItem[] = [
  { id: 1, title: "Racine", level: 0, expanded: true },
  { id: 2, title: "Introduction", level: 1 },
  { id: 3, title: "Connexion à l'application", level: 1 },
  {
    id: 4,
    title: "Dossier de l'Usager",
    level: 1,
    expanded: true,
    active: true,
  },
  { id: 5, title: "Administratif", level: 2 },
  { id: 6, title: "Etablissement", level: 3 },
  { id: 7, title: "Etat Civil", level: 3 },
];

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  isExpanded,
  onToggle,
  className,
}) => {
  const [isProjectExpanded, setIsProjectExpanded] = useState(true);
  const [isMapExpanded, setIsMapExpanded] = useState(true);

  const toggleProjectExpand = () => setIsProjectExpanded(!isProjectExpanded);
  const toggleMapExpand = () => setIsMapExpanded(!isMapExpanded);

  // Ajoute l’état des projets et sélection
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    projects[0]?.id ?? null
  );

  // callbacks pour gestion
  const handleSelect = (id: number) => setSelectedProjectId(id);
  const handleAdd = () => {
    const newId = projects.length
      ? Math.max(...projects.map((p) => p.id)) + 1
      : 1;
    setProjects([
      ...projects,
      { id: newId, title: `Nouveau Projet ${newId}`, gamme: "Nouvelle Gamme" },
    ]);
    setSelectedProjectId(newId);
  };
  const handleClone = (id: number) => {
    const p = projects.find((x) => x.id === id);
    if (p) {
      const newId = Math.max(...projects.map((x) => x.id)) + 1;
      setProjects([
        ...projects,
        { ...p, id: newId, title: p.title + " (Clone)" },
      ]);
      setSelectedProjectId(newId);
    }
  };
  const handleDelete = (id: number) => {
    setProjects(projects.filter((x) => x.id !== id));
    setSelectedProjectId(projects.length > 1 ? projects[0].id : null);
  };
  const handlePublish = (id: number) => alert("Publier projet id: " + id);
  const handleLoad = () => alert("Charger projet (à implémenter)");

  // Ajoute la gestion de l’état pour MapModule ici :
  const [mapItems, setMapItems] = useState<MapItem[]>(initialMapItems);
  const [selectedMapItemId, setSelectedMapItemId] = useState<number | null>(
    mapItems[0]?.id ?? null
  );

  // Les callbacks d'interaction MapModule
  const handleSelectMapItem = (id: number) => setSelectedMapItemId(id);
  const handleAddMapItem = () => {
    const newId = mapItems.length
      ? Math.max(...mapItems.map((i) => i.id)) + 1
      : 1;
    setMapItems([
      ...mapItems,
      { id: newId, title: `Nouvelle rubrique ${newId}`, level: 1 },
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

  return (
    <>
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
                />
              </div>
              {isExpanded && (
                <div className="mt-[62px] min-h-[48px]">
                  <MapModule
                    isExpanded={isMapExpanded}
                    onToggle={toggleMapExpand}
                    mapItems={mapItems} // <= obligatoire
                    selectedMapItemId={selectedMapItemId}
                    onSelect={handleSelectMapItem}
                    onAdd={handleAddMapItem}
                    onClone={handleCloneMapItem}
                    onDelete={handleDeleteMapItem}
                    onLoad={handleLoadMap}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        className={`fixed top-[120px] p-0 h-18 w-18 z-50 transition-all duration-300 ease-in-out hover:bg-gray-200`}
        style={{
          left: isExpanded ? "345px" : "0",
          transform: "translateX(-50%)",
        }}
        onClick={onToggle}
      >
        <img
          className={`w-full h-full transition-transform duration-300 ${
            isExpanded ? "" : "rotate-180"
          }`}
          alt="Leftbar toggle"
          src="https://c.animaapp.com/macke9kyh9ZtZh/img/leftbar-collapse.svg"
        />
      </Button>
    </>
  );
};
