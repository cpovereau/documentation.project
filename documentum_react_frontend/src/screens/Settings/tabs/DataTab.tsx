import React, { useState } from "react";
import { ImportModal } from "components/ui/import-modal";
import AddItemModal from "components/ui/AddItemModal";
import DataListPanel from "components/ui/DataListPanel";
import { Button } from "components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "lib/utils";

const initialGammes = [
  {
    id: 1,
    nom: "Planning",
    description: "Module de planification",
    is_archived: false,
  },
  {
    id: 2,
    nom: "Usager",
    description: "Gestion des utilisateurs",
    is_archived: true,
  },
];

const initialProduits = [
  {
    id: 1,
    nom: "PLA",
    description: "Produit Planning",
    gamme: "Planning",
    is_archived: false,
  },
  {
    id: 2,
    nom: "USA",
    description: "Produit Usager",
    gamme: "Usager",
    is_archived: false,
  },
];

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

  const [gammes, setGammes] = useState(initialGammes);
  const [produits, setProduits] = useState(initialProduits);
  const [fonctionnalites, setFonctionnalites] = useState(
    initialFonctionnalites
  );
  const [audiences, setAudiences] = useState(initialAudiences);
  const [tags, setTags] = useState(initialTags);
  const [profils, setProfils] = useState(initialProfils);
  const [interfaceItems, setInterfaceItems] = useState(initialInterface);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAdd = () => {
    setIsModalOpen(true);
  };

  const handleArchive = (id: number) => {
    const updateItem = (items: any[]) =>
      items.map((item) =>
        item.id === id ? { ...item, is_archived: !item.is_archived } : item
      );

    switch (selectedItem) {
      case "gammes":
        setGammes((prev) => updateItem(prev));
        break;
      case "produits":
        setProduits((prev) => updateItem(prev));
        break;
      case "fonctionnalites":
        setFonctionnalites((prev) => updateItem(prev));
        break;
      case "audiences":
        setAudiences((prev) => updateItem(prev));
        break;
      case "tags":
        setTags((prev) => updateItem(prev));
        break;
      case "profils_publication":
        setProfils((prev) => updateItem(prev));
        break;
      case "interface_ui":
        setInterfaceItems((prev) => updateItem(prev));
        break;
    }
  };

  const filterItems = (items: any[]) =>
    items.filter((i) => i.is_archived === showArchived);

  const getTitle = () => {
    switch (selectedItem) {
      case "gammes":
        return "Gammes";
      case "produits":
        return "Produits";
      case "fonctionnalites":
        return "Fonctionnalités";
      case "audiences":
        return "Audiences";
      case "tags":
        return "Tags";
      case "profils_publication":
        return "Profils de publication";
      case "interface_ui":
        return "Interface utilisateur";
      default:
        return "";
    }
  };

  const getItems = () => {
    switch (selectedItem) {
      case "gammes":
        return filterItems(gammes);
      case "produits":
        return filterItems(produits);
      case "fonctionnalites":
        return filterItems(fonctionnalites);
      case "audiences":
        return filterItems(audiences);
      case "tags":
        return filterItems(tags);
      case "profils_publication":
        return filterItems(profils);
      case "interface_ui":
        return filterItems(interfaceItems);
      default:
        return [];
    }
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
          { key: "gamme", label: "Gamme associée" },
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
          { key: "type", label: "Type" },
          { key: "description", label: "Description" },
        ];
      default:
        return [];
    }
  };

  const [isImportOpen, setIsImportOpen] = useState(false);

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
        onSubmit={(item) => {
          switch (selectedItem) {
            case "gammes":
              setGammes((prev) => [...prev, item]);
              break;
            case "produits":
              setProduits((prev) => [...prev, item]);
              break;
            case "fonctionnalites":
              setFonctionnalites((prev) => [...prev, item]);
              break;
            case "audiences":
              setAudiences((prev) => [...prev, item]);
              break;
            case "tags":
              setTags((prev) => [...prev, item]);
              break;
            case "profils_publication":
              setProfils((prev) => [...prev, item]);
              break;
            case "interface_ui":
              setInterfaceItems((prev) => [...prev, item]);
              break;
          }
        }}
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
