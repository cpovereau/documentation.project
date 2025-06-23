export type MediaFilterType = 'produit' | 'fonctionnalite' | 'item';

/**
 * Extrait les composantes normalisées d'un nom de fichier média.
 * Ex : "USA_AUTH_BTN_Confirmer.png" → { produit: "USA", fonctionnalite: "AUTH", item: "BTN" }
 */
export function parseMediaFilename(filename: string): {
  produit?: string;
  fonctionnalite?: string;
  item?: string;
  reste?: string;
} {
  const nameOnly = filename.split('.')[0];
  const parts = nameOnly.split('_');

  return {
    produit: parts[0] || undefined,
    fonctionnalite: parts[1] || undefined,
    item: parts[2] || undefined,
    reste: parts.slice(3).join('_') || undefined,
  };
}

/**
 * Vérifie si un fichier média correspond à un filtre donné.
 */
export function matchesMediaFilter(
  filename: string,
  filterType: MediaFilterType | null,
  keyword: string
): boolean {
  if (!filterType || !keyword) return true;

  const parsed = parseMediaFilename(filename);
  const targetValue = parsed[filterType];

  return (
    !!targetValue &&
    targetValue.toLowerCase().includes(keyword.toLowerCase())
  );
}
