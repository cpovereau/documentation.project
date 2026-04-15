# documentation/services.py
import logging
from django.db import transaction
from django.db.models import Max, F, Subquery, OuterRef
from django.utils.timezone import now
from rest_framework.exceptions import ValidationError

from .models import Map, MapRubrique, Projet, Rubrique, RevisionRubrique, VersionProjet, PublicationSnapshot
from .utils import get_active_version, compute_xml_hash
from .exporters import export_map_to_dita

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Versioning documentaire — Lot 2
# ---------------------------------------------------------------------------

@transaction.atomic
def create_revision_if_changed(
    *, rubrique: Rubrique, new_xml: str, user
) -> "RevisionRubrique | None":
    """
    Crée une RevisionRubrique si new_xml diffère réellement du contenu actuel.

    Règles métier :
    - Comparaison par hash SHA-256 normalisé (compute_xml_hash).
    - Hash identique → retourne None, aucune écriture en base.
    - Hash différent → crée RevisionRubrique(numero = dernier + 1), retourne la révision.
    - Ne modifie PAS rubrique.contenu_xml : c'est la responsabilité de l'appelant
      (serializer.save() dans RubriqueViewSet.update()).

    Concurrence :
    - select_for_update(of=("self",)) sur la ligne Rubrique sérialise toute tentative
      de modification simultanée de la même rubrique dans la même transaction.
    - En PostgreSQL : row-level lock — optimal.
    - En SQLite (tests) : table-level lock — fonctionnel, moins précis.
    - La contrainte unique_together(rubrique, numero) est le garde-fou DB final
      si le verrou est contourné (impossible en pratique, défense en profondeur).

    Limite documentée :
    - Deux transactions concurrentes sur des rubriques DIFFÉRENTES ne s'impactent pas.
    - Deux transactions concurrentes sur la MÊME rubrique sont sérialisées par le lock.
    - Si la transaction englobante est déjà en cours (cas RubriqueViewSet.update()),
      le select_for_update ré-acquiert le lock sur la même ligne — idempotent en PG.

    Retourne : RevisionRubrique créée, ou None si contenu identique.
    """
    # 🔒 Verrou sur la ligne Rubrique — sérialise les révisions concurrentes.
    # Pas de select_related ici → pas de JOIN → select_for_update() sans of=("self",).
    # Robuste multi-environnement (PostgreSQL row-lock, SQLite ignoré gracieusement).
    locked = Rubrique.objects.select_for_update().get(pk=rubrique.pk)

    hash_new = compute_xml_hash(new_xml)
    hash_current = compute_xml_hash(locked.contenu_xml)

    if hash_new == hash_current:
        logger.debug(
            "[RevisionRubrique] Contenu identique — pas de révision. rubrique_id=%s",
            locked.pk,
        )
        return None

    dernier_numero = (
        RevisionRubrique.objects.filter(rubrique=locked)
        .aggregate(m=Max("numero"))["m"]
        or 0
    )
    nouveau_numero = dernier_numero + 1

    revision = RevisionRubrique.objects.create(
        rubrique=locked,
        numero=nouveau_numero,
        contenu_xml=new_xml,
        hash_contenu=hash_new,
        auteur=user,
    )

    logger.info(
        "[RevisionRubrique] Révision %s créée. rubrique_id=%s auteur=%s",
        nouveau_numero,
        locked.pk,
        getattr(user, "username", str(user)),
    )
    return revision


def create_initial_revision(*, rubrique: Rubrique, user) -> RevisionRubrique:
    """
    Crée la RevisionRubrique initiale (numero=1) pour une rubrique nouvellement créée.

    Source de vérité unique pour toute création initiale de révision.
    Appelée depuis :
    - create_project() — rubrique racine
    - create_rubrique_in_map() — rubrique insérée dans la structure
    - RubriqueViewSet.create() — création directe via l'API

    Pas de verrou nécessaire : la rubrique vient d'être créée dans la même transaction,
    aucune révision concurrente ne peut exister sur un pk inexistant.
    """
    return RevisionRubrique.objects.create(
        rubrique=rubrique,
        numero=1,
        contenu_xml=rubrique.contenu_xml or "",
        hash_contenu=compute_xml_hash(rubrique.contenu_xml),
        auteur=user,
    )


@transaction.atomic
def create_project(*, data: dict, user) -> dict:
    """
    Crée un projet complet de façon atomique.

    Invariants garantis :
    - 1 Projet
    - 1 VersionProjet active (1.0.0)
    - 1 Map master
    - 1 Rubrique racine
    - 1 MapRubrique racine

    Paramètres :
    - data : dict validé (nom, description, gamme, ...) issu du serializer
    - user : utilisateur Django authentifié

    Retourne un dict {projet, version, map, rubrique, map_rubrique}
    pour permettre la construction de la réponse en vue.
    """
    # 1. Projet
    projet = Projet.objects.create(
        nom=data["nom"],
        description=data.get("description", ""),
        gamme=data.get("gamme"),
        auteur=user,
    )
    logger.info(
        "[CreateProject] Projet créé id=%s nom=%r user=%s",
        projet.id, projet.nom, user.username,
    )

    # 2. Version active initiale
    version = VersionProjet.objects.create(
        projet=projet,
        version_numero="1.0.0",
        date_lancement=now(),
        notes_version="Version initiale",
        is_active=True,
    )
    logger.info(
        "[CreateProject] Version créée id=%s projet_id=%s",
        version.id, projet.id,
    )

    # 3. Map master
    map_obj = Map.objects.create(
        nom="Carte par défaut",
        projet=projet,
        is_master=True,
    )
    logger.info(
        "[CreateProject] Map master créée id=%s projet_id=%s",
        map_obj.id, projet.id,
    )

    # 4. Rubrique racine — contenu_xml vide accepté à la racine (ancrage UX)
    rubrique = Rubrique.objects.create(
        projet=projet,
        version_projet=version,
        titre="Racine documentaire",
        contenu_xml="",
        auteur=user,
        is_active=True,
        is_archived=False,
        revision_numero=1,
    )
    logger.info(
        "[CreateProject] Rubrique racine créée id=%s projet_id=%s",
        rubrique.id, projet.id,
    )

    # 4b. Révision initiale (numero=1) — snapshot du contenu à la création
    create_initial_revision(rubrique=rubrique, user=user)

    # 5. MapRubrique racine
    map_rubrique = MapRubrique.objects.create(
        map=map_obj,
        rubrique=rubrique,
        parent=None,
        ordre=1,
    )
    logger.info(
        "[CreateProject] MapRubrique racine créée id=%s map_id=%s rubrique_id=%s",
        map_rubrique.id, map_obj.id, rubrique.id,
    )

    return {
        "projet": projet,
        "version": version,
        "map": map_obj,
        "rubrique": rubrique,
        "map_rubrique": map_rubrique,
    }


@transaction.atomic
def add_rubrique_to_map(
    *,
    map_id: int,
    rubrique_id: int,
    parent_id: int | None = None,
    ordre: int | None = None,
) -> MapRubrique:
    """
    Attache une rubrique à une map via MapRubrique.
    - Transaction atomique
    - Verrouillage des lignes MapRubrique de la map (anti-conflits d'ordre)
    - Calcul automatique de l'ordre si non fourni
    - Validation métier (map/rubrique/projet cohérents)
    """
    try:
        map_obj = Map.objects.select_for_update().get(pk=map_id)
    except Map.DoesNotExist:
        raise ValidationError({"map": ["Map introuvable."]})

    try:
        rubrique = Rubrique.objects.get(pk=rubrique_id)
    except Rubrique.DoesNotExist:
        raise ValidationError({"rubrique": ["Rubrique introuvable."]})

    # 🧠 règle métier saine : on n’attache pas une rubrique d’un autre projet
    if rubrique.projet_id != map_obj.projet_id:
        raise ValidationError(
            {"rubrique": ["La rubrique n'appartient pas au même projet que la map."]}
        )

    parent = None
    if parent_id is not None:
        try:
            parent = MapRubrique.objects.get(pk=parent_id, map_id=map_id)
        except MapRubrique.DoesNotExist:
            raise ValidationError({"parent": ["Parent introuvable dans cette map."]})

    # Empêcher les doublons (même rubrique déjà attachée à la map)
    if MapRubrique.objects.filter(map_id=map_id, rubrique_id=rubrique_id).exists():
        raise ValidationError(
            {"rubrique": ["Cette rubrique est déjà présente dans cette map."]}
        )

    # Verrouille toutes les entrées de la map pour un calcul d'ordre stable en concurrence
    MapRubrique.objects.select_for_update().filter(map_id=map_id)

    # dans add_rubrique_to_map(), remplacer le calcul max :

    if ordre is None:
        current_max = (
            MapRubrique.objects.filter(map_id=map_id, parent_id=parent_id)
            .aggregate(m=Max("ordre"))
            .get("m")
        )
        ordre = (current_max or 0) + 1

    mr = MapRubrique.objects.create(
        map_id=map_id,
        rubrique_id=rubrique_id,
        ordre=ordre,
        parent=parent,
    )

    logger.info(
        f"[MapRubrique] Ajout rubrique_id={rubrique_id} à map_id={map_id} ordre={ordre} parent_id={parent_id}"
    )
    return mr


@transaction.atomic
def create_rubrique_in_map(
    *,
    map_id: int,
    titre: str,
    contenu_xml: str,
    auteur,
    parent_id: int | None = None,
    insert_after_id: int | None = None,
    insert_before_id: int | None = None,
) -> MapRubrique:
    """
    Crée une Rubrique et l'insère dans une Map de façon atomique.
    Supporte insertion relative (insert_after / insert_before).
    """

    # --- validations d’API ---
    if insert_after_id and insert_before_id:
        raise ValidationError(
            {"insert": ["Choisir insert_after OU insert_before (pas les deux)."]}
        )

    # --- map + projet ---
    try:
        map_obj = (
            Map.objects.select_for_update().select_related("projet").get(pk=map_id)
        )
    except Map.DoesNotExist:
        raise ValidationError({"map": ["Map introuvable."]})

    # --- politique de version ---
    version_active = get_active_version(map_obj.projet)
    if not version_active:
        raise ValidationError(
            {"version_projet": ["Aucune version active pour ce projet."]}
        )

    # --- parent ---
    parent = None
    if parent_id is not None:
        try:
            parent = MapRubrique.objects.get(pk=parent_id, map_id=map_id)
        except MapRubrique.DoesNotExist:
            raise ValidationError({"parent": ["Parent introuvable dans cette map."]})

    # --- ancre d’insertion (future DnD) ---
    anchor = None
    if insert_after_id or insert_before_id:
        anchor_id = insert_after_id or insert_before_id
        try:
            anchor = MapRubrique.objects.select_related("parent").get(
                pk=anchor_id, map_id=map_id
            )
        except MapRubrique.DoesNotExist:
            raise ValidationError({"insert": ["Ancre introuvable dans cette map."]})

        # inférence du parent si non fourni
        if parent_id is None:
            parent = anchor.parent
            parent_id = anchor.parent_id

        # cohérence hiérarchique
        if anchor.parent_id != parent_id:
            raise ValidationError({"insert": ["Ancre et parent incohérents."]})

    # --- création de la rubrique ---
    rubrique = Rubrique.objects.create(
        projet=map_obj.projet,
        version_projet=version_active,
        titre=titre,
        contenu_xml=contenu_xml,
        auteur=auteur,
        is_active=True,
        is_archived=False,
        revision_numero=1,
        version_precedente=None,
    )

    # Révision initiale (numero=1) — snapshot du contenu à la création
    create_initial_revision(rubrique=rubrique, user=auteur)

    # --- siblings verrouillés pour ordre stable ---
    siblings_qs = MapRubrique.objects.select_for_update().filter(
        map_id=map_id, parent_id=parent_id
    )

    # --- calcul de l’ordre ---
    if anchor is None:
        # insertion en fin
        current_max = siblings_qs.aggregate(m=Max("ordre")).get("m")
        ordre = (current_max or 0) + 1
    else:
        if insert_before_id:
            ordre = anchor.ordre
        else:
            ordre = anchor.ordre + 1

        # décale les suivants
        siblings_qs.filter(ordre__gte=ordre).update(ordre=F("ordre") + 1)

    # --- création du nœud MapRubrique ---
    mr = MapRubrique.objects.create(
        map_id=map_id,
        rubrique_id=rubrique.id,
        parent=parent,
        ordre=ordre,
    )

    logger.info(
        "[MapRubrique] create_rubrique_in_map map_id=%s rubrique_id=%s parent_id=%s ordre=%s",
        map_id,
        rubrique.id,
        parent_id,
        ordre,
    )

    return mr


@transaction.atomic
def indent_map_rubrique(*, map_id: int, map_rubrique_id: int) -> None:
    """
    Indente une MapRubrique :
    - devient enfant de son sibling précédent
    - recalcul du parent et de l'ordre
    """

    # 🔒 verrouillage de la cible (of=('self',) : PostgreSQL interdit FOR UPDATE sur un LEFT JOIN)
    try:
        mr = (
            MapRubrique.objects.select_for_update(of=("self",))
            .select_related("parent")
            .get(pk=map_rubrique_id, map_id=map_id)
        )
    except MapRubrique.DoesNotExist:
        raise ValidationError(
            {"mapRubriqueId": ["Élément introuvable dans cette map."]}
        )

    parent_id = mr.parent_id

    # 🔒 verrouillage des siblings
    siblings = (
        MapRubrique.objects.select_for_update()
        .filter(map_id=map_id, parent_id=parent_id)
        .order_by("ordre")
    )

    siblings_list = list(siblings)
    index = next((i for i, s in enumerate(siblings_list) if s.id == mr.id), None)

    # ❌ pas de frère précédent → impossible d'indenter
    if index is None or index == 0:
        raise ValidationError(
            {"mapRubriqueId": ["Impossible d'indenter le premier élément du niveau."]}
        )

    previous_sibling = siblings_list[index - 1]

    # 🔍 nouveau parent = sibling précédent
    new_parent = previous_sibling

    # 🔒 verrouille les futurs enfants du nouveau parent
    children_qs = MapRubrique.objects.select_for_update().filter(
        map_id=map_id, parent_id=new_parent.id
    )

    # 📐 nouvel ordre = dernier enfant + 1
    max_ordre = children_qs.aggregate(m=Max("ordre")).get("m")
    new_ordre = (max_ordre or 0) + 1

    # 🧠 mise à jour de la cible
    mr.parent = new_parent
    mr.ordre = new_ordre
    mr.save(update_fields=["parent", "ordre"])

    logger.info(
        "[MapRubrique] indent map_id=%s map_rubrique_id=%s → nouveau parent_id=%s ordre=%s",
        map_id, map_rubrique_id, new_parent.id, new_ordre,
    )


@transaction.atomic
def outdent_map_rubrique(*, map_id: int, map_rubrique_id: int) -> None:
    """
    Désindente une MapRubrique :
    - remonte d’un niveau
    - devient sibling de son parent
    """

    # 🔒 verrouillage de la cible (of=('self',) : PostgreSQL interdit FOR UPDATE sur un LEFT JOIN)
    try:
        mr = (
            MapRubrique.objects.select_for_update(of=("self",))
            .select_related("parent")
            .get(pk=map_rubrique_id, map_id=map_id)
        )
    except MapRubrique.DoesNotExist:
        raise ValidationError(
            {"mapRubriqueId": ["Élément introuvable dans cette map."]}
        )

    # ❌ déjà à la racine
    if mr.parent is None:
        raise ValidationError(
            {"mapRubriqueId": ["Impossible de désindenter un élément racine."]}
        )

    parent = mr.parent

    # 🔒 verrouillage du parent (of=('self',) : PostgreSQL interdit FOR UPDATE sur un LEFT JOIN)
    try:
        parent = (
            MapRubrique.objects.select_for_update(of=("self",))
            .select_related("parent")
            .get(pk=parent.id, map_id=map_id)
        )
    except MapRubrique.DoesNotExist:
        raise ValidationError({"parent": ["Parent introuvable ou incohérent."]})

    grandparent = parent.parent  # peut être None (racine)

    # 🔒 verrouillage des siblings du futur niveau
    siblings_qs = MapRubrique.objects.select_for_update().filter(
        map_id=map_id, parent_id=grandparent.id if grandparent else None
    )

    # 📐 nouvel ordre = juste après le parent
    new_ordre = parent.ordre + 1

    # 🔁 décale les suivants
    siblings_qs.filter(ordre__gte=new_ordre).update(ordre=F("ordre") + 1)

    # 🧠 mise à jour de la cible
    mr.parent = grandparent
    mr.ordre = new_ordre
    mr.save(update_fields=["parent", "ordre"])

    logger.info(
        "[MapRubrique] outdent map_id=%s map_rubrique_id=%s → nouveau parent_id=%s ordre=%s",
        map_id, map_rubrique_id, grandparent.id if grandparent else None, new_ordre,
    )


@transaction.atomic
def reorder_map_rubriques(
    *, map_id: int, parent_id: int | None, ordered_ids: list[int]
) -> None:
    """
    Réordonne les enfants d’un même parent dans une map.
    - Ne modifie pas la hiérarchie
    - Met à jour uniquement le champ 'ordre'
    """

    if not ordered_ids:
        raise ValidationError({"orderedIds": ["La liste ne peut pas être vide."]})

    # 🔒 verrouillage de toutes les rubriques concernées
    rubriques = MapRubrique.objects.select_for_update().filter(
        map_id=map_id,
        parent_id=parent_id,
        id__in=ordered_ids,
    )

    if rubriques.count() != len(ordered_ids):
        raise ValidationError(
            {"orderedIds": ["Liste incohérente ou rubriques introuvables."]}
        )

    # 🔍 vérification unicité
    if len(set(ordered_ids)) != len(ordered_ids):
        raise ValidationError({"orderedIds": ["La liste contient des doublons."]})

    # 🔄 application de l’ordre
    ordre_map = {rid: idx + 1 for idx, rid in enumerate(ordered_ids)}

    for mr in rubriques:
        mr.ordre = ordre_map[mr.id]
        mr.save(update_fields=["ordre"])

    logger.info(
        "[MapRubrique] reorder map_id=%s parent_id=%s count=%s",
        map_id, parent_id, len(ordered_ids),
    )


# ---------------------------------------------------------------------------
# Publication versionnante — Lot 3
# ---------------------------------------------------------------------------

def bump_minor_version(version_str: str) -> str:
    """
    Incrémente la partie mineure d'une version semver, remet le patch à zéro.
    Ex : "1.0.0" → "1.1.0",  "2.3.7" → "2.4.0".
    Lève ValueError si le format ne correspond pas à "X.Y.Z".
    """
    parts = version_str.split(".")
    if len(parts) != 3:
        raise ValueError(f"Version non semver : {version_str!r}")
    major, minor, _ = parts
    return f"{major}.{int(minor) + 1}.0"


def _get_last_published_version(projet: Projet) -> "VersionProjet | None":
    """
    Retourne la dernière VersionProjet publiée pour ce projet.
    Critères : is_active=False + au moins un PublicationSnapshot attaché.
    Tri par date_lancement décroissante — None si aucune publication antérieure.
    """
    return (
        VersionProjet.objects.filter(
            projet=projet,
            is_active=False,
            publication_snapshots__isnull=False,
        )
        .order_by("-date_lancement")
        .distinct()
        .first()
    )


def _build_rubrique_revision_map(map_obj: Map) -> dict:
    """
    Construit {rubrique_id: RevisionRubrique} pour toutes les rubriques de la map.
    Sélectionne la révision la plus récente (numéro max) par rubrique.
    Une seule requête DB via Subquery/annotation — zéro N+1.

    Périmètre v1 : map passée en paramètre (map master en production).
    """
    rubrique_ids = list(
        MapRubrique.objects.filter(map=map_obj).values_list("rubrique_id", flat=True)
    )
    if not rubrique_ids:
        return {}

    # Sous-requête : numéro max de révision pour la même rubrique
    latest_num_sq = (
        RevisionRubrique.objects.filter(rubrique_id=OuterRef("rubrique_id"))
        .order_by("-numero")
        .values("numero")[:1]
    )

    revisions = (
        RevisionRubrique.objects.filter(rubrique_id__in=rubrique_ids)
        .annotate(_max_num=Subquery(latest_num_sq))
        .filter(numero=F("_max_num"))
    )

    return {r.rubrique_id: r for r in revisions}


def _detect_changes(
    rubrique_revision_map: dict,
    last_published: "VersionProjet | None",
) -> dict:
    """
    Compare l'état courant de la map (rubrique_revision_map) avec la dernière
    publication (last_published).

    Retourne :
    {
        "nouvelles":  [rubrique_id, ...],   # dans la map, absentes de la dernière pub
        "modifiees":  [rubrique_id, ...],   # révision courante ≠ révision publiée
        "retirees":   [rubrique_id, ...],   # dans la dernière pub, absentes de la map
        "has_changes": bool,
    }

    Cas première publication (last_published is None) : tout est "nouvelle".
    """
    if last_published is None:
        return {
            "nouvelles": list(rubrique_revision_map.keys()),
            "modifiees": [],
            "retirees": [],
            "has_changes": bool(rubrique_revision_map),
        }

    # {rubrique_id: revision_id} au moment de la dernière publication
    published_map = {
        snap.rubrique_id: snap.revision_id
        for snap in last_published.publication_snapshots.all()
    }

    current_ids = set(rubrique_revision_map.keys())
    published_ids = set(published_map.keys())

    nouvelles = list(current_ids - published_ids)
    retirees = list(published_ids - current_ids)
    modifiees = [
        rid for rid in current_ids & published_ids
        if rubrique_revision_map[rid].id != published_map[rid]
    ]

    return {
        "nouvelles": nouvelles,
        "modifiees": modifiees,
        "retirees": retirees,
        "has_changes": bool(nouvelles or modifiees or retirees),
    }


@transaction.atomic
def _create_publication_snapshot(
    *, projet: Projet, rubrique_revision_map: dict, user
) -> tuple:
    """
    Opération atomique de versionnage métier :

    1. Verrouille et fige la VersionProjet WIP courante (is_active=False).
    2. Crée un PublicationSnapshot pour chaque rubrique de la map.
    3. Crée la prochaine VersionProjet WIP (version mineure incrémentée, is_active=True).

    Invariants :
    - Si publish_project() échoue avant cette fonction → aucune écriture.
    - Si l'export DITA échoue après → la version est déjà figée (comportement voulu).
    - unique_together (version_projet, rubrique) sur PublicationSnapshot est le
      garde-fou DB final contre une double publication concurrente.

    Retourne (version_publiee, nouvelle_version_wip).
    """
    # 1. Verrou + gel de la version WIP
    wip_version = (
        VersionProjet.objects.select_for_update()
        .filter(projet=projet, is_active=True)
        .first()
    )
    if wip_version is None:
        raise ValidationError(
            {"version": ["Aucune version active (WIP) trouvée pour ce projet."]}
        )

    wip_version.is_active = False
    wip_version.date_lancement = now()
    wip_version.save(update_fields=["is_active", "date_lancement"])

    # 2. Création des snapshots (un par rubrique)
    PublicationSnapshot.objects.bulk_create([
        PublicationSnapshot(
            version_projet=wip_version,
            rubrique_id=rubrique_id,
            revision=revision,
        )
        for rubrique_id, revision in rubrique_revision_map.items()
    ])

    # 3. Nouvelle version WIP
    new_version_numero = bump_minor_version(wip_version.version_numero)
    new_wip = VersionProjet.objects.create(
        projet=projet,
        version_numero=new_version_numero,
        is_active=True,
        notes_version=f"En cours (depuis v{wip_version.version_numero})",
    )

    logger.info(
        "[Publication] Version %s figée (%s snapshots). Prochaine WIP : %s. projet_id=%s user=%s",
        wip_version.version_numero,
        len(rubrique_revision_map),
        new_version_numero,
        projet.pk,
        getattr(user, "username", str(user)),
    )

    return (wip_version, new_wip)


def publish_project(
    *, projet: Projet, map_obj: Map, format_output: str, user
) -> dict:
    """
    Service central de publication — point d'entrée unique.

    Séparation nette entre les deux responsabilités :
    - Versionnage métier (atomique) : décide s'il y a changement, fige la version,
      crée les snapshots, ouvre la prochaine WIP. → _create_publication_snapshot()
    - Export technique DITA : délégué à export_map_to_dita() APRÈS la transaction.
      Un échec d'export ne remet PAS en cause le versionnage.

    Flux :
    1. Collecter les révisions courantes de la map.
    2. Détecter les changements vs dernière publication.
    3. Si changements → versionnage atomique.
    4. Export DITA (hors transaction).
    5. Retourner un dict de résultat complet.

    Si aucun changement : republication de la map sans bump de version.
    """
    # --- Phase 1 : révisions courantes de la map ---
    rubrique_revision_map = _build_rubrique_revision_map(map_obj)

    if not rubrique_revision_map:
        raise ValidationError(
            {"map": ["La map ne contient aucune rubrique publiable."]}
        )

    # --- Phase 2 : comparaison avec la dernière publication ---
    last_published = _get_last_published_version(projet)
    changes = _detect_changes(rubrique_revision_map, last_published)

    # --- Phase 3 : versionnage métier [atomique] ---
    if changes["has_changes"]:
        published_version, new_wip = _create_publication_snapshot(
            projet=projet,
            rubrique_revision_map=rubrique_revision_map,
            user=user,
        )
    else:
        # Aucun changement : republication sans bump de version
        published_version = last_published
        new_wip = None
        logger.info(
            "[Publication] Aucun changement détecté — republication sans bump. projet_id=%s",
            projet.pk,
        )

    # --- Phase 4 : export technique DITA (hors transaction) ---
    export_result = export_map_to_dita(map_obj.pk, output_format=format_output)

    return {
        "status": "ok",
        "version_publiee": published_version.version_numero if published_version else None,
        "nouvelle_version_wip": new_wip.version_numero if new_wip else None,
        "has_changes": changes["has_changes"],
        "changements": changes,
        "export": export_result,
    }


def get_publication_diff(*, projet: Projet, map_obj: Map) -> dict:
    """
    Calcule le diff entre l'état courant de la map et la dernière version publiée.
    Lecture seule — aucune écriture en base.

    Utilisé par GET /api/projets/{id}/publication-diff/ pour informer l'utilisateur
    avant de déclencher une publication.
    """
    rubrique_revision_map = _build_rubrique_revision_map(map_obj)
    last_published = _get_last_published_version(projet)
    changes = _detect_changes(rubrique_revision_map, last_published)
    wip_version = get_active_version(projet)

    return {
        "version_wip_courante": wip_version.version_numero if wip_version else None,
        "derniere_version_publiee": last_published.version_numero if last_published else None,
        "has_changes": changes["has_changes"],
        "changements": {
            "nouvelles": len(changes["nouvelles"]),
            "modifiees": len(changes["modifiees"]),
            "retirees": len(changes["retirees"]),
        },
        "detail": changes,
    }
