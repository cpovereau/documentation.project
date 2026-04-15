// src/api/mapRubriques.ts
//
// Ce fichier expose uniquement le type MapRubrique utilisé par mapStructure.ts.
// Les fonctions CRUD legacy (createMapRubrique, updateMapRubrique, deleteMapRubrique)
// ont été supprimées : elles ciblaient /api/maps/{id}/rubriques/ qui n'existe plus
// depuis Sprint 4. Les opérations structurelles passent désormais par
// /api/maps/{id}/structure/* (voir LeftSidebar.tsx).

/**
 * Représente l'usage structurel d'une Rubrique dans une Map.
 * Source de vérité pour l'arbre documentaire.
 */
export interface MapRubrique {
  id: number;
  map: number;
  rubrique: number;
  ordre: number;
  parent: number | null;

  // Enrichissements optionnels selon endpoints
  rubrique_detail?: {
    id: number;
    titre: string;
    is_active: boolean;
    is_archived: boolean;
  };
}
