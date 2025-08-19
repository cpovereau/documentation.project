// src/components/ui/CreateProjectDialog.tsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import api, {
  createProjectValidated as createProject,
  getProjectDetailsValidated as getProjectDetails,
} from "@/lib/apiClient";
import { mapApiProjectToItem } from "@/lib/mappers";
import type { ProjectItem } from "@/types/ProjectItem";
import { toast } from "sonner";

interface Gamme {
  id: number;
  nom: string;
  is_archived: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (newProject: ProjectItem) => void;
}

export const CreateProjectDialog: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [gammeId, setGammeId] = useState<string>("");
  const [gammes, setGammes] = useState<Gamme[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    nom?: string;
    description?: string;
    gamme?: string;
  }>({});

  useEffect(() => {
    if (open) {
      setNom("");
      setDescription("");
      setGammeId("");
      api.get("/gammes/").then((res) => {
        setGammes(res.data.filter((g: Gamme) => !g.is_archived));
      });
    }
  }, [open]);

  const handleConfirm = async () => {
    const nomTrim = nom.trim();
    const descTrim = description.trim();

    const nextErrors: typeof errors = {};
    if (!nomTrim) nextErrors.nom = "Le nom est requis.";
    if (!gammeId) nextErrors.gamme = "La gamme est requise.";
    if (!descTrim) nextErrors.description = "La description est requise.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      setLoading(true);
      const { projet } = await createProject({
        nom: nomTrim,
        description: descTrim, // jamais vide
        gamme_id: Number(gammeId),
      });
      const full = await getProjectDetails(projet.id);
      onConfirm(mapApiProjectToItem(full));
      onClose();
    } catch (err: any) {
      // remonte proprement les erreurs DRF par champ
      if (err.fields?.description) {
        setErrors((e) => ({
          ...e,
          description: String(err.fields.description),
        }));
      }
      toast.error(err.message ?? "Erreur lors de la création du projet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un nouveau projet</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label>Nom du projet</Label>
            <Input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Documentation Usager"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Obligatoire"
            />
          </div>

          <div>
            <Label>Gamme</Label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={gammeId}
              onChange={(e) => setGammeId(e.target.value)}
            >
              <option value="">Choisir une gamme...</option>
              {gammes.map((g) => (
                <option key={g.id} value={g.id.toString()}>
                  {g.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              className={"h-11 w-36"}
              onClick={handleConfirm}
              disabled={loading || !nom || !gammeId}
            >
              Créer le projet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
