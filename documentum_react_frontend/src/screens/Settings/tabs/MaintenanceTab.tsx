import { Button } from "components/ui/button";
import { Card, CardContent } from "components/ui/card";
import { useMaintenanceActions } from "hooks/useMaintenanceActions";
import { useState, useEffect } from "react";
import { Checkbox } from "components/ui/checkbox";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";

const MOCK_PROJETS = [
  { id: 1, nom: "Projet Usager" },
  { id: 2, nom: "Projet Planning" },
];

const MOCK_VERSIONS: { [key: string]: { id: number; label: string }[] } = {
  1: [
    { id: 101, label: "1.0.0" },
    { id: 102, label: "1.1.0" },
  ],
  2: [
    { id: 201, label: "2.0.0" },
    { id: 202, label: "2.1.0" },
  ],
};

export default function MaintenanceTab() {
  const {
    loading,
    archiveOldVersions,
    validateVersions,
    clearCache,
    clearSessions,
    exportLogs,
    exportConfig,
    cloneVersion,
  } = useMaintenanceActions();

  const [includeInactiveProjects, setIncludeInactiveProjects] = useState(false);
  const [showCloneForm, setShowCloneForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<
    string | undefined
  >();
  const [projectVersions, setProjectVersions] = useState<
    { id: number; label: string }[]
  >([]);
  const [selectedVersionId, setSelectedVersionId] = useState<
    string | undefined
  >();
  const [nouveauNom, setNouveauNom] = useState("");

  useEffect(() => {
    if (selectedProjectId) {
      const versions = MOCK_VERSIONS[selectedProjectId] || [];
      setProjectVersions(versions);
      setSelectedVersionId(undefined);
    }
  }, [selectedProjectId]);

  const ActionRow = (props: { label: string; onClick: () => void }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{props.label}</span>
      <Button
        className="px-6"
        variant="outline"
        disabled={loading}
        onClick={props.onClick}
      >
        Exécuter
      </Button>
    </div>
  );

  const handleClone = async () => {
    if (!selectedProjectId || !selectedVersionId || !nouveauNom) return;
    await cloneVersion({
      projetId: Number(selectedProjectId),
      sourceVersionId: Number(selectedVersionId),
      nouveauNom,
    });
    setShowCloneForm(false);
    setSelectedProjectId(undefined);
    setSelectedVersionId(undefined);
    setNouveauNom("");
  };

  return (
    <div className="space-y-6">
      {/* Section : Versions */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Maintenance des versions</h2>
          <ActionRow
            label="Archiver toutes les versions sauf la version active"
            onClick={() => archiveOldVersions()}
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
          <Button
            className="px-6"
            variant="outline"
            onClick={() => setShowCloneForm(!showCloneForm)}
          >
            Cloner une version
          </Button>

          {showCloneForm && (
            <div className="mt-4 space-y-4 border rounded p-4 bg-gray-50">
              <div className="space-y-1">
                <Label>Projet</Label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="border px-2 py-1 rounded w-full"
                >
                  <option value="">-- Choisir un projet --</option>
                  {MOCK_PROJETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nom}
                    </option>
                  ))}
                </select>
              </div>
              {selectedProjectId && (
                <div className="space-y-1">
                  <Label>Version source</Label>
                  <select
                    value={selectedVersionId}
                    onChange={(e) => setSelectedVersionId(e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                  >
                    <option value="">-- Choisir une version --</option>
                    {projectVersions.map((version) => (
                      <option key={version.id} value={version.id}>
                        {version.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-1">
                <Label htmlFor="nouveauNom">Nom de la nouvelle version</Label>
                <Input
                  id="nouveauNom"
                  value={nouveauNom}
                  onChange={(e) => setNouveauNom(e.target.value)}
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  className="h-11 px-6"
                  onClick={handleClone}
                  disabled={
                    loading ||
                    !nouveauNom ||
                    !selectedProjectId ||
                    !selectedVersionId
                  }
                >
                  Cloner
                </Button>
              </div>
            </div>
          )}
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
