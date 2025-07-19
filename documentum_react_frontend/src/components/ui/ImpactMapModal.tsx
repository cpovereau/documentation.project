import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "components/ui/dialog";
import { ImpactMapGraph } from "components/ui/ImpactMapGraph";
import { Button } from "components/ui/button";

interface ImpactMapModalProps {
  open: boolean;
  onClose: () => void;
  product: string;
  version: string;
  height?: number;
  onGenerateTestPlan?: () => void; // 🔧 Callback pour déclencher la génération
}

export const ImpactMapModal: React.FC<ImpactMapModalProps> = ({
  open,
  onClose,
  product,
  version,
  height,
  onGenerateTestPlan,
}) => {
  if (!open) return null;

  return (
    <div
      className="transition-all duration-300 bg-white border-t shadow-inner"
      style={{ height }}
    >
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-full flex flex-col">
          <DialogHeader>
            <DialogTitle>{`Arbre d’impact : ${product} ${version}`}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden border rounded bg-white">
            <ImpactMapGraph />
          </div>

          <DialogFooter className="mt-4 flex flex-col gap-2">
            <Button
              variant="secondary"
              className="h-11 w-full"
              onClick={onGenerateTestPlan}
            >
              Générer le plan de test
            </Button>

            <Button className="h-11 w-full" onClick={onClose}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
