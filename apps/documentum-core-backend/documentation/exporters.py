# documentation/exporters.py
from .models import Map


# -- Fonction pour exporter une Map en DITA --
def export_map_to_dita(map_id, output_format="pdf"):
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
        print(
            f"Export de la map '{map_obj.nom}' avec {rubriques.count()} rubriques au format {output_format.upper()}"
        )

        return {
            "status": "success",
            "message": f"Export DITA effectué avec succès au format {output_format.upper()}",
            "map": map_obj.nom,
            "rubriques_count": rubriques.count(),
            "format": output_format,
        }

    except Map.DoesNotExist:
        return {"status": "error", "message": f"Aucune map trouvée avec l'ID {map_id}"}
