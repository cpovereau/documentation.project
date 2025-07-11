import { useState } from "react";
import { Button } from "components/ui/button";
import { Plus, RefreshCcw } from "lucide-react";

interface Profil {
  id: number;
  nom: string;
  description: string;
  permissions: Record<string, boolean>;
}

interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  profilId: number | null;
  actif: boolean;
}

const permissionsDisponibles = [
  "creer_projet",
  "publier",
  "supprimer_map",
  "gerer_utilisateurs",
  "modifier_rubriques",
];

export default function AccessTab() {
  const [activeSubTab, setActiveSubTab] = useState<"profils" | "utilisateurs">(
    "profils"
  );

  const [profils, setProfils] = useState<Profil[]>([
    {
      id: 1,
      nom: "Administrateur",
      description: "Accès complet à toutes les fonctionnalités.",
      permissions: Object.fromEntries(
        permissionsDisponibles.map((p) => [p, true])
      ),
    },
    {
      id: 2,
      nom: "Rédacteur",
      description: "Peut créer et modifier des rubriques.",
      permissions: {
        creer_projet: true,
        publier: false,
        supprimer_map: false,
        gerer_utilisateurs: false,
        modifier_rubriques: true,
      },
    },
  ]);

  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([
    {
      id: 1,
      nom: "Dupont",
      prenom: "Jean",
      email: "j.dupont@example.com",
      profilId: 1,
      actif: true,
    },
  ]);

  const [profilActif, setProfilActif] = useState<Profil | null>(profils[0]);

  const togglePermission = (key: string) => {
    if (!profilActif) return;
    const updated = {
      ...profilActif,
      permissions: {
        ...profilActif.permissions,
        [key]: !profilActif.permissions[key],
      },
    };
    setProfilActif(updated);
    setProfils((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleAddProfil = () => {
    const newProfil: Profil = {
      id: Date.now(),
      nom: "Nouveau profil",
      description: "",
      permissions: {},
    };
    setProfils((prev) => [...prev, newProfil]);
    setProfilActif(newProfil);
  };

  const handleNomChange = (value: string) => {
    if (!profilActif) return;
    const updated = { ...profilActif, nom: value };
    setProfilActif(updated);
    setProfils((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDescriptionChange = (value: string) => {
    if (!profilActif) return;
    const updated = { ...profilActif, description: value };
    setProfilActif(updated);
    setProfils((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleAddUser = () => {
    const newUser: Utilisateur = {
      id: Date.now(),
      nom: "",
      prenom: "",
      email: "",
      profilId: null,
      actif: true,
    };
    setUtilisateurs((prev) => [...prev, newUser]);
  };

  const handleUserChange = (id: number, key: keyof Utilisateur, value: any) => {
    setUtilisateurs((prev) =>
      prev.map((user) => (user.id === id ? { ...user, [key]: value } : user))
    );
  };

  return (
    <div className="flex h-full">
      {/* Sous-menu vertical */}
      <div className="w-48 border-r border-gray-200 pr-2 mr-6 bg-orange-100">
        <div className="flex flex-col space-y-2 pt-6 ml-2">
          <Button
            variant={activeSubTab === "profils" ? "default" : "ghost"}
            className="justify-start"
            onClick={() => setActiveSubTab("profils")}
          >
            Profils
          </Button>
          <Button
            variant={activeSubTab === "utilisateurs" ? "default" : "ghost"}
            className="justify-start"
            onClick={() => setActiveSubTab("utilisateurs")}
          >
            Utilisateurs
          </Button>
        </div>
      </div>

      {/* Contenu contextuel */}
      <div className="flex-grow flex flex-col h-full">
        <div className="flex-grow overflow-y-auto">
          {activeSubTab === "profils" && (
            <div className="flex h-full">
              {/* Liste des profils */}
              <div className="w-1/3 pt-2 pr-4 border-r">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Liste des profils</h3>
                  <button
                    className="text-gray-600 hover:text-black"
                    title="Ajouter un profil"
                    onClick={handleAddProfil}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {profils.map((profil) => (
                    <Button
                      key={profil.id}
                      variant={
                        profilActif?.id === profil.id ? "default" : "ghost"
                      }
                      className="w-full justify-start"
                      onClick={() => setProfilActif(profil)}
                    >
                      {profil.nom || "(Sans nom)"}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Détail du profil sélectionné */}
              <div className="w-2/3 pl-6 pr-4 mt-6">
                {profilActif && (
                  <div>
                    <input
                      type="text"
                      value={profilActif.nom}
                      onChange={(e) => handleNomChange(e.target.value)}
                      className="text-xl font-bold mb-2 w-full border rounded px-3 py-1"
                    />
                    <textarea
                      value={profilActif.description}
                      onChange={(e) => handleDescriptionChange(e.target.value)}
                      className="text-sm text-gray-600 mb-4 w-full border rounded px-3 py-1"
                      placeholder="Description du profil..."
                    />

                    <div className="grid grid-cols-1 gap-1">
                      {permissionsDisponibles.map((key) => {
                        const value = profilActif.permissions[key] ?? false;
                        return (
                          <div
                            key={key}
                            className="flex items-start ml-1 gap-2"
                          >
                            <label className="capitalize font-medium w-48">
                              {key.replace("_", " ")} :
                            </label>
                            <Button
                              variant={value ? "success" : "outline"}
                              onClick={() => togglePermission(key)}
                              className="w-24 mr-4 mb-6"
                            >
                              {value ? "Oui" : "Non"}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSubTab === "utilisateurs" && (
            <div>
              <div className="flex justify-between items-center mb-4 mr-4 ">
                <h2 className="text-xl font-bold">Liste des utilisateurs</h2>
                <button
                  className="text-gray-600 hover:text-black"
                  title="Ajouter un utilisateur"
                  onClick={handleAddUser}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4 mr-4">
                {utilisateurs.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 border border-gray-300 p-3 rounded-md"
                  >
                    <div className="flex flex-col w-1/4">
                      <input
                        type="text"
                        placeholder="Prénom"
                        value={user.prenom}
                        onChange={(e) =>
                          handleUserChange(user.id, "prenom", e.target.value)
                        }
                        className="mb-1 border border-gray-300 rounded px-2 py-1"
                      />
                      <input
                        type="text"
                        placeholder="Nom"
                        value={user.nom}
                        onChange={(e) =>
                          handleUserChange(
                            user.id,
                            "nom",
                            e.target.value.toUpperCase()
                          )
                        }
                        className="border border-gray-300 font-semibold rounded px-2 py-1"
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={user.email}
                      onChange={(e) =>
                        handleUserChange(user.id, "email", e.target.value)
                      }
                      className="w-1/3 border border-gray-300 rounded px-2 py-1"
                    />
                    <select
                      className="w-1/4 border border-gray-300 rounded px-2 py-1"
                      value={user.profilId ?? ""}
                      onChange={(e) =>
                        handleUserChange(
                          user.id,
                          "profilId",
                          Number(e.target.value)
                        )
                      }
                    >
                      <option value="">Aucun profil</option>
                      {profils.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nom}
                        </option>
                      ))}
                    </select>
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      title="Réinitialiser le mot de passe"
                    >
                      <RefreshCcw className="w-5 h-5" />
                    </button>
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={user.actif}
                        onChange={(e) =>
                          handleUserChange(user.id, "actif", e.target.checked)
                        }
                      />
                      Actif
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bouton enregistrer global */}
        <div className="mt-4 flex justify-end">
          <Button className="h-11 px-6 bg-blue-600 mr-4 mb-6 text-white">
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}
