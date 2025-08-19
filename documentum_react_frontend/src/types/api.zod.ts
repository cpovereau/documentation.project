// src/types/api.zod.ts
// Validation runtime + types dérivés pour Documentum (miroir des serializers DRF)

import { z } from "zod";

/* ---------------------------------------------------------
 * Helpers
 * --------------------------------------------------------- */
const id = z.number().int().nonnegative();
const isoDate = z.string();      // ex: "2025-08-19" (date)
const isoDateTime = z.string();  // ex: "2025-08-19T12:34:56Z" (datetime)

// Pour json libre (paramètres de profils, etc.)
export const JsonRecord = z.record(z.any());

/* ---------------------------------------------------------
 * User
 * --------------------------------------------------------- */
export const UserSchema = z.object({
  id,
  username: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
});
export type UserZ = z.infer<typeof UserSchema>;

/* ---------------------------------------------------------
 * Gamme
 * --------------------------------------------------------- */
export const GammeSchema = z.object({
  id,
  nom: z.string(),
  description: z.string().nullable().optional(),
  is_archived: z.boolean(),
});
export type GammeZ = z.infer<typeof GammeSchema>;

/* ---------------------------------------------------------
 * Produit
 * --------------------------------------------------------- */
export const ProduitSchema = z.object({
  id,
  nom: z.string(),
  description: z.string().nullable(),
  abreviation: z.string(), // ex: "USA", "PLA"
  gamme: id,               // relation id (read)
  gamme_nom: z.string().optional(), // read_only dans le serializer
  is_archived: z.boolean(),
});
export type ProduitZ = z.infer<typeof ProduitSchema>;

/* ---------------------------------------------------------
 * Fonctionnalite
 * --------------------------------------------------------- */
export const FonctionnaliteSchema = z.object({
  id,
  produit: id,
  produit_nom: z.string().optional(), // read_only
  nom: z.string(),
  id_fonctionnalite: z.string(), // <= 10 côté back (règle import)
  code: z.string().max(5),
  is_archived: z.boolean(),
});
export type FonctionnaliteZ = z.infer<typeof FonctionnaliteSchema>;

/* ---------------------------------------------------------
 * Tag
 * --------------------------------------------------------- */
export const TagSchema = z.object({
  id,
  nom: z.string(),
  is_archived: z.boolean(),
});
export type TagZ = z.infer<typeof TagSchema>;

/* ---------------------------------------------------------
 * InterfaceUtilisateur
 * --------------------------------------------------------- */
export const InterfaceUtilisateurSchema = z.object({
  id,
  nom: z.string(),
  code: z.string(), // unique
  is_archived: z.boolean(),
});
export type InterfaceUtilisateurZ = z.infer<typeof InterfaceUtilisateurSchema>;

/* ---------------------------------------------------------
 * Audience
 * - Read: fonctionnalités complètes (read_only)
 * - Write: fonctionnalite_ids (write_only)
 * --------------------------------------------------------- */
export const AudienceReadSchema = z.object({
  id,
  nom: z.string(),
  description: z.string().nullable().optional(),
  fonctionnalites: z.array(FonctionnaliteSchema),
  is_archived: z.boolean(),
});
export type AudienceReadZ = z.infer<typeof AudienceReadSchema>;

export const AudienceWriteSchema = z.object({
  nom: z.string(),
  description: z.string().nullable().optional(),
  fonctionnalite_ids: z.array(id), // write_only
  is_archived: z.boolean().optional(),
});
export type AudienceWriteZ = z.infer<typeof AudienceWriteSchema>;

/* ---------------------------------------------------------
 * VersionProjet
 * --------------------------------------------------------- */
export const VersionProjetSchema = z.object({
  id,
  version_numero: z.string(),
  date_lancement: z.string().nullable(), // ISO datetime ou null
  is_active: z.boolean(),
  is_archived: z.boolean(),
});
export type VersionProjetZ = z.infer<typeof VersionProjetSchema>;

/* ---------------------------------------------------------
 * Map
 * --------------------------------------------------------- */
export const MapSchema = z.object({
  id,
  nom: z.string(),
  projet: id,
  is_master: z.boolean(),
});
export type MapZ = z.infer<typeof MapSchema>;

/* ---------------------------------------------------------
 * Project
 * - Read: gamme objet, maps[], versions[]
 * - Create: envoie gamme_id (write_only côté DRF)
 * --------------------------------------------------------- */
export const ProjectReadSchema = z.object({
  id,
  nom: z.string(),
  description: z.string(),
  gamme: GammeSchema,             // nested (read_only)
  maps: z.array(MapSchema),       // read_only
  versions: z.array(VersionProjetSchema), // read_only
  version_numero: z.string().nullable().optional(),
  date_creation: isoDateTime,
  date_mise_a_jour: isoDateTime,
  auteur: id.nullable(),          // id user ou null
});
export type ProjectReadZ = z.infer<typeof ProjectReadSchema>;

export const ProjectCreateSchema = z.object({
  nom: z.string(),
  description: z.string(),
  gamme_id: id, // write_only
});
export type ProjectCreateZ = z.infer<typeof ProjectCreateSchema>;

/* ---------------------------------------------------------
 * Rubrique
 * - Read: fonctionnalite (objet) read_only + fonctionnalite_id absent
 * - Write: fonctionnalite_id présent, version_projet auto server
 * --------------------------------------------------------- */
export const RubriqueReadSchema = z.object({
  id,
  titre: z.string(),
  contenu_xml: z.string(),
  projet: id,
  type_rubrique: id,
  fonctionnalite: FonctionnaliteSchema.nullable(), // read_only
  version_projet: id.nullable(),
  is_active: z.boolean(),
  is_archived: z.boolean(),
  date_creation: isoDate,  // Date (models: DateField)
  date_mise_a_jour: isoDate,
  locked_by: z.string().nullable(), // username
  locked_at: z.string().nullable(), // datetime
  revision_numero: z.number().int(),
  audience: z.string(),
  version: z.number().int(),
  version_precedente: id.nullable(),
});
export type RubriqueReadZ = z.infer<typeof RubriqueReadSchema>;

export const RubriqueWriteSchema = z.object({
  titre: z.string(),
  contenu_xml: z.string(),
  projet: id,
  type_rubrique: id,
  fonctionnalite_id: id.nullable().optional(),
  // version_projet est assignée côté serveur à la création (version active)
  is_active: z.boolean().optional(),
  is_archived: z.boolean().optional(),
  revision_numero: z.number().int(),
  audience: z.string().optional(),
  version: z.number().int(),
  version_precedente: id.nullable().optional(),
});
export type RubriqueWriteZ = z.infer<typeof RubriqueWriteSchema>;

/* ---------------------------------------------------------
 * Media
 * --------------------------------------------------------- */
export const MediaTypeSchema = z.union([z.literal("image"), z.literal("video")]);
export type MediaTypeZ = z.infer<typeof MediaTypeSchema>;

export const MediaSchema = z.object({
  id,
  rubrique: id.nullable(),
  produit: id,
  type_media: MediaTypeSchema,
  nom_fichier: z.string(),
  description: z.string().nullable(),
  chemin_acces: z.string(),
});
export type MediaZ = z.infer<typeof MediaSchema>;

/* ---------------------------------------------------------
 * ProfilPublication
 * (type_sortie: string – voir TYPE_SORTIE_CHOICES côté back)
 * --------------------------------------------------------- */
export const ProfilPublicationSchema = z.object({
  id,
  nom: z.string(),
  type_sortie: z.string(),
  map: id.nullable(),
  parametres: JsonRecord,
  is_archived: z.boolean(),
});
export type ProfilPublicationZ = z.infer<typeof ProfilPublicationSchema>;

/* ---------------------------------------------------------
 * API Responses
 * --------------------------------------------------------- */
export const CreateProjectResponseSchema = z.object({
  projet: ProjectReadSchema,
  map: MapSchema, // map master créée automatiquement
});
export type CreateProjectResponseZ = z.infer<typeof CreateProjectResponseSchema>;

export type GetProjectDetailsResponseZ = ProjectReadZ;

/* ---------------------------------------------------------
 * Utils de validation ergonomiques
 * --------------------------------------------------------- */

/**
 * Valide avec Zod et renvoie les données typées, sinon lève une erreur
 * (pratique pour centraliser le message d’erreur et garder un code concis).
 */
export function parseOrThrow<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
  errMsg?: string
): z.infer<T> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    console.error(parsed.error.format());
    throw new Error(errMsg ?? "Réponse API invalide");
  }
  return parsed.data;
}
