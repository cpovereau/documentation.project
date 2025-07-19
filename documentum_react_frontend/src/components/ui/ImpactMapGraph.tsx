import React from "react";
import ReactFlow, { Background, Controls, Edge, Node } from "reactflow";
import "reactflow/dist/style.css";

/**
 * Ce composant affiche une carte mentale simulée pour l'arbre d'impact d'une version.
 * Les données sont actuellement en dur, mais peuvent être remplacées par une API plus tard.
 */

const nodes: Node[] = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    data: { label: "Fonctionnalité A" },
    type: "default",
  },
  {
    id: "2",
    position: { x: 250, y: -100 },
    data: { label: "Rubrique : Connexion (task)" },
    type: "default",
  },
  {
    id: "3",
    position: { x: 250, y: 100 },
    data: { label: "Rubrique : Sécurité (concept)" },
    type: "default",
  },
  {
    id: "4",
    position: { x: 500, y: 0 },
    data: { label: "Fonctionnalité B" },
    type: "default",
  },
  {
    id: "5",
    position: { x: 750, y: -50 },
    data: { label: "Rubrique : Export PDF (task)" },
    type: "default",
  },
  {
    id: "6",
    position: { x: 750, y: 50 },
    data: { label: "Rubrique : Liens externes (reference)" },
    type: "default",
  },
];

const edges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e1-3", source: "1", target: "3", animated: true },
  { id: "e1-4", source: "1", target: "4", animated: false },
  { id: "e4-5", source: "4", target: "5", animated: true },
  { id: "e4-6", source: "4", target: "6", animated: true },
];

export const ImpactMapGraph = () => {
  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background color="#f5f5f5" gap={16} />
        <Controls position="bottom-right" />
      </ReactFlow>
    </div>
  );
};
