import React, { useState } from "react";
import AddItemModal from "components/ui/AddItemModal";
import DataListPanel from "components/ui/DataListPanel";
import { Button } from "components/ui/button";
import { Plus } from "lucide-react";

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

  return (
    <>
      <div className="flex h-full">
        {/* Colonne gauche FIXE */}
        <div className="w-48 shrink-0 border-r p-2 space-y-2 pt-6 bg-orange-100">
          <Button
            variant={selectedItem === "gammes" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setSelectedItem("gammes")}
          >
            Gammes
          </Button>
          <Button
            variant={selectedItem === "produits" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setSelectedItem("produits")}
          >
            Produits
          </Button>
          <Button
            variant={selectedItem === "fonctionnalites" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setSelectedItem("fonctionnalites")}
          >
            Fonctionnalités
          </Button>
          <Button
            variant={selectedItem === "audiences" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setSelectedItem("audiences")}
          >
            Audiences
          </Button>
          <Button
            variant={selectedItem === "tags" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setSelectedItem("tags")}
          >
            Tags
          </Button>
          <Button
            variant={
              selectedItem === "profils_publication" ? "default" : "ghost"
            }
            className="w-full justify-start"
            onClick={() => setSelectedItem("profils_publication")}
          >
            Profils de publication
          </Button>
          <Button
            variant={selectedItem === "interface_ui" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setSelectedItem("interface_ui")}
          >
            Interface utilisateur
          </Button>
        </div>

        {/* Colonne droite */}
        <div className="flex-1 overflow-auto">
          <div className="flex justify-between items-center px-4">
            <h2 className="text-xl font-semibold">{getTitle()}</h2>
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
    </>
  );
};

export default DataTab;
