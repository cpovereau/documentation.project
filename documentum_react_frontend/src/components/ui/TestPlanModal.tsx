import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "components/ui/dialog";
import { Button } from "components/ui/button";
import { ChevronUp, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TaskNode {
  id: string;
  label: string;
}

interface TestPlanModalProps {
  open: boolean;
  onClose: () => void;
  tasks: TaskNode[];
  onReorder: (newOrder: TaskNode[]) => void;
  onGenerate: (orderedTasks: TaskNode[]) => void;
}

export const TestPlanModal: React.FC<TestPlanModalProps> = ({
  open,
  onClose,
  tasks,
  onReorder,
  onGenerate,
}) => {
  const moveTask = (index: number, direction: "up" | "down") => {
    const newTasks = [...tasks];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= tasks.length) return;
    [newTasks[index], newTasks[target]] = [newTasks[target], newTasks[index]];
    onReorder(newTasks);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Plan de test – Ordonnancement</DialogTitle>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto">
          <ul className="space-y-2">
            {tasks.map((task, index) => (
              <li
                key={task.id}
                className="flex items-center justify-between bg-muted p-2 rounded shadow"
              >
                <span>{`${index + 1}. ${task.label}`}</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    onClick={() => moveTask(index, "up")}
                    disabled={index === 0}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => moveTask(index, "down")}
                    disabled={index === tasks.length - 1}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter>
          <div className={cn("mt-4 flex justify-between items-center")}>
            <Button
              variant="secondary"
              className="h-8 px-4 mr-3"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button className="h-8 px-4" onClick={() => onGenerate(tasks)}>
              Valider et générer le plan
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
