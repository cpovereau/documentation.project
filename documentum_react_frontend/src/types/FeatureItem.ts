// src/types/FeatureItem.ts

export interface FeatureItem {
  /** Identifiant unique de la fonctionnalité */
  id: number;

  /** Nom affiché de la fonctionnalité */
  name: string;

  /** Niveau d'imbrication dans l'arborescence (1 = racine) */
  level: number;

  /** Indique si la fonctionnalité est développée ou repliée */
  expanded?: boolean;

  /** Statut d'activité ou de sélection contextuelle */
  active?: boolean;

  /** Marqueur visuel de mise à jour ou de correctif attendu */
  hasUpdate?: boolean;
}
