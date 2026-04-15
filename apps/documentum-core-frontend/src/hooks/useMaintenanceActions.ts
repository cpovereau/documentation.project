// src/hooks/useMaintenanceActions.ts
import { useState } from "react";
import { toast } from "sonner";

type CloneVersionPayload = {
  projetId: number;
  sourceVersionId: number;
  nouveauNom: string;
};

export const useMaintenanceActions = () => {
  const [loading, setLoading] = useState(false);

  const simulateAction = async (label: string, duration = 1500) => {
    setLoading(true);
    toast.info(`${label} en cours...`);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        toast.success(`${label} terminée.`);
        setLoading(false);
        resolve();
      }, duration);
    });
  };

  const cloneVersion = async ({ projetId, sourceVersionId, nouveauNom }: CloneVersionPayload) => {
    setLoading(true);
    toast.info(`Clonage de la version ${sourceVersionId}...`);
    // Simulation du clonage
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        toast.success(`Version ${nouveauNom} clonée avec succès !`);
        setLoading(false);
        resolve();
      }, 2000);
    });
  };

  return {
    loading,
    archiveOldVersions: () => simulateAction("Archivage des anciennes versions"),
    validateVersions: () => simulateAction("Vérification des conflits de version"),
    clearSessions: () => simulateAction("Suppression des sessions expirées"),
    clearCache: () => simulateAction("Nettoyage du cache applicatif"),
    exportLogs: () => simulateAction("Export des logs"),
    exportConfig: () => simulateAction("Export de la configuration"),
    cloneVersion,
  };
};
