import React, { useState } from "react";
import { SyncLeftSidebar } from "./SyncLeftSidebar";
import { SyncCentralEditor } from "./SyncCentralEditor";
import { SyncRightSidebar } from "./SyncRightSidebar";

const products = ["Planning", "Usager", "Finance"];
const versions = ["1.0", "1.1", "1.2"];
const features = [
  { id: 1, name: "Fonctionnalité 1", needsUpdate: true },
  { id: 2, name: "Fonctionnalité 2", needsUpdate: false },
  { id: 3, name: "Fonctionnalité 3", needsUpdate: true },
];

export const ProductDocSync: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [selectedVersion, setSelectedVersion] = useState(versions[0]);
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
  const [isLeftSidebarExpanded, setIsLeftSidebarExpanded] = useState(true);
  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState(true);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className={`${isLeftSidebarExpanded ? 'w-[345px]' : 'w-0'} transition-all duration-300`}>
        <SyncLeftSidebar
          isExpanded={isLeftSidebarExpanded}
          onToggle={() => setIsLeftSidebarExpanded(!isLeftSidebarExpanded)}
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          selectedVersion={selectedVersion}
          setSelectedVersion={setSelectedVersion}
          selectedFeature={selectedFeature}
          setSelectedFeature={setSelectedFeature}
          products={products}
          versions={versions}
          features={features}
        />
      </div>
      <div className="flex-grow overflow-hidden flex">
        <SyncCentralEditor
          selectedFeature={selectedFeature}
          features={features}
          isRightSidebarExpanded={isRightSidebarExpanded}
        />
        <div className={`${isRightSidebarExpanded ? 'w-[248px]' : 'w-0'} transition-all duration-300`}>
          <SyncRightSidebar
            isExpanded={isRightSidebarExpanded}
            onToggle={() => setIsRightSidebarExpanded(!isRightSidebarExpanded)}
          />
        </div>
      </div>
    </div>
  );
};
