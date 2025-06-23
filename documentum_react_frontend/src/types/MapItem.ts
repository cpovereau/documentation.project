export interface MapItem {
  id: number;
  title: string;
  isMaster: boolean;
  level: number;
  expanded?: boolean;
  active?: boolean;
}
