import React from "react";
import { Button } from "components/ui/button";
import { Separator } from "components/ui/separator";
import { ProductSelect } from "components/ui/ProductSelect";
import { VersionSelect } from "components/ui/VersionSelect";
import { FeatureModule } from "components/ui/FeatureModule";
import type { FeatureItem } from "@/types/FeatureItem";
import { ArrowLeftCircle } from "lucide-react";
import { cn } from "lib/utils";

interface SyncLeftSidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  selectedProduct: string;
  setSelectedProduct: (val: string) => void;
  productOptions: { value: string; label: string }[];
  selectedVersion: string;
  setSelectedVersion: (val: string) => void;
  versionOptions: { value: string; label: string }[];
  onAddVersion: () => void;
  onPublish: () => void;
  onShowImpactMap: () => void;
  features: FeatureItem[];
  selectedFeature: number | null;
  onSelectFeature: (id: number) => void;
  setSelectedFeature: (id: number) => void;
  onAddFeature: () => void;
  onIndent: (id: number) => void;
  onOutdent: (id: number) => void;
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
  selectedProduct,
  setSelectedProduct,
  productOptions,
  selectedVersion,
  setSelectedVersion,
  versionOptions,
  onAddVersion,
  onPublish,
  onShowImpactMap,
  features,
  selectedFeature,
  onSelectFeature,
  onAddFeature,
  onDeleteFeature,
  onCopyFeature,
  onPasteFeature,
  onReorderFeatures,
  onToggleExpandFeature,
  onIndent,
  onOutdent,
  className = "",
}) => (
  <>
    <div
      className="w-[345px] h-full bg-[#f7a900] rounded-r-[15px] shadow-lg flex flex-col"
      style={{ width: isExpanded ? "345px" : "0px" }}
    >
      <div className="relative h-full">
        <div
          className="h-full bg-[#f7a900] rounded-r-[15px] shadow-lg transition-all duration-300 ease-in-out flex flex-col"
          style={{
            width: "345px",
            transform: isExpanded ? "translateX(0)" : "translateX(-345px)",
          }}
        >
          <div className="pt-20 px-4 flex flex-col h-full p-4">
            <Separator />
            <div className="h-[26px] top-[11px] font-bold text-black text-[32px] leading-normal mb-4">
              Produit / Version
            </div>

            {/* Produit / Version */}
            <div className="flex pt-5 gap-2 mb-2">
              <ProductSelect
                value={selectedProduct}
                onChange={(val) => setSelectedProduct(val)}
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

            {/* Bloc Fonctionnalités */}
            <div className="flex-1">
              <div className="rounded-xl shadow p-2 h-full flex flex-col">
                <FeatureModule
                  isExpanded={true}
                  onToggle={() => {}}
                  features={features}
                  selectedFeatureId={selectedFeature}
                  onSelectFeature={onSelectFeature}
                  onAdd={onAddFeature}
                  onDelete={onDeleteFeature}
                  onCopy={onCopyFeature}
                  onPaste={onPasteFeature}
                  onReorderFeatures={onReorderFeatures}
                  onToggleExpand={onToggleExpandFeature}
                  onIndent={onIndent}
                  onOutdent={onOutdent}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* Bouton dock/undock */}
    <Button
      variant="ghost"
      className={`fixed top-[120px] p-0 h-17 w-17 z-50 flex items-center justify-center rounded-full transition-all duration-300 ease-in-out hover:bg-gray-200`}
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
