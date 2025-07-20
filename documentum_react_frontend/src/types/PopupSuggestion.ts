// src/types/PopupSuggestion.ts

export interface PopupProps {
  x: number;
  y: number;
  suggestions: string[];
  message: string;
  from: number;
  to: number;
  onReplace: (text: string, from: number, to: number) => void;
}