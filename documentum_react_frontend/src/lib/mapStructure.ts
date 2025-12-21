// src/lib/mapStructure.ts

import type { MapRubrique } from "@/api/mapRubriques"

/**
 * Contrat minimal pour raisonner sur l'arbre documentaire.
 * Compatible MapRubrique, MapRubriqueDTO, MapItem (via adaptation).
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
 * Détermine le parent pour une insertion.
 *
 * Règle :
 * - si un nœud est sélectionné → insertion en enfant
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

/**
 * Retourne le chemin (ids) de la racine vers un nœud cible.
 *
 * Exemple :
 *   [rootId, parentId, targetId]
 */
export function getPathToNode<T extends MapNode>(
  nodes: T[],
  targetId: number
): number[] | null {
  const byId = new Map<number, T>(
    nodes.map((n) => [n.id, n])
  )

  const path: number[] = []
  let current = byId.get(targetId)

  while (current) {
    path.unshift(current.id)

    if (current.parent === null) {
      break
    }

    current = byId.get(current.parent)
  }

  return path.length ? path : null
}

/**
 * Indique si une MapRubrique est la racine.
 */
export function isRootMapRubrique(
  mr: MapRubrique
): boolean {
  return mr.parent === null
}
