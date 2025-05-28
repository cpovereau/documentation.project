from django.contrib.auth.models import User, Group
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "Setup test users for CRUD operations"

    def handle(self, *args, **kwargs):
        # Définir les groupes à créer
        groups = ["Administrateur", "Rédacteur", "Gestionnaire de publication", "Relecteur", "Invité"]
        for group_name in groups:
            group, created = Group.objects.get_or_create(name=group_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f"Groupe {group_name} créé."))

        # Création des utilisateurs
        users_info = [
            {"username": "admin_user", "password": "password123", "group": "Administrateur"},
            {"username": "editor_user", "password": "password123", "group": "Rédacteur"},
            {"username": "publisher_user", "password": "password123", "group": "Gestionnaire de publication"},
            {"username": "reviewer_user", "password": "password123", "group": "Relecteur"},
            {"username": "guest_user", "password": "password123", "group": "Invité"},
        ]

        for info in users_info:
            user, created = User.objects.get_or_create(username=info["username"])
            user.set_password(info["password"])
            user.save()
            
            group = Group.objects.get(name=info["group"])
            user.groups.add(group)
            
            self.stdout.write(self.style.SUCCESS(f"User {info['username']} created and added to group {info['group']}"))
