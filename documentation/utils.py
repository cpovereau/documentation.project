from django.http import JsonResponse
from django.utils.timezone import now
from django.core.exceptions import ValidationError
from .models import Rubrique, VersionProjet
from .exporters import export_map_to_dita


def get_versions(projet, is_active=None, is_archived=None):
    """
    Récupère les versions d'un projet avec des filtres optionnels.
    """
    versions = VersionProjet.objects.filter(projet=projet)
    if is_active is not None:
        versions = versions.filter(is_active=is_active)
    if is_archived is not None:
        versions = versions.filter(is_archived=is_archived)
    return versions


def get_active_version(projet):
    """
    Retourne la version active pour un projet donné.
    """
    return VersionProjet.objects.filter(projet=projet, is_active=True).first()


def validate_versions(projet):
    """
    Valide que le projet n'a qu'une seule version active.
    """
    active_versions = VersionProjet.objects.filter(projet=projet, is_active=True).count()
    if active_versions > 1:
        raise ValidationError(f"Le projet {projet.nom} a plusieurs versions actives.")


def archive_old_versions(projet):
    """
    Archive toutes les versions d'un projet sauf la version active.
    """
    active_version = get_active_version(projet)
    if not active_version:
        raise ValidationError(f"Aucune version active trouvée pour le projet {projet.nom}.")

    VersionProjet.objects.filter(projet=projet).exclude(pk=active_version.pk).update(
        is_archived=True,
        is_active=False
    )


def clone_version(version_source):
    """
    Clone une version de projet existante, en dupliquant ses rubriques actives.
    """
    new_version = VersionProjet.objects.create(
        projet=version_source.projet,
        version_numero=f"{version_source.version_numero}_clone",
        date_lancement=now(),
        notes_version=f"Clonage de {version_source.version_numero}",
        is_active=False
    )

    rubriques = Rubrique.objects.filter(version_projet=version_source, is_active=True)
    for r in rubriques:
        r.pk = None
        r.version_projet = new_version
        r.date_creation = now().date()
        r.date_mise_a_jour = now().date()
        r.locked_by = None
        r.locked_at = None
        r.is_active = True
        r.is_archived = False
        r.save()

    return new_version

# Vue Django API pour appeler la publication
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def publier_map(request, map_id):
    format_output = request.data.get('format', 'pdf')
    result = export_map_to_dita(map_id, output_format=format_output)
    return JsonResponse(result)
