// src/components/sidebar/VersionSelect.tsx
import React from "react";
import { Button } from "components/ui/button";
import { Plus } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "components/ui/select";

interface VersionSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  onAdd?: () => void;
  disabled?: boolean;
  className?: string;
}

export const VersionSelect: React.FC<VersionSelectProps> = ({
  value,
  onChange,
  options,
  onAdd,
  disabled = false,
  className = "",
}) => (
  <div className="flex items-center gap-1 w-full">
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled}
      modal={false}
      position="popper"
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="Sélectionner une version" />
        {value ? options.find((opt) => opt.value === value)?.label : null}
      </SelectTrigger>
      <SelectContent>
        {(options ?? []).map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {onAdd && (
      <Button
        variant="outline"
        className="ml-1 px-2 py-2"
        style={{ minWidth: 36, minHeight: 36 }}
        strokeWidth={2.5}
        aria-label="Ajouter une version"
        title="Ajouter une version"
        onClick={onAdd}
        type="button"
      >
        <Plus className="w-4 h-4" />
      </Button>
    )}
  </div>
);
