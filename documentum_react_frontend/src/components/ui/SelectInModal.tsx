// components/ui/SelectInModal.tsx
import React from "react";

export interface SelectInModalProps {
  value: string;
  onChange: (value: string) => void;
  options: { id: number | string; label: string }[];
  placeholder?: string;
  className?: string;
  name?: string;
}

export function SelectInModal({
  value,
  onChange,
  options,
  placeholder = "Choisir une option",
  className = "",
  name,
}: Readonly<SelectInModalProps>) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full border rounded px-3 py-2 ${className}`}
      name={name}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export default SelectInModal;
