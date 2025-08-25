// src/api/rubriques.ts
import api from "@/lib/apiClient";

/** ---- Types ---- */

export type DitaType = "topic" | "concept" | "task" | "reference";

export interface DitaTemplateRequest {
  titre: string;
  type_dita?: DitaType;             // défaut: "topic"
  audience?: string | null;
  produit?: string | null;          // nom/abréviation produit
  fonctionnalites?: string[] | null;
  projet_id?: number;               // pour déduire la version active côté backend
}

export interface DitaTemplateResponse {
  xml: string;
}

export interface Rubrique {
  id: number;
  titre: string;
  contenu_xml: string;
  projet: number;
  type_rubrique: number;
  fonctionnalite?: {
    id: number;
    code: string;
    nom: string;
  } | null;
  version_projet?: number;
  is_active: boolean;
  is_archived: boolean;
  date_creation: string;
  date_mise_a_jour: string;
  audience: string;
  revision_numero: number;
  version: number;
  version_precedente?: number | null;
}

export interface RubriqueCreatePayload {
  titre: string;
  contenu_xml: string;
  projet: number;
  type_rubrique: number;            // ⚠ requis par le modèle
  fonctionnalite_id?: number | null;
  audience?: string;                // ex. "générique"
  revision_numero: number;          // ex. 1
  version: number;                  // ex. 1
  // version_projet est injecté côté serveur si projet a une version active
}

export interface RubriqueUpdatePayload extends Partial<RubriqueCreatePayload> {}

/** ---- Helpers ---- */

/**
 * Fallback local au cas où l'endpoint /api/dita-template/ n'existe pas ou renvoie 404.
 * NB: volontairement minimaliste; le backend reste la source de vérité.
 */
function generateFallbackDitaTemplate(req: DitaTemplateRequest): string {
  const today = new Date().toISOString().slice(0, 10);
  const type = (req.type_dita ?? "topic");
  const audienceXml = req.audience ? `\n      <audience>${req.audience}</audience>` : "";
  // Pas de version côté fallback (on ne connaît pas la version active)
  const produitXml = req.produit ? `\n      <doc-tag type="produit">${req.produit}</doc-tag>` : "";
  const fcts = (req.fonctionnalites ?? []) as string[];
  const fctXml = fcts.map(c => `\n      <doc-tag type="fonctionnalite">${c}</doc-tag>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE topic PUBLIC "-//OASIS//DTD DITA Topic//EN" "topic.dtd">
<${type} id="topic-${today.replace(/-/g, "")}">
  <title>${req.titre || "Nouvelle rubrique"}</title>
  <prolog>
    <author>?</author>
    <critdates>
      <created date="${today}" />
    </critdates>
    <metadata>${audienceXml}${produitXml}${fctXml}
    </metadata>
  </prolog>
  <body>
    <section>
      <title>Concept</title>
      <p>Présentez le contexte…</p>
    </section>
    <task>
      <title>Procédure</title>
      <steps>
        <step><cmd>Étape 1</cmd></step>
        <step><cmd>Étape 2</cmd></step>
      </steps>
    </task>
    <section>
      <title>Référence</title>
      <p>Détails complémentaires…</p>
    </section>
  </body>
</${type}>`;
}

/** ---- API Calls ---- */

/**
 * Génère un squelette DITA côté serveur (auteur, date, version active, etc.)
 * Tombe en fallback local si l’endpoint n’est pas disponible.
 */
export async function generateDitaTemplate(req: DitaTemplateRequest): Promise<string> {
  try {
    const { data } = await api.post<DitaTemplateResponse>("/api/dita-template/", {
      titre: req.titre,
      type_dita: req.type_dita ?? "topic",
      audience: req.audience ?? null,
      produit: req.produit ?? null,
      fonctionnalites: req.fonctionnalites ?? [],
      projet_id: req.projet_id ?? null,
    });
    // data.xml attendu
    if (!data?.xml || typeof data.xml !== "string") {
      throw new Error("Réponse inattendue du serveur (xml manquant).");
    }
    return data.xml;
  } catch (e: any) {
    // Si 404/405/Not implemented, on passe en fallback local
    if (e?.status === 404 || e?.response?.status === 404) {
      return generateFallbackDitaTemplate(req);
    }
    // L’intercepteur Axios devrait déjà normaliser { message, fields, status }
    const msg = e?.message || "Erreur lors de la génération du gabarit DITA.";
    throw new Error(msg);
  }
}

/**
 * Récupère une rubrique par ID.
 */
export async function getRubrique(id: number): Promise<Rubrique> {
  const { data } = await api.get<Rubrique>(`/rubriques/${id}/`);
  return data;
}

/**
 * Liste paginée/filtrée des rubriques (facultatif).
 * Passer les query params nécessaires (archived, search, etc.).
 */
export async function listRubriques(params?: Record<string, any>): Promise<Rubrique[]> {
  const { data } = await api.get<Rubrique[]>("/rubriques/", { params });
  return data;
}

/**
 * Crée une rubrique (DB) — nécessite un type_rubrique (FK) + version/revision.
 * L’API backend se charge d’associer version_projet = version active du projet.
 */
export async function createRubrique(payload: RubriqueCreatePayload): Promise<Rubrique> {
  const { data } = await api.post<Rubrique>("/rubriques/", payload);
  return data;
}

/**
 * Met à jour une rubrique existante (DB).
 */
export async function updateRubrique(id: number, payload: RubriqueUpdatePayload): Promise<Rubrique> {
  const { data } = await api.patch<Rubrique>(`/rubriques/${id}/`, payload);
  return data;
}

/**
 * Utilitaire “haute-niveau” pour le flux UX :
 * - Génère un XML DITA (serveur si possible, sinon fallback)
 * - Ne crée PAS en DB (laisser le composant décider quand persister)
 */
export async function prepareNewRubriqueXml(args: {
  titre: string;
  projetId: number;
  produitLabelOrAbbrev: string | null;     // ex. "USA - Usager" ou "USA"
  type?: DitaType;                          // défaut "topic"
  audience?: string | null;                 // null ok
  fonctionnalites?: string[] | null;        // null/[] ok
}): Promise<string> {
  return generateDitaTemplate({
    titre: args.titre,
    type_dita: args.type ?? "topic",
    audience: args.audience ?? null,
    produit: args.produitLabelOrAbbrev ?? null,
    fonctionnalites: args.fonctionnalites ?? [],
    projet_id: args.projetId,
  });
}
