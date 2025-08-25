// src/api/rubriques.ts
import api from "@/lib/apiClient";

// Typage pour l'appel à l'API de génération de rubrique DITA
export interface RubriqueInitPayload {
  titre: string;
  projet_id?: number;
  produitLabelOrAbbrev: string | null;
  type?: string; // DitaType ou autre si défini
  audience?: string | null;
  fonctionnalites?: string[] | null;
}

export async function prepareNewRubriqueXml(payload: RubriqueInitPayload): Promise<string> {
  const response = await api.post("/dita-template/", payload);
  return response.data.xml;
} // Le backend renvoie { xml: "..." }

// Autres fonctions liées aux rubriques à ajouter ici...
