import os
import subprocess
from django.conf import settings, Rubrique, VersionProjet
from django.utils.timezone import now
from .models import Map, MapRubrique
from xml.etree import ElementTree as ET
from django.http import JsonResponse

def sanitize_filename(title):
    return "".join(c if c.isalnum() or c in ("-", "_") else "_" for c in title).lower()

def export_map_to_dita(map_id, output_format='pdf', dita_bin_path='c:/dita-ot/bin/dita'):
    try:
        map_obj = Map.objects.prefetch_related('rubriques').get(pk=map_id)
        rubriques = map_obj.rubriques.all()

        export_dir = os.path.join(settings.BASE_DIR, f'temp_exports/map_{map_id}')
        rubriques_dir = os.path.join(export_dir, 'rubriques')
        output_dir = os.path.join(export_dir, 'output')
        os.makedirs(rubriques_dir, exist_ok=True)
        os.makedirs(output_dir, exist_ok=True)

        topicrefs = []
        for rubrique in rubriques:
            filename = sanitize_filename(rubrique.titre) + ".dita"
            filepath = os.path.join(rubriques_dir, filename)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(rubrique.contenu_xml)
            topicrefs.append(f'    <topicref href="rubriques/{filename}"/>')

        map_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE map PUBLIC "-//OASIS//DTD DITA Map//EN" "map.dtd">
<map id="map-{map_id}">
  <title>{map_obj.nom}</title>
{os.linesep.join(topicrefs)}
</map>'''

        map_path = os.path.join(export_dir, 'map.ditamap')
        with open(map_path, 'w', encoding='utf-8') as f:
            f.write(map_content)

        subprocess.run([
            dita_bin_path,
            f'--input={map_path}',
            f'--format={output_format}',
            f'--output={output_dir}'
        ], check=True)

        return {
            "status": "success",
            "output_path": output_dir,
            "map_file": map_path
        }

    except Map.DoesNotExist:
        return {"status": "error", "message": "Map introuvable."}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": f"Erreur DITA-OT : {str(e)}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
    from .models import Rubrique, VersionProjet
from django.utils.timezone import now

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
        raise ValueError(f"Le projet {projet.nom} a plusieurs versions actives.")

def archive_old_versions(projet):
    """
    Archive toutes les versions d'un projet sauf la version active.
    """
    active_version = get_active_version(projet)
    if not active_version:
        raise ValueError(f"Aucune version active trouvée pour le projet {projet.nom}.")
    
    VersionProjet.objects.filter(projet=projet).exclude(pk=active_version.pk).update(is_archived=True, is_active=False)


# Vue Django API pour appeler la publication
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def publier_map(request, map_id):
    format_output = request.data.get('format', 'pdf')
    result = export_map_to_dita(map_id, output_format=format_output)
    return JsonResponse(result)
