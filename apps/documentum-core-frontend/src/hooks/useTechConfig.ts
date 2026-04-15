import { useEffect, useState } from "react";
import { TechConfig } from "@/types/TechConfig";

const DEFAULT_CONFIG: TechConfig = {
  languagetoolEnabled: true,
  apiUrl: "http://localhost:8000/api/",
  apiTimeout: 3000,
  apiPrefix: "/api/v1/",
  exportPath: "/var/export/",
  tempPath: "/tmp/documentum/",
  mediaPath: "/var/media/",
  logRetentionDays: 30,
  purgeArchives: false,
  maxActiveVersions: 5,
  debugMode: false,
  showSQL: false,
  taskTimeout: 10000,
  sessionDurationMinutes: 60,
  tokenDurationHours: 24,
  maxLoginFails: 5,
  maintenanceMode: false,
};

export function useTechConfig() {
  const [config, setConfig] = useState<TechConfig>(DEFAULT_CONFIG);

  // Chargement initial depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem("techConfig");
    if (stored) {
      try {
        setConfig(JSON.parse(stored));
      } catch {
        console.warn("Configuration invalide ignorée");
      }
    }
  }, []);

  // Sauvegarde automatique en localStorage
  useEffect(() => {
    localStorage.setItem("techConfig", JSON.stringify(config));
  }, [config]);

  const updateConfig = (partial: Partial<TechConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
  };

  return {
    config,
    updateConfig,
    resetConfig,
  };
}