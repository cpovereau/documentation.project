import React, { useState } from "react";
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
import { useProduits } from "hooks/useProduits";
import { useFonctionnaliteList } from "hooks/useFonctionnaliteList";

// TODO(backend): MinimalTask à déplacer dans src/types/ une fois stabilisé
type MinimalTask = {
  id: string;
  label: string;
};

export const ProductDocSync: React.FC = () => {
  // ── Source de vérité produit : number | null ─────────────────────────────
  // selectedProductId est l'identifiant technique backend.
  // La conversion UI string ↔ number est déléguée à SyncLeftSidebar (point unique).
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // ── Source de vérité version : string local ──────────────────────────────
  // NOTE : "version Produit" n'a pas d'entité backend directe à ce stade.
  // Le modèle VersionProjet (GET /api/versions/) est lié à Projet, pas à Produit :
  //   VersionProjet.projet → Projet (pas de FK vers Produit).
  // Brancher ProductDocSync sur VersionProjet serait une mauvaise hypothèse.
  // La gestion des versions reste locale jusqu'à arbitrage métier sur l'entité cible.
  // TODO(Phase 2 — bloqué): définir l'entité "version Produit" avec l'équipe, puis
  //   créer useVersionProduitList(selectedProductId) et handleAddVersion vers POST API.
  const [selectedVersion, setSelectedVersion] = useState("");
  const [versions, setVersions] = useState(["1.0", "1.1", "1.2"]);
  const versionOptions = versions.map((v) => ({ value: v, label: v }));

  // ── Produits depuis l'API ────────────────────────────────────────────────
  const { data: produits = [] } = useProduits();
  const productOptions = produits.map((p) => ({
    value: String(p.id),
    label: p.nom,
  }));

  // Label du produit sélectionné (résolu depuis les données API)
  const selectedProductLabel =
    produits.find((p) => p.id === selectedProductId)?.nom ?? "";

  // ── Fonctionnalités depuis l'API ─────────────────────────────────────────
  const {
    features,
    isLoading: featuresLoading,
    isError: featuresError,
    addFeature,
    archiveFeature,
    isAdding,
  } = useFonctionnaliteList(selectedProductId);

  // ── États UI ─────────────────────────────────────────────────────────────
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
  const [isLeftSidebarExpanded, setIsLeftSidebarExpanded] = useState(true);
  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState(true);
  const [copiedFeature, setCopiedFeature] = useState<FeatureItem | null>(null);

  // Layout : SyncBottombar (tableau) = haut/principal, SyncEditor = bas/secondaire.
  // TODO(Phase 5): TOTAL_HEIGHT calculé une seule fois au montage — ajouter resize listener si nécessaire
  const TOTAL_HEIGHT = window.innerHeight - 130;
  const [bottomBarHeight, setBottomBarHeight] = useState(
    () => window.innerHeight - 130 - 300
  );
  const editorHeight = TOTAL_HEIGHT - bottomBarHeight;

  // Fonctionnalités visibles uniquement si Produit ET Version sont sélectionnés
  const showFeatures =
    selectedProductId !== null &&
    selectedVersion !== "" &&
    !featuresLoading &&
    !featuresError;

  // ── Changement de produit ────────────────────────────────────────────────
  const handleSelectProduct = (id: number | null) => {
    setSelectedProductId(id);
    setSelectedVersion(""); // reset : les versions seront dépendantes du produit
    setSelectedFeature(null);
  };

  // ── Versions (gestion locale — voir NOTE ci-dessus) ──────────────────────
  const handleAddVersion = () => {
    // Comportement temporaire : incrémentation locale du numéro mineur.
    // TODO(Phase 2 — bloqué): remplacer par POST vers l'endpoint "version Produit" défini.
    const last = versions[versions.length - 1];
    const [major, minor] = last.split(".").map(Number);
    const newVersion = `${major}.${minor + 1}`;
    setVersions([...versions, newVersion]);
    setSelectedVersion(newVersion);
  };

  const handlePublishVersion = () => {
    // TODO(Phase 2): remplacer par POST /api/publier-version/{id}/ + toast
    alert(
      `Le suivi de ${selectedProductLabel} version ${selectedVersion} a été publié !`
    );
  };

  // ── Dialog : ajout d'une fonctionnalité ──────────────────────────────────
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newFeatureName, setNewFeatureName] = useState("");

  const handleAddFeature = () => {
    if (selectedProductId === null) return;
    setNewFeatureName("");
    setShowAddDialog(true);
  };

  const handleConfirmAddFeature = () => {
    if (!newFeatureName.trim() || selectedProductId === null) return;
    addFeature(
      { nom: newFeatureName.trim(), produitId: selectedProductId },
      {
        onSuccess: (created) => {
          setSelectedFeature(created.id);
          setShowAddDialog(false);
          setNewFeatureName("");
        },
      }
    );
  };

  // ── Archivage (remplace DELETE — HTTP 405) ───────────────────────────────
  const handleDeleteFeature = (id: number) => {
    archiveFeature(id);
    if (selectedFeature === id) setSelectedFeature(null);
  };

  // ── Copier / coller ──────────────────────────────────────────────────────
  const handleCopyFeature = (id: number) => {
    const feature = features.find((f) => f.id === id);
    if (feature) {
      setCopiedFeature({ ...feature });
      toast.success(`Fonctionnalité « ${feature.name} » copiée`);
    }
  };

  const handlePasteFeature = () => {
    if (!copiedFeature || selectedProductId === null) return;
    addFeature(
      { nom: `${copiedFeature.name} (copie)`, produitId: selectedProductId },
      { onSuccess: (created) => setSelectedFeature(created.id) }
    );
  };

  // ── Réordonnancement : désactivé (pas de champ 'ordre' backend) ──────────
  // TODO(Phase 1.2): implémenter si champ 'ordre' ajouté au modèle Fonctionnalite
  const handleReorder = (_newItems: FeatureItem[]) => {};

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
            setSelectedVersion={setSelectedVersion}
            versionOptions={versionOptions}
            onAddVersion={handleAddVersion}
            onPublish={handlePublishVersion}
            features={features}
            showFeatures={showFeatures}
            selectedFeature={selectedFeature}
            onSelectFeature={setSelectedFeature}
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
            version={selectedVersion}
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
            features={features}
            height={bottomBarHeight}
            onResize={(newHeight) => setBottomBarHeight(newHeight)}
          />
          <SyncEditor
            selectedType={selectedArticleType}
            onTypeChange={setSelectedArticleType}
            height={editorHeight}
          />
        </div>

        {/* ── Sidebar droite ───────────────────────────────────────────────── */}
        <div
          className={`${
            isRightSidebarExpanded ? "w-[248px]" : "w-0"
          } transition-all duration-300 h-full`}
        >
          <SyncRightSidebar
            isExpanded={isRightSidebarExpanded}
            onToggle={() => setIsRightSidebarExpanded(!isRightSidebarExpanded)}
          />
        </div>
      </div>

      {/* ── Dialog : ajout d'une fonctionnalité ─────────────────────────────── */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nouvelle fonctionnalité</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium block mb-1">
                Nom de la fonctionnalité
              </label>
              <Input
                autoFocus
                placeholder="Ex : Gestion des utilisateurs"
                value={newFeatureName}
                onChange={(e) => setNewFeatureName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirmAddFeature();
                }}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                disabled={!newFeatureName.trim() || isAdding}
                onClick={handleConfirmAddFeature}
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
