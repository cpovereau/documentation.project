// src/lib/mapStructure.ts

import type { MapRubrique } from "@/api/mapRubriques"


/**
 * Contrat minimal pour raisonner sur l'arbre documentaire.
 * Compatible MapRubrique ET MapRubriqueDTO.
 */
export interface MapNode {
  id: number
  parent: number | null
}


/**
 * Retourne la MapRubrique racine d'une map.
 * Invariant : il doit y en avoir exactement une.
 */
export function getRootMapRubrique<T extends MapNode>(
  nodes: T[]
): T {
  const roots = nodes.filter((n) => n.parent === null)

  if (roots.length === 0) {
    throw new Error("Aucune racine documentaire trouvée pour la map.")
  }

  if (roots.length > 1) {
    throw new Error("Plusieurs racines documentaires détectées (structure invalide).")
  }

  return roots[0]
}


/**
 * Détermine le parent MapRubrique pour une insertion.
 *
 * Règle :
 * - si une MapRubrique est sélectionnée → insertion en enfant
 * - sinon → insertion sous la racine
 */
export function getInsertionParentId<T extends MapNode>(
  nodes: T[],
  selectedNodeId: number | null
): number {
  if (selectedNodeId !== null) {
    return selectedNodeId
  }

  const root = getRootMapRubrique(nodes)
  return root.id
}


export function isRootMapRubrique(
  mr: MapRubrique
): boolean {
  return mr.parent === null
}
