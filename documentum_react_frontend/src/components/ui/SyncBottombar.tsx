import React, { useState } from "react";
import { Button } from "components/ui/button";
import { Trash, Plus } from "lucide-react";
import { VerticalDragHandle } from "components/ui/VerticalDragHandle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog";
import { Input } from "components/ui/input";

interface Topic {
  id: number;
  title: string;
  status: string;
  version: string;
  assignee: string;
}

interface SyncBottombarProps {
  selectedFeatureName?: string;
  height: number;
  onResize: (newHeight: number) => void;
}

// Composant de la barre de séparation verticale pour le redimensionnement
export const SyncBottombar: React.FC<SyncBottombarProps> = ({
  selectedFeatureName = "-",
  height,
  onResize,
}) => {
  const MIN_HEIGHT = 200;
  const MAX_HEIGHT = 600;

  const handleResizeStart = (e: React.MouseEvent) => {
    const startY = e.clientY;
    const startHeight = height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientY - startY;
      const newHeight = Math.max(
        MIN_HEIGHT,
        Math.min(MAX_HEIGHT, startHeight - delta)
      );
      onResize(newHeight);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // États pour gérer l'ouverture des dialogues
  const [openDialog, setOpenDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [filterText, setFilterText] = useState("");

  // État pour stocker les sujets de documentation
  const [documentationTopics, setDocumentationTopics] = useState<Topic[]>([
    {
      id: 1,
      title: "Sujet 1",
      status: "À réviser",
      version: "1.0",
      assignee: "Jean Dupont",
    },
    {
      id: 2,
      title: "Sujet 2",
      status: "À jour",
      version: "1.1",
      assignee: "Marie Martin",
    },
    {
      id: 3,
      title: "Sujet 3",
      status: "En cours",
      version: "1.2",
      assignee: "Pierre Durand",
    },
  ]);

  // Rubriques disponibles pour la sélection
  const availableRubriques = [
    "Guide d'installation",
    "Procédure de réinitialisation",
    "Introduction au module Planning",
    "Rubrique générique de test",
    "Checklist post-installation",
  ];

  // Fonction pour mettre à jour le statut d'un sujet de documentation
  const handleUpdateStatus = (id: number, action: "actualiser" | "a_jour") => {
    setDocumentationTopics((prev) =>
      prev.map((topic) => {
        if (topic.id !== id) return topic;

        if (action === "actualiser" && topic.status === "À jour") {
          return { ...topic, status: "À réviser" };
        }

        if (
          action === "a_jour" &&
          (topic.status === "À réviser" || topic.status === "En cours")
        ) {
          return { ...topic, status: "À jour" };
        }

        return topic;
      })
    );
  };

  // Fonction pour supprimer un sujet de documentation
  const handleDeleteTopic = (id: number) => {
    setDocumentationTopics((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((topic) => topic.id !== id);
    });
  };

  // État pour gérer l'ouverture du modal de consultation
  const handleOpenModal = (topic: Topic) => {
    setCurrentTopic(topic);
    setOpenDialog(true);
  };

  // État pour gérer l'ouverture du dialogue d'ajout de rubrique
  const handleAddSelectedRubrique = (rubrique: string) => {
    const nextId = documentationTopics.length
      ? Math.max(...documentationTopics.map((t) => t.id)) + 1
      : 1;
    const newTopic: Topic = {
      id: nextId,
      title: rubrique,
      status: "À réviser",
      version: "1.0",
      assignee: "Non assigné",
    };
    setDocumentationTopics((prev) => [...prev, newTopic]);
    setOpenAddDialog(false);
    setFilterText("");
  };

  const filteredRubriques = availableRubriques.filter((r) =>
    r.toLowerCase().includes(filterText.toLowerCase())
  );

  // Fonction pour ajouter un nouveau sujet de documentation
  const handleAddNewTopic = () => {
    const nextId = documentationTopics.length
      ? Math.max(...documentationTopics.map((t) => t.id)) + 1
      : 1;
    const newTopic: Topic = {
      id: nextId,
      title: `Nouvelle rubrique ${nextId}`,
      status: "À réviser",
      version: "1.0",
      assignee: "Non assigné",
    };
    setDocumentationTopics((prev) => [...prev, newTopic]);
  };

  return (
    <div
      className="border-t border-gray-300 bg-white flex flex-col overflow-hidden"
      style={{ height, minHeight: "200px", maxHeight: "600px" }}
    >
      <VerticalDragHandle onResizeStart={handleResizeStart} />
      <div className="overflow-auto px-4 pt-2 flex-1 h-full">
        <h2 className="text-xl font-bold mb-2">Sujets de documentation</h2>
        <Button
          variant="ghost"
          className="w-8 h-8 p-0 flex items-center justify-center"
          title="Lier une nouvelle documentation"
        >
          <Plus
            className="w-6 h-6 transition hover:scale-110 hover:text-blue-700"
            strokeWidth={2.5}
            onClick={() => setOpenAddDialog(true)}
          />
        </Button>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Fonctionnalité</th>
              <th className="border p-2 w-[500px]">Titre</th>
              <th className="border p-2">Statut</th>
              <th className="border p-2">Version</th>
              <th className="border p-2">Assigné à</th>
              <th className="border p-2 w-[400px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documentationTopics.map((topic) => (
              <tr key={topic.id} className="group">
                <td className="border p-2">{selectedFeatureName}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleOpenModal(topic)}
                    className="text-blue-600 hover:underline"
                  >
                    {topic.title}
                  </button>
                </td>
                <td className="border p-2 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      topic.status === "À réviser"
                        ? "bg-orange-200 text-orange-800"
                        : topic.status === "À jour"
                        ? "bg-green-200 text-green-800"
                        : topic.status === "En cours"
                        ? "bg-blue-200 text-blue-800"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {topic.status}
                  </span>
                </td>
                <td className="border p-2 text-center">{topic.version}</td>
                <td className="border p-2 text-center">
                  {topic.status !== "À jour" ? (
                    <select className="text-sm border rounded p-1">
                      <option>Jean Dupont</option>
                      <option>Marie Martin</option>
                      <option>Pierre Durand</option>
                    </select>
                  ) : (
                    topic.assignee
                  )}
                </td>
                <td className="border p-2 text-center">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="px-4 py-2 text-sm hover:bg-orange-100 hover:text-orange-800"
                      onClick={() => handleUpdateStatus(topic.id, "actualiser")}
                    >
                      À actualiser
                    </Button>
                    <Button
                      variant="outline"
                      className="px-4 py-2 text-sm hover:bg-green-100 hover:text-green-800"
                      onClick={() => handleUpdateStatus(topic.id, "a_jour")}
                    >
                      Marquer comme à jour
                    </Button>
                    {documentationTopics.length > 1 && (
                      <Button
                        variant="ghost"
                        className="ml-10 opacity-0 text-gray-800 group-hover:opacity-100 transition-opacity duration-200"
                        title="Supprimer le lien avec la documentation"
                        onClick={() => handleDeleteTopic(topic.id)}
                      >
                        <Trash className="w-6 h-6" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Prévisualisation : {currentTopic?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 text-sm overflow-y-auto h-full">
            <p>
              Ceci est une prévisualisation simulée de la documentation
              <strong> "{currentTopic?.title}"</strong>.<br />
              Vous pourrez plus tard intégrer ici un rendu XML ou TipTap en
              lecture seule.
            </p>
            <p className="mt-4 text-gray-500 text-xs">
              (Version : {currentTopic?.version} – Statut :{" "}
              {currentTopic?.status})
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sélectionner une rubrique à lier</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Rechercher une rubrique..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="my-2"
          />
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredRubriques.length > 0 ? (
              filteredRubriques.map((rubrique, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAddSelectedRubrique(rubrique)}
                >
                  {rubrique}
                </Button>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">
                Aucune rubrique trouvée.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
