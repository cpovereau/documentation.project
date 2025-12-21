# documentation/services.py
import logging
from django.db import transaction
from django.db.models import Max, F
from rest_framework.exceptions import ValidationError

from .models import Map, Rubrique, MapRubrique
from .utils import get_active_version

logger = logging.getLogger(__name__)


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
