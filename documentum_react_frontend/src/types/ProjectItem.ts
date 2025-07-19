// src/types/ProjectItem.ts
import type { MapItem } from "./MapItem";

export interface ProjectItem {
  id: number;
  title: string;
  gamme: string;
  mapItems: MapItem[];
}
