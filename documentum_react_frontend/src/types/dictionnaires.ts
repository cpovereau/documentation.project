// 📁 Types liés aux entités "dictionnaire" utilisées dans Documentum

// --- Gamme ---
export interface Gamme {
  id: number;
  nom: string;
  description: string;
  is_archived: boolean;
}

// --- Produit ---
export interface Produit {
  id: number;
  nom: string;
  description: string | null;
  abreviation: string;
  gamme: number;
  gamme_nom?: string; // exposé en readOnly dans le serializer
  is_archived: boolean;
}

// --- Fonctionnalité ---
export interface Fonctionnalite {
  id: number;
  nom: string;
  code: string;
  id_fonctionnalite: string;
  produit: number;
  produit_nom?: string;
  is_archived: boolean;
}

// --- Interface utilisateur ---
export interface InterfaceUtilisateur {
  id: number;
  nom: string;
  code: string;
  is_archived: boolean;
}

// --- Tag ---
export interface Tag {
  id: number;
  nom: string;
  is_archived: boolean;
}

// --- Audience ---
export interface Audience {
  id: number;
  nom: string;
  description: string;
  fonctionnalites: Fonctionnalite[];
  is_archived: boolean;
}
