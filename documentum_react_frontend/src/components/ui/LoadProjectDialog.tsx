// src/components/ui/LoadProjectDialog.tsx
import React, { useEffect, useMemo, useState } from "react";
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
  getProjectDetailsValidated as getProjectDetails,
} from "@/lib/apiClient";
import { mapApiProjectToItem } from "@/lib/mappers";
import type { ProjectItem } from "@/types/ProjectItem";
import { toast } from "sonner";

// Type minimal pour la liste (réponse de GET /projets/)
interface Gamme {
  id: number;
  nom: string;
}
interface ProjectListItem {
  id: number;
  nom: string;
  gamme: Gamme;
  date_mise_a_jour: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (loadedProject: ProjectItem) => void;
  initialSelectedId?: number | null;
}

export const LoadProjectDialog: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  initialSelectedId = null,
}) => {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>(
    initialSelectedId ? String(initialSelectedId) : ""
  );
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedId(initialSelectedId ? String(initialSelectedId) : "");
    setQuery("");
    setLoading(true);
    api
      .get<ProjectListItem[]>("/projets/?archived=false")
      .then((res) => setProjects(res.data))
      .catch((err) => {
        console.error(err);
        toast.error("Impossible de charger la liste des projets.");
      })
      .finally(() => setLoading(false));
  }, [open, initialSelectedId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.nom.toLowerCase().includes(q) ||
        (p.gamme?.nom || "").toLowerCase().includes(q)
    );
  }, [projects, query]);

  const handleConfirm = async () => {
    if (!selectedId) {
      toast.error("Sélectionne un projet à charger.");
      return;
    }
    try {
      setLoading(true);
      const full = await getProjectDetails(Number(selectedId));
      const uiProject = mapApiProjectToItem(full);
      onConfirm(uiProject);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Erreur lors du chargement du projet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Charger un projet</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label>Rechercher</Label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nom de projet ou gamme"
            />
          </div>

          <div>
            <Label>Projet</Label>
            {/* Select natif (fonctionne dans les modales) */}
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">Choisir un projet...</option>
              {filtered.map((p) => (
                <option key={p.id} value={p.id.toString()}>
                  {p.nom} {p.gamme ? `— ${p.gamme.nom}` : ""}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              {filtered.length} projet(s)
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button className={"h-11 w-36"} variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button
              className={"h-11 w-36"}
              onClick={handleConfirm}
              disabled={loading || !selectedId}
            >
              Charger
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
