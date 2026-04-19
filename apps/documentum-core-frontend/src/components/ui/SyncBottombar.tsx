import React, { useEffect, useState } from "react";
import { Button } from "components/ui/button";
import { ExternalLink, Trash, Plus } from "lucide-react";
import { VerticalDragHandle } from "components/ui/VerticalDragHandle";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "components/ui/dialog";
import type { ImpactDocumentaire, StatutImpact } from "@/api/impacts";
import {
  useImpactList,
  useImpactCreate,
  useImpactUpdateStatut,
  useImpactDelete,
  useRubriqueListForImpact,
} from "@/hooks/useImpactDocumentaire";
import { useRubriqueUsages } from "@/hooks/useRubriqueUsages";

// ---------------------------------------------------------------------------
// UsagePanel — sub-component so useRubriqueUsages is called unconditionally
// ---------------------------------------------------------------------------

const UsagePanel: React.FC<{ rubriqueId: number }> = ({ rubriqueId }) => {
  const { usages, isLoading } = useRubriqueUsages(rubriqueId);

  if (isLoading) {
    return <p className="text-xs text-gray-400 italic">Chargement des usages…</p>;
  }
  if (usages.length === 0) {
    return <p className="text-xs text-gray-400 italic">Aucune Map n'utilise cette rubrique.</p>;
  }
  return (
    <ul className="list-none space-y-1">
      {usages.map((u) => (
        <li key={u.map_id} className="text-xs text-gray-700">
          <span className="font-medium">{u.map_nom}</span>
          <span className="text-gray-400"> — {u.projet_nom}</span>
        </li>
      ))}
    </ul>
  );
};

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

interface SyncBottombarProps {
  selectedFeatureName?: string;
  selectedEvolutionId: number | null;
  height: number;
  onResize: (newHeight: number) => void;
  onImpactSelect: (impact: ImpactDocumentaire | null) => void;
}

const STATUT_LABELS: Record<StatutImpact, string> = {
  a_faire: "À faire",
  en_cours: "En cours",
  pret: "Prêt",
  valide: "Validé",
  ignore: "Ignoré",
};

const STATUT_COLORS: Record<StatutImpact, string> = {
  a_faire: "bg-orange-100 text-orange-800",
  en_cours: "bg-blue-100 text-blue-800",
  pret: "bg-yellow-100 text-yellow-800",
  valide: "bg-green-100 text-green-800",
  ignore: "bg-gray-100 text-gray-500",
};

// ---------------------------------------------------------------------------
// SyncBottombar
// ---------------------------------------------------------------------------

export const SyncBottombar: React.FC<SyncBottombarProps> = ({
  selectedFeatureName = "-",
  selectedEvolutionId,
  height,
  onResize,
  onImpactSelect,
}) => {
  const MIN_HEIGHT = 200;
  const MAX_HEIGHT = 700;

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = height;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "row-resize";

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientY - startY;
      const newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, startHeight + delta));
      onResize(newHeight);
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // ── Données depuis l'API ────────────────────────────────────────────────
  const { impacts, isLoading } = useImpactList(selectedEvolutionId);
  const { addImpact, isAdding } = useImpactCreate();
  const { updateStatut } = useImpactUpdateStatut();
  const { deleteImpact } = useImpactDelete();

  // ── Sélection de ligne et panneau usages ───────────────────────────────
  const [selectedImpactId, setSelectedImpactId] = useState<number | null>(null);
  const [openUsagePanelId, setOpenUsagePanelId] = useState<number | null>(null);

  // Réinitialise la sélection quand l'évolution change
  useEffect(() => {
    setSelectedImpactId(null);
    setOpenUsagePanelId(null);
    onImpactSelect(null);
  }, [selectedEvolutionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRowClick = (impact: ImpactDocumentaire) => {
    if (selectedImpactId === impact.id) {
      setSelectedImpactId(null);
      onImpactSelect(null);
    } else {
      setSelectedImpactId(impact.id);
      onImpactSelect(impact);
    }
  };

  const handleToggleUsagePanel = (e: React.MouseEvent, impactId: number) => {
    e.stopPropagation();
    setOpenUsagePanelId((prev) => (prev === impactId ? null : impactId));
  };

  // ── Dialog d'ajout : sélection de la rubrique ──────────────────────────
  const { rubriques, isLoading: rubriquesLoading } = useRubriqueListForImpact();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedRubriqueId, setSelectedRubriqueId] = useState<number | "">("");

  const handleOpenAddDialog = () => {
    setSelectedRubriqueId("");
    setOpenAddDialog(true);
  };

  const handleConfirmAdd = () => {
    if (!selectedRubriqueId || selectedEvolutionId === null) return;
    addImpact(selectedEvolutionId, selectedRubriqueId, {
      onSuccess: () => setOpenAddDialog(false),
    });
  };

  return (
    <div
      className="border-t border-gray-300 bg-white flex flex-col overflow-hidden"
      style={{ height, minHeight: `${MIN_HEIGHT}px`, maxHeight: `${MAX_HEIGHT}px` }}
    >
      <div className="overflow-auto px-4 pt-2 flex-1 h-full">
        {/* En-tête du tableau */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold ml-3 shrink-0">Impacts documentaires</h2>

          <div className="flex items-center gap-2 shrink-0">
            {selectedFeatureName !== "-" && (
              <span className="text-sm text-gray-500 italic leading-none">
                — contexte : {selectedFeatureName}
              </span>
            )}

            <Button
              variant="ghost"
              className="w-8 h-8 p-0 flex items-center justify-center"
              title="Déclarer un impact documentaire"
              onClick={handleOpenAddDialog}
              disabled={selectedEvolutionId === null}
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
              <th className="border p-2 text-left">Rubrique impactée</th>
              <th className="border p-2 text-center w-[160px]">Statut</th>
              <th className="border p-2 text-center w-[100px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={3} className="border p-4 text-center text-gray-400 italic text-sm">
                  Chargement…
                </td>
              </tr>
            )}
            {!isLoading && selectedEvolutionId === null && (
              <tr>
                <td colSpan={3} className="border p-4 text-center text-gray-400 italic text-sm">
                  Sélectionnez une évolution pour voir ses impacts documentaires.
                </td>
              </tr>
            )}
            {!isLoading && selectedEvolutionId !== null && impacts.length === 0 && (
              <tr>
                <td colSpan={3} className="border p-4 text-center text-gray-400 italic text-sm">
                  Aucun impact déclaré. Utilisez le bouton + pour en ajouter un.
                </td>
              </tr>
            )}
            {impacts.map((impact) => (
              <React.Fragment key={impact.id}>
                <tr
                  className={`group cursor-pointer transition-colors ${
                    selectedImpactId === impact.id
                      ? "bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleRowClick(impact)}
                >
                  <td className="border p-2 text-sm">{impact.rubrique_titre}</td>
                  <td className="border p-2 text-center" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={impact.statut}
                      onChange={(e) =>
                        updateStatut(
                          impact.id,
                          e.target.value as StatutImpact,
                          impact.evolution_produit
                        )
                      }
                      className={`text-xs rounded px-2 py-1 border-none cursor-pointer ${STATUT_COLORS[impact.statut]}`}
                    >
                      {(Object.entries(STATUT_LABELS) as [StatutImpact, string][]).map(
                        ([val, label]) => (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        )
                      )}
                    </select>
                  </td>
                  <td className="border p-2 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        className={`w-7 h-7 p-0 flex items-center justify-center transition-colors ${
                          openUsagePanelId === impact.id
                            ? "text-blue-600"
                            : "opacity-0 group-hover:opacity-100 text-gray-500 hover:text-blue-600"
                        }`}
                        title="Voir dans Doc Principale"
                        onClick={(e) => handleToggleUsagePanel(e, impact.id)}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-7 h-7 p-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-500 hover:text-red-600"
                        title="Supprimer"
                        onClick={() => {
                          deleteImpact(impact.id, impact.evolution_produit);
                          if (selectedImpactId === impact.id) {
                            setSelectedImpactId(null);
                            onImpactSelect(null);
                          }
                        }}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>

                {openUsagePanelId === impact.id && (
                  <tr>
                    <td colSpan={3} className="border-x border-b bg-gray-50 px-4 py-2">
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        Maps utilisant cette rubrique :
                      </p>
                      <UsagePanel rubriqueId={impact.rubrique} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drag handle */}
      <VerticalDragHandle onResizeStart={handleResizeStart} />

      {/* Dialog d'ajout d'un impact */}
      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Déclarer un impact documentaire</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium block mb-1">Rubrique impactée</label>
              <select
                value={selectedRubriqueId}
                onChange={(e) =>
                  setSelectedRubriqueId(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full border rounded px-3 py-2 text-sm"
                disabled={rubriquesLoading}
              >
                <option value="">— Sélectionner une rubrique —</option>
                {rubriques.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.titre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpenAddDialog(false)}>
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmAdd}
                disabled={!selectedRubriqueId || isAdding}
              >
                {isAdding ? "Ajout…" : "Ajouter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
