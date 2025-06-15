// src/components/ui/ProductSelect.tsx
import React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "components/ui/select";

interface ProductSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  className?: string;
}

export const ProductSelect: React.FC<ProductSelectProps> = ({
  value,
  onChange,
  options = [],
  disabled = false,
  className = "",
}) => (
  <Select
    value={value}
    onValueChange={onChange}
    disabled={disabled}
    modal={false}
    position="popper"
  >
    <SelectTrigger className={className}>
      <SelectValue placeholder="Produit ?">
        {value ? options.find((opt) => opt.value === value)?.label : null}
      </SelectValue>
    </SelectTrigger>
    <SelectContent>
      {options.map((opt) => (
        <SelectItem key={opt.value} value={opt.value}>
          {opt.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);
