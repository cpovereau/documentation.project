import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { SyncLeftSidebar } from "components/ui/SyncLeftSidebar";
import { SyncEditor } from "components/ui/SyncEditor";
import { SyncBottombar } from "components/ui/SyncBottombar";
import { SyncRightSidebar } from "components/ui/SyncRightSidebar";
import { TopBar } from "components/ui/TopBar";
import { ImpactMapModal } from "components/ui/ImpactMapModal";
import { TestPlanModal } from "components/ui/TestPlanModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog";
import { Input } from "components/ui/input";
import { Button } from "components/ui/button";
import type { FeatureItem } from "types/FeatureItem";
import { toast } from "sonner";
import { useProduits } from "@/hooks/useDictionnaireHooks";
import { useFonctionnaliteList } from "hooks/useFonctionnaliteList";
import { useVersionProduitList, useVersionProduitCreate, useVersionProduitPublier } from "@/hooks/useVersionProduit";
import { useEvolutionProduitList, useEvolutionProduitCreate, useEvolutionProduitArchive, useEvolutionProduitReorder } from "@/hooks/useEvolutionProduit";
import type { EvolutionProduit } from "@/api/versionsProduit";
import type { ImpactDocumentaire } from "@/api/impacts";
import type { MinimalTask } from "@/types/MinimalTask";
import { useWindowHeight } from "@/hooks/useWindowHeight";
import { useImpactUpdateNotes } from "@/hooks/useImpactDocumentaire";

export const ProductDocSync: React.FC = () => {
  // ── Source de vérité produit : number | null ─────────────────────────────
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // ── Source de vérité version : string (ID de VersionProduit en string) ───
  // La valeur dans VersionSelect est toujours un string.
  // On utilise l'ID backend comme valeur, et le numero comme label.
  // selectedVersionId est dérivé ci-dessous pour les appels API.
  const [selectedVersion, setSelectedVersion] = useState("");
  const selectedVersionId = selectedVersion ? parseInt(selectedVersion, 10) : null;

  // ── Produits depuis l'API ────────────────────────────────────────────────
  const { data: produits = [] } = useProduits();
  const productOptions = produits.map((p) => ({
    value: String(p.id),
    label: p.nom,
  }));

  const selectedProductLabel =
    produits.find((p) => p.id === selectedProductId)?.nom ?? "";

  // ── Versions depuis l'API (Phase 2) ─────────────────────────────────────
  const { versions, isLoading: versionsLoading } = useVersionProduitList(selectedProductId);
  const versionOptions = versions.map((v) => ({
    value: String(v.id),
    label: v.numero,
  }));

  const selectedVersionData = versions.find((v) => v.id === selectedVersionId) ?? null;

  // ── Hooks mutations VersionProduit ───────────────────────────────────────
  const { createVersion, isCreating: isCreatingVersion } = useVersionProduitCreate();
  const { publierVersion, isPublishing } = useVersionProduitPublier();

  // ── EvolutionProduit depuis l'API (Phase 1 révisée) ──────────────────────
  const {
    evolutions,
    features,
    isLoading: evolutionsLoading,
    isError: evolutionsError,
  } = useEvolutionProduitList(selectedVersionId);

  const { addEvolution, isAdding } = useEvolutionProduitCreate();
  const { archiveEvolution } = useEvolutionProduitArchive();
  const { reorderEvolutions } = useEvolutionProduitReorder();

  // ── Fonctionnalites du référentiel (pour le dialog d'ajout d'évolution) ──
  // Utilisation de useFonctionnaliteList pour accéder au référentiel stable.
  const { features: fonctionnaliteItems } = useFonctionnaliteList(selectedProductId);

  // ── États UI ─────────────────────────────────────────────────────────────
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
  const [selectedImpact, setSelectedImpact] = useState<ImpactDocumentaire | null>(null);

  // Type de l'évolution sélectionnée — dérivé depuis evolutions (source de vérité API)
  const selectedEvolution = evolutions.find((e) => e.id === selectedFeature) ?? null;
  const evolutionType: "evolution" | "correctif" | null = selectedEvolution?.type ?? null;

  const { updateNotes } = useImpactUpdateNotes();

  const handleSelectFeature = (id: number) => {
    setSelectedFeature(id);
    setSelectedImpact(null);
  };

  const handleNotesChange = (impactId: number, notes: string) => {
    if (!selectedImpact) return;
    updateNotes(impactId, notes, selectedImpact.evolution_produit, {
      onSuccess: (updated) => setSelectedImpact(updated),
    });
  };
  const [isLeftSidebarExpanded, setIsLeftSidebarExpanded] = useState(true);
  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState(true);
  const [copiedEvolution, setCopiedEvolution] = useState<EvolutionProduit | null>(null);

  const windowHeight = useWindowHeight();
  const TOTAL_HEIGHT = windowHeight - 130;
  const [bottomBarHeight, setBottomBarHeight] = useState(
    () => window.innerHeight - 130 - 300
  );
  const editorHeight = TOTAL_HEIGHT - bottomBarHeight;

  // Fonctionnalités visibles uniquement si Produit ET Version sont sélectionnés
  const showFeatures =
    selectedProductId !== null &&
    selectedVersionId !== null &&
    !evolutionsLoading &&
    !evolutionsError;

  // ── Changement de produit ────────────────────────────────────────────────
  const handleSelectProduct = (id: number | null) => {
    setSelectedProductId(id);
    setSelectedVersion("");
    setSelectedFeature(null);
    setSelectedImpact(null);
  };

  // ── Dialog : ajout d'une version ─────────────────────────────────────────
  const [showAddVersionDialog, setShowAddVersionDialog] = useState(false);
  const [newVersionNumero, setNewVersionNumero] = useState("");

  const handleAddVersion = () => {
    if (selectedProductId === null) return;
    setNewVersionNumero("");
    setShowAddVersionDialog(true);
  };

  const handleConfirmAddVersion = () => {
    if (!newVersionNumero.trim() || selectedProductId === null) return;
    createVersion(
      { produit: selectedProductId, numero: newVersionNumero.trim() },
      {
        onSuccess: (created) => {
          setSelectedVersion(String(created.id));
          setShowAddVersionDialog(false);
          setNewVersionNumero("");
        },
      }
    );
  };

  // ── Publication de version ───────────────────────────────────────────────
  const handlePublishVersion = () => {
    if (selectedVersionId === null || selectedProductId === null) {
      toast.error("Sélectionnez une version avant de publier.");
      return;
    }
    if (selectedVersionData?.statut === "publiee") {
      toast.error("Cette version est déjà publiée.");
      return;
    }
    publierVersion(selectedVersionId, selectedProductId, {
      onSuccess: (published) => {
        toast.success(
          `${selectedProductLabel} v${published.numero} publiée avec succès.`
        );
      },
    });
  };

  // ── Dialog : ajout d'une évolution ───────────────────────────────────────
  const [showAddEvolutionDialog, setShowAddEvolutionDialog] = useState(false);
  const [newEvolutionFonctionnaliteId, setNewEvolutionFonctionnaliteId] = useState<number | null>(null);
  const [newEvolutionType, setNewEvolutionType] = useState<"evolution" | "correctif">("evolution");
  const [newEvolutionDescription, setNewEvolutionDescription] = useState("");

  const handleAddFeature = () => {
    if (selectedVersionId === null) return;
    setNewEvolutionFonctionnaliteId(null);
    setNewEvolutionType("evolution");
    setNewEvolutionDescription("");
    setShowAddEvolutionDialog(true);
  };

  const handleConfirmAddEvolution = () => {
    if (!newEvolutionFonctionnaliteId || selectedVersionId === null) return;
    addEvolution(
      {
        version_produit: selectedVersionId,
        fonctionnalite: newEvolutionFonctionnaliteId,
        type: newEvolutionType,
        description: newEvolutionDescription.trim(),
      },
      {
        onSuccess: (created) => {
          setSelectedFeature(created.id);
          setShowAddEvolutionDialog(false);
        },
      }
    );
  };

  // ── Archivage ─────────────────────────────────────────────────────────────
  const handleDeleteFeature = (id: number) => {
    if (selectedVersionId === null) return;
    archiveEvolution(id, selectedVersionId);
    if (selectedFeature === id) {
      setSelectedFeature(null);
      setSelectedImpact(null);
    }
  };

  // ── Copier / coller ───────────────────────────────────────────────────────
  const handleCopyFeature = (id: number) => {
    const evolution = evolutions.find((e) => e.id === id);
    if (evolution) {
      setCopiedEvolution(evolution);
      const nom = evolution.fonctionnalite_nom ?? `Évolution #${id}`;
      toast.success(`Évolution « ${nom} » copiée`);
    }
  };

  const handlePasteFeature = () => {
    if (!copiedEvolution || selectedVersionId === null) return;
    addEvolution(
      {
        version_produit: selectedVersionId,
        fonctionnalite: copiedEvolution.fonctionnalite,
        type: copiedEvolution.type,
        description: copiedEvolution.description
          ? `${copiedEvolution.description} (copie)`
          : "(copie)",
      },
      {
        onSuccess: (created) => setSelectedFeature(created.id),
      }
    );
  };

  // ── Réordonnancement : persisté via PATCH /reorder/ ──────────────────────
  const handleReorder = (newItems: FeatureItem[]) => {
    if (selectedVersionId === null) return;
    reorderEvolutions(
      { orderedIds: newItems.map((item) => item.id) },
      selectedVersionId
    );
  };

  // ── Expand / collapse : dormant en mono-niveau ───────────────────────────
  const handleToggleExpand = (_id: number, _expand: boolean) => {};

  // ── Impact map / plan de test ─────────────────────────────────────────────
  const [selectedArticleType, setSelectedArticleType] = useState<
    "evolution" | "correctif"
  >("evolution");
  const [showImpactMap, setShowImpactMap] = useState(false);
  const [impactMapHeight] = useState(160);
  const [showTestPlanModal, setShowTestPlanModal] = useState(false);
  const [orderedTasks, setOrderedTasks] = useState<MinimalTask[]>([]);

  const handleGenerateTestPlan = (tasks: MinimalTask[]) => {
    setOrderedTasks(tasks);
    setShowTestPlanModal(true);
  };

  return (
    <div className="relative flex flex-col h-screen overflow-hidden">
      <TopBar currentScreen="product-doc-sync" />
      <div className="flex flex-row flex-grow h-full relative overflow-hidden">

        {/* ── Sidebar gauche ──────────────────────────────────────────────── */}
        <div
          className={`${
            isLeftSidebarExpanded ? "w-[345px]" : "w-0"
          } transition-all duration-300 h-full flex-shrink-0`}
        >
          <SyncLeftSidebar
            isExpanded={isLeftSidebarExpanded}
            onToggle={() => setIsLeftSidebarExpanded(!isLeftSidebarExpanded)}
            selectedProductId={selectedProductId}
            onSelectProduct={handleSelectProduct}
            productOptions={productOptions}
            selectedVersion={selectedVersion}
            setSelectedVersion={(val) => {
              setSelectedVersion(val);
              setSelectedFeature(null);
            }}
            versionOptions={versionOptions}
            onAddVersion={handleAddVersion}
            onPublish={handlePublishVersion}
            features={features}
            showFeatures={showFeatures}
            selectedFeature={selectedFeature}
            onSelectFeature={handleSelectFeature}
            onReorderFeatures={handleReorder}
            onDeleteFeature={handleDeleteFeature}
            onAddFeature={handleAddFeature}
            onCopyFeature={handleCopyFeature}
            onPasteFeature={handlePasteFeature}
            onShowImpactMap={() => setShowImpactMap(true)}
            onToggleExpandFeature={handleToggleExpand}
            className="h-full"
          />

          <ImpactMapModal
            open={showImpactMap}
            onClose={() => setShowImpactMap(false)}
            product={selectedProductLabel}
            version={selectedVersionData?.numero ?? selectedVersion}
            evolutionId={selectedFeature}
            evolutionLabel={
              selectedFeature
                ? (features.find((f) => f.id === selectedFeature)?.name ?? "Évolution")
                : undefined
            }
            height={impactMapHeight}
            onGenerateTestPlan={handleGenerateTestPlan}
          />

          <TestPlanModal
            open={showTestPlanModal}
            onClose={() => setShowTestPlanModal(false)}
            tasks={orderedTasks}
            onReorder={setOrderedTasks}
            onGenerate={() => {
              // TODO(Phase 4): remplacer par l'appel API de génération de plan de test
              setShowTestPlanModal(false);
            }}
          />
        </div>

        {/* ── Zone centrale : tableau (principal) + éditeur (secondaire) ───── */}
        <div className="flex flex-col flex-grow min-w-0 min-h-0 h-full">
          <SyncBottombar
            selectedFeatureName={
              selectedFeature
                ? features.find((f) => f.id === selectedFeature)?.name ?? "-"
                : "-"
            }
            selectedEvolutionId={selectedFeature}
            height={bottomBarHeight}
            onResize={(newHeight) => setBottomBarHeight(newHeight)}
            onImpactSelect={setSelectedImpact}
          />
          <SyncEditor
            selectedType={selectedArticleType}
            onTypeChange={setSelectedArticleType}
            evolutionType={evolutionType}
            height={editorHeight}
            selectedImpact={selectedImpact}
            onNotesChange={handleNotesChange}
          />
        </div>

        {/* ── Sidebar droite ───────────────────────────────────────────────── */}
        <div
          className={cn(
            "transition-all duration-300 h-full",
            isRightSidebarExpanded ? "w-[248px]" : "w-0"
          )}
        >
          <SyncRightSidebar
            isExpanded={isRightSidebarExpanded}
            onToggle={() => setIsRightSidebarExpanded(!isRightSidebarExpanded)}
          />
        </div>
      </div>

      {/* ── Dialog : ajout d'une version ────────────────────────────────────── */}
      <Dialog open={showAddVersionDialog} onOpenChange={setShowAddVersionDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nouvelle version</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium block mb-1">
                Numéro de version
              </label>
              <Input
                autoFocus
                placeholder="Ex : 2.1"
                value={newVersionNumero}
                onChange={(e) => setNewVersionNumero(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirmAddVersion();
                }}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => setShowAddVersionDialog(false)}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                disabled={!newVersionNumero.trim() || isCreatingVersion}
                onClick={handleConfirmAddVersion}
              >
                {isCreatingVersion ? "Création…" : "Créer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog : ajout d'une évolution ──────────────────────────────────── */}
      <Dialog open={showAddEvolutionDialog} onOpenChange={setShowAddEvolutionDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nouvelle évolution</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Sélection de la fonctionnalité du référentiel */}
            <div>
              <label className="text-sm font-medium block mb-1">
                Fonctionnalité (référentiel)
              </label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={newEvolutionFonctionnaliteId ?? ""}
                onChange={(e) =>
                  setNewEvolutionFonctionnaliteId(
                    e.target.value ? parseInt(e.target.value, 10) : null
                  )
                }
              >
                <option value="">Sélectionner une fonctionnalité…</option>
                {fonctionnaliteItems.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="text-sm font-medium block mb-1">Type</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="evolutionType"
                    value="evolution"
                    checked={newEvolutionType === "evolution"}
                    onChange={() => setNewEvolutionType("evolution")}
                  />
                  Évolution
                </label>
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="evolutionType"
                    value="correctif"
                    checked={newEvolutionType === "correctif"}
                    onChange={() => setNewEvolutionType("correctif")}
                  />
                  Correctif
                </label>
              </div>
            </div>

            {/* Description (optionnel) */}
            <div>
              <label className="text-sm font-medium block mb-1">
                Description{" "}
                <span className="text-xs text-gray-400 font-normal">
                  (optionnel)
                </span>
              </label>
              <textarea
                className="w-full border rounded px-3 py-2 text-sm resize-none"
                rows={3}
                placeholder="Décrivez l'évolution ou le correctif…"
                value={newEvolutionDescription}
                onChange={(e) => setNewEvolutionDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => setShowAddEvolutionDialog(false)}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                disabled={!newEvolutionFonctionnaliteId || isAdding}
                onClick={handleConfirmAddEvolution}
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
