import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "components/ui/dialog";
import { Button } from "components/ui/button";

interface ImpactMapModalProps {
  open: boolean;
  onClose: () => void;
  product: string;
  version: string;
}

export const ImpactMapModal: React.FC<ImpactMapModalProps> = ({
  open,
  onClose,
  product,
  version,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{`Arbre d’impact : ${product} ${version}`}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col justify-center items-center flex-1 h-full border rounded-md bg-muted text-muted-foreground p-4">
          <p className="text-center text-muted-foreground italic">
            Aperçu visuel de l’arbre d’impact à venir...
          </p>
        </div>
        <DialogFooter className="mt-4">
          <Button className="h-11 px-4 py-0 w-full" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
