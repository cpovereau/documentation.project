import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SyncLeftSidebar } from "components/ui/SyncLeftSidebar";
import { SyncCentralEditor } from "components/ui/SyncCentralEditor";
import { SyncRightSidebar } from "components/ui/SyncRightSidebar";
import { TopBar } from "components/ui/TopBar";
import { ImpactMapModal } from "components/ui/ImpactMapModal";

const products = ["Planning", "Usager", "Finance"];
const productOptions = products.map((p) => ({
  value: p.toLowerCase(),
  label: p,
}));
const features = [
  { id: 1, name: "Fonctionnalité 1", needsUpdate: true },
  { id: 2, name: "Fonctionnalité 2", needsUpdate: false },
  { id: 3, name: "Fonctionnalité 3", needsUpdate: true },
];

export const ProductDocSync: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("");
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
  const [isLeftSidebarExpanded, setIsLeftSidebarExpanded] = useState(true);
  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState(true);

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

  const [showImpactMap, setShowImpactMap] = useState(false);

  const handleShowImpactMap = () => setShowImpactMap(true);
  const handleCloseImpactMap = () => setShowImpactMap(false);

  return (
    <div className="relative flex flex-col min-h-screen overflow-visible">
      <TopBar
        currentScreen="product-doc-sync"
        onToggleScreen={handleScreenSwitch}
      />
      <div className="flex flex-grow">
        <div
          className={`${
            isLeftSidebarExpanded ? "w-[345px]" : "w-0"
          } transition-all duration-300`}
        >
          <SyncLeftSidebar
            isExpanded={isLeftSidebarExpanded}
            onToggle={() => setIsLeftSidebarExpanded(!isLeftSidebarExpanded)}
            onAddVersion={handleAddVersion}
            onPublish={handlePublishVersion}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            productOptions={productOptions}
            selectedVersion={selectedVersion}
            setSelectedVersion={setSelectedVersion}
            versionOptions={versionOptions}
            selectedFeature={selectedFeature}
            setSelectedFeature={setSelectedFeature}
            products={products}
            versions={versions}
            features={features}
            onShowImpactMap={handleShowImpactMap}
          />
          <ImpactMapModal
            open={showImpactMap}
            onClose={handleCloseImpactMap}
            product={selectedProduct}
            version={selectedVersion}
          />
        </div>
        <div className="flex-grow flex">
          <SyncCentralEditor
            selectedFeature={selectedFeature}
            features={features}
            isRightSidebarExpanded={isRightSidebarExpanded}
          />
          <div
            className={`${
              isRightSidebarExpanded ? "w-[248px]" : "w-0"
            } transition-all duration-300`}
          >
            <SyncRightSidebar
              isExpanded={isRightSidebarExpanded}
              onToggle={() =>
                setIsRightSidebarExpanded(!isRightSidebarExpanded)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
