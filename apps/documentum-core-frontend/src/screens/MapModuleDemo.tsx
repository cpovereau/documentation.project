import React, { useState } from "react";
import { MapModule, MapItem } from "components/ui/MapModule";

const initialMapItems: MapItem[] = [
  { id: 1, title: "Racine", level: 0, active: true },
  { id: 2, title: "Introduction", level: 1 },
  { id: 3, title: "Connexion à l'application", level: 1 },
  {
    id: 4,
    title: "Dossier de l'Usager",
    level: 1,
  },
  { id: 5, title: "Administratif", level: 2 },
  { id: 6, title: "Etablissement", level: 3 },
  { id: 7, title: "Etat Civil", level: 3 },
];

const handleToggleExpand = (itemId: number, expand: boolean) => {
  setMapItems((prev) =>
    prev.map((item) =>
      item.id === itemId ? { ...item, expanded: expand } : item
    )
  );
};

export const MapModuleDemo = () => {
  const [mapItems, setMapItems] = useState<MapItem[]>(initialMapItems);
  const [selectedMapItemId, setSelectedMapItemId] = useState<number | null>(4);

  const handleSelect = (id: number) => setSelectedMapItemId(id);
  const handleAdd = () => {
    const newId = Math.max(...mapItems.map((i) => i.id)) + 1;
    setMapItems([
      ...mapItems,
      { id: newId, title: `Nouvelle rubrique ${newId}`, level: 1 },
    ]);
    setSelectedMapItemId(newId);
  };
  const handleClone = (id: number) => {
    const item = mapItems.find((i) => i.id === id);
    if (item) {
      const newId = Math.max(...mapItems.map((i) => i.id)) + 1;
      setMapItems([
        ...mapItems,
        { ...item, id: newId, title: item.title + " (Clone)" },
      ]);
      setSelectedMapItemId(newId);
    }
  };
  const handleDelete = (id: number) => {
    setMapItems(mapItems.filter((i) => i.id !== id));
    setSelectedMapItemId(null);
  };
  const handleIndent = (itemId: number) => {
    setMapItems((prev) =>
      prev.map((item, i, arr) => {
        if (item.id === itemId) {
          // On cherche le frère précédent pour vérifier la logique, ici simple :
          if (i === 0) return item;
          const prevLevel = arr[i - 1].level;
          return { ...item, level: Math.min(item.level + 1, prevLevel + 1) };
        }
        return item;
      })
    );
  };
  const handleOutdent = (itemId: number) => {
    setMapItems((prev) =>
      prev.map((item) =>
        item.id === itemId && item.level > 1
          ? { ...item, level: item.level - 1 }
          : item
      )
    );
  };
  const handleLoad = () => alert("Charger map");

  return (
    <MapModule
      isExpanded={true}
      onToggle={() => {}}
      mapItems={mapItems}
      selectedMapItemId={selectedMapItemId}
      onSelect={handleSelect}
      onAdd={handleAdd}
      onClone={handleClone}
      onDelete={handleDelete}
      onLoad={handleLoad}
      onIndent={handleIndent}
      onOutdent={handleOutdent}
      onToggleExpand={handleToggleExpand}
      onReorder={() => {}}
    />
  );
};
