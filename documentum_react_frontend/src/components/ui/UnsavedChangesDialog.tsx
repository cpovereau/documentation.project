import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UnsavedChangesDialogProps {
  open: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  open,
  saving,
  onSave,
  onDiscard,
  onCancel,
}) => (
  <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>Modifications non sauvegardées</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-gray-600 mt-2">
        La rubrique en cours contient des modifications non enregistrées.
        Que souhaitez-vous faire ?
      </p>
      <div className="flex flex-col gap-2 mt-4">
        <Button
          className="w-full bg-[#15803d] hover:bg-[#166534] text-white"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Button
          variant="outline"
          className="w-full border-red-300 text-red-600 hover:bg-red-50"
          onClick={onDiscard}
          disabled={saving}
        >
          Quitter sans enregistrer
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          onClick={onCancel}
          disabled={saving}
        >
          Annuler
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);
