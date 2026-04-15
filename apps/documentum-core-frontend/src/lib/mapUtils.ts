export type MapNodeLike = {
  id: number
  parentId: number | null
}

export function getPathToMapNode<T extends MapNodeLike>(
  items: T[],
  targetId: number,
): number[] | null {
  const byId = new Map(items.map(i => [i.id, i]))

  const path: number[] = []
  let current = byId.get(targetId)

  while (current) {
    path.unshift(current.id)
    current =
      current.parentId !== null
        ? byId.get(current.parentId)
        : undefined
  }

  return path.length ? path : null
}

export function getPathToMapRubrique<T extends MapNodeLike>(
  items: T[],
  targetId: number,
): number[] | null {
  const byId = new Map<number, T>(
    items.map(item => [item.id, item]),
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
