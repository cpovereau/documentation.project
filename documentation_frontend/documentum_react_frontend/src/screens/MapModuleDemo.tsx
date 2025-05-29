import React, { useState } from "react";
import { MapModule, MapItem } from "components/ui/MapModule";

const initialMapItems: MapItem[] = [
  { id: 1, title: "Racine", level: 0, expanded: true },
  { id: 2, title: "Introduction", level: 1 },
  { id: 3, title: "Connexion à l'application", level: 1 },
  {
    id: 4,
    title: "Dossier de l'Usager",
    level: 1,
    expanded: true,
    active: true,
  },
  { id: 5, title: "Administratif", level: 2 },
  { id: 6, title: "Etablissement", level: 3 },
  { id: 7, title: "Etat Civil", level: 3 },
];

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
    />
  );
};
