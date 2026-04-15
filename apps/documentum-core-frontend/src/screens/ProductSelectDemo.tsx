// src/components/ui/ProductSelectDemo.tsx
import React, { useState } from "react";
import { ProductSelect } from "components/ui/ProductSelect";

export const ProductSelectDemo: React.FC = () => {
  const [product, setProduct] = useState("planning");

  const options = [
    { label: "Planning", value: "planning" },
    { label: "Usager", value: "usager" },
  ];

  return (
    <div className="p-6 w-[300px]">
      <h2 className="mb-2 font-semibold text-lg">Sélection du produit :</h2>
      <ProductSelect value={product} onChange={setProduct} options={options} />
      <p className="mt-4 text-sm text-muted-foreground">
        Produit sélectionné : <strong>{product}</strong>
      </p>
    </div>
  );
};
