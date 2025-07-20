import React, { useState, useMemo, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

interface TaskNode {
  id: string;
  label: string;
}

interface ImpactMapGraphProps {
  onGenerateTestPlan?: (tasks: TaskNode[]) => void;
}

/**
 * Ce composant affiche une carte mentale simulée pour l'arbre d'impact d'une version.
 * L'utilisateur peut sélectionner les rubriques de type `task` pour construire un plan de test.
 * Les fonctionnalités sans `task` sont surlignées.
 */

const initialNodes: Node[] = [
  {
    id: "1",
    position: { x: 0, y: 100 },
    data: { label: "Fonctionnalité A", type: "feature" },
    type: "default",
  },
  {
    id: "2",
    position: { x: 200, y: 0 },
    data: { label: "Rubrique : Connexion (task)", type: "task", parent: "1" },
    type: "default",
  },
  {
    id: "3",
    position: { x: 200, y: 200 },
    data: {
      label: "Rubrique : Sécurité (concept)",
      type: "concept",
      parent: "1",
    },
    type: "default",
  },
  {
    id: "4",
    position: { x: 450, y: 100 },
    data: { label: "Fonctionnalité B", type: "feature" },
    type: "default",
  },
  {
    id: "5",
    position: { x: 650, y: 0 },
    data: { label: "Rubrique : Export PDF (task)", type: "task", parent: "4" },
    type: "default",
  },
  {
    id: "6",
    position: { x: 650, y: 200 },
    data: {
      label: "Rubrique : Liens externes (reference)",
      type: "reference",
      parent: "4",
    },
    type: "default",
  },
  {
    id: "7",
    position: { x: 0, y: 350 },
    data: { label: "Fonctionnalité C (sans task)", type: "feature" },
    type: "default",
  },
  {
    id: "8",
    position: { x: 200, y: 350 },
    data: {
      label: "Rubrique : Préambule (concept)",
      type: "concept",
      parent: "7",
    },
    type: "default",
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e1-3", source: "1", target: "3", animated: true },
  { id: "e1-4", source: "1", target: "4", animated: false },
  { id: "e4-5", source: "4", target: "5", animated: true },
  { id: "e4-6", source: "4", target: "6", animated: true },
  { id: "e7-8", source: "7", target: "8", animated: false },
];

export const ImpactMapGraph: React.FC<ImpactMapGraphProps> = ({
  onGenerateTestPlan,
}) => {
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    if (node.data.type !== "task") return;
    setSelectedTaskIds((prev) =>
      prev.includes(node.id)
        ? prev.filter((id) => id !== node.id)
        : [...prev, node.id]
    );
  };

  const featureHasTask: Record<string, boolean> = useMemo(() => {
    const map: Record<string, boolean> = {};
    nodes.forEach((n) => {
      if (n.data.type === "feature") map[n.id] = false;
    });
    nodes.forEach((n) => {
      if (n.data.type === "task" && n.data.parent) {
        map[n.data.parent] = true;
      }
    });
    return map;
  }, [nodes]);

  const styledNodes = nodes.map((node) => {
    let style: React.CSSProperties = {
      border: "1px solid #ccc",
      padding: 8,
      borderRadius: 6,
    };

    if (node.data.type === "task") {
      if (selectedTaskIds.includes(node.id)) {
        style = {
          ...style,
          backgroundColor: "#fff3cd",
          border: "2px solid #f0ad4e",
        };
      }
    } else if (node.data.type === "feature") {
      if (!featureHasTask[node.id]) {
        style = {
          ...style,
          border: "2px dashed red",
          backgroundColor: "#ffe6e6",
        };
      }
    }

    return {
      ...node,
      style,
    };
  });

  const selectedTasks = nodes.filter(
    (n) => selectedTaskIds.includes(n.id) && n.data.type === "task"
  );

  const orphanFeatures = nodes.filter(
    (n) => n.data.type === "feature" && !featureHasTask[n.id]
  );

  const allTaskIds = nodes
    .filter((n) => n.data.type === "task")
    .map((n) => n.id);

  const handleGenerateClick = () => {
    const payload: TaskNode[] = selectedTasks.map((t) => ({
      id: t.id,
      label: t.data.label,
    }));
    if (payload.length > 0 && onGenerateTestPlan) {
      onGenerateTestPlan(payload);
    }
  };

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={styledNodes}
        edges={edges}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background color="#f5f5f5" gap={16} />
        <Controls position="bottom-right" />
      </ReactFlow>

      <div className="absolute bottom-6 left-6 max-w-xs bg-white border shadow-lg rounded-md p-4 text-sm z-50">
        {selectedTasks.length < allTaskIds.length && (
          <button
            onClick={() => setSelectedTaskIds(allTaskIds)}
            className="mb-3 text-sm text-blue-600 hover:underline"
          >
            Sélectionner toutes les tâches
          </button>
        )}

        <p className="font-semibold mb-2">Tâches sélectionnées :</p>
        <ul className="list-disc list-inside text-gray-700 mb-3">
          {selectedTasks.map((t) => (
            <li key={t.id}>{t.data.label}</li>
          ))}
          {selectedTasks.length === 0 && (
            <li className="italic text-gray-400">Aucune</li>
          )}
        </ul>

        <p className="font-semibold mb-2">
          Fonctionnalités sans tâches descript. :
        </p>
        <ul className="list-disc list-inside text-red-600 mb-3">
          {orphanFeatures.map((f) => (
            <li key={f.id}>{f.data.label}</li>
          ))}
          {orphanFeatures.length === 0 && (
            <li className="italic text-gray-400">Aucune</li>
          )}
        </ul>

        {selectedTasks.length > 0 && (
          <button
            onClick={handleGenerateClick}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Générer le plan de test
          </button>
        )}
      </div>
    </div>
  );
};
