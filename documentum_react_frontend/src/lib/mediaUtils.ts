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

/**
 * Génère le prochain nom de média disponible selon les noms déjà existants.
 * @param existingNames Liste complète des noms de médias (ex : ["PLA-MEN-EDT-001.jpg", ...])
 * @param extension Extension souhaitée (ex : "jpg", "png", "gif")
 * @returns Nouveau nom de fichier (ex : "PLA-MEN-EDT-005.jpg")
 */
export function generateNextMediaName(existingNames: string[], extension: string): string {
  if (!existingNames || existingNames.length === 0) {
    return `-001.${extension}`;
  }

  // Extraire tous les suffixes numériques de type NNN
  const regex = /-(\d{3})\.[a-zA-Z0-9]+$/;

  const maxNum = existingNames.reduce((max, name) => {
    const match = name.match(regex);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      return Math.max(max, num);
    }
    return max;
  }, 0);

  const nextNum = (maxNum + 1).toString().padStart(3, "0");

  // Récupération du préfixe depuis un des noms existants
  const first = existingNames[0];
  const prefixMatch = first.match(/^(.+)-\d{3}\./);
  const prefix = prefixMatch ? prefixMatch[1] : "MEDIA";

  return `${prefix}-${nextNum}.${extension}`;
}
