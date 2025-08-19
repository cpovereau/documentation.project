// src/lib/mappers.ts
import type { Project, Map as ApiMap, VersionProjet } from "../types/api";
import type { ProjectItem } from "../types/ProjectItem";
import type { MapItem } from "../types/MapItem";

/** Sélectionne la version active d’un projet, sinon la plus récente si dispo. */
export function getActiveVersionNumero(p: Project): string | undefined {
  if (Array.isArray(p.versions) && p.versions.length > 0) {
    const active = p.versions.find(v => v.is_active);
    if (active) return active.version_numero;

    // Fallback : prend la dernière par date_lancement si présentes
    const withDate = p.versions
      .filter(v => !!v.date_lancement)
      .sort((a: VersionProjet, b: VersionProjet) =>
        new Date(b.date_lancement).getTime() - new Date(a.date_lancement).getTime()
      );
    if (withDate.length) return withDate[0].version_numero;

    // Sinon, prend la première
    return p.versions[0].version_numero;
  }
  return undefined;
}

/** Map API → UI : Map -> MapItem */
export function mapApiMapToItem(
  m: ApiMap,
  options?: {
    level?: number;
    expanded?: boolean;
    active?: boolean;
    parentId?: number | null;
    versionOrigine?: string;
  }
): MapItem {
  return {
    id: m.id,
    title: m.nom,
    isMaster: m.is_master,
    level: options?.level ?? 0,
    expanded: options?.expanded ?? !!m.is_master, // master ouvert par défaut
    active: options?.active ?? true,
    parentId: options?.parentId ?? null,
    versionOrigine: options?.versionOrigine,
  };
}

/** Map API → UI : Project -> ProjectItem (avec ses maps à plat pour l’UI actuelle) */
export function mapApiProjectToItem(p: Project): ProjectItem {
  const versionOrigine = getActiveVersionNumero(p);
  const mapItems: MapItem[] = (p.maps ?? []).map((m) =>
    mapApiMapToItem(m, {
      level: 0,
      expanded: m.is_master, // garde le comportement d’ouverture
      versionOrigine,
    })
  );

  return {
    id: p.id,
    title: p.nom,
    gamme: p.gamme?.nom ?? "",
    mapItems,
  };
}

/** Convenience : tableau de projets API → tableau de ProjectItem */
export function mapApiProjectsToItems(projects: Project[]): ProjectItem[] {
  return projects.map(mapApiProjectToItem);
}
