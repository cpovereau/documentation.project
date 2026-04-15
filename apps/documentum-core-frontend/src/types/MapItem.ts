// src/types/MapItem.ts

export interface MapItem {
  id: number;
  rubriqueId: number | null;
  title: string;
  isMaster: boolean;
  level: number;
  expanded?: boolean;
  active?: boolean;
  versionOrigine?: string;

  /** UI / Structure */
  isRoot?: boolean

  /** Pour gérer une arborescence explicite */
  parentId: number | null;
}
