import React from "react";
import { Button } from "components/ui/button";
import { Separator } from "components/ui/separator";
import { ProductSelect } from "components/ui/ProductSelect";
import { VersionSelect } from "components/ui/VersionSelect";
import { FeatureModule } from "components/ui/FeatureModule";
import type { FeatureItem } from "@/types/FeatureItem";
import { ArrowLeftCircle } from "lucide-react";
import { cn } from "lib/utils";

// NOTE(métier): onIndent/onOutdent supprimés — hiérarchie désactivée (cadrage 2026-04-16).

interface SyncLeftSidebarProps {
  isExpanded: boolean;
  onToggle: () => void;

  /**
   * ID technique du produit sélectionné (number | null).
   * Source de vérité : l'identifiant backend, pas le nom.
   * La conversion number ↔ string pour ProductSelect se fait uniquement ici.
   */
  selectedProductId: number | null;
  onSelectProduct: (id: number | null) => void;
  productOptions: { value: string; label: string }[];

  selectedVersion: string;
  setSelectedVersion: (val: string) => void;
  versionOptions: { value: string; label: string }[];
  onAddVersion: () => void;
  onPublish: () => void;
  onShowImpactMap: () => void;

  features: FeatureItem[];
  /** Afficher le module fonctionnalités uniquement si Produit ET Version sont sélectionnés */
  showFeatures: boolean;
  selectedFeature: number | null;
  onSelectFeature: (id: number) => void;
  onAddFeature: () => void;
  onDeleteFeature: (id: number) => void;
  onCopyFeature: (id: number) => void;
  onPasteFeature: () => void;
  onReorderFeatures: (items: FeatureItem[]) => void;
  onToggleExpandFeature: (id: number, expand: boolean) => void;
  className?: string;
}

export const SyncLeftSidebar: React.FC<SyncLeftSidebarProps> = ({
  isExpanded,
  onToggle,
  selectedProductId,
  onSelectProduct,
  productOptions,
  selectedVersion,
  setSelectedVersion,
  versionOptions,
  onAddVersion,
  onPublish,
  onShowImpactMap,
  features,
  showFeatures,
  selectedFeature,
  onSelectFeature,
  onAddFeature,
  onDeleteFeature,
  onCopyFeature,
  onPasteFeature,
  onReorderFeatures,
  onToggleExpandFeature,
  className = "",
}) => {
  // ── Conversion string ↔ number — POINT UNIQUE dans l'application ──────────
  // ProductSelect est un composant générique qui ne connaît que des strings.
  // On convertit ici à la frontière UI, sans disséminer parseInt() ailleurs.
  const selectStringValue = selectedProductId === null ? "" : String(selectedProductId);

  const handleProductChange = (val: string) => {
    onSelectProduct(val ? Number.parseInt(val, 10) : null);
  };

  return (
    <>
      <div
        className={cn(
          "h-full bg-[#f7a900] rounded-r-[15px] shadow-lg transition-all duration-300 ease-in-out flex flex-col",
          isExpanded ? "w-[345px]" : "w-0",
          className
        )}
      >
        {/* Contenu scrollable */}
        <div className="pt-20 px-4 flex flex-col h-full overflow-hidden">
          <Separator />
          <div className="h-[26px] font-bold text-black text-[32px] leading-normal mb-4">
            Produit / Version
          </div>

          {/* Sélecteurs produit/version */}
          <div className="flex pt-5 gap-2 mb-2">
            <ProductSelect
              value={selectStringValue}
              onChange={handleProductChange}
              options={productOptions}
            />
            <VersionSelect
              value={selectedVersion}
              onChange={(val) => setSelectedVersion(val)}
              options={versionOptions}
              onAdd={onAddVersion}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 mb-2">
            <Button
              variant="primary"
              className="h-11 px-4 py-0 w-full"
              onClick={onPublish}
            >
              Publier le suivi de version
            </Button>
            <Button
              variant="outline"
              className="h-11 px-4 py-0 w-full"
              onClick={onShowImpactMap}
            >
              Afficher l'arbre d'impact
            </Button>
          </div>

          {/* Bloc Fonctionnalités — affiché uniquement après sélection Produit + Version */}
          <div className="flex-1 min-h-0 overflow-hidden p-2 transition-all duration-300">
            {isExpanded && showFeatures && (
              <div className="rounded-xl shadow h-full min-h-0">
                <FeatureModule
                  features={features}
                  selectedFeatureId={selectedFeature}
                  onSelectFeature={onSelectFeature}
                  onAdd={onAddFeature}
                  onDelete={onDeleteFeature}
                  onCopy={onCopyFeature}
                  onPaste={onPasteFeature}
                  onReorderFeatures={onReorderFeatures}
                  onToggleExpand={onToggleExpandFeature}
                />
              </div>
            )}
            {isExpanded && !showFeatures && (
              <p className="text-sm text-black/60 italic mt-4 text-center">
                Sélectionnez un produit et une version pour afficher les
                fonctionnalités.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bouton dock/undock */}
      <Button
        variant="ghost"
        className="fixed top-[120px] p-0 h-17 w-17 z-50 flex items-center justify-center rounded-full transition-all duration-300 ease-in-out hover:bg-gray-200"
        style={{
          left: isExpanded ? "345px" : "0",
          transform: "translateX(-50%)",
        }}
        onClick={onToggle}
      >
        <ArrowLeftCircle
          className={isExpanded ? "w-12 h-12" : "w-12 h-12 rotate-180"}
          aria-label="Leftbar toggle"
        />
      </Button>
    </>
  );
};
