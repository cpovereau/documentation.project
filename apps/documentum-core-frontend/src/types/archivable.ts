export interface ArchivableItem {
  id: number;
  nom: string;
  is_archived: boolean;
  [key: string]: any;
}
