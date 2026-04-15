// src/lib/mappers.ts
import type { Project, Map as ApiMap, VersionProjet } from "../types/api";
import type { ProjectReadZ } from "@/types/api.zod";
import type { ProjectItem } from "../types/ProjectItem";
import type { MapItem } from "../types/MapItem";

/** Sélectionne la version active d’un projet, sinon la plus récente si dispo. */
export function getActiveVersionNumero(p: Project): string | undefined {
  if (Array.isArray(p.versions) && p.versions.length > 0) {
    const active = p.versions.find(v => v.is_active);
    if (active) return active.version_numero;

    // Fallback : prend la dernière par date_lancement si présentes
    const withDate = p.versions
      .filter(
        (v): v is VersionProjet & { date_lancement: string } =>
          typeof v.date_lancement === "string"
      )
      .sort(
        (a, b) =>
          new Date(b.date_lancement).getTime() -
          new Date(a.date_lancement).getTime()
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
    rubriqueId: null,
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

/** Map ProjectReadZ (API) → Project (UI interne) */
export function mapProjectReadZToProject(p: ProjectReadZ): Project {
  return {
    id: p.id,
    nom: p.nom,
    description: p.description,
    gamme: p.gamme
      ? {
          id: p.gamme.id,
          nom: p.gamme.nom,
          description: p.gamme.description ?? "",
          is_archived: p.gamme.is_archived,
        }
      : null,
    maps: p.maps ?? [],
    versions: p.versions ?? [],
  };
}
