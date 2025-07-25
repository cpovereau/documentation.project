from django.core.management.base import BaseCommand
from documentation.models import InterfaceUtilisateur

class Command(BaseCommand):
    help = "Charge les types d’interface utilisateur prédéfinis dans la base."

    UI_TYPES = [
        ("Bouton", "BOU"),
        ("Écran", "ECR"),
        ("Menu", "MEN"),
        ("Onglet", "ONG"),
        ("Modale", "MOD"),
        ("Champ", "CHP"),
        ("Message", "MSG"),
        ("Icône", "ICO"),
        ("Liste", "LST"),
        ("Case", "CHK"),
        ("Barre d’outils", "BAR"),
        ("Lien", "LNK"),
        ("Étiquette", "ETQ"),
        ("Aide", "AID"),
        ("DragDrop", "DRG"),
        ("Slider", "SLD"),
        ("Carte", "CRD"),
        ("Graphique", "GRF"),
        ("Sidebar", "SID"),
        ("Switch", "SWC"),
        ("Calendrier", "CAL"),
    ]

    def handle(self, *args, **options):
        created_count = 0

        for nom, code in self.UI_TYPES:
            obj, created = InterfaceUtilisateur.objects.get_or_create(
                nom=nom,
                code=code,
                defaults={"is_archived": False}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"✔ Ajouté : {nom}"))
                created_count += 1
            else:
                self.stdout.write(f"- Déjà présent : {nom}")

        self.stdout.write(self.style.SUCCESS(f"\n✅ {created_count} type(s) ajoutés."))
