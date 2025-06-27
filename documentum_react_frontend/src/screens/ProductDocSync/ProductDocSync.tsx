import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SyncLeftSidebar } from "components/ui/SyncLeftSidebar";
import { SyncEditor } from "components/ui/SyncEditor";
import { SyncBottombar } from "components/ui/SyncBottombar";
import { SyncRightSidebar } from "components/ui/SyncRightSidebar";
import { TopBar } from "components/ui/TopBar";
import { ImpactMapModal } from "components/ui/ImpactMapModal";
import type { FeatureItem } from "@/types/FeatureItem";
import { toast } from "sonner";

const products = ["Planning", "Usager", "Finance"];
const productOptions = products.map((p) => ({
  value: p.toLowerCase(),
  label: p,
}));

export const ProductDocSync: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("");
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
  const [isLeftSidebarExpanded, setIsLeftSidebarExpanded] = useState(true);
  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState(true);
  const [copiedFeature, setCopiedFeature] = useState<FeatureItem | null>(null);

  const [features, setFeatures] = useState<FeatureItem[]>([
    {
      id: 1,
      name: "Fonctionnalité 1",
      level: 1,
      expanded: true,
      hasUpdate: true,
      hasEvolution: true,
      hasCorrectif: false,
    },
    {
      id: 2,
      name: "Fonctionnalité 2",
      level: 2,
      expanded: true,
      hasUpdate: false,
      hasEvolution: false,
      hasCorrectif: true,
    },
    {
      id: 3,
      name: "Fonctionnalité 3",
      level: 1,
      expanded: true,
      hasUpdate: true,
      hasEvolution: true,
      hasCorrectif: true,
    },
  ]);

  const navigate = useNavigate();

  const handleScreenSwitch = () => {
    navigate("/desktop");
  };

  const [versions, setVersions] = useState(["1.0", "1.1", "1.2"]);

  const versionOptions = versions.map((v) => ({
    value: v,
    label: v,
  }));

  const handleAddVersion = () => {
    const last = versions[versions.length - 1];
    const [major, minor] = last.split(".").map(Number);
    const newVersion = `${major}.${minor + 1}`;

    setVersions([...versions, newVersion]);
    setSelectedVersion(newVersion);
  };

  const handlePublishVersion = () => {
    alert(
      `Le suivi de ${selectedProduct} version ${selectedVersion} a été publié !`
    );
  };

  const [selectedArticleType, setSelectedArticleType] = useState<
    "evolution" | "correctif"
  >("evolution");

  const [showImpactMap, setShowImpactMap] = useState(false);

  const handleShowImpactMap = () => setShowImpactMap(true);
  const handleCloseImpactMap = () => setShowImpactMap(false);

  const handleToggleExpand = (id: number, expand: boolean) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, expanded: expand } : f))
    );
  };

  const handleReorder = (newItems: FeatureItem[]) => {
    setFeatures(newItems);
  };

  const handleIndent = (id: number) => {
    setFeatures((prev) =>
      prev.map((f) =>
        f.id === id && f.level < 5 ? { ...f, level: f.level + 1 } : f
      )
    );
  };

  const handleOutdent = (id: number) => {
    setFeatures((prev) =>
      prev.map((f) =>
        f.id === id && f.level > 1 ? { ...f, level: f.level - 1 } : f
      )
    );
  };

  const handleDeleteFeature = (id: number) => {
    setFeatures((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAddFeature = () => {
    const newId = Math.max(...features.map((f) => f.id)) + 1;
    setFeatures((prev) => [
      ...prev,
      { id: newId, name: `Fonctionnalité ${newId}`, level: 1, expanded: true },
    ]);
  };

  const handleCopyFeature = (id: number) => {
    const feature = features.find((f) => f.id === id);
    if (feature) {
      setCopiedFeature({ ...feature });
      toast.success(`Fonctionnalité « ${feature.name} » copiée`);
    }
  };

  const handlePasteFeature = () => {
    if (!copiedFeature) return;

    const newId = Math.max(...features.map((f) => f.id)) + 1;
    const newFeature: FeatureItem = {
      ...copiedFeature,
      id: newId,
      name: copiedFeature.name + " (copie)",
    };

    setFeatures((prev) => [...prev, newFeature]);
    console.log("Fonctionnalité collée :", newFeature.name);
  };

  return (
    <div className="relative flex flex-col min-h-screen overflow-visible">
      <TopBar
        currentScreen="product-doc-sync"
        onToggleScreen={handleScreenSwitch}
      />
      <div className="flex flex-grow">
        <div
          className={`$${
            isLeftSidebarExpanded ? "w-[345px]" : "w-0"
          } transition-all duration-300`}
        >
          <SyncLeftSidebar
            isExpanded={isLeftSidebarExpanded}
            onToggle={() => setIsLeftSidebarExpanded(!isLeftSidebarExpanded)}
            onAddVersion={handleAddVersion}
            onPublish={handlePublishVersion}
            products={products}
            versions={versions}
            features={features}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            productOptions={productOptions}
            selectedVersion={selectedVersion}
            setSelectedVersion={setSelectedVersion}
            versionOptions={versionOptions}
            selectedFeature={selectedFeature}
            setSelectedFeature={setSelectedFeature}
            onSelectFeature={setSelectedFeature}
            onToggleExpand={handleToggleExpand}
            onReorderFeatures={handleReorder}
            onIndent={handleIndent}
            onOutdent={handleOutdent}
            onDeleteFeature={handleDeleteFeature}
            onAddFeature={handleAddFeature}
            onCopyFeature={handleCopyFeature}
            onPasteFeature={handlePasteFeature}
            onShowImpactMap={handleShowImpactMap}
            onToggleExpandFeature={handleToggleExpand}
          />
          <ImpactMapModal
            open={showImpactMap}
            onClose={handleCloseImpactMap}
            product={selectedProduct}
            version={selectedVersion}
          />
        </div>
        <div
          className="flex flex-grow transition-all duration-300 ease-in-out"
          style={{
            width: isRightSidebarExpanded ? "calc(100% - 248px)" : "100%",
          }}
        >
          <div className="flex flex-col flex-grow min-w-0">
            <SyncEditor
              selectedType={selectedArticleType}
              onTypeChange={setSelectedArticleType}
            />
            <SyncBottombar
              selectedFeatureName={
                selectedFeature
                  ? features.find((f) => f.id === selectedFeature)?.name || "-"
                  : "-"
              }
            />
          </div>
        </div>
        <div
          className={`${
            isRightSidebarExpanded ? "w-[248px]" : "w-0"
          } transition-all duration-300`}
        >
          <SyncRightSidebar
            isExpanded={isRightSidebarExpanded}
            onToggle={() => setIsRightSidebarExpanded(!isRightSidebarExpanded)}
          />
        </div>
      </div>
    </div>
  );
};
