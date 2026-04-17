// src/components/ui/LoadProjectDialog.tsx
import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useProjets } from "@/hooks/useProjets";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (projectId: number) => void;
  initialSelectedId?: number | null;
}

export const LoadProjectDialog: React.FC<Props> = ({
  open,
  onClose,
  onSelect,
  initialSelectedId = null,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    initialSelectedId ? String(initialSelectedId) : "",
  );
  const [query, setQuery] = useState("");

  const { data: projects = [], isLoading: loading } = useProjets(open);

  // Reset UI quand la modale s'ouvre
  React.useEffect(() => {
    if (open) {
      setSelectedId(initialSelectedId ? String(initialSelectedId) : "");
      setQuery("");
    }
  }, [open, initialSelectedId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.nom.toLowerCase().includes(q) ||
        (p.gamme?.nom || "").toLowerCase().includes(q),
    );
  }, [projects, query]);

  const handleConfirm = () => {
    if (!selectedId) {
      toast.error("Sélectionnez un projet à charger.");
      return;
    }
    onSelect(Number(selectedId));
    onClose();
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
            <p className="text-xs text-muted-foreground mt-1">{filtered.length} projet(s)</p>
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
