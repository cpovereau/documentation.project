import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "components/ui/dialog";
import { ImpactMapGraph } from "components/ui/ImpactMapGraph";

import type { TaskNode } from "components/ui/TestPlanModal";

interface ImpactMapModalProps {
  open: boolean;
  onClose: () => void;
  product: string;
  version: string;
  height?: number;
  onGenerateTestPlan?: (tasks: TaskNode[]) => void;
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
        <DialogContent className="max-w-5xl h-full flex flex-col">
          <DialogHeader>
            <DialogTitle>{`Arbre d’impact : ${product} ${version}`}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <ImpactMapGraph onGenerateTestPlan={onGenerateTestPlan} />
          </div>

          <DialogFooter>
            <></>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
