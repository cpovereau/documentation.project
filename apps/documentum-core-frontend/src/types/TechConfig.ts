export interface TechConfig {
  // Section 1: Services et APIs
  languagetoolEnabled: boolean;
  apiUrl: string;
  apiTimeout: number;
  apiPrefix: string;

  // Section 2: Répertoires techniques
  exportPath: string;
  tempPath: string;
  mediaPath: string;

  // Section 3: Mémoire & Historique
  logRetentionDays: number;
  purgeArchives: boolean;
  maxActiveVersions: number;

  // Section 4: Débogage & Performance
  debugMode: boolean;
  showSQL: boolean;
  taskTimeout: number;

  // Section 5: Sécurité & Sessions
  sessionDurationMinutes: number;
  tokenDurationHours: number;
  maxLoginFails: number;
  maintenanceMode: boolean;
}