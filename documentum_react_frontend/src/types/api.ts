// src/types/api.ts
// Miroir des serializers Django REST de Documentum
// ------------------------------------------------
// Ces interfaces décrivent la forme EXACTE des données renvoyées par l'API.
// Elles sont distinctes des types UI (ex. ProjectItem / MapItem).

// --- Utilisateurs ---
export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

// --- Gammes & Produits ---
export interface Gamme {
  id: number;
  nom: string;
  description: string;
  is_archived: boolean;
}

export interface Produit {
  id: number;
  nom: string;
  description: string | null;
  abreviation: string; // ex: "USA", "PLA"
  gamme: number;       // id de Gamme
  gamme_nom?: string;  // présent dans ProduitSerializer (read_only)
  is_archived: boolean;
}

// --- Fonctionnalités, Tags, Interfaces, Audiences ---
export interface Fonctionnalite {
  id: number;
  produit: number;           // id de Produit
  produit_nom?: string;      // read_only
  nom: string;
  id_fonctionnalite: string; // ex: "0000"
  code: string;              // ex: "COMP", "ECIV" (<= 5)
  is_archived: boolean;
}

export interface Tag {
  id: number;
  nom: string;
  is_archived: boolean;
}

export interface InterfaceUtilisateur {
  id: number;
  nom: string;
  code: string; // unique
  is_archived: boolean;
}

export interface Audience {
  id: number;
  nom: string;
  description: string | null;
  // Serializer "AudienceSerializer" renvoie les fonctionnalités en objets complets (read_only)
  fonctionnalites: Fonctionnalite[];
  // Lors d'un POST/PUT on envoie fonctionnalite_ids (write_only), non présent en lecture:
  // fonctionnalite_ids?: number[];
  is_archived: boolean;
}

// --- Versions, Maps, Projets ---
export interface VersionProjet {
  id: number;
  version_numero: string;    // ex: "1.0.0"
  date_lancement: string | null; // ISO datetime
  is_active: boolean;
  is_archived: boolean;
}

export interface Map {
  id: number;
  nom: string;
  projet: number;     // id du projet
  is_master: boolean; // racine « master »
}

export interface Project {
  id: number;
  nom: string;
  description: string;
  gamme: Gamme;                 // objet imbriqué (read_only)
  // En écriture, on envoie "gamme_id", mais ce champ n'est pas renvoyé en lecture
  // gamme_id?: number;         // write_only
  maps: Map[];                  // read_only
  versions: VersionProjet[];    // read_only
  version_numero?: string | null;
  date_creation: string;        // ISO datetime
  date_mise_a_jour: string;     // ISO datetime
  auteur: number | null;        // id de l'utilisateur
}

// --- Rubriques ---
export interface Rubrique {
  id: number;
  titre: string;
  contenu_xml: string;
  projet: number;                 // id de Projet
  type_rubrique: number;          // id de TypeRubrique
  fonctionnalite: Fonctionnalite | null; // read_only (objet)
  // En écriture, on peut envoyer fonctionnalite_id (write_only)
  // mais ce champ n’est pas renvoyé par l’API en lecture
  fonctionnalite_id?: number | null;
  version_projet: number | null;  // id de VersionProjet (assigné serveur)
  is_active: boolean;
  is_archived: boolean;
  date_creation: string;          // ISO date
  date_mise_a_jour: string;       // ISO date
  locked_by: string | null;       // username (StringRelatedField)
  locked_at: string | null;       // ISO datetime ou null
  revision_numero: number;
  audience: string;               // ex: "générique"
  version: number;
  version_precedente: number | null; // id d'une autre Rubrique
}

// --- Médias ---
export type MediaType = "image" | "video";

export interface Media {
  id: number;
  rubrique: number | null;    // id de Rubrique (peut être null à l'import)
  produit: number;            // id de Produit
  type_media: MediaType;
  nom_fichier: string;
  description: string | null;
  chemin_acces: string;       // chemin relatif
}

// --- Profils de publication ---
export interface ProfilPublication {
  id: number;
  nom: string;
  type_sortie: string;        // valeur dans TYPE_SORTIE_CHOICES (backend)
  map: number | null;         // id de Map
  parametres: Record<string, unknown>;
  is_archived: boolean;
}

// --- Réponses d'API utiles ---
export interface CreateProjectResponse {
  projet: Project;
  map: Map; // map master créée automatiquement
}

// getProjectDetails renvoie directement un Project
export type GetProjectDetailsResponse = Project;
