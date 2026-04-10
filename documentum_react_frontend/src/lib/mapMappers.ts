// documentum_react_frontend/src/lib/mapMappers.ts
import type { MapItem } from "@/types/MapItem"
import { getPathToNode } from "@/lib/mapStructure"

export interface MapRubriqueLike {
  id: number
  parent: number | null
  ordre: number
  rubrique: {
    id: number
    titre: string
    revision_numero?: number
  }
  rubrique_detail?: {
    titre: string
  }
}

type ChildIndex = Map<number | null, number[]> // parentId -> [childIds...]

function buildChildrenIndex<T extends MapRubriqueLike>(
  rubriques: T[]
): ChildIndex {
  // index par id pour accéder à ordre
  const byId = new Map<number, T>(
    rubriques.map(r => [r.id, r])
  )

  // groupe les ids par parent
  const children = new Map<number | null, number[]>()
  for (const r of rubriques) {
    const key = r.parent ?? null
    const arr = children.get(key) ?? []
    arr.push(r.id)
    children.set(key, arr)
  }

  // trie chaque liste d'enfants par `ordre` ASC (puis id en tie-break)
  for (const [parentId, ids] of children.entries()) {
    ids.sort((a, b) => {
      const ra = byId.get(a)
      const rb = byId.get(b)
      const oa = ra?.ordre ?? 0
      const ob = rb?.ordre ?? 0
      if (oa !== ob) return oa - ob
      return a - b
    })
    children.set(parentId, ids)
  }

  return children
}

/**
 * Transforme MapRubrique[] en MapItem[] plat, ordonné, avec levels.
 * - rootLevel = 1 (cohérent avec tes helpers canIndent/canOutdent)
 * - expanded est dérivé du chemin vers selectedMapItemId
 */
export function mapRubriquesToMapItems<T extends MapRubriqueLike>(
  rubriques: T[],
  selectedMapItemId: number | null,
  options?: {
    rootLevel?: number
  }
): MapItem[] {
  const rootLevel = options?.rootLevel ?? 1

  const byId = new Map<number, T>(
  rubriques.map(r => [r.id, r])
)
  const childrenIndex = buildChildrenIndex(rubriques)

  // Déterminer la racine (parent === null)
  const roots = rubriques.filter(r => r.parent === null)
  if (roots.length !== 1) {
    throw new Error(
      roots.length === 0
        ? "Aucune racine documentaire trouvée pour la map."
        : "Plusieurs racines documentaires détectées (structure invalide)."
    )
  }
  const rootId = roots[0].id

  // Chemin à ouvrir automatiquement (root -> ... -> selected)
  const nodesForPath = rubriques.map(r => ({
    id: r.id,
    parentId: r.parent,
  }));

  const openPath = selectedMapItemId
    ? getPathToNode(nodesForPath, selectedMapItemId)
    : null;

  const result: MapItem[] = []

  // DFS pré-ordre : root puis ses enfants triés, etc.
  function walk(nodeId: number, level: number) {
    const mr = byId.get(nodeId)
    if (!mr) return
    const isRoot = mr.parent === null

    result.push({
      id: mr.id,                         
      rubriqueId: mr.rubrique.id,        
      title: isRoot
        ? "Structure documentaire"
        : mr.rubrique_detail?.titre ?? mr.rubrique.titre,
      isMaster: false,                   
      level,
      expanded: openPath ? openPath.includes(mr.id) : true,
      active: true,
      versionOrigine: mr.rubrique.revision_numero
    ? String(mr.rubrique.revision_numero)
    : undefined,
      isRoot: mr.parent === null,
      parentId: mr.parent,
    })

    const childIds = childrenIndex.get(mr.id) ?? []
    for (const cid of childIds) {
      walk(cid, level + 1)
    }
  }

  walk(rootId, rootLevel)

  return result
}
