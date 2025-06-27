import React from "react";
import { Button } from "components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "components/ui/select";
import { Eye } from "lucide-react";

interface ToolbarCorrectionProps {
  selectedType: "evolution" | "correctif";
  onTypeChange: (type: "evolution" | "correctif") => void;
  currentIndex: number;
  totalCount: number;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  onShowView: () => void;
}

export const ToolbarCorrection: React.FC<ToolbarCorrectionProps> = ({
  selectedType,
  onTypeChange,
  currentIndex,
  totalCount,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  onShowView,
}) => {
  return (
    <div className="flex items-center gap-3 border-b px-4 py-2 mx-[30px] relative z-10">
      {/* Sélecteur Evolution/Correctif */}
      <Select value={selectedType ?? "evolution"} onValueChange={onTypeChange}>
        <SelectTrigger className="min-w-[110px] max-w-[160px] px-3 truncate">
          <SelectValue>
            {selectedType === "evolution" ? "Évolution" : "Correctif"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="evolution">Évolution</SelectItem>
          <SelectItem value="correctif">Correctif</SelectItem>
        </SelectContent>
      </Select>

      {/* Compteur */}
      <span className="text-sm text-muted-foreground">
        ({totalCount === 0 ? 0 : currentIndex + 1}/{totalCount})
      </span>

      {/* Navigation */}
      <Button
        size="sm"
        variant="ghost"
        disabled={!hasPrevious}
        onClick={onPrevious}
      >
        ◀ Précédent
      </Button>
      <Button size="sm" variant="ghost" disabled={!hasNext} onClick={onNext}>
        Suivant ▶
      </Button>

      {/* Vue globale */}
      <Button
        size="icon"
        variant="ghost"
        className="ml-auto mr-[48px]"
        onClick={onShowView}
        title={`Afficher les ${
          selectedType === "evolution" ? "évolutions" : "correctifs"
        } de la version`}
      >
        <Eye className="w-5 h-5" />
      </Button>
    </div>
  );
};
