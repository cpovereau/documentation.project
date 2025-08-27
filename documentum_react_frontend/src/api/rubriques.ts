// src/api/rubriques.ts
import api from "@/lib/apiClient"

/** ---- Types ---- */

export type DitaType = "topic" | "concept" | "task" | "reference"

/** Payload interne UI côté frontend (tous cas d'usage) */
export interface RubriqueInitPayload {
  titre: string
  type_dita?: DitaType
  audience?: string | null
  produitLabelOrAbbrev?: string | null
  fonctionnalites?: string[] | null
  projetId?: number
}

/** Requête API backend */
export interface DitaTemplateRequest {
  titre: string
  type_dita?: DitaType
  audience?: string | null
  produit?: string | null
  fonctionnalites?: string[] | null
  projet_id?: number
}

export interface DitaTemplateResponse {
  xml: string
}

export interface Rubrique {
  id: number
  titre: string
  contenu_xml: string
  projet: number
  type_rubrique: number
  fonctionnalite?: {
    id: number
    code: string
    nom: string
  } | null
  version_projet?: number
  is_active: boolean
  is_archived: boolean
  date_creation: string
  date_mise_a_jour: string
  audience: string
  revision_numero: number
  version: number
  version_precedente?: number | null
}

export interface RubriqueCreatePayload {
  titre: string
  contenu_xml: string
  projet: number
  type_rubrique: number
  fonctionnalite_id?: number | null
  audience?: string
  revision_numero: number
  version: number
}

export interface RubriqueUpdatePayload extends Partial<RubriqueCreatePayload> {}

/** ---- Conversion ---- */

export function buildDitaTemplateRequest(
  init: RubriqueInitPayload
): DitaTemplateRequest {
  return {
    titre: init.titre,
    type_dita: init.type_dita ?? "topic",
    audience: init.audience ?? null,
    produit: init.produitLabelOrAbbrev ?? null,
    fonctionnalites: init.fonctionnalites ?? [],
    projet_id: init.projetId ?? undefined,
  }
}

/** ---- Helpers ---- */

function generateFallbackDitaTemplate(req: DitaTemplateRequest): string {
  const today = new Date().toISOString().slice(0, 10)
  const type = req.type_dita ?? "topic"
  const audienceXml = req.audience ? `\n      <audience>${req.audience}</audience>` : ""
  const produitXml = req.produit ? `\n      <doc-tag type=\"produit\">${req.produit}</doc-tag>` : ""
  const fcts = req.fonctionnalites ?? []
  const fctXml = fcts.map((c) => `\n      <doc-tag type=\"fonctionnalite\">${c}</doc-tag>`).join("")

  return `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<!DOCTYPE topic PUBLIC \"-//OASIS//DTD DITA Topic//EN\" \"topic.dtd\">
<${type} id=\"topic-${today.replace(/-/g, "")}\">
  <title>${req.titre || "Nouvelle rubrique"}</title>
  <prolog>
    <author>?</author>
    <critdates>
      <created date=\"${today}\" />
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
        <step><p>Étape 1</p></step>
        <step><p>Étape 2</p></step>
      </steps>
    </task>
    <section>
      <title>Référence</title>
      <p>Détails complémentaires…</p>
    </section>
  </body>
</${type}>`
}

/** ---- API Calls ---- */

export async function generateDitaTemplate(req: DitaTemplateRequest): Promise<string> {
  try {
    const { data } = await api.post<DitaTemplateResponse>("/api/dita-template/", {
      titre: req.titre,
      type_dita: req.type_dita ?? "topic",
      audience: req.audience ?? null,
      produit: req.produit ?? null,
      fonctionnalites: req.fonctionnalites ?? [],
      projet_id: req.projet_id ?? null,
    })
    if (!data?.xml || typeof data.xml !== "string") {
      throw new Error("Réponse inattendue du serveur (xml manquant).")
    }
    return data.xml
  } catch (e: any) {
    if (e?.status === 404 || e?.response?.status === 404) {
      return generateFallbackDitaTemplate(req)
    }
    const msg = e?.message || "Erreur lors de la génération du gabarit DITA."
    throw new Error(msg)
  }
}

export async function prepareNewRubriqueXml(
  payload: RubriqueInitPayload
): Promise<string> {
  const request = buildDitaTemplateRequest(payload)
  return generateDitaTemplate(request)
}

export async function getRubrique(id: number): Promise<Rubrique> {
  const { data } = await api.get<Rubrique>(`/rubriques/${id}/`)
  return data
}

export async function listRubriques(params?: Record<string, any>): Promise<Rubrique[]> {
  const { data } = await api.get<Rubrique[]>("/rubriques/", { params })
  return data
}

export async function createRubrique(payload: RubriqueCreatePayload): Promise<Rubrique> {
  const { data } = await api.post<Rubrique>("/rubriques/", payload)
  return data
}

export async function updateRubrique(
  id: number,
  payload: RubriqueUpdatePayload
): Promise<Rubrique> {
  const { data } = await api.patch<Rubrique>(`/rubriques/${id}/`, payload)
  return data
}
