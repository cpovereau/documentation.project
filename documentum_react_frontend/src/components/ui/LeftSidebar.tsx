import React, { useState, useEffect } from "react";
import api from "@/lib/apiClient";
import { mapRubriquesToMapItems } from "@/lib/mapMappers";
import { Button } from "@/components/ui/button";
import { ProjectModule } from "@/components/ui/ProjectModule";
import { MapModule } from "@/components/ui/MapModule";
import type { MapItem } from "@/types/MapItem";
import type { ProjectMap } from "@/types/ProjectMap";
import type { ProjectDTO } from "@/types/ProjectDTO";
import type { MapRubriqueDTO } from "@/api/maps";
import useSelectedVersion from "@/hooks/useSelectedVersion";
import { useNewRubriqueXml } from "@/hooks/useNewRubriqueXml";
import { listMapRubriques, publishMap } from "@/api/maps";
import { getInsertionParentId } from "@/lib/mapStructure";
import useProjectStore from "@/store/projectStore";
import useXmlBufferStore from "@/store/xmlBufferStore";
import useSelectionStore from "@/store/selectionStore";
import { toast } from "sonner";
import { CreateProjectDialog } from "@/components/ui/CreateProjectDialog";
import { LoadProjectDialog } from "@/components/ui/LoadProjectDialog";
import { LoadMapDialog } from "components/ui/LoadMapDialog";
import { ImportModal } from "components/ui/import-modal";
import { ArrowLeftCircle } from "lucide-react";

interface LeftSidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  className?: string;
}

function assertMapId(mapId: number | null): asserts mapId is number {
  if (mapId === null) {
    throw new Error("Map indisponible.");
  }
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  isExpanded,
  onToggle,
  className,
}) => {
  const [isProjectExpanded, setIsProjectExpanded] = useState(true);
  const [isMapExpanded, setIsMapExpanded] = useState(true);
  const [projectMaps, setProjectMaps] = useState<ProjectMap[]>([]);

  const toggleProjectExpand = () => setIsProjectExpanded(!isProjectExpanded);
  const toggleMapExpand = () => setIsMapExpanded(!isMapExpanded);

  const [createOpen, setCreateOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [mapItems, setMapItems] = useState<MapItem[]>([]);
  const [mapRubriques, setMapRubriques] = useState<MapRubriqueDTO[]>([]);
  const [currentMapId, setCurrentMapId] = useState<number | null>(null);
  const [loadMapOpen, setLoadMapOpen] = useState(false);
  const [importWordOpen, setImportWordOpen] = useState(false);
  const [pendingSelectId, setPendingSelectId] = useState<number | null>(null);

  // Stores
  const { selectedProjectId } = useSelectedVersion();
  const setSelectedProjectId = useProjectStore((s) => s.setSelectedProjectId);
  const generateRubriqueXml = useNewRubriqueXml();
  const { setXml, getXml, getStatus } = useXmlBufferStore();

  // 🎯 Sélection — source de vérité unique
  const {
    selectedMapItemId,
    selectedRubriqueId,
    setSelection,
    clearSelection,
  } = useSelectionStore();

  const [projects, setProjects] = useState<ProjectDTO[]>([]);

  // ─────────────────────────────────────────────────────────────
  // Fonction centrale de sélection d'un item de la map.
  // Dérive rubriqueId depuis mapRubriques pour rester cohérent.
  // ─────────────────────────────────────────────────────────────
  function selectMapItem(mapItemId: number | null) {
    if (mapItemId === null) {
      clearSelection();
      return;
    }
    const mr = mapRubriques.find((r) => r.id === mapItemId);
    const rubriqueId = mr?.rubrique.id ?? null;
    setSelection({ mapItemId, rubriqueId });
  }

  // ─────────────────────────────────────────────────────────────
  // Garde-fou — utilise le selectedRubriqueId réel depuis le store
  // ─────────────────────────────────────────────────────────────
  const hasUnsavedChanges =
    selectedRubriqueId !== null && getStatus(selectedRubriqueId) === "dirty";

  // Sélection différée après création d'une rubrique
  useEffect(() => {
    if (!pendingSelectId || mapRubriques.length === 0) return;
    const mr = mapRubriques.find((r) => r.id === pendingSelectId);
    const rubriqueId = mr?.rubrique.id ?? null;
    setSelection({ mapItemId: pendingSelectId, rubriqueId });
    setPendingSelectId(null);
  }, [mapRubriques, pendingSelectId]);

  // Reconstruction des mapItems depuis mapRubriques
  useEffect(() => {
    if (!currentMapId || mapRubriques.length === 0) {
      setMapItems([]);
      return;
    }
    const hasRoot = mapRubriques.some((r) => r.parent === null);
    if (!hasRoot) {
      console.warn("[MapStructure] MapRubriques sans racine, mapping ignoré.");
      setMapItems([]);
      return;
    }
    setMapItems(mapRubriquesToMapItems(mapRubriques, selectedMapItemId));
  }, [currentMapId, mapRubriques, selectedMapItemId]);

  // Initialisation du buffer XML pour chaque rubrique
  useEffect(() => {
    for (const item of mapItems) {
      if (item.rubriqueId == null) continue;
      const xml = getXml(item.rubriqueId);
      if (!xml) {
        setXml(
          item.rubriqueId,
          `<topic>
           <title>${item.title}</title>
           <body>
             <p>Contenu à compléter</p>
           </body>
         </topic>`,
        );
      }
    }
  }, [mapItems, getXml, setXml]);

  const [showExportCard, setShowExportCard] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // Gestion des projets
  // ─────────────────────────────────────────────────────────────

  const handleSelect = (projectId: number) => {
    if (hasUnsavedChanges) {
      toast.error("Enregistrez ou annulez vos modifications avant de changer de projet.");
      return;
    }
    openProject(projectId);
  };

  const handleConfirmNewProject = (projectId: number) => {
    openProject(projectId);
  };

  const handleAdd = () => setCreateOpen(true);

  // Clone projet — hors scope v1 (pas d'endpoint backend disponible)
  const handleClone = (_id: number) => {
    toast.error("Clonage de projet non disponible (v1).");
  };

  // Suppression projet — DELETE /api/projets/{id}/
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/projets/${id}/`);
      setProjects((prev) => prev.filter((x) => x.id !== id));
      if (selectedProjectId === id) {
        setSelectedProjectId(null);
        setCurrentMapId(null);
        setMapRubriques([]);
        setMapItems([]);
        clearSelection();
      }
      toast.success("Projet supprimé.");
    } catch {
      toast.error("Impossible de supprimer le projet.");
    }
  };

  const handlePublish = (_id: number) => {
    setShowExportCard(true);
  };

  // ─────────────────────────────────────────────────────────────
  // Publication — POST /api/publier-map/{mapId}/
  //
  // Règle de sélection de la map cible (par ordre de priorité) :
  //   1. map avec is_master === true
  //   2. map unique si une seule map dans le projet
  //   3. blocage explicite si plusieurs maps sans master
  // ─────────────────────────────────────────────────────────────
  const handleExport = async (format: string): Promise<void> => {
    const master = projectMaps.find((m) => m.is_master);
    const targetMap = master ?? (projectMaps.length === 1 ? projectMaps[0] : null);

    if (!targetMap) {
      toast.error(
        "Impossible de déterminer la map à publier : plusieurs maps existent sans map master définie.",
      );
      return;
    }

    try {
      const result = await publishMap(targetMap.id, format);
      if (result.status === "error") {
        toast.error(result.message ?? "Erreur lors de la publication.");
      } else {
        toast.success(result.message ?? "Publication réussie.");
      }
    } catch {
      toast.error("Erreur lors de la publication.");
    }
  };

  const handleLoad = () => setLoadOpen(true);

  const handleConfirmLoadedProject = (project: ProjectDTO) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === project.id);
      return exists ? prev.map((p) => (p.id === project.id ? project : p)) : [project, ...prev];
    });
    openProject(project.id);
  };

  async function openProject(projectId: number) {
    if (hasUnsavedChanges) {
      toast.error("Enregistrez ou annulez vos modifications avant de changer de projet.");
      return;
    }

    let project = projects.find((p) => p.id === projectId);

    if (!project) {
      try {
        const res = await api.get(`/api/projets/${projectId}/`);
        const fetchedProject = res.data.project ?? res.data;
        project = fetchedProject;
        setProjects((prev) => [...prev, fetchedProject]);
      } catch (e) {
        console.error(e);
        toast.error("Projet introuvable !");
        return;
      }
    }

    if (!project) {
      toast.error("Projet introuvable !");
      return;
    }

    setSelectedProjectId(project.id);
    setProjectMaps(project.maps ?? []);
    setCurrentMapId(null);
    setMapRubriques([]);
    setMapItems([]);
    clearSelection();
  }

  // ─────────────────────────────────────────────────────────────
  // Gestion de la map
  // ─────────────────────────────────────────────────────────────

  async function openMap(mapId: number) {
    if (hasUnsavedChanges) {
      toast.error("Enregistrez ou annulez vos modifications avant de changer de map.");
      return;
    }
    setCurrentMapId(mapId);
    clearSelection();
    try {
      const rubriques = await listMapRubriques(mapId);
      setMapRubriques(rubriques);
    } catch (e) {
      console.error(e);
      toast.error("Impossible de charger la map.");
    }
  }

  const handleSelectMapItem = (id: number) => {
    if (hasUnsavedChanges) {
      toast.error("Vous avez des modifications non sauvegardées dans la rubrique actuelle.");
      return;
    }
    selectMapItem(id);
  };

  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  const handleRename = (itemId: number) => {
    setEditingItemId(itemId);
  };

  // Renommage rubrique — PATCH /api/rubriques/{id}/
  const handleRenameSave = async (itemId: number, newTitle: string) => {
    const mr = mapRubriques.find((r) => r.id === itemId);
    if (!mr) {
      toast.error("Rubrique introuvable.");
      setEditingItemId(null);
      return;
    }
    try {
      await api.patch(`/api/rubriques/${mr.rubrique.id}/`, { titre: newTitle });
      assertMapId(currentMapId);
      setMapRubriques(await listMapRubriques(currentMapId));
      toast.success("Rubrique renommée.");
    } catch {
      toast.error("Impossible de renommer la rubrique.");
    } finally {
      setEditingItemId(null);
    }
  };

  const handleAddMapItem = async () => {
    if (!selectedProjectId || !currentMapId) {
      toast.error("Projet ou map indisponible.");
      return;
    }

    try {
      const nodesForInsertion = mapRubriques.map((mr) => ({
        id: mr.id,
        parentId: mr.parent,
      }));

      const rootNode = nodesForInsertion.find((n) => n.parentId === null);
      if (!rootNode) {
        throw new Error("Aucune racine documentaire trouvée.");
      }

      const computedParentId = getInsertionParentId(nodesForInsertion, selectedMapItemId);
      const parentId = computedParentId ?? rootNode.id;

      const xml = await generateRubriqueXml("Nouvelle rubrique");

      const created = await api.post(`/api/maps/${currentMapId}/structure/create/`, {
        titre: "Nouvelle rubrique",
        contenu_xml: xml,
        parent: parentId,
      });

      const createdMapRubriqueId = created.data.id;

      const refreshed = await listMapRubriques(currentMapId);
      setMapRubriques(refreshed);

      // Sélection différée : déclenchée après rebuild mapItems
      setPendingSelectId(createdMapRubriqueId);

      toast.success("Rubrique créée.");
    } catch (e) {
      console.error(e);
      toast.error("Échec de la création de la rubrique.");
    }
  };

  // Clone rubrique — hors scope v1 (pas d'endpoint backend disponible)
  const handleCloneMapItem = (_id: number) => {
    toast.error("Clonage de rubrique non disponible (v1).");
  };

  // Suppression rubrique — hors scope v1
  // Backend bloque DELETE /api/rubriques/{id}/ si la rubrique est encore en map ;
  // aucun endpoint DELETE /api/maps/{id}/structure/{mr_id}/ n'existe.
  const handleDeleteMapItem = (_id: number) => {
    toast.error("Suppression de rubrique non disponible (v1).");
  };

  const handleLoadMap = () => {
    if (hasUnsavedChanges) {
      toast.error("Enregistrez ou annulez vos modifications avant de charger une map.");
      return;
    }
    alert("Charger map");
  };

  // Indentation / Désindentation
  const handleIndent = async (mapRubriqueId: number) => {
    try {
      assertMapId(currentMapId);
      await api.post(`/api/maps/${currentMapId}/structure/${mapRubriqueId}/indent/`);
      setMapRubriques(await listMapRubriques(currentMapId));
    } catch {
      toast.error("Indentation impossible.");
    }
  };

  const handleOutdent = async (mapRubriqueId: number) => {
    try {
      assertMapId(currentMapId);
      await api.post(`/api/maps/${currentMapId}/structure/${mapRubriqueId}/outdent/`);
      setMapRubriques(await listMapRubriques(currentMapId));
    } catch (e) {
      console.error(e);
      toast.error("Désindentation impossible.");
    }
  };

  // Drag & drop reorder
  const handleReorder = async (orderedMapRubriqueIds: number[]) => {
    try {
      assertMapId(currentMapId);
      await api.post(`/api/maps/${currentMapId}/structure/reorder/`, {
        orderedIds: orderedMapRubriqueIds,
      });
      setMapRubriques(await listMapRubriques(currentMapId));
    } catch (e) {
      console.error(e);
      toast.error("Réorganisation impossible.");
    }
  };

  // Synchronisation sur le projet sélectionné
  useEffect(() => {
    if (!selectedProjectId) {
      setMapRubriques([]);
      clearSelection();
      return;
    }
    (async () => {
      const res = await api.get(`/api/projets/${selectedProjectId}/structure/`);
      setCurrentMapId(res.data.map.id);
      setMapRubriques(res.data.structure);
    })();
  }, [selectedProjectId]);

  function openLoadMapDialog() {
    setLoadMapOpen(true);
  }

  return (
    <>
      <CreateProjectDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onConfirm={handleConfirmNewProject}
      />
      ;
      <LoadProjectDialog
        open={loadOpen}
        onClose={() => setLoadOpen(false)}
        onSelect={(projectId) => openProject(projectId)}
        initialSelectedId={selectedProjectId}
      />
      ;
      <ImportModal
        open={importWordOpen}
        title="Importer une map Word"
        accept=".doc,.docx"
        onClose={() => setImportWordOpen(false)}
        onNext={(_file) => {
          setImportWordOpen(false);
        }}
      />
      ;
      <LoadMapDialog
        open={loadMapOpen}
        onClose={() => setLoadMapOpen(false)}
        maps={projectMaps}
        onSelect={(mapId) => openMap(mapId)}
      />
      ;
      <div
        className={`fixed top-[103px] bottom-0 left-0 transition-all duration-300 ease-in-out ${className}`}
        style={{ width: isExpanded ? "345px" : "0" }}
      >
        <div className="relative h-full">
          <div
            className="h-full bg-[#f7a900] rounded-r-[15px] transition-all duration-300 ease-in-out"
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
                  onExport={handleExport}
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
                    onSelect={handleSelectMapItem}
                    onRename={handleRename}
                    editingItemId={editingItemId}
                    onRenameSave={handleRenameSave}
                    onAdd={handleAddMapItem}
                    onImportWord={() => setImportWordOpen(true)}
                    onLoadMapDialog={openLoadMapDialog}
                    onClone={handleCloneMapItem}
                    onDelete={handleDeleteMapItem}
                    onLoad={handleLoadMap}
                    onIndent={handleIndent}
                    onOutdent={handleOutdent}
                    onReorder={handleReorder}
                    onToggleExpand={toggleMapExpand}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        className="fixed top-[120px] p-0 h-17 w-17 z-50 flex items-center justify-center rounded-full transition-all duration-300 ease-in-out hover:bg-gray-200"
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
