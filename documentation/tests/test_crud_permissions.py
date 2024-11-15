from django.test import TestCase
from django.contrib.auth.models import User, Group
from documentation.models import Projet
from rest_framework.authtoken.models import Token

class CRUDPermissionTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        print("Setup des données de test...")

        # Création des groupes
        groups = ['Administrateur', 'Rédacteur', 'Gestionnaire de publication', 'Relecteur', 'Invité']
        for group_name in groups:
            Group.objects.get_or_create(name=group_name)
            print(f"Groupe créé ou récupéré: {group_name}")

        # Création des utilisateurs de test
        users = {
            'admin_user': 'Administrateur',
            'editor_user': 'Rédacteur',
            'publisher_user': 'Gestionnaire de publication',
            'reviewer_user': 'Relecteur',
            'guest_user': 'Invité',
        }

        for username, group_name in users.items():
            user = User.objects.create_user(username=username, password='testpassword')
            group = Group.objects.get(name=group_name)
            user.groups.add(group)
            # Création d’un token d’authentification pour l’utilisateur
            Token.objects.create(user=user)
            print(f"Utilisateur {username} créé et ajouté au groupe {group_name}")

    def test_create_projet(self):
        print("Début du test de création de projet...")

        # Connexion de l’utilisateur admin_user et récupération du token
        user = User.objects.get(username='admin_user')
        token = Token.objects.get(user=user)
        print(f"Token récupéré pour l'utilisateur {user.username}: {token.key}")

        # En-têtes avec le token d'authentification
        headers = {'HTTP_AUTHORIZATION': f'Token {token.key}'}

        # Effectuer la requête POST avec le token
        response = self.client.post('/api/projet/create/', {
            'nom': 'Test Projet',
            'description': 'Projet de test'
        }, **headers)
        print(f"Requête POST exécutée. Statut de la réponse: {response.status_code}")
        print(f"Données de la réponse: {response.json()}")

        # Vérifier le statut de la réponse
        self.assertEqual(response.status_code, 201)
        print("Test de création de projet réussi.")
