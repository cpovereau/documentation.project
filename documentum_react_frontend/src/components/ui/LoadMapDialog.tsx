// components/LoadMapDialog.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { MapItem } from "@/types/MapItem";

interface LoadMapDialogProps {
  open: boolean;
  onClose: () => void;
  onLoad: (selectedMap: MapItem[]) => void;
  availableMaps: {
    id: number;
    title: string;
    isMaster: boolean;
    versionOrigine?: string;
    projet: string;
    gamme: string;
  }[];
}

export const LoadMapDialog: React.FC<LoadMapDialogProps> = ({
  open,
  onClose,
  onLoad,
  availableMaps,
}) => {
  const [searchText, setSearchText] = useState("");
  const [filterBy, setFilterBy] = useState<"projet" | "gamme" | "titre">(
    "titre"
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filteredMaps = availableMaps.filter((m) => {
    let value: string;
    if (filterBy === "projet") {
      value = m.projet;
    } else if (filterBy === "gamme") {
      value = m.gamme;
    } else {
      value = m.title;
    }
    return value.toLowerCase().includes(searchText.toLowerCase());
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Charger une Map existante</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 my-2">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="titre">Titre</option>
            <option value="projet">Projet</option>
            <option value="gamme">Gamme</option>
          </select>
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={`Rechercher par ${filterBy}`}
            className="flex-1"
          />
        </div>

        <Separator />

        <div className="max-h-[250px] overflow-y-auto space-y-1">
          {filteredMaps.map((map) => (
            <div
              key={map.id}
              onClick={() => setSelectedId(map.id)}
              className={`cursor-pointer p-2 rounded border ${
                selectedId === map.id
                  ? "border-blue-600 bg-blue-50"
                  : "hover:bg-gray-100"
              }`}
            >
              <div className="font-semibold">{map.title}</div>
              <div className="text-sm text-gray-500">
                Projet : {map.projet} • Gamme : {map.gamme}
              </div>
              {map.versionOrigine && (
                <div className="text-xs text-gray-400">
                  Version d’origine : v{map.versionOrigine}
                </div>
              )}
              {map.isMaster && (
                <span className="text-[10px] bg-blue-200 text-blue-800 px-1 rounded ml-2">
                  maître
                </span>
              )}
            </div>
          ))}
          {filteredMaps.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-4">
              Aucune map trouvée.
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button className="h-11 px-4" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            className="h-11 px-4"
            disabled={selectedId === null}
            onClick={() => {
              const selected = availableMaps.find((m) => m.id === selectedId);
              if (selected) {
                onLoad([
                  {
                    id: selected.id,
                    title: selected.title,
                    isMaster: selected.isMaster,
                    level: 0,
                    versionOrigine: selected.versionOrigine,
                    expanded: true,
                  },
                ]);
              }
              onClose();
            }}
          >
            Charger cette map
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
