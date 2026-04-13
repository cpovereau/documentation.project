// =====================================================
// 📂 Fichier : DataTab.tsx
// 🔎 Description : Onglet "Données" des Paramètres
// 🗣️ Tous les commentaires doivent être écrits en français.
// =====================================================

import { useState, useEffect } from "react";
import { useAllDictionnaireData } from "@/hooks/useAllDictionnaireData";
import api from "@/lib/apiClient";
import { useImportModal } from "@/hooks/useImportModal";
import { toast } from "sonner";
import { useArchivableHooks, resourceLabels } from "@/hooks/useArchivableList";
import AddItemModal from "components/ui/AddItemModal";
import DataListPanel from "components/ui/DataListPanel";
import { Button } from "components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "lib/utils";

// Composant principal pour l'onglet "Données"
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
  const [editMode, setEditMode] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const hooks = useArchivableHooks(selectedItem, showArchived);
  const currentHook = hooks[selectedItem];

  const { openImportModal } = useImportModal();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAdd = () => {
    setIsModalOpen(true);
  };

  // Délègue la création au hook — gère le bon endpoint et le refetch
  const handleCreate = async (item: any) => {
    if (!currentHook) return;
    try {
      await currentHook.create(item);
      toast.success(`${resourceLabels[selectedItem]} ajouté avec succès.`);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création.");
    }
  };

  // Délègue l'archivage/restauration au hook
  const handleArchive = async (id: number, isArchived: boolean) => {
    if (!currentHook) return;
    try {
      await currentHook.toggleArchive(id, isArchived);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'archivage/restauration.");
    }
  };

  // Titre affiché dans l'entête du panneau
  const getTitle = () => {
    return resourceLabels[selectedItem] ?? "";
  };

  // Éléments de la liste pour la ressource active
  const getItems = () => {
    return currentHook?.items ?? [];
  };

  // Colonnes du tableau selon la ressource active
  const getColumns = () => {
    switch (selectedItem) {
      case "gammes":
      case "audiences":
        return [
          { key: "nom", label: "Nom" },
          { key: "description", label: "Description" },
        ];
      case "produits":
        return [
          { key: "nom", label: "Nom" },
          { key: "abreviation", label: "Abrév." },
          { key: "description", label: "Description" },
          { key: "gamme_nom", label: "Gamme associée" },
        ];
      case "fonctionnalites":
        return [
          { key: "nom", label: "Nom" },
          { key: "id_fonctionnalite", label: "Id Associée" },
          { key: "produit_nom", label: "Produit" },
          { key: "code", label: "Code" },
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

  // Vérifie si des actions doivent être affichées (bouton Modifier, Importer, etc.)
  const shouldShowActions = selectedItem !== "profils_publication";

  // Bouton Modifier pour les éléments qui peuvent être modifiés
  const editButton = shouldShowActions && (
    <Button
      className={cn(
        "mt-3 px-3 text-sm font-medium bg-blue-500 text-white hover:bg-blue-600"
      )}
      title="Modifier les libellés Nom, Description, Code ou Abréviation uniquement"
      onClick={() => setEditMode(!editMode)}
    >
      {editMode ? "Annuler" : "Modifier"}
    </Button>
  );

  // Bouton Ajouter pour ajouter un nouvel élément
  const addButton = shouldShowActions && (
    <Button
      variant="ghost"
      onClick={handleAdd}
      title={`Ajouter ${getTitle().toLowerCase()}`}
    >
      <Plus className="w-5 h-5" />
    </Button>
  );

  // Données dictionnaire centralisées (gammes et produits pour les modales de création)
  const { data: allData, refetch: refetchAllData } = useAllDictionnaireData();

  // Bouton Importer pour les fonctionnalités
  const importButton = selectedItem === "fonctionnalites" && (
    <div className="flex justify-end mt-3">
      <Button
        className={cn(
          "px-3 text-sm font-medium bg-orange-500 text-white hover:bg-orange-600"
        )}
        onClick={() =>
          openImportModal({
            context: "fonctionnalites",
            produits: allData.produits,
            title: "Importer des fonctionnalités",
            onConfirm: async ({ file, mapping, produitId, skipHeader }) => {
              const form = new FormData();
              form.append("file", file);
              form.append("mapping", JSON.stringify(mapping));
              form.append("produit", produitId.toString());
              form.append("skip_header", skipHeader ? "true" : "false");

              await api.post("/import/fonctionnalites/", form);
              toast.success("Import terminé !");
              await currentHook.refetch();
            },
          })
        }
      >
        Importer
      </Button>
    </div>
  );

  // Réinitialise le mode édition quand on change d'onglet
  useEffect(() => {
    setEditMode(false);
  }, [selectedItem]);

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
          {/* Zone entête au-dessus du tableau */}
          <div className="flex justify-between items-center px-4 py-2">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">{getTitle()}</h2>
              {editButton}
              {importButton}
            </div>
            {addButton}
          </div>
          <DataListPanel
            title={getTitle()}
            items={getItems()}
            columns={getColumns()}
            onAdd={handleAdd}
            onArchive={handleArchive}
            archived={showArchived}
            onToggleArchived={setShowArchived}
            editable={editMode}
            onUpdate={async (id, changes) => {
              // Délègue la mise à jour au hook — gère le bon endpoint et le refetch
              try {
                await currentHook.update(id, changes);
                toast.success("Élément mis à jour.");
              } catch (err: any) {
                toast.error(err.message || "Erreur lors de la mise à jour.");
              }
            }}
          />
        </div>
      </div>
      <AddItemModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        itemType={selectedItem}
        onSubmit={handleCreate}
        gammes={allData.gammes}
        produits={allData.produits}
      />
    </>
  );
};

export default DataTab;
