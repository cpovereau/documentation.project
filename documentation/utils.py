# documentation/utils.py
# -- Fonctions utilitaires pour la gestion des rubriques et des versions de projet --
from django.http import JsonResponse
from django.utils.timezone import now
from django.core.exceptions import ValidationError
from django.db import transaction
from .models import Rubrique, VersionProjet
from .exporters import export_map_to_dita

# --- Gestion des exceptions personnalisées ---
import logging

logger = logging.getLogger(__name__)


# --- Fonction utilitaire pour obtenir les versions d'un projet ---
def get_versions(projet, is_active=None, is_archived=None):
    if not projet:
        logger.warning("Appel à get_versions sans projet valide")
        raise ValidationError("Le projet fourni est invalide.")

    versions = VersionProjet.objects.filter(projet=projet)
    if is_active is not None:
        versions = versions.filter(is_active=is_active)
    if is_archived is not None:
        versions = versions.filter(is_archived=is_archived)
    return versions


# --- Fonction utilitaire pour obtenir la version active d'un projet ---
def get_active_version(projet):
    """
    Retourne la version active pour un projet donné.
    """
    return VersionProjet.objects.filter(projet=projet, is_active=True).first()


# --- Fonction utilitaire pour valider les versions d'un projet ---
def validate_versions(projet):
    """
    Valide que le projet n'a qu'une seule version active.
    """
    active_versions = VersionProjet.objects.filter(
        projet=projet, is_active=True
    ).count()
    if active_versions > 1:
        logger.warning(
            f"Projet {projet.nom} possède {active_versions} versions actives simultanées."
        )
        raise ValidationError(f"Le projet {projet.nom} a plusieurs versions actives.")
    logger.debug(f"Validation OK : 1 seule version active pour {projet.nom}")


# --- Fonction utilitaire pour cloner une version de projet ---
def clone_version(version_source):
    logger.info(
        f"Clonage de la version '{version_source.version_numero}' du projet '{version_source.projet.nom}'"
    )

    try:
        with transaction.atomic():
            new_version = VersionProjet.objects.create(
                projet=version_source.projet,
                version_numero=f"{version_source.version_numero}_clone",
                date_lancement=now(),
                notes_version=f"Clonage de {version_source.version_numero}",
                is_active=False,
            )

            rubriques = Rubrique.objects.filter(
                version_projet=version_source, is_active=True
            )
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
                logger.debug(f"Rubrique clonée : {r.titre}")

            return new_version

    except Exception as e:
        logger.error(
            f"Échec du clonage de la version {version_source.version_numero} : {e}"
        )
        raise ValidationError(f"Erreur lors du clonage de la version : {str(e)}")


# --- Fonction utilitaire pour archiver toutes les versions sauf la version active ---
def archive_old_versions(projet):
    """
    Archive toutes les versions d'un projet sauf la version active.
    """
    if not projet:
        msg = "Aucun projet fourni à archive_old_versions()."
        logger.error(msg)
        raise ValidationError(msg)

    active_version = get_active_version(projet)
    if not active_version:
        msg = f"Aucune version active trouvée pour le projet '{projet.nom}'."
        logger.error(msg)
        raise ValidationError(msg)

    updated_count = (
        VersionProjet.objects.filter(projet=projet)
        .exclude(pk=active_version.pk)
        .update(is_archived=True, is_active=False)
    )

    logger.info(
        f"{updated_count} version(s) archivées pour le projet '{projet.nom}' (version active : {active_version.version_numero})"
    )


# --- Fonction pour gabarits DITA ---
def generate_dita_template(
    type_dita: str = "topic",  # "topic" par défaut : plus souple que concept/task/reference
    auteur: str = "?",
    titre: str = "Nouvelle rubrique",
    audience: str | None = None,  # facultatif
    version: str | None = None,  # ex. "1.0.0" (VersionProjet.version_numero)
    produit: str | None = None,  # ex. "Océalia Usager" ou abréviation "USA"
    fonctionnalites: list[str] | None = None,  # ex. ["AUTH", "MEN"]
    created_iso: str | None = None,  # pour tests/seed; sinon today()
    topic_id_prefix: str = "topic",  # ex. "topic" ou "doc"
):
    """
    Génère un squelette DITA prêt à insérer dans CentralEditor.
    Recommandation projet : type_dita="topic" (souple) + sections internes (concept/task/reference).
    """
    from datetime import date

    # Normalise le type: on tolère concept/task/reference/topic mais on force le DOCTYPE topic (souplesse)
    allowed = {"topic", "concept", "task", "reference"}
    type_dita = type_dita if type_dita in allowed else "topic"

    # Date
    today = created_iso or date.today().isoformat()
    topic_id = f"{topic_id_prefix}-{today.replace('-', '')}"

    # Métadonnées optionnelles
    audience_xml = f"\n      <audience>{audience}</audience>" if audience else ""
    version_xml = f"\n      <version>{version}</version>" if version else ""
    produit_xml = (
        f'\n      <doc-tag type="produit">{produit}</doc-tag>' if produit else ""
    )

    fct_xml = ""
    if fonctionnalites:
        # Une balise par fonctionnalité (code court recommandé)
        fct_xml = "".join(
            [
                f'\n      <doc-tag type="fonctionnalite">{code}</doc-tag>'
                for code in fonctionnalites
            ]
        )

    # Corps : structure mixte (concept + steps + référence) pour guider l’auteur
    body_blocks = """
  <body>
    <section>
      <title>Concept</title>
      <p>Présentez le contexte fonctionnel et le “pourquoi”.</p>
    </section>

    <task>
      <title>Procédure</title>
      <steps>
        <step><p>Étape 1</p><p>Détail…</p></step>
        <step><p>Étape 2</p><p>Détail…</p></step>
      </steps>
    </task>

    <section>
      <title>Référence</title>
      <p>Paramètres, contraintes, erreurs fréquentes…</p>
    </section>
  </body>""".rstrip()

    # On utilise le DOCTYPE Topic (plus permissif), même si type_dita != "topic"
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE topic PUBLIC "-//OASIS//DTD DITA Topic//EN" "topic.dtd">
<{type_dita} id="{topic_id}">
  <title>{titre}</title>
  <prolog>
    <author>{auteur}</author>
    <critdates>
      <created date="{today}" />
    </critdates>
    <metadata>{audience_xml}{version_xml}{produit_xml}{fct_xml}
    </metadata>
  </prolog>{body_blocks}
</{type_dita}>"""
    return xml


# Formats de sortie autorisés pour DITA-OT
DITA_OUTPUT_FORMATS = ["pdf", "html5", "xhtml", "scorm", "markdown", "eclipsehelp"]

# Vue Django API pour appeler la publication
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def publier_map(request, map_id):
    format_output = request.data.get("format", "pdf")
    try:
        result = export_map_to_dita(map_id, output_format=format_output)
        if result.get("status") == "error":
            logger.error(
                f"Erreur lors de la publication de la map {map_id} : {result.get('message', 'Erreur inconnue')}"
            )
            result["formats_supportes"] = DITA_OUTPUT_FORMATS
        return JsonResponse(result)
    except Exception as e:
        logger.exception(f"Erreur inattendue lors de la publication de la map {map_id}")
        return JsonResponse(
            {
                "status": "error",
                "message": f"Erreur système : {str(e)}",
                "formats_supportes": DITA_OUTPUT_FORMATS,
            },
            status=500,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_formats_publication(request):
    return JsonResponse({"formats_supportes": DITA_OUTPUT_FORMATS})
