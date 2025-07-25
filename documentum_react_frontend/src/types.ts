// src/types.ts

export type Gamme = {
  id: number;
  nom: string;
  description?: string;
  is_archived: boolean;
};

export type Produit = {
  id: number;
  nom: string;
  description?: string;
  gamme: string | number; // Nom ou ID
  is_archived: boolean;
};

export type Fonctionnalite = {
  id: number;
  nom: string;
  id_fonctionnalite: string;
  description?: string;
  produit: string | number; // Nom ou ID
  is_archived: boolean;
};

export type Audience = {
  id: number;
  nom: string;
  description?: string;
  fonctionnalite_ids?: number[];
  is_archived: boolean;
};

export type Tag = {
  id: number;
  nom: string;
  is_archived: boolean;
};

export type ProfilPublication = {
  id: number;
  nom: string;
  type_sortie: "PDF" | "Web" | "Moodle" | "Fiche";
  is_archived: boolean;
};

export type InterfaceUIItem = {
  id: number;
  nom: string;
  type: string;
  description?: string;
  is_archived: boolean;
};

export type MapItem = {
  id: number;
  nom: string;
  projet: number;
  is_master: boolean;
};

export type Projet = {
  id: number;
  nom: string;
  description: string;
  auteur: number;
  gamme: Gamme;
  version_numero?: string;
  date_creation: string;
  date_mise_a_jour: string;
  versions?: VersionProjet[];
  maps?: MapItem[];
};

export type VersionProjet = {
  id: number;
  version_numero: string;
  date_lancement?: string;
  notes_version?: string;
  is_active: boolean;
  is_archived: boolean;
};

export type Rubrique = {
  id: number;
  titre: string;
  contenu_xml: string;
  auteur: number;
  date_creation: string;
  date_mise_a_jour: string;
  audience: string;
  revision_numero: number;
  version: number;
  version_precedente?: number;
  type_rubrique: number;
  fonctionnalite?: Fonctionnalite;
  fonctionnalite_id?: number;
  projet: number;
  version_projet: number;
  is_active: boolean;
  is_archived: boolean;
  locked_by?: string;
  locked_at?: string;
};