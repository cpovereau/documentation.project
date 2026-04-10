# documentation/services.py
import logging
from django.db import transaction
from django.db.models import Max, F
from django.utils.timezone import now
from rest_framework.exceptions import ValidationError

from .models import Map, MapRubrique, Projet, Rubrique, VersionProjet
from .utils import get_active_version

logger = logging.getLogger(__name__)


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
