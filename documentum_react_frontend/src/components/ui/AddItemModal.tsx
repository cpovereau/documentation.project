import React, { useState } from "react";
import { SelectInModal } from "@/components/ui/SelectInModal";
import { ArchivableItem } from "@/types/archivable";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "components/ui/dialog";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Textarea } from "components/ui/textarea";

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (item: any) => void;
  itemType:
    | "gammes"
    | "produits"
    | "fonctionnalites"
    | "audiences"
    | "tags"
    | "profils_publication"
    | "interface_ui";
  gammes?: { id: number; nom: string }[];
  produits?: ArchivableItem[];
}

function AddItemModal({
  open,
  onClose,
  onSubmit,
  itemType,
  gammes,
  produits,
}: Readonly<AddItemModalProps>) {
  const [formData, setFormData] = useState<any>({});

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    if (!formData.nom) return;
    onSubmit({ ...formData, is_archived: false });
    onClose();
    setFormData({});
  };

  const renderFields = () => {
    switch (itemType) {
      case "gammes":
      case "audiences":
        return (
          <>
            <Input
              placeholder="Nom"
              value={formData.nom || ""}
              onChange={(e) => handleChange("nom", e.target.value)}
              className="mb-4"
            />
            <Textarea
              placeholder="Description"
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </>
        );
      case "produits":
        return (
          <>
            <Input
              placeholder="Nom"
              value={formData.nom || ""}
              onChange={(e) => handleChange("nom", e.target.value)}
              className="mb-4"
            />
            <Textarea
              placeholder="Description"
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              className="mb-4"
            />
            <SelectInModal
              value={formData.gamme || ""}
              onChange={(val) => handleChange("gamme", val)}
              options={gammes?.map((g) => ({ id: g.id, label: g.nom })) || []}
              placeholder="Gamme associée"
            />
          </>
        );
      case "fonctionnalites":
        return (
          <>
            <Input
              placeholder="Nom"
              value={formData.nom || ""}
              onChange={(e) => handleChange("nom", e.target.value)}
              className="mb-4"
            />
            <Input
              placeholder="ID Fonctionnalité"
              value={formData.id_fonctionnalite || ""}
              onChange={(e) =>
                handleChange("id_fonctionnalite", e.target.value)
              }
              className="mb-4"
            />
            <SelectInModal
              value={formData.produit || ""}
              onChange={(val) => handleChange("produit", val)}
              options={produits?.map((p) => ({ id: p.id, label: p.nom })) || []}
              placeholder="Produit associé"
            />
          </>
        );
      case "tags":
        return (
          <Input
            placeholder="Nom du tag"
            value={formData.nom || ""}
            onChange={(e) => handleChange("nom", e.target.value)}
          />
        );
      case "profils_publication":
        return (
          <>
            <Input
              placeholder="Nom"
              value={formData.nom || ""}
              onChange={(e) => handleChange("nom", e.target.value)}
              className="mb-4"
            />
            <Input
              placeholder="Type de sortie (PDF, Web...)"
              value={formData.type_sortie || ""}
              onChange={(e) => handleChange("type_sortie", e.target.value)}
            />
          </>
        );
      case "interface_ui":
        return (
          <>
            <Input
              placeholder="Nom"
              value={formData.nom || ""}
              onChange={(e) => handleChange("nom", e.target.value)}
              className="mb-4"
            />
            <Input
              placeholder="Type (Bouton, Écran...)"
              value={formData.type || ""}
              onChange={(e) => handleChange("type", e.target.value)}
              className="mb-4"
            />
            <Textarea
              placeholder="Description"
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
      >
        <DialogTitle id="modal-title">
          Ajouter {itemType.replace("_", " ")}
        </DialogTitle>

        <DialogDescription id="modal-desc">
          Cette boîte de dialogue permet d’ajouter un nouvel élément dans la
          catégorie {itemType.replace("_", " ")}.
        </DialogDescription>

        <div className="space-y-4 mt-2">{renderFields()}</div>

        <DialogFooter>
          <Button variant="outline" className="h-8 px-4" onClick={onClose}>
            Annuler
          </Button>
          <Button className="h-8 px-4" onClick={handleSave}>
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddItemModal;
