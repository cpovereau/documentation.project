from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from documentation.models import Projet, Rubrique, Media, Map

class Command(BaseCommand):
    help = 'Setup user groups and assign permissions'

    def handle(self, *args, **kwargs):
        groups_permissions = {
            "Administrateur": {
                "permissions": Permission.objects.all()  # Donne accès à toutes les permissions
            },
            "Rédacteur": {
                "permissions": [
                    # Ajoutez ici les permissions de création et modification pour les modèles spécifiques
                    'add_projet', 'change_projet', 'add_rubrique', 'change_rubrique', 
                    'add_media', 'change_media'
                ],
                "excluded": ["delete_projet", "delete_rubrique"]  # Pas de suppression
            },
            "Gestionnaire de publication": {
                "permissions": [
                    'add_projet', 'change_projet', 'delete_projet',
                    'add_rubrique', 'change_rubrique', 'delete_rubrique',
                    'add_media', 'change_media', 'delete_media'
                ]
            },
            # Définissez les autres groupes comme vous le souhaitez
        }

        for group_name, config in groups_permissions.items():
            group, created = Group.objects.get_or_create(name=group_name)
            permissions = config.get("permissions", [])
            if isinstance(permissions, list):
                permissions = Permission.objects.filter(codename__in=permissions)
            group.permissions.set(permissions)
            print(f"Group {group_name} {'created' if created else 'updated'} with permissions.")
