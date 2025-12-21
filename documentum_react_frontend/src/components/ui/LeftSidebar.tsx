import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ProjectModule } from "@/components/ui/ProjectModule";
import { MapModule } from "@/components/ui/MapModule";
import type { MapItem } from "@/types/MapItem";
import type { ProjectMap } from "@/types/ProjectMap";
import type { ProjectDTO } from "@/types/ProjectDTO";
import type { MapRubriqueDTO } from "@/api/maps";
import { prepareNewRubriqueXml } from "@/api/rubriqueTemplates";
import { createRubrique } from "@/api/rubriques";
import api from "@/lib/apiClient";
import { createMapRubrique } from "@/api/mapRubriques";
import { listMapRubriques } from "@/api/maps";
import useSelectedProduct from "@/hooks/useSelectedProduct";
import useSelectedVersion from "@/hooks/useSelectedVersion";
import { getInsertionParentId } from "@/lib/mapStructure";
import useProjectStore from "@/store/projectStore";
import useXmlBufferStore from "@/store/xmlBufferStore";
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
  onToggleExpand: (itemId: number, expand: boolean) => void;
  rubriqueId: number | null;
  setSelectedMapItemId: React.Dispatch<React.SetStateAction<number | null>>;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  isExpanded,
  onToggle,
  className,
  onToggleExpand,
  rubriqueId,
  setSelectedMapItemId,
}) => {
  // État local pour gérer l'expansion des projets et des maps
  // Utilise useState pour gérer l'état d'expansion des projets et des maps
  // Initialement, les projets et maps sont tous ouverts
  const [isProjectExpanded, setIsProjectExpanded] = useState(true);
  const [isMapExpanded, setIsMapExpanded] = useState(true);
  const [projectMaps, setProjectMaps] = useState<ProjectMap[]>([]);

  const toggleProjectExpand = () => setIsProjectExpanded(!isProjectExpanded);
  const toggleMapExpand = () => setIsMapExpanded(!isMapExpanded);

  // État pour gérer l'ouverture du dialogue de création de projet
  const [createOpen, setCreateOpen] = useState(false);

  // État pour gérer l'ouverture du dialogue de chargement de projet
  const [loadOpen, setLoadOpen] = useState(false);

  // État pour gérer l'élément de la map sélectionné
  const [mapItems, setMapItems] = useState<MapItem[]>([]);

  // Etat pour gérer les MapRubriques
  const [mapRubriques, setMapRubriques] = useState<MapRubriqueDTO[]>([]);
  const [currentMapId, setCurrentMapId] = useState<number | null>(null);

  // État pour gérer l'ouverture du dialogue de chargement de map
  const [loadMapOpen, setLoadMapOpen] = useState(false);

  // État pour gérer l'ouverture du dialogue d'importation de map Word
  const [importWordOpen, setImportWordOpen] = useState(false);

  // 🧠 Stores / sélection globale (produit, version, projet)
  const { selectedProjectId } = useSelectedVersion();
  const { selectedProduct } = useSelectedProduct();
  const setSelectedProjectId = useProjectStore((s) => s.setSelectedProjectId);

  const { setXml, getXml, getStatus } = useXmlBufferStore();

  // 🔎 DEBUG — comparaison des sources selectedProjectId
  const rawSelectedProjectId = useProjectStore((s) => s.selectedProjectId);

  console.log("[DEBUG][LeftSideBar] selectedProjectId via useSelectedVersion:", selectedProjectId);

  console.log("[DEBUG][LeftSideBar] selectedProjectId via raw projectStore:", rawSelectedProjectId);

  // 📦 Projets chargés depuis l’API
  const [projects, setProjects] = useState<ProjectDTO[]>([]);

  // Fonction de mapping des MapRubriques
  function mapRubriquesToMapItems(mrs: MapRubriqueDTO[]): MapItem[] {
    return mrs.map((mr) => ({
      id: mr.id, // ✅ MapRubrique.id
      rubriqueId: mr.rubrique.id, // ✅ Rubrique.id
      title: mr.rubrique.titre,
      level: mr.parent ? 2 : 1,
      expanded: false,
      isMaster: false,
      versionOrigine: "",
      isRoot: mr.parent === null,
    }));
  }

  // Synchronisation des mapItems avec les mapRubriques chargées
  useEffect(() => {
    setMapItems(mapRubriquesToMapItems(mapRubriques));
  }, [mapRubriques]);

  // Initialisation du buffer XML pour chaque rubrique de la map
  // On s'assure que chaque mapItem a une entrée dans le buffer, même vide
  useEffect(() => {
    for (const item of mapItems) {
      if (item.rubriqueId == null) {
        continue; // ⛔ pas une rubrique → pas de XML
      }

      const xml = getXml(item.rubriqueId);
      if (!xml) {
        console.log(`📄 Initialisation XML vide pour la rubrique ID ${item.rubriqueId}`);
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

  // ID de la rubrique sélectionnée dans la map
  const [selectedMapItemId] = useState<number | null>(null);

  const selectedMapItem = mapItems.find((item) => item.id === selectedMapItemId);
  const selectedRubriqueId = selectedMapItem?.rubriqueId ?? null;

  // État pour gérer l'affichage de la carte d'exportation
  // Utilisé pour afficher une carte d'exportation après la publication d'un projet
  // Peut être utilisé pour afficher des options d'exportation ou de partage
  const [showExportCard, setShowExportCard] = useState(false);

  // Callback pour sélectionner un projet
  const handleSelect = (projectId: number) => {
    if (hasUnsavedChanges) {
      toast.error("Enregistrez ou annulez vos modifications avant de changer de projet.");
      return;
    }
    openProject(projectId);
  };

  // Callback pour ajouter un nouveau projet
  const handleConfirmNewProject = (projectId: number) => {
    openProject(projectId);
  };

  // Ajoute un nouveau projet
  const handleAdd = () => setCreateOpen(true);

  // Clone un projet
  // On crée un nouveau projet avec un ID unique et les mêmes mapItems
  // Le titre est suffixé par " (Clone)" pour le différencier
  // On met à jour la sélection du projet cloné
  // Note : on ne clone pas les détails du projet (gamme, description, etc.)
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

  // Supprimer un projet
  const handleDelete = (id: number) => {
    setProjects(projects.filter((x) => x.id !== id));
    setSelectedProjectId(projects.length > 1 ? projects[0].id : null);
  };

  // Publier un projet (pour l'instant, juste une alerte)
  const handlePublish = (id: number) => {
    setShowExportCard(true);
  };

  // Charger un projet (pour l'instant, juste une alerte)
  const handleLoad = () => setLoadOpen(true);

  // Les callbacks d'interaction MapModule
  const handleSelectMapItem = (id: number) => {
    // 🛑 Garde-fou : empêcher de changer de rubrique s'il y a des modifications non sauvegardées
    if (hasUnsavedChanges) {
      toast.error("Vous avez des modifications non sauvegardées dans la rubrique actuelle.");
      return;
    }

    // ✔️ Pas de changement en cours → on peut changer la sélection
    setSelectedMapItemId(id);
  };

  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  // 🚨 Rubrique courante non sauvegardée ?
  const hasUnsavedChanges =
    selectedRubriqueId !== null && getStatus(selectedRubriqueId) === "dirty";

  // Callback pour confirmer le projet chargé depuis le dialogue
  const handleConfirmLoadedProject = (project: ProjectDTO) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === project.id);

      return exists ? prev.map((p) => (p.id === project.id ? project : p)) : [project, ...prev];
    });

    openProject(project.id);
  };

  // Renommer un item de la map
  const handleRename = (itemId: number) => {
    setEditingItemId(itemId); // active le champ <input>
  };

  const handleRenameSave = (itemId: number, newTitle: string) => {
    setMapItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, title: newTitle } : item)),
    );
    setEditingItemId(null);
  };

  // Ajouter une nouvelle rubrique
  // Hypothèses existantes :
  // - masterMapId disponible
  // - mapItems = UI only
  // - mapRubriques = nouveau state à introduire

  const handleAddMapItem = async () => {
    if (!selectedProjectId || !currentMapId) {
      toast.error("Projet ou map indisponible.");
      return;
    }

    try {
      // Détermination du parent d'insertion
      const parentId = getInsertionParentId(mapRubriques, selectedMapItemId);

      // 1️⃣ Génération XML
      const xml = await prepareNewRubriqueXml({
        titre: "Nouvelle rubrique",
        projetId: selectedProjectId,
        type_dita: "topic",
        produitLabelOrAbbrev: selectedProduct?.abreviation ?? null,
      });

      // 2️⃣ Création Rubrique
      const rubrique = await createRubrique({
        titre: "Nouvelle rubrique",
        contenu_xml: xml,
        projet: selectedProjectId,
      });

      // 3️⃣ Attache à la map master (backend)
      await createMapRubrique(currentMapId, {
        rubrique: rubrique.id,
        parent: null,
      });

      // 4️⃣ 🔁 RECHARGEMENT STRUCTURE (source de vérité)
      const refreshed = await listMapRubriques(currentMapId);
      setMapRubriques(refreshed);

      // 5️⃣ Sélection logique
      const createdItem = refreshed.find((mr) => mr.rubrique.id === rubrique.id);

      if (createdItem) {
        setSelectedMapItemId(createdItem.id);
      }

      toast.success("Rubrique créée.");
    } catch (e) {
      console.error(e);
      toast.error("Échec de la création de la rubrique.");
    }
  };

  // Clone pour les items de la map
  const handleCloneMapItem = (id: number) => {
    const item = mapItems.find((i) => i.id === id);
    if (item) {
      const newId = Math.max(...mapItems.map((i) => i.id)) + 1;
      setMapItems([...mapItems, { ...item, id: newId, title: item.title + " (Clone)" }]);
      setSelectedMapItemId(newId);
    }
  };

  async function openProject(projectId: number) {
    if (hasUnsavedChanges) {
      toast.error("Enregistrez ou annulez vos modifications avant de changer de projet.");
      return;
    }

    // 1️⃣ Chercher dans le cache
    let project = projects.find((p) => p.id === projectId);

    // 2️⃣ Fallback API
    if (!project) {
      try {
        const res = await api.get(`/api/projets/${projectId}/`);
        const fetchedProject = res.data.project ?? res.data;

        // ⚠️ ici on sait que fetchedProject existe
        project = fetchedProject;

        setProjects((prev) => [...prev, fetchedProject]);
      } catch (e) {
        console.error(e);
        toast.error("Projet introuvable !");
        return;
      }
    }

    // À ce stade, project a été trouvé ou chargé
    if (!project) {
      // sécurité ultime, ne devrait jamais arriver
      toast.error("Projet introuvable !");
      return;
    }

    // 3️⃣ Store UNIQUE
    setSelectedProjectId(project.id);

    // 4️⃣ Maps
    setProjectMaps(project.maps ?? []);

    // 5️⃣ Reset contexte
    setCurrentMapId(null);
    setMapRubriques([]);
    setMapItems([]);
    setSelectedMapItemId(null);
  }

  async function openMap(mapId: number) {
    if (hasUnsavedChanges) {
      toast.error("Enregistrez ou annulez vos modifications avant de changer de map.");
      return;
    }

    setCurrentMapId(mapId);

    try {
      const rubriques = await listMapRubriques(mapId);
      setMapRubriques(rubriques);
      setSelectedMapItemId(null);
    } catch (e) {
      console.error(e);
      toast.error("Impossible de charger la map.");
    }
  }

  // Delete map item
  // On supprime l'item de la map et on réinitialise la sélection si nécessaire
  const handleDeleteMapItem = (id: number) => {
    setMapItems(mapItems.filter((i) => i.id !== id));
    setSelectedMapItemId(null);
  };
  const handleLoadMap = () => {
    if (hasUnsavedChanges) {
      toast.error("Enregistrez ou annulez vos modifications avant de charger une map.");
      return;
    }
    alert("Charger map");
  };

  // Indentation / Outdentation
  // Indentation augmente le niveau de la map, Outdentation le diminue
  // On ne peut pas indenter au-delà du niveau 2 (pour éviter les arborescences trop profondes)
  // On ne peut pas outdenter si on est déjà au niveau 1
  // On utilise l'index pour trouver l'élément à modifier
  // et on ajuste le niveau en conséquence
  const MAX_LEVEL = 2; // ou 3 si vous changez plus tard

  const handleIndent = (itemId: number) => {
    setMapItems((prev) =>
      prev.map((item, i, arr) => {
        if (item.id !== itemId) return item;

        // ⛔ Racine : jamais indentable
        if (item.isRoot) return item;

        // ⛔ Premier item (pas de parent possible)
        if (i === 0) return item;

        const prevItem = arr[i - 1];

        // ⛔ Impossible de devenir enfant de la racine si déjà niveau max
        const targetLevel = Math.min(item.level + 1, prevItem.level + 1);

        if (targetLevel > MAX_LEVEL) return item;

        return {
          ...item,
          level: targetLevel,
        };
      }),
    );
  };

  const MIN_LEVEL = 1;

  const handleOutdent = (itemId: number) => {
    setMapItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;

        // ⛔ Racine
        if (item.isRoot) return item;

        // ⛔ Déjà au niveau minimum
        if (item.level <= MIN_LEVEL) return item;

        return {
          ...item,
          level: item.level - 1,
        };
      }),
    );
  };

  // Expand/collapse handler
  const handleToggleExpand = (itemId: number, expand: boolean) => {
    setMapItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, expanded: expand } : item)),
    );
  };

  // Drag & drop reorder handler
  const handleReorder = (newItems: MapItem[]) => {
    const rootIndex = newItems.findIndex((i) => i.isRoot);

    // ⛔ Cas invalide (ne devrait jamais arriver)
    if (rootIndex === -1) return;

    // 🔒 On force la racine à rester en première position
    if (rootIndex !== 0) {
      const root = newItems[rootIndex];
      const withoutRoot = newItems.filter((i) => !i.isRoot);
      setMapItems([root, ...withoutRoot]);
      return;
    }

    setMapItems(newItems);
  };

  //Synchronisation des mapItems avec le projet sélectionné
  useEffect(() => {
    if (!selectedProjectId) {
      setMapRubriques([]);
      setMapItems([]);
      setSelectedMapItemId(null);
      return;
    }

    (async () => {
      try {
        const res = await api.get(`/api/projets/${selectedProjectId}/structure/`);

        const { map, structure } = res.data;

        setCurrentMapId(map.id);
        setMapRubriques(structure);

        console.group("[FLOW][LoadProject][structure]");
        console.log("projectId", selectedProjectId);
        console.log("response", res.data);
        console.groupEnd();
      } catch (e) {
        console.error(e);
        toast.error("Impossible de charger la structure du projet.");
      }
    })();
  }, [selectedProjectId]);

  // Synchronisation des mapItems avec les mapRubriques chargées
  useEffect(() => {
    if (mapRubriques.length === 0) {
      setMapItems([]);
      setSelectedMapItemId(null);
      return;
    }

    const items = mapRubriquesToMapItems(mapRubriques);
    setMapItems(items);
    setSelectedMapItemId(items[0]?.id ?? null);
  }, [mapRubriques]);

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
