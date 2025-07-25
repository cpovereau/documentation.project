import { useState, useEffect } from "react";
import { ImportModal } from "components/ui/import-modal";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";
import { getArchivableHooks, resourceLabels } from "@/hooks/useArchivableList";
import { toggleArchivableResource } from "@/lib/resources";
import AddItemModal from "components/ui/AddItemModal";
import DataListPanel from "components/ui/DataListPanel";
import { Button } from "components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "lib/utils";

const initialFonctionnalites = [
  {
    id: 1,
    nom: "Menu Principal",
    id_fonctionnalite: "MEN",
    produit: "PLA",
    is_archived: false,
  },
  {
    id: 2,
    nom: "Traitement",
    id_fonctionnalite: "TRA",
    produit: "USA",
    is_archived: false,
  },
];

const initialAudiences = [
  {
    id: 1,
    nom: "Utilisateurs avancés",
    description: "Fonctionnalités expertes",
    is_archived: false,
  },
  {
    id: 2,
    nom: "Débutants",
    description: "Fonctions simples",
    is_archived: false,
  },
];

const initialTags = [
  { id: 1, nom: "Important", is_archived: false },
  { id: 2, nom: "À vérifier", is_archived: false },
];

const initialProfils = [
  { id: 1, nom: "Export PDF", type_sortie: "PDF", is_archived: false },
  { id: 2, nom: "Export Moodle", type_sortie: "Moodle", is_archived: false },
];

const initialInterface = [
  {
    id: 1,
    nom: "Bouton Valider",
    type: "Bouton",
    description: "Validation formulaire",
    is_archived: false,
  },
  {
    id: 2,
    nom: "Écran Connexion",
    type: "Écran",
    description: "Connexion utilisateur",
    is_archived: false,
  },
];

const DataTab = () => {
  const [selectedItem, setSelectedItem] = useState<
    | "gammes"
    | "produits"
    | "fonctionnalites"
    | "audiences"
    | "tags"
    | "profils_publication"
    | "interface_ui"
  >("gammes");

  const [showArchived, setShowArchived] = useState(false);

  const hooks = getArchivableHooks(selectedItem, showArchived);
  const currentHook = hooks[selectedItem];
  const items = currentHook?.items ?? [];
  const toggleArchive = currentHook?.toggleArchive;
  const refetch = currentHook?.refetch;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAdd = () => {
    setIsModalOpen(true);
  };

  const handleCreate = async (item: any) => {
    if (!currentHook) return;
    try {
      await api.post(`/${selectedItem}/`, item, { withCredentials: true });
      await currentHook.refetch();
      toast.success(`${resourceLabels[selectedItem]} ajouté avec succès.`);
    } catch (err: any) {
      console.error("Erreur lors de l'ajout :", err);
      toast.error("Erreur lors de la création.");
    }
  };

  const handleArchive = async (id: number, isArchived: boolean) => {
    if (!currentHook) return;

    try {
      await currentHook.toggleArchive(id, isArchived);
    } catch (err: any) {
      console.error("Erreur archivage:", err);
      toast.error(err.message || "Erreur lors de l'archivage/restauration.");
    }
  };

  const filterItems = (items: any[]) =>
    items.filter((i) => i.is_archived === showArchived);

  const getTitle = () => {
    return resourceLabels[selectedItem] ?? "";
  };

  const getItems = () => {
    return currentHook?.items ?? [];
  };

  const getColumns = () => {
    switch (selectedItem) {
      case "gammes":
        return [
          { key: "nom", label: "Nom" },
          { key: "description", label: "Description" },
        ];
      case "produits":
        return [
          { key: "nom", label: "Nom" },
          { key: "description", label: "Description" },
          { key: "gamme_nom", label: "Gamme associée" },
        ];
      case "fonctionnalites":
        return [
          { key: "nom", label: "Nom" },
          { key: "id_fonctionnalite", label: "ID" },
          { key: "produit", label: "Produit" },
        ];
      case "audiences":
        return [
          { key: "nom", label: "Nom" },
          { key: "description", label: "Description" },
        ];
      case "tags":
        return [{ key: "nom", label: "Nom" }];
      case "profils_publication":
        return [
          { key: "nom", label: "Nom" },
          { key: "type_sortie", label: "Type de sortie" },
        ];
      case "interface_ui":
        return [
          { key: "nom", label: "Nom" },
          { key: "code", label: "Code" },
        ];
      default:
        return [];
    }
  };

  const [isImportOpen, setIsImportOpen] = useState(false);

  useEffect(() => {
    api
      .get("/gammes/", { params: { archived: false } })
      .then((res) => {
        console.log("✅ [init] Gammes préchargées :", res.data);
      })
      .catch((err) => {
        console.error("❌ [init] Erreur API /gammes/ :", err);
      });
  }, []);

  return (
    <>
      <div className="flex h-full">
        {/* Colonne gauche FIXE */}
        <div className="w-48 shrink-0 p-2 space-y-2 pt-6 bg-orange-100">
          <Button
            onClick={() => setSelectedItem("gammes")}
            variant={selectedItem === "gammes" ? "default" : "ghost"}
            className={cn(
              "w-full text-left justify-start px-3 py-2 rounded font-medium text-sm",
              selectedItem === "gammes"
                ? "bg-white text-orange-600 shadow"
                : "hover:bg-orange-200 text-gray-700"
            )}
          >
            Gammes
          </Button>
          <Button
            onClick={() => setSelectedItem("produits")}
            variant={selectedItem === "produits" ? "default" : "ghost"}
            className={cn(
              "w-full text-left justify-start px-3 py-2 rounded font-medium text-sm",
              selectedItem === "produits"
                ? "bg-white text-orange-600 shadow"
                : "hover:bg-orange-200 text-gray-700"
            )}
          >
            Produits
          </Button>
          <Button
            onClick={() => setSelectedItem("fonctionnalites")}
            variant={selectedItem === "fonctionnalites" ? "default" : "ghost"}
            className={cn(
              "w-full text-left justify-start px-3 py-2 rounded font-medium text-sm",
              selectedItem === "fonctionnalites"
                ? "bg-white text-orange-600 shadow"
                : "hover:bg-orange-200 text-gray-700"
            )}
          >
            Fonctionnalités
          </Button>
          <Button
            onClick={() => setSelectedItem("audiences")}
            variant={selectedItem === "audiences" ? "default" : "ghost"}
            className={cn(
              "w-full text-left justify-start px-3 py-2 rounded font-medium text-sm",
              selectedItem === "audiences"
                ? "bg-white text-orange-600 shadow"
                : "hover:bg-orange-200 text-gray-700"
            )}
          >
            Audiences
          </Button>
          <Button
            onClick={() => setSelectedItem("tags")}
            variant={selectedItem === "tags" ? "default" : "ghost"}
            className={cn(
              "w-full text-left justify-start px-3 py-2 rounded font-medium text-sm",
              selectedItem === "tags"
                ? "bg-white text-orange-600 shadow"
                : "hover:bg-orange-200 text-gray-700"
            )}
          >
            Tags
          </Button>
          <Button
            onClick={() => setSelectedItem("profils_publication")}
            variant={
              selectedItem === "profils_publication" ? "default" : "ghost"
            }
            className={cn(
              "w-full text-left justify-start px-3 py-2 rounded font-medium text-sm",
              selectedItem === "profils_publication"
                ? "bg-white text-orange-600 shadow"
                : "hover:bg-orange-200 text-gray-700"
            )}
          >
            Profils de publication
          </Button>
          <Button
            onClick={() => setSelectedItem("interface_ui")}
            variant={selectedItem === "interface_ui" ? "default" : "ghost"}
            className={cn(
              "w-full text-left justify-start px-3 py-2 rounded font-medium text-sm",
              selectedItem === "interface_ui"
                ? "bg-white text-orange-600 shadow"
                : "hover:bg-orange-200 text-gray-700"
            )}
          >
            Interface utilisateur
          </Button>
        </div>

        {/* Colonne droite */}
        <div className="flex-1 overflow-auto">
          <div className="flex justify-between items-center px-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">{getTitle()}</h2>
              {selectedItem === "fonctionnalites" && (
                <div className="flex justify-end mt-3">
                  <Button
                    className={cn(
                      "px-3 text-sm font-medium bg-orange-500 text-white hover:bg-orange-600"
                    )}
                    onClick={() => setIsImportOpen(true)}
                  >
                    Importer
                  </Button>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              onClick={handleAdd}
              title={`Ajouter ${getTitle().toLowerCase()}`}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          <DataListPanel
            title={getTitle()}
            items={getItems()}
            columns={getColumns()}
            onAdd={handleAdd}
            onArchive={handleArchive}
            archived={showArchived}
            onToggleArchived={setShowArchived}
          />
        </div>
      </div>
      <AddItemModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        itemType={selectedItem}
        onSubmit={handleCreate}
        gammes={hooks["gammes"]?.items ?? []}
        produits={hooks["produits"]?.items ?? []}
      />
      {selectedItem === "fonctionnalites" && (
        <ImportModal
          open={isImportOpen}
          title="Importer des fonctionnalités"
          onClose={() => setIsImportOpen(false)}
          onNext={(file) => {
            console.log("Fichier à importer :", file);
            setIsImportOpen(false);
          }}
        />
      )}
    </>
  );
};

export default DataTab;
