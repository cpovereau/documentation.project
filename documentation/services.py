# documentation/services.py
import logging
from django.db import transaction
from django.db.models import Max
from rest_framework.exceptions import ValidationError

from .models import Map, Rubrique, MapRubrique

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

    if ordre is None:
        current_max = (
            MapRubrique.objects.filter(map_id=map_id).aggregate(m=Max("ordre")).get("m")
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
