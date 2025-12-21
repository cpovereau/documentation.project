// components/LoadMapDialog.tsx
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface ProjectMap {
  id: number;
  nom: string;
  is_master: boolean;
}

interface LoadMapDialogProps {
  open: boolean;
  onClose: () => void;
  maps: ProjectMap[];
  onSelect: (mapId: number) => void;
}

export const LoadMapDialog: React.FC<LoadMapDialogProps> = ({ open, onClose, maps, onSelect }) => {
  const [searchText, setSearchText] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filteredMaps = maps.filter((m) => m.nom.toLowerCase().includes(searchText.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Choisir une map du projet</DialogTitle>
        </DialogHeader>

        <Input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Rechercher une map"
          className="my-2"
        />

        <Separator />

        <div className="max-h-[250px] overflow-y-auto space-y-1 mt-2">
          {filteredMaps.map((map) => (
            <div
              key={map.id}
              onClick={() => setSelectedId(map.id)}
              className={`cursor-pointer p-2 rounded border ${
                selectedId === map.id ? "border-blue-600 bg-blue-50" : "hover:bg-gray-100"
              }`}
            >
              <div className="font-semibold">{map.nom}</div>
              {map.is_master && (
                <span className="text-[10px] bg-blue-200 text-blue-800 px-1 rounded">
                  map maître
                </span>
              )}
            </div>
          ))}

          {filteredMaps.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-4">
              Aucune map disponible pour ce projet.
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            disabled={selectedId === null}
            onClick={() => {
              if (selectedId !== null) {
                onSelect(selectedId);
              }
              onClose();
            }}
          >
            Charger la map
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
