// src/types/MapItem.ts

export interface MapItem {
  id: number;
  title: string;
  isMaster: boolean;
  level: number;
  expanded?: boolean;
  active?: boolean;
  versionOrigine?: string;

  /** Pour gérer une arborescence explicite */
  parentId?: number | null;
}
