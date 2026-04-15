import React from "react";
import { Input } from "components/ui/input";
import { Switch } from "components/ui/switch";
import { Button } from "components/ui/button";
import { Label } from "components/ui/label";
import { Card, CardContent } from "components/ui/card";
import { useTechConfig } from "hooks/useTechConfig";
import { toast } from "sonner";

export default function TechTab() {
  const { config, updateConfig } = useTechConfig();

  const handleSave = () => {
    toast.success("Paramètres techniques enregistrés");
  };

  return (
    <div className="p-6 space-y-8">
      {/* Section 1 : Services et APIs */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-lg font-semibold">Services et APIs</h2>

          <div className="flex items-center justify-between">
            <Label htmlFor="languagetool">Activer LanguageTool</Label>
            <Switch
              id="languagetool"
              checked={config.languagetoolEnabled}
              onCheckedChange={(v) => updateConfig({ languagetoolEnabled: v })}
            />
          </div>

          <div>
            <Label htmlFor="api-url">URL de l'API backend</Label>
            <Input
              id="api-url"
              value={config.apiUrl}
              onChange={(e) => updateConfig({ apiUrl: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="api-timeout">Timeout des appels API (ms)</Label>
            <Input
              id="api-timeout"
              type="number"
              value={config.apiTimeout}
              onChange={(e) =>
                updateConfig({ apiTimeout: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <Label htmlFor="api-prefix">Préfixe API</Label>
            <Input
              id="api-prefix"
              value={config.apiPrefix}
              onChange={(e) => updateConfig({ apiPrefix: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 2 : Répertoires */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-lg font-semibold">Répertoires techniques</h2>

          <div>
            <Label htmlFor="export-path">Dossier d'export (PDF, Web)</Label>
            <Input
              id="export-path"
              value={config.exportPath}
              onChange={(e) => updateConfig({ exportPath: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="temp-path">Dossier temporaire</Label>
            <Input
              id="temp-path"
              value={config.tempPath}
              onChange={(e) => updateConfig({ tempPath: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="media-path">Dossier des médias</Label>
            <Input
              id="media-path"
              value={config.mediaPath}
              onChange={(e) => updateConfig({ mediaPath: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 3 : Mémoire & Historique */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-lg font-semibold">Mémoire & Historique</h2>

          <div>
            <Label htmlFor="log-retention">Conservation des logs (jours)</Label>
            <Input
              id="log-retention"
              type="number"
              value={config.logRetentionDays}
              onChange={(e) =>
                updateConfig({ logRetentionDays: Number(e.target.value) })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="purge-archives">
              Purge automatique des versions archivées
            </Label>
            <Switch
              id="purge-archives"
              checked={config.purgeArchives}
              onCheckedChange={(v) => updateConfig({ purgeArchives: v })}
            />
          </div>

          <div>
            <Label htmlFor="version-limit">
              Limite versions actives par projet
            </Label>
            <Input
              id="version-limit"
              type="number"
              value={config.maxActiveVersions}
              onChange={(e) =>
                updateConfig({ maxActiveVersions: Number(e.target.value) })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 4 : Débogage */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-lg font-semibold">Débogage & Performance</h2>

          <div className="flex items-center justify-between">
            <Label htmlFor="debug-mode">Mode debug</Label>
            <Switch
              id="debug-mode"
              checked={config.debugMode}
              onCheckedChange={(v) => updateConfig({ debugMode: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="log-sql">Afficher les requêtes SQL</Label>
            <Switch
              id="log-sql"
              checked={config.showSQL}
              onCheckedChange={(v) => updateConfig({ showSQL: v })}
            />
          </div>

          <div>
            <Label htmlFor="task-timeout">Timeout max pour tâches (ms)</Label>
            <Input
              id="task-timeout"
              type="number"
              value={config.taskTimeout}
              onChange={(e) =>
                updateConfig({ taskTimeout: Number(e.target.value) })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 5 : Sécurité */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-lg font-semibold">Sécurité & Sessions</h2>

          <div>
            <Label htmlFor="session-duration">Durée de session (minutes)</Label>
            <Input
              id="session-duration"
              type="number"
              value={config.sessionDurationMinutes}
              onChange={(e) =>
                updateConfig({ sessionDurationMinutes: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <Label htmlFor="token-duration">
              Durée de validité des tokens (heures)
            </Label>
            <Input
              id="token-duration"
              type="number"
              value={config.tokenDurationHours}
              onChange={(e) =>
                updateConfig({ tokenDurationHours: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <Label htmlFor="max-login-fails">
              Tentatives de connexion avant blocage
            </Label>
            <Input
              id="max-login-fails"
              type="number"
              value={config.maxLoginFails}
              onChange={(e) =>
                updateConfig({ maxLoginFails: Number(e.target.value) })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="maintenance-mode">
              Activer le mode maintenance
            </Label>
            <Switch
              id="maintenance-mode"
              checked={config.maintenanceMode}
              onCheckedChange={(v) => updateConfig({ maintenanceMode: v })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bouton Enregistrer */}
      <div className="mt-4 flex justify-end">
        <Button
          className="h-11 px-6 bg-blue-600 text-white"
          onClick={handleSave}
        >
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
