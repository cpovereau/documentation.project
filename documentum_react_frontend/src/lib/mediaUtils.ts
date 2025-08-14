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
export function generateNextMediaName(
  prefix: string,
  existingNames: string[],
  extension: string
): string {
  let max = 0;
  const pattern = new RegExp(`^${prefix}-(\\d{3})\\.(jpg|jpeg|png|gif)$`, "i");

  for (const name of existingNames) {
    const match = name.match(pattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > max) max = num;
    }
  }

  const nextNum = (max + 1).toString().padStart(3, "0");
  return `${prefix}-${nextNum}.${extension}`;
}

/**
 * Gestion du chemin adapté pour l'affichage des médias dans l'application en mode local
 *
 */
export function getMediaUrl(fileName: string) {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  return `${API_BASE_URL}/medias/${fileName}`;
}

