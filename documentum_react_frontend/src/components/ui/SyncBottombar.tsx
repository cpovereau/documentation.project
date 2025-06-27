import React, { useState } from "react";
import { Button } from "components/ui/button";

interface Topic {
  id: number;
  title: string;
  status: string;
  version: string;
  assignee: string;
}

interface SyncBottombarProps {
  selectedFeatureName?: string;
}

export const SyncBottombar: React.FC<SyncBottombarProps> = ({
  selectedFeatureName = "-",
}) => {
  const [height, setHeight] = useState(200);
  const [isResizing, setIsResizing] = useState(false);

  const documentationTopics: Topic[] = [
    {
      id: 1,
      title: "Sujet 1",
      status: "\u00c0 r\u00e9viser",
      version: "1.0",
      assignee: "Jean Dupont",
    },
    {
      id: 2,
      title: "Sujet 2",
      status: "\u00c0 jour",
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

  const startResize = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsResizing(true);
    const startY = e.clientY;
    const startHeight = height;

    const onMouseMove = (e: MouseEvent) => {
      const newHeight = startHeight - (startY - e.clientY);
      if (newHeight >= 100 && newHeight <= 600) {
        setHeight(newHeight);
      }
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="border-t border-gray-300 bg-white">
      <div
        className="h-2 cursor-row-resize bg-gray-100 flex items-center justify-center"
        onMouseDown={startResize}
      >
        <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
      </div>
      <div
        className="overflow-auto px-4 pt-2 pb-4"
        style={{ height: `${height}px` }}
      >
        <h2 className="text-xl font-bold mb-4">Sujets de documentation</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Fonctionnalit\u00e9</th>
              <th className="border p-2">Titre</th>
              <th className="border p-2">Statut</th>
              <th className="border p-2">Version</th>
              <th className="border p-2">Assign\u00e9 \u00e0</th>
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
                      topic.status === "\u00c0 r\u00e9viser"
                        ? "bg-orange-200 text-orange-800"
                        : topic.status === "\u00c0 jour"
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
                    Termin\u00e9
                  </Button>
                  <Button size="sm" variant="outline">
                    Marquer comme \u00e0 jour
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
