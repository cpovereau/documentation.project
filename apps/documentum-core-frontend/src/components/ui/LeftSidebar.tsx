import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { mapRubriquesToMapItems } from "@/lib/mapMappers";
import { Button } from "@/components/ui/button";
import { ProjectModule } from "@/components/ui/ProjectModule";
import { MapModule } from "@/components/ui/MapModule";
import type { MapItem } from "@/types/MapItem";
import type { ProjectMap } from "@/types/ProjectMap";
import type { ProjectDTO } from "@/types/ProjectDTO";
import { publishMap } from "@/api/maps";
import { getInsertionParentId } from "@/lib/mapStructure";
import useSelectedVersion from "@/hooks/useSelectedVersion";
import { useNewRubriqueXml } from "@/hooks/useNewRubriqueXml";
import useProjectStore from "@/store/projectStore";
import useXmlBufferStore from "@/store/xmlBufferStore";
import useSelectionStore from "@/store/selectionStore";
import { toast } from "sonner";
import { useRubriqueSave } from "@/hooks/useSaveRubrique";
import { useMapStructure, mapStructureQueryKey } from "@/hooks/useMapStructure";
import { useProjetActions } from "@/hooks/useProjetActions";
import { CreateProjectDialog } from "@/components/ui/CreateProjectDialog";
import { LoadProjectDialog } from "@/components/ui/LoadProjectDialog";
import { LoadMapDialog } from "components/ui/LoadMapDialog";
import { ImportModal } from "components/ui/import-modal";
import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
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
  const [currentMapId, setCurrentMapId] = useState<number | null>(null);
  const [loadMapOpen, setLoadMapOpen] = useState(false);
  const [importWordOpen, setImportWordOpen] = useState(false);
  const [pendingSelectId, setPendingSelectId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  // Stores
  const { selectedProjectId } = useSelectedVersion();
  const setSelectedProjectId = useProjectStore((s) => s.setSelectedProjectId);
  const generateRubriqueXml = useNewRubriqueXml();
  const { getStatus } = useXmlBufferStore();

  // 🎯 Sélection — source de vérité unique
  const {
    selectedMapItemId,
    selectedRubriqueId,
    setSelection,
    clearSelection,
  } = useSelectionStore();

  const [projects, setProjects] = useState<ProjectDTO[]>([]);

  // ── Hooks API ────────────────────────────────────────────────────────────
  const mapStructure = useMapStructure(currentMapId);
  const projetActions = useProjetActions(selectedProjectId);
  const { mapRubriques } = mapStructure;

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
  const currentBufferStatus = selectedRubriqueId === null ? null : getStatus(selectedRubriqueId);
  const hasUnsavedChanges = currentBufferStatus === "dirty" || currentBufferStatus === "error";

  // ─────────────────────────────────────────────────────────────
  // Navigation gardée — modale de confirmation si buffer non sauvegardé
  // ─────────────────────────────────────────────────────────────
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const { saveRubrique, saving: savingRubrique } = useRubriqueSave(selectedRubriqueId);

  const requestNavigation = (action: () => void) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(() => action);
    } else {
      action();
    }
  };

  const handleSaveAndContinue = async () => {
    const success = await saveRubrique();
    const action = pendingNavigation;
    setPendingNavigation(null);
    if (success && action) action();
  };

  const handleDiscardAndContinue = () => {
    const action = pendingNavigation;
    setPendingNavigation(null);
    action?.();
  };

  const handleCancelDialog = () => {
    setPendingNavigation(null);
  };

  // ─────────────────────────────────────────────────────────────
  // Sync structure projet → currentMapId + pre-populate cache map
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedProjectId) {
      setCurrentMapId(null);
      clearSelection();
      return;
    }
    if (projetActions.structure.data) {
      const mapId = projetActions.structure.data.map.id;
      setCurrentMapId(mapId);
      queryClient.setQueryData(
        mapStructureQueryKey(mapId),
        projetActions.structure.data.structure,
      );
    } else {
      setCurrentMapId(null);
    }
  }, [projetActions.structure.data, selectedProjectId, queryClient]);

  // Erreur chargement map
  useEffect(() => {
    if (mapStructure.isError) toast.error("Impossible de charger la map.");
  }, [mapStructure.isError]);

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

  // Initialisation buffer supprimée — useDitaLoader est désormais le point de charge
  // unique : il fetche GET /api/rubriques/{id}/ à la sélection et alimente le buffer.

  const [showExportCard, setShowExportCard] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // Gestion des projets
  // ─────────────────────────────────────────────────────────────

  const handleSelect = (projectId: number) => {
    requestNavigation(() => openProject(projectId));
  };

  const handleConfirmNewProject = (projectId: number) => {
    openProject(projectId);
  };

  const handleAdd = () => requestNavigation(() => setCreateOpen(true));

  // Clone projet — hors scope v1 (pas d'endpoint backend disponible)
  const handleClone = (_id: number) => {
    toast.error("Clonage de projet non disponible (v1).");
  };

  // Suppression projet — DELETE /api/projets/{id}/
  const handleDelete = async (id: number) => {
    try {
      await projetActions.deleteProjet.mutateAsync(id);
      setProjects((prev) => prev.filter((x) => x.id !== id));
      if (selectedProjectId === id) {
        setSelectedProjectId(null);
        setCurrentMapId(null);
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

  const handleLoad = () => requestNavigation(() => setLoadOpen(true));

  async function openProject(projectId: number) {
    let project = projects.find((p) => p.id === projectId);

    if (!project) {
      try {
        project = await projetActions.fetchProjet(projectId);
        setProjects((prev) => [...prev, project!]);
      } catch {
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
    clearSelection();
  }

  // ─────────────────────────────────────────────────────────────
  // Gestion de la map
  // ─────────────────────────────────────────────────────────────

  function openMap(mapId: number) {
    setCurrentMapId(mapId);
    clearSelection();
    // useMapStructure(mapId) fetche automatiquement via useQuery
  }

  const handleSelectMapItem = (id: number) => {
    requestNavigation(() => selectMapItem(id));
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
      assertMapId(currentMapId);
      await mapStructure.renameRubrique.mutateAsync({
        rubriqueId: mr.rubrique.id,
        titre: newTitle,
      });
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

      const result = await mapStructure.createRubrique.mutateAsync({
        titre: "Nouvelle rubrique",
        contenu_xml: xml,
        parent: parentId,
      });

      setPendingSelectId(result.data.id);
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
    requestNavigation(() => alert("Charger map"));
  };

  // Indentation / Désindentation
  const handleIndent = async (mapRubriqueId: number) => {
    try {
      assertMapId(currentMapId);
      await mapStructure.indent.mutateAsync(mapRubriqueId);
    } catch {
      toast.error("Indentation impossible.");
    }
  };

  const handleOutdent = async (mapRubriqueId: number) => {
    try {
      assertMapId(currentMapId);
      await mapStructure.outdent.mutateAsync(mapRubriqueId);
    } catch {
      toast.error("Désindentation impossible.");
    }
  };

  // Drag & drop reorder
  const handleReorder = async (orderedMapRubriqueIds: number[]) => {
    try {
      assertMapId(currentMapId);
      await mapStructure.reorder.mutateAsync(orderedMapRubriqueIds);
    } catch {
      toast.error("Réorganisation impossible.");
    }
  };

  function openLoadMapDialog() {
    requestNavigation(() => setLoadMapOpen(true));
  }

  return (
    <>
      <UnsavedChangesDialog
        open={pendingNavigation !== null}
        saving={savingRubrique}
        onSave={handleSaveAndContinue}
        onDiscard={handleDiscardAndContinue}
        onCancel={handleCancelDialog}
      />
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
