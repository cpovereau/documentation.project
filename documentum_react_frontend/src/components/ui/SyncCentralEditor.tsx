import React, { useRef } from "react";
import { Button } from "components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";

interface SyncCentralEditorProps {
  selectedFeature: number | null;
  features: { id: number; name: string; needsUpdate: boolean }[];
  isRightSidebarExpanded: boolean;
}

export const SyncCentralEditor: React.FC<SyncCentralEditorProps> = ({
  selectedFeature,
  features,
  isRightSidebarExpanded,
}) => {
  const editableRef = useRef<HTMLDivElement>(null);
  const documentationTopics = [
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
  ];

  return (
    <div
      className="flex flex-col bg-white overflow-hidden transition-all duration-300 ease-in-out"
      style={{
        width: isRightSidebarExpanded ? "calc(100% - 248px)" : "100%",
      }}
    >
      {/* Upper Section */}
      <div className="flex-grow p-6 overflow-auto">
        <div className="mb-4 flex items-center space-x-2">
          <Button>Ajouter un correctif / évolution</Button>
          <Button variant="outline">Gras</Button>
          <Button variant="outline">Italique</Button>
          <Button variant="outline">Souligné</Button>
          <Button variant="outline">Couleur</Button>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Taille de police" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Petit</SelectItem>
              <SelectItem value="medium">Moyen</SelectItem>
              <SelectItem value="large">Grand</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div
          ref={editableRef}
          contentEditable
          suppressContentEditableWarning
          className="border p-4 h-64 overflow-auto"
        >
          {/* Pas de {children}, on laisse vide ou du contenu brut ici */}
        </div>
      </div>

      {/* Lower Section (Bottom Bar) */}
      <div className="border-t border-gray-200">
        <div className="flex items-center justify-center cursor-ns-resize h-2 bg-gray-100">
          <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
        </div>
        <div className="p-4 overflow-x-auto">
          <h2 className="text-xl font-bold mb-4">Sujets de documentation</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Fonctionnalité</th>
                <th className="border p-2">Titre du sujet</th>
                <th className="border p-2">Statut</th>
                <th className="border p-2">Version du produit</th>
                <th className="border p-2">Assigné à</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documentationTopics.map((topic) => (
                <tr key={topic.id}>
                  <td className="border p-2">
                    {selectedFeature
                      ? features.find((f) => f.id === selectedFeature)?.name
                      : "-"}
                  </td>
                  <td className="border p-2">
                    <a href="#" className="text-blue-600 hover:underline">
                      {topic.title}
                    </a>
                  </td>
                  <td className="border p-2">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
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
                  <td className="border p-2">{topic.version}</td>
                  <td className="border p-2">{topic.assignee}</td>
                  <td className="border p-2">
                    <Button size="sm" variant="outline" className="mr-2">
                      Terminé
                    </Button>
                    <Button size="sm" variant="outline">
                      Marquer comme à jour
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
