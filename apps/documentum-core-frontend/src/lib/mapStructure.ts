// src/lib/mapStructure.ts

import type { MapRubrique } from "@/api/mapRubriques"

/**
 * Contrat minimal pour raisonner sur l'arbre documentaire.
 * Compatible MapRubrique, MapRubriqueDTO, MapItem (via adaptation).
 */
export interface MapNode {
  id: number
  parentId: number | null
}

/**
 * Règle métier : la racine n'est pas une rubrique éditable.
 */
export function isStructuralOnlyNode<T extends MapNode>(
  node: T
): boolean {
  return node.parentId === null
}

/**
 * Indique si un nœud est la racine. 
 */

export function isRootMapItem(item: { parentId: number | null }): boolean {
  return item.parentId === null
}


/**
 * Retourne la MapRubrique racine d'une map.
 * Invariant : il doit y en avoir exactement une.
 */
export function getRootMapRubrique<T extends MapNode>(
  nodes: T[]
): T {
  const roots = nodes.filter((n) => n.parentId === null)

  if (roots.length === 0) {
    throw new Error("Aucune racine documentaire trouvée pour la map.")
  }

  if (roots.length > 1) {
    throw new Error("Plusieurs racines documentaires détectées (structure invalide).")
  }

  return roots[0]
}

/**
 * Indique si un nœud peut être sélectionné, renommé, indenté, ou lui attacher un buffer d'éditeur.
 * Règle : seuls les nœuds non-structurels peuvent l'être.
 */
export function canSelectNode<T extends MapNode>(node: T): boolean {
  return !isStructuralOnlyNode(node)
}

export function canRenameNode<T extends MapNode>(node: T): boolean {
  return !isStructuralOnlyNode(node)
}

export function canIndentNode<T extends MapNode>(node: T): boolean {
  return !isStructuralOnlyNode(node)
}

export function canAttachEditorBuffer<T extends MapNode>(node: T): boolean {
  return !isStructuralOnlyNode(node)
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

    if (current.parentId === null) {
      break
    }

    current = byId.get(current.parentId)
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
