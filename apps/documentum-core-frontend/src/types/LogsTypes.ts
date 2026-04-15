export type LogType = 'modification' | 'export' | 'login' | 'audit';

export interface LogEntry {
  id: number;
  type: LogType;
  date: string; // format ISO 8601 ou human-readable
  utilisateur: string;
  action: string;
  cible?: string;
  description?: string;
  projet?: string; // pour les modifications ou exports
  map?: string; // pour les exports
  format?: string; // pour les exports (PDF, WebHelp...)
}