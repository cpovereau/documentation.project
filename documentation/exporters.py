from django.http import JsonResponse
from django.utils.timezone import now
from django.core.exceptions import ValidationError
from .models import Rubrique, VersionProjet

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


# -- Fonction pour exporter une Map en DITA --
def export_map_to_dita(map_id, output_format='pdf'):
    """
    Fonction simulant l'export d'une Map en format DITA.
    À terme, cette fonction devra :
    - récupérer la Map et ses rubriques
    - générer un document DITA valide
    - lancer l'export via DITA-OT
    """
    try:
        map_obj = Map.objects.get(pk=map_id)
        rubriques = map_obj.rubriques.all()

        # Simulation d'une logique de traitement
        print(f"Export de la map '{map_obj.nom}' avec {rubriques.count()} rubriques au format {output_format.upper()}")

        return {
            "status": "success",
            "message": f"Export DITA effectué avec succès au format {output_format.upper()}",
            "map": map_obj.nom,
            "rubriques_count": rubriques.count(),
            "format": output_format
        }

    except Map.DoesNotExist:
        return {
            "status": "error",
            "message": f"Aucune map trouvée avec l'ID {map_id}"
        }
