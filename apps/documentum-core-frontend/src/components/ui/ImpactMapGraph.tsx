import React, { useState, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { useImpactList } from "@/hooks/useImpactDocumentaire";
import type { StatutImpact } from "@/api/impacts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TaskNode {
  id: string;
  label: string;
}

interface ImpactMapGraphProps {
  evolutionId: number | null;
  evolutionLabel?: string;
  onGenerateTestPlan?: (tasks: TaskNode[]) => void;
}

// ---------------------------------------------------------------------------
// Statut styling
// ---------------------------------------------------------------------------

const STATUT_LABELS: Record<StatutImpact, string> = {
  a_faire: "À faire",
  en_cours: "En cours",
  pret: "Prêt",
  valide: "Validé",
  ignore: "Ignoré",
};

const STATUT_NODE_STYLE: Record<StatutImpact, React.CSSProperties> = {
  a_faire:  { background: "#fff7ed", border: "2px solid #fb923c", color: "#9a3412" },
  en_cours: { background: "#eff6ff", border: "2px solid #60a5fa", color: "#1e3a8a" },
  pret:     { background: "#fefce8", border: "2px solid #facc15", color: "#713f12" },
  valide:   { background: "#f0fdf4", border: "2px solid #4ade80", color: "#14532d" },
  ignore:   { background: "#f9fafb", border: "2px solid #d1d5db", color: "#6b7280" },
};

const BASE_NODE_STYLE: React.CSSProperties = {
  borderRadius: 8,
  padding: "6px 10px",
  fontSize: 12,
  minWidth: 160,
};

const EVOLUTION_NODE_STYLE: React.CSSProperties = {
  ...BASE_NODE_STYLE,
  background: "#f0f9ff",
  border: "2px solid #0284c7",
  color: "#0c4a6e",
  fontWeight: 700,
  minWidth: 180,
};

// ---------------------------------------------------------------------------
// ImpactMapGraph
// ---------------------------------------------------------------------------

export const ImpactMapGraph: React.FC<ImpactMapGraphProps> = ({
  evolutionId,
  evolutionLabel = "Évolution",
  onGenerateTestPlan,
}) => {
  const { impacts, isLoading, isError } = useImpactList(evolutionId);

  const [selectedImpactIds, setSelectedImpactIds] = useState<string[]>([]);

  // ── Construction des nœuds et arêtes depuis les données réelles ───────────
  const { nodes: builtNodes, edges: builtEdges } = useMemo(() => {
    const verticalSpacing = 90;
    const totalHeight = Math.max(impacts.length - 1, 0) * verticalSpacing;
    const centerY = totalHeight / 2;

    const evolutionNode: Node = {
      id: "evolution",
      position: { x: 0, y: centerY },
      data: { label: evolutionLabel },
      type: "default",
      style: EVOLUTION_NODE_STYLE,
    };

    const impactNodes: Node[] = impacts.map((impact, i) => ({
      id: String(impact.id),
      position: { x: 320, y: i * verticalSpacing },
      data: {
        label: `${impact.rubrique_titre}\n${STATUT_LABELS[impact.statut]}`,
        impactId: impact.id,
        statut: impact.statut,
      },
      type: "default",
      style: {
        ...BASE_NODE_STYLE,
        ...STATUT_NODE_STYLE[impact.statut],
      },
    }));

    const impactEdges: Edge[] = impacts.map((impact) => ({
      id: `e-ev-${impact.id}`,
      source: "evolution",
      target: String(impact.id),
      animated: impact.statut === "en_cours",
      style: { stroke: "#94a3b8" },
    }));

    return {
      nodes: [evolutionNode, ...impactNodes],
      edges: impactEdges,
    };
  }, [impacts, evolutionLabel]);

  const [nodes, , onNodesChange] = useNodesState(builtNodes);
  const [edges, , onEdgesChange] = useEdgesState(builtEdges);

  // Synchronise les nœuds quand les données changent (impact de rechargement TanStack Query)
  const syncedNodes = builtNodes.map((node) => {
    if (node.id === "evolution") return node;
    const isSelected = selectedImpactIds.includes(node.id);
    if (!isSelected) return node;
    return {
      ...node,
      style: {
        ...node.style,
        outline: "3px solid #6366f1",
        outlineOffset: 2,
      },
    };
  });

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    if (node.id === "evolution") return;
    setSelectedImpactIds((prev) =>
      prev.includes(node.id)
        ? prev.filter((id) => id !== node.id)
        : [...prev, node.id]
    );
  };

  const selectedImpacts = impacts.filter((impact) =>
    selectedImpactIds.includes(String(impact.id))
  );

  const handleGenerateClick = () => {
    if (!onGenerateTestPlan) return;
    const payload: TaskNode[] = selectedImpacts.map((impact) => ({
      id: String(impact.id),
      label: impact.rubrique_titre,
    }));
    if (payload.length > 0) onGenerateTestPlan(payload);
  };

  // ── États loading / empty / error ─────────────────────────────────────────
  if (evolutionId === null) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 italic text-sm">
        Sélectionnez une évolution dans la liste pour afficher sa carte d'impact.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm animate-pulse">
        Chargement de la carte d'impact…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 text-sm">
        Erreur lors du chargement des impacts. Réessayez.
      </div>
    );
  }

  if (impacts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 italic text-sm">
        Aucun impact documentaire déclaré pour cette évolution.
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={syncedNodes}
        edges={builtEdges}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.25 }}
      >
        <Background color="#f5f5f5" gap={16} />
        <Controls position="bottom-right" />
      </ReactFlow>

      {/* Panneau latéral de sélection */}
      <div className="absolute bottom-4 left-4 max-w-xs bg-white border shadow-lg rounded-lg p-4 text-sm z-50">
        <p className="font-semibold mb-2 text-gray-700">
          Impacts sélectionnés ({selectedImpacts.length}/{impacts.length})
        </p>

        {impacts.length > 0 && selectedImpacts.length < impacts.length && (
          <button
            onClick={() =>
              setSelectedImpactIds(impacts.map((i) => String(i.id)))
            }
            className="mb-3 text-xs text-blue-600 hover:underline"
          >
            Tout sélectionner
          </button>
        )}

        <ul className="list-disc list-inside text-gray-700 mb-3 max-h-40 overflow-y-auto">
          {selectedImpacts.map((impact) => (
            <li key={impact.id} className="text-xs leading-5">
              {impact.rubrique_titre}
              <span className="ml-1 text-gray-400">
                ({STATUT_LABELS[impact.statut]})
              </span>
            </li>
          ))}
          {selectedImpacts.length === 0 && (
            <li className="italic text-gray-400 text-xs">
              Cliquez sur un nœud pour le sélectionner.
            </li>
          )}
        </ul>

        {selectedImpacts.length > 0 && onGenerateTestPlan && (
          <button
            onClick={handleGenerateClick}
            className="mt-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs hover:bg-blue-700 w-full"
          >
            Générer le plan de test ({selectedImpacts.length})
          </button>
        )}
      </div>
    </div>
  );
};
