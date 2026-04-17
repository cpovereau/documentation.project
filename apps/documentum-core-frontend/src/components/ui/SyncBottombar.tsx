import React, { useState } from "react";
import { Button } from "components/ui/button";
import { Trash, Plus } from "lucide-react";
import { VerticalDragHandle } from "components/ui/VerticalDragHandle";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "components/ui/dialog";
import { Input } from "components/ui/input";
import type { FeatureItem } from "@/types/FeatureItem";

// TODO(backend): ImpactItem représente une évolution ou un correctif lié à une fonctionnalité.
// Ce type local sera remplacé par l'entité backend correspondante une fois le modèle défini.
// Candidats backend identifiés : ImpactDocumentaire, ou entité dédiée Correctif/Évolution.
// Ref: docs/01_OPERATIONNEL/ProductDocSync/PRODUCTDOCSYNC_ROADMAP.md — Phase 3
type ImpactItem = {
  id: number;
  featureId: number;
  featureName: string;
  type: "correctif" | "evolution";
  titre: string;
  // TODO(backend): statut à aligner sur les valeurs backend (à_faire / en_cours / prêt / validé)
  statut: "à_faire" | "en_cours" | "prêt" | "validé";
};

interface SyncBottombarProps {
  /** Nom de la fonctionnalité sélectionnée dans la sidebar (contexte affiché) */
  selectedFeatureName?: string;
  /** Liste des fonctionnalités disponibles pour l'ajout d'un impact */
  // TODO(backend): remplacer par les données chargées depuis GET /api/fonctionnalites/
  features: FeatureItem[];
  height: number;
  onResize: (newHeight: number) => void;
}

const STATUT_LABELS: Record<ImpactItem["statut"], string> = {
  à_faire: "À faire",
  en_cours: "En cours",
  prêt: "Prêt",
  validé: "Validé",
};

const STATUT_COLORS: Record<ImpactItem["statut"], string> = {
  à_faire: "bg-orange-100 text-orange-800",
  en_cours: "bg-blue-100 text-blue-800",
  prêt: "bg-yellow-100 text-yellow-800",
  validé: "bg-green-100 text-green-800",
};

export const SyncBottombar: React.FC<SyncBottombarProps> = ({
  selectedFeatureName = "-",
  features,
  height,
  onResize,
}) => {
  const MIN_HEIGHT = 200;
  const MAX_HEIGHT = 700;

  const handleResizeStart = (e: React.MouseEvent) => {
    // Empêche la sélection de texte au mousedown
    e.preventDefault();

    const startY = e.clientY;
    const startHeight = height;

    // Désactiver user-select et figer le curseur pendant tout le drag
    document.body.style.userSelect = "none";
    document.body.style.cursor = "row-resize";

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientY - startY;
      // Le handle est en bas du bloc haut (tableau).
      // Drag vers le bas (delta > 0) → handle descend → tableau grandit.
      // Drag vers le haut (delta < 0) → handle monte → tableau rétrécit.
      const newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, startHeight + delta));
      onResize(newHeight);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      // Restaurer user-select et curseur
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // TODO(backend): données initiales hardcodées — à remplacer par GET /api/impacts/ ou entité équivalente
  const [impactItems, setImpactItems] = useState<ImpactItem[]>([
    {
      id: 1,
      featureId: 1,
      featureName: "Fonctionnalité 1",
      type: "evolution",
      titre: "Exemple d'évolution",
      statut: "en_cours",
    },
    {
      id: 2,
      featureId: 2,
      featureName: "Fonctionnalité 2",
      type: "correctif",
      titre: "Exemple de correctif",
      statut: "à_faire",
    },
  ]);

  // État du dialogue d'ajout d'un impact (Correctif / Évolution)
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newItemFeatureId, setNewItemFeatureId] = useState<number | "">("");
  const [newItemType, setNewItemType] = useState<"correctif" | "evolution">("evolution");
  const [newItemTitre, setNewItemTitre] = useState("");

  const handleOpenAddDialog = () => {
    setNewItemFeatureId("");
    setNewItemType("evolution");
    setNewItemTitre("");
    setOpenAddDialog(true);
  };

  const handleConfirmAdd = () => {
    if (!newItemFeatureId) return;
    const feature = features.find((f) => f.id === newItemFeatureId);
    if (!feature) return;

    const nextId = impactItems.length ? Math.max(...impactItems.map((i) => i.id)) + 1 : 1;

    // TODO(backend): remplacer cette mutation locale par POST /api/impacts/ ou équivalent
    setImpactItems((prev) => [
      ...prev,
      {
        id: nextId,
        featureId: feature.id,
        featureName: feature.name,
        type: newItemType,
        titre:
          newItemTitre ||
          `${newItemType === "evolution" ? "Évolution" : "Correctif"} — ${feature.name}`,
        statut: "à_faire",
      },
    ]);
    setOpenAddDialog(false);
  };

  const handleDeleteItem = (id: number) => {
    // TODO(backend): remplacer par DELETE /api/impacts/{id}/ ou équivalent
    setImpactItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleUpdateStatut = (id: number, statut: ImpactItem["statut"]) => {
    // TODO(backend): remplacer par PATCH /api/impacts/{id}/ { statut }
    setImpactItems((prev) => prev.map((i) => (i.id === id ? { ...i, statut } : i)));
  };

  return (
    <div
      className="border-t border-gray-300 bg-white flex flex-col overflow-hidden"
      style={{ height, minHeight: `${MIN_HEIGHT}px`, maxHeight: `${MAX_HEIGHT}px` }}
    >
      <div className="overflow-auto px-4 pt-2 flex-1 h-full">
        {/* En-tête du tableau */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold ml-3 shrink-0">Évolutions &amp; Correctifs</h2>

          <div className="flex items-center gap-2 shrink-0">
            {selectedFeatureName !== "-" && (
              <span className="text-sm text-gray-500 italic leading-none">
                — contexte : {selectedFeatureName}
              </span>
            )}

            <Button
              variant="ghost"
              className="w-8 h-8 p-0 flex items-center justify-center"
              title="Ajouter un correctif ou une évolution"
              onClick={handleOpenAddDialog}
            >
              <Plus
                className="w-6 h-6 transition hover:scale-110 hover:text-blue-700"
                strokeWidth={2.5}
              />
            </Button>
          </div>
        </div>

        {/* Tableau des impacts */}
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Fonctionnalité</th>
              <th className="border p-2 text-left w-[120px]">Type</th>
              <th className="border p-2 text-left">Titre</th>
              <th className="border p-2 text-center w-[120px]">Statut</th>
              <th className="border p-2 text-center w-[200px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {impactItems.length === 0 && (
              <tr>
                <td colSpan={5} className="border p-4 text-center text-gray-400 italic text-sm">
                  Aucun élément. Utilisez le bouton + pour ajouter un correctif ou une évolution.
                </td>
              </tr>
            )}
            {impactItems.map((item) => (
              <tr key={item.id} className="group">
                <td className="border p-2 text-sm">{item.featureName}</td>
                <td className="border p-2 text-center">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.type === "evolution"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.type === "evolution" ? "Évolution" : "Correctif"}
                  </span>
                </td>
                <td className="border p-2 text-sm">{item.titre}</td>
                <td className="border p-2 text-center">
                  <select
                    value={item.statut}
                    onChange={(e) =>
                      handleUpdateStatut(item.id, e.target.value as ImpactItem["statut"])
                    }
                    className={`text-xs rounded px-2 py-1 border-none cursor-pointer ${STATUT_COLORS[item.statut]}`}
                  >
                    {Object.entries(STATUT_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border p-2 text-center">
                  <Button
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-500 hover:text-red-600"
                    title="Supprimer"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drag handle en bas du bloc pour redimensionnement vers le bas */}
      <VerticalDragHandle onResizeStart={handleResizeStart} />

      {/* Dialogue d'ajout — Correctif ou Évolution */}
      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un correctif ou une évolution</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Sélection de la fonctionnalité */}
            <div>
              <label className="text-sm font-medium block mb-1">Fonctionnalité</label>
              {/* TODO(backend): cette liste sera chargée depuis GET /api/fonctionnalites/?produit={id} */}
              <select
                value={newItemFeatureId}
                onChange={(e) => setNewItemFeatureId(e.target.value ? Number(e.target.value) : "")}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="">— Sélectionner une fonctionnalité —</option>
                {features.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type : Correctif ou Évolution */}
            <div>
              <label className="text-sm font-medium block mb-1">Type</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="impactType"
                    value="evolution"
                    checked={newItemType === "evolution"}
                    onChange={() => setNewItemType("evolution")}
                  />
                  <span className="text-sm">Évolution</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="impactType"
                    value="correctif"
                    checked={newItemType === "correctif"}
                    onChange={() => setNewItemType("correctif")}
                  />
                  <span className="text-sm">Correctif</span>
                </label>
              </div>
            </div>

            {/* Titre (optionnel) */}
            <div>
              <label className="text-sm font-medium block mb-1">
                Titre <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <Input
                placeholder="Décrire brièvement l'évolution ou le correctif…"
                value={newItemTitre}
                onChange={(e) => setNewItemTitre(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpenAddDialog(false)}>
                Annuler
              </Button>
              <Button variant="primary" onClick={handleConfirmAdd} disabled={!newItemFeatureId}>
                Ajouter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
