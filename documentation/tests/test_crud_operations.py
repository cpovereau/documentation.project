from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from documentation.models import Gamme, Projet

User = get_user_model()


class CRUDOperationsTests(TestCase):

    def setUp(self):
        # Configuration initiale : créer un utilisateur et initialiser le client API
        self.user = User.objects.create_user(
            username="testuser", password="testpassword123"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.gamme = Gamme.objects.create(nom="Hebergement")

    def test_create_project(self):
        # Test de création d'un projet
        payload = {
            "nom": "Nouveau Projet",
            "description": "Description de test",
            "gamme_id": self.gamme.id,
        }
        response = self.client.post("/api/projets/", payload, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["nom"], "Nouveau Projet")

    def test_read_project(self):
        # Test de lecture d'un projet
        project = Projet.objects.create(
            nom="Projet existant", description="Description existante", gamme=self.gamme
        )
        response = self.client.get(f"/api/projets/{project.id}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["nom"], "Projet existant")

    def test_update_project(self):
        # Test de mise à jour d'un projet
        project = Projet.objects.create(
            nom="Projet à mettre à jour",
            description="Ancienne description",
            gamme=self.gamme,
        )
        payload = {
            "nom": "Projet mis à jour",
            "description": "Nouvelle description",
            "gamme_id": self.gamme.id,
        }
        response = self.client.put(
            f"/api/projets/{project.id}/", payload, format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["nom"], "Projet mis à jour")

    def test_delete_project(self):
        # Test de suppression d'un projet
        project = Projet.objects.create(
            nom="Projet à supprimer", description="Description", gamme=self.gamme
        )
        response = self.client.delete(f"/api/projets/{project.id}/")
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Projet.objects.filter(id=project.id).exists())
