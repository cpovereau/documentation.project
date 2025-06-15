import React from "react";
import { Button } from "components/ui/button";
import { Separator } from "components/ui/separator";
import { ProductSelect } from "components/ui/ProductSelect";
import { VersionSelect } from "components/ui/VersionSelect";
import { FeatureModule, FeatureItem } from "components/ui/FeatureModule";
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
  onAddFeature: () => void;
  onDeleteFeature: (id: number) => void;
  onCopyFeature: (id: number) => void;
  onPasteFeature: () => void;
  onReorderFeatures: (items: FeatureItem[]) => void;
  onToggleExpandFeature: (id: number, expand: boolean) => void;
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
}) => (
  <>
    {/* Sidebar dockée à droite */}
    <div
      className={cn(
        "fixed top-[103px] bottom-0 left-0 z-40 transition-all duration-300 ease-in-out bg-[#f7a900] rounded-tl-2xl rounded-bl-2xl flex flex-col shadow-lg",
        isExpanded ? "w-[345px]" : "w-0 overflow-hidden"
      )}
      style={{ minWidth: isExpanded ? 345 : 0, maxWidth: 345 }}
    >
      <div className="pt-20 px-4 flex flex-col h-full p-4">
        <Separator />
        <div className="h-[26px] top-[11px] font-['Roboto',Helvetica] font-extrabold text-black text-[32px] tracking-[0] leading-normal whitespace-nowrap">
          Produit / Version
        </div>
        {/* Header : Produit / Version côte à côte */}
        <div className="flex pt-5 gap-2 mb-2">
          <ProductSelect
            value={selectedProduct}
            onChange={(val) => {
              console.log("produit choisi :", val);
              setSelectedProduct(val);
            }}
            options={productOptions}
          />
          <VersionSelect
            value={selectedVersion}
            onChange={(val) => {
              console.log("version choisie :", val);
              setSelectedVersion(val);
            }}
            options={versionOptions ?? []}
            onAdd={onAddVersion}
          />
        </div>
        {/* Boutons action contextuelle */}
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
              onSelect={onSelectFeature}
              onAdd={onAddFeature}
              onDelete={onDeleteFeature}
              onCopy={onCopyFeature}
              onPaste={onPasteFeature}
              onReorder={onReorderFeatures}
              onToggleExpand={onToggleExpandFeature}
            />
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
