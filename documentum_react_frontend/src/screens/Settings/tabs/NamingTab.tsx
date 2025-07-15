import React, { useState } from "react";
import { Button } from "components/ui/button";
import { NamingConfig } from "types/NamingConfig";

export default function NamingTab() {
  const [activeCategory, setActiveCategory] = useState("conventions");

  const [projectFormat, setProjectFormat] = useState("");
  const [customProjectFormat, setCustomProjectFormat] = useState("");

  const [versionFormat, setVersionFormat] = useState("");
  const [customVersionFormat, setCustomVersionFormat] = useState("");

  const [featureFormat, setFeatureFormat] = useState("");
  const [customFeatureFormat, setCustomFeatureFormat] = useState("");

  const [rubriqueFormat, setRubriqueFormat] = useState("");
  const [customRubriqueFormat, setCustomRubriqueFormat] = useState("");

  const [autoIncrementFeatures, setAutoIncrementFeatures] = useState(false);
  const [featureStartValue, setFeatureStartValue] = useState("001");

  const [autoIncrementRubriques, setAutoIncrementRubriques] = useState(false);
  const [rubriqueStartValue, setRubriqueStartValue] = useState("001");

  const [incrementOnClone, setIncrementOnClone] = useState(false);

  const handleSimulation = () => {
    const nextFeatureId = `${featureStartValue}-SIM`; // simulation
    const nextRubriqueId = `${rubriqueStartValue}-SIM`;
    console.log("Simulation :");
    if (autoIncrementFeatures)
      console.log("→ Prochaine fonctionnalité :", nextFeatureId);
    if (autoIncrementRubriques)
      console.log("→ Prochaine rubrique :", nextRubriqueId);
    alert("Simulation effectuée (voir console)");
  };

  const handleApplyGeneration = () => {
    alert("Génération appliquée (simulation)");
  };

  const getFinalFormat = (format: string, custom: string): string =>
    format === "custom" ? custom : format;

  const handleSave = () => {
    const config: NamingConfig = {
      projet: getFinalFormat(projectFormat, customProjectFormat),
      version: getFinalFormat(versionFormat, customVersionFormat),
      fonctionnalite: getFinalFormat(featureFormat, customFeatureFormat),
      rubrique: getFinalFormat(rubriqueFormat, customRubriqueFormat),
    };

    console.log("Configuration enregistrée (simulation) :", config);
    alert("Paramètres enregistrés avec succès (simulation).");
  };

  return (
    <div className="flex h-full">
      {/* Colonne latérale orange */}
      <div className="w-64 bg-orange-100 p-4 pt-6">
        <h2 className="text-lg font-semibold mb-4">Catégories</h2>
        <nav className="space-y-2">
          <Button
            variant={activeCategory === "conventions" ? "default" : "ghost"}
            className={`w-full text-left justify-start px-3 py-2 rounded font-medium text-sm ${
              activeCategory === "conventions"
                ? "bg-white text-orange-600 shadow"
                : "hover:bg-orange-200 text-gray-700"
            }`}
            onClick={() => setActiveCategory("conventions")}
          >
            Conventions de nommage
          </Button>
          <Button
            variant={activeCategory === "generation" ? "default" : "ghost"}
            className={`w-full text-left justify-start px-3 py-2 rounded font-medium text-sm ${
              activeCategory === "generation"
                ? "bg-white text-orange-600 shadow"
                : "hover:bg-orange-200 text-gray-700"
            }`}
            onClick={() => setActiveCategory("generation")}
          >
            Génération automatique
          </Button>
          <Button
            variant={activeCategory === "prefixes" ? "default" : "ghost"}
            className={`w-full text-left justify-start px-3 py-2 rounded font-medium text-sm ${
              activeCategory === "prefixes"
                ? "bg-white text-orange-600 shadow"
                : "hover:bg-orange-200 text-gray-700"
            }`}
            onClick={() => setActiveCategory("prefixes")}
          >
            Préfixes & Suffixes
          </Button>
          <Button
            variant={activeCategory === "validation" ? "default" : "ghost"}
            className={`w-full text-left justify-start px-3 py-2 rounded font-medium text-sm ${
              activeCategory === "validation"
                ? "bg-white text-orange-600 shadow"
                : "hover:bg-orange-200 text-gray-700"
            }`}
            onClick={() => setActiveCategory("validation")}
          >
            Validation & Restrictions
          </Button>
        </nav>
      </div>

      {/* Contenu dynamique */}
      <div className="flex-1 p-6 bg-white overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Paramètres de nommage</h1>

        {/* Conventions de nommage */}
        {activeCategory === "conventions" && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              Conventions de nommage
            </h2>
            <p className="text-sm text-gray-700 mb-4">
              Définissez ici les règles utilisées pour nommer vos projets,
              rubriques, versions, fonctionnalités, etc.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Projet */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Format des projets
                </label>
                <select
                  value={projectFormat}
                  onChange={(e) => setProjectFormat(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Aucune règle</option>
                  <option value="IDGamme-IDProduit-Nom">
                    IDGamme-IDProduit-Nom
                  </option>
                  <option value="Gamme - IDProduit - Nom">
                    Gamme - IDProduit - Nom
                  </option>
                  <option value="custom">Format personnalisé</option>
                </select>
              </div>
              {projectFormat === "custom" && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Format personnalisé
                  </label>
                  <input
                    type="text"
                    value={customProjectFormat}
                    onChange={(e) => setCustomProjectFormat(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="ex : P-{ID}-{Nom}"
                  />
                </div>
              )}
              {/* Version */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Format des versions
                </label>
                <select
                  value={versionFormat}
                  onChange={(e) => setVersionFormat(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Aucune règle</option>
                  <option value="X.Y">X.Y</option>
                  <option value="X.Y.Z">X.Y.Z</option>
                  <option value="AAAA.X.Y">AAAA.X.Y</option>
                  <option value="Rel-X.Y">Rel-X.Y</option>
                  <option value="custom">Format personnalisé</option>
                </select>
              </div>
              {versionFormat === "custom" && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Format personnalisé
                  </label>
                  <input
                    type="text"
                    value={customVersionFormat}
                    onChange={(e) => setCustomVersionFormat(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="ex : vX_buildY"
                  />
                </div>
              )}
              {/* Fonctionnalité */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Format des fonctionnalités
                </label>
                <select
                  value={featureFormat}
                  onChange={(e) => setFeatureFormat(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Aucune règle</option>
                  <option value="PROD-CODE">PROD-CODE</option>
                  <option value="PROD-FUNC-ID">PROD-FUNC-ID</option>
                  <option value="custom">Format personnalisé</option>
                </select>
              </div>
              {featureFormat === "custom" && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Format personnalisé
                  </label>
                  <input
                    type="text"
                    value={customFeatureFormat}
                    onChange={(e) => setCustomFeatureFormat(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="ex : {Produit}-{Code}"
                  />
                </div>
              )}
              {/* Rubrique */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Format des rubriques
                </label>
                <select
                  value={rubriqueFormat}
                  onChange={(e) => setRubriqueFormat(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Aucune règle</option>
                  <option value="PROD-FUNC-NOM.xml">PROD-FUNC-NOM.xml</option>
                  <option value="CODE-RUB.xml">CODE-RUB.xml</option>
                  <option value="custom">Format personnalisé</option>
                </select>
              </div>
              {rubriqueFormat === "custom" && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Format personnalisé
                  </label>
                  <input
                    type="text"
                    value={customRubriqueFormat}
                    onChange={(e) => setCustomRubriqueFormat(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="ex : DOC-{Produit}-{Nom}.xml"
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Génération automatique */}
        {activeCategory === "generation" && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Génération automatique
            </h2>
            <div className="space-y-6">
              {/* Fonctionnalités */}
              <div>
                <label className="flex items-center space-x-2 mb-1">
                  <input
                    type="checkbox"
                    checked={autoIncrementFeatures}
                    onChange={(e) => setAutoIncrementFeatures(e.target.checked)}
                  />
                  <span>
                    Activer l’incrémentation des identifiants de fonctionnalité
                  </span>
                </label>
                {autoIncrementFeatures && (
                  <div className="ml-6">
                    <p className="italic text-sm text-gray-500 mb-1">
                      Format enregistré : PROD-001
                    </p>
                    <input
                      type="text"
                      value={featureStartValue}
                      onChange={(e) => setFeatureStartValue(e.target.value)}
                      placeholder="Valeur de départ ex : 001"
                      className="border border-gray-300 rounded px-3 py-2 w-full md:w-1/2"
                    />
                  </div>
                )}
              </div>

              {/* Rubriques */}
              <div>
                <label className="flex items-center space-x-2 mb-1">
                  <input
                    type="checkbox"
                    checked={autoIncrementRubriques}
                    onChange={(e) =>
                      setAutoIncrementRubriques(e.target.checked)
                    }
                  />
                  <span>
                    Activer l’incrémentation des identifiants de rubrique
                  </span>
                </label>
                {autoIncrementRubriques && (
                  <div className="ml-6">
                    <p className="italic text-sm text-gray-500 mb-1">
                      Format enregistré : DOC-001
                    </p>
                    <input
                      type="text"
                      value={rubriqueStartValue}
                      onChange={(e) => setRubriqueStartValue(e.target.value)}
                      placeholder="Valeur de départ ex : 001"
                      className="border border-gray-300 rounded px-3 py-2 w-full md:w-1/2"
                    />
                  </div>
                )}
              </div>

              {/* Clonage */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={incrementOnClone}
                    onChange={(e) => setIncrementOnClone(e.target.checked)}
                  />
                  <span>
                    Incrémenter automatiquement les identifiants lors d’un
                    clonage
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  className="h-11 px-6"
                  onClick={handleSimulation}
                >
                  Simuler la génération
                </Button>
                <Button
                  variant="danger"
                  className="h-11 px-6"
                  onClick={handleApplyGeneration}
                >
                  Appliquer la génération
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Préfixes & Suffixes */}
        {activeCategory === "prefixes" && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Préfixes & Suffixes</h2>
            <p className="text-sm text-gray-700 mb-4">
              Définissez ici les préfixes ou suffixes utilisés lors de la
              génération des identifiants, fichiers, maps ou profils.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Préfixe pour les fichiers XML
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="ex : DOC_"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Suffixe pour les fichiers XML
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="ex : _v1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Préfixe suggéré pour les ID de fonctionnalités
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="ex : USA-"
                  title="Ce préfixe est proposé par défaut dans DataTab lors de la création d'une fonctionnalité."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Suffixe des maps secondaires
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="ex : _child"
                />
              </div>
            </div>
          </section>
        )}

        {/* Validation & Restrictions */}
        {activeCategory === "validation" && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              Validation & Restrictions
            </h2>
            <p className="text-sm text-gray-700 mb-4">
              Contrôlez ici les règles de validation appliquées aux noms,
              identifiants et fichiers de vos projets.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Caractères interdits
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="ex : @ # $ % / \\"
                  title="Liste séparée par des espaces (ex : @ # % /)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Longueur maximale d’un ID
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="ex : 20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Longueur minimale d’un nom
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="ex : 3"
                />
              </div>
              <div>
                <label className="inline-flex items-center space-x-2">
                  <input type="checkbox" className="form-checkbox" />
                  <span className="text-sm">Forcer l’unicité des titres</span>
                </label>
              </div>
            </div>
          </section>
        )}

        {activeCategory !== "generation" && (
          <div className="mt-4 flex justify-end">
            <Button
              className="h-11 px-6 bg-blue-600 text-white"
              onClick={handleSave}
            >
              Enregistrer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
