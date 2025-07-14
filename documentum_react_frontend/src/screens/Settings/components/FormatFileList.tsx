import React, { useState } from "react";
import { cn } from "lib/utils";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "components/ui/dialog";
import { Button } from "components/ui/button";

interface FormatFileListProps {
  fichiers: { id: number; nom: string; contenu: string }[];
  selectedId: number | null;
  onSelect: (file: { id: number; nom: string; contenu: string }) => void;
  onDelete: (id: number) => void;
}

const FormatFileList: React.FC<FormatFileListProps> = ({
  fichiers,
  selectedId,
  onSelect,
  onDelete,
}) => {
  const [deleteId, setDeleteId] = useState<number | null>(null);

  if (fichiers.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">Aucun fichier disponible.</p>
    );
  }

  return (
    <>
      <div className="border rounded-md divide-y">
        {fichiers.map((file) => (
          <div
            key={file.id}
            className={cn(
              "group flex items-center justify-between px-4 py-2 text-sm cursor-pointer hover:bg-gray-50",
              file.id === selectedId &&
                "bg-gray-100 font-medium text-orange-700"
            )}
            onClick={() => onSelect(file)}
          >
            <span>{file.nom}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteId(file.id);
              }}
              className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Supprimer le fichier"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce fichier ?</DialogTitle>
            <DialogDescription>
              Cette action supprimera le fichier du système. Elle est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="ghost"
              className="h-11 px-4"
              onClick={() => setDeleteId(null)}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              className="h-11 px-4"
              onClick={() => {
                if (deleteId !== null) {
                  onDelete(deleteId);
                  setDeleteId(null);
                }
              }}
            >
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FormatFileList;
