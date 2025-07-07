import React from "react";
import { Button } from "components/ui/button";
import { VerticalDragHandle } from "components/ui/VerticalDragHandle";

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

export const SyncBottombar: React.FC<SyncBottombarProps> = ({
  selectedFeatureName = "-",
  height,
  onResize,
}) => {
  const MIN_HEIGHT = 120;
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

  const documentationTopics: Topic[] = [
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
      className="border-t border-gray-300 bg-white flex flex-col overflow-hidden"
      style={{
        height,
        minHeight: "120px", // Pour respecter le comportement de ResizeHandle
        maxHeight: "600px",
      }}
    >
      <VerticalDragHandle onResizeStart={handleResizeStart} />
      <div className="overflow-auto px-4 pt-2 flex-1 h-full">
        <h2 className="text-xl font-bold mb-4">Sujets de documentation</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Fonctionnalité</th>
              <th className="border p-2">Titre</th>
              <th className="border p-2">Statut</th>
              <th className="border p-2">Version</th>
              <th className="border p-2">Assigné à</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documentationTopics.map((topic) => (
              <tr key={topic.id}>
                <td className="border p-2">{selectedFeatureName}</td>
                <td className="border p-2">
                  <a href="#" className="text-blue-600 hover:underline">
                    {topic.title}
                  </a>
                </td>
                <td className="border p-2">
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
  );
};
