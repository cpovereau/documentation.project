import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
}

function AddItemModal({
  open,
  onClose,
  onSubmit,
  itemType,
}: Readonly<AddItemModalProps>) {
  const [formData, setFormData] = useState<any>({});

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    if (!formData.nom) return;
    onSubmit({ ...formData, id: Date.now(), is_archived: false });
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
            <Input
              placeholder="Gamme associée"
              value={formData.gamme || ""}
              onChange={(e) => handleChange("gamme", e.target.value)}
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
            <Input
              placeholder="Produit associé"
              value={formData.produit || ""}
              onChange={(e) => handleChange("produit", e.target.value)}
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
        aria-labelledby="add-item-title"
        aria-describedby="add-item-desc"
      >
        <DialogHeader>
          <DialogTitle id="add-item-title">
            Ajouter {itemType.replace("_", " ")}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Cette boîte de dialogue permet d’ajouter un nouvel élément dans la
          catégorie {itemType.replace("_", " ")}.
        </DialogDescription>
        <div className="space-y-4 mt-2">{renderFields()}</div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave}>Ajouter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddItemModal;
