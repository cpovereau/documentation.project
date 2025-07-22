from django.http import JsonResponse
from django.utils.timezone import now
from django.core.exceptions import ValidationError
from .models import Rubrique, VersionProjet
from .exporters import export_map_to_dita

def get_versions(projet, is_active=None, is_archived=None):
    ...

# --- Nouvelle fonction pour gabarits DITA ---
def generate_dita_template(type_dita='concept', auteur='?', titre='Nouvelle rubrique', audience='tous', version='1.0.0'):
    from datetime import date

    doctype_map = {
        'concept': 'concept.dtd',
        'task': 'task.dtd',
        'reference': 'reference.dtd',
        'learningAssessment': 'learningAssessment.dtd',
        'topic': 'topic.dtd'
    }

    if type_dita not in doctype_map:
        type_dita = 'topic'

    today = date.today().isoformat()

    return f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE {type_dita} PUBLIC "-//OASIS//DTD DITA {type_dita.capitalize()}//EN" "{doctype_map[type_dita]}">
<{type_dita} id="{type_dita}-{today.replace('-', '')}">
  <title>{titre}</title>
  <prolog>
    <author>{auteur}</author>
    <critdates>
      <created date="{today}" />
    </critdates>
    <metadata>
      <audience>{audience}</audience>
      <version>{version}</version>
    </metadata>
  </prolog>
  <body>
    <p>Contenu initial...</p>
  </body>
</{type_dita}>'''

# Vue Django API pour appeler la publication
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def publier_map(request, map_id):
    format_output = request.data.get('format', 'pdf')
    result = export_map_to_dita(map_id, output_format=format_output)
    if result.get("status") == "error":
        result["formats_supportes"] = ['pdf', 'html5', 'xhtml', 'scorm', 'markdown', 'eclipsehelp']
    return JsonResponse(result)
