import { Button } from "components/ui/button";
import { Card, CardContent } from "components/ui/card";
import { useMaintenanceActions } from "hooks/useMaintenanceActions";
import { useState } from "react";
import { Checkbox } from "components/ui/checkbox";

export default function MaintenanceTab() {
  const {
    loading,
    archiveOldVersions,
    validateVersions,
    clearCache,
    clearSessions,
    exportLogs,
    exportConfig,
  } = useMaintenanceActions();

  const [includeInactiveProjects, setIncludeInactiveProjects] = useState(false);

  const ActionRow = ({
    label,
    onClick,
  }: {
    label: string;
    onClick: () => void;
  }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <Button
        className="px-6"
        variant="outline"
        disabled={loading}
        onClick={onClick}
      >
        Exécuter
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Section : Versions */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Maintenance des versions</h2>
          <ActionRow
            label="Archiver toutes les versions sauf la version active"
            onClick={
              () =>
                archiveOldVersions() /* includeInactiveProjects ignored pour l’instant */
            }
          />
          <ActionRow
            label="Vérifier les conflits de version"
            onClick={validateVersions}
          />
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeInactive"
              checked={includeInactiveProjects}
              onChange={() =>
                setIncludeInactiveProjects(!includeInactiveProjects)
              }
            />
            <label htmlFor="includeInactive" className="text-sm text-gray-600">
              Inclure les projets inactifs
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Section : Sessions et cache */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Nettoyage applicatif</h2>
          <ActionRow
            label="Supprimer les sessions expirées"
            onClick={clearSessions}
          />
          <ActionRow label="Vider le cache applicatif" onClick={clearCache} />
        </CardContent>
      </Card>

      {/* Section : Logs */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Journalisation & export</h2>
          <ActionRow
            label="Exporter les logs au format CSV"
            onClick={exportLogs}
          />
          <ActionRow
            label="Exporter la configuration complète"
            onClick={exportConfig}
          />
        </CardContent>
      </Card>
    </div>
  );
}
