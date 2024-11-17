from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User

class AuthenticationTests(APITestCase):
    def setUp(self):
        # Crée un utilisateur de test avec les attributs nécessaires
        self.user = User.objects.create_user(
            username='gitadmin', 
            password='Ocealia31520',
            first_name='Test', 
            last_name='User', 
            is_superuser=False, 
            is_staff=False, 
            is_active=True
        )

    def test_login(self):
        url = reverse('login')
        data = {'username': 'gitadmin', 'password': 'Ocealia31520'}
        response = self.client.post(url, data, format='json')
        print(response.data)  # Affiche la réponse pour débogage
        # Vérifie le statut HTTP et la présence du nom d'utilisateur dans la réponse
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('username', response.data['user'])
        self.assertIn('token', response.data)

    def test_logout(self):
        self.client.login(username='gitadmin', password='Ocealia31520')
        url = reverse('logout')
        response = self.client.post(url)
        # Vérifie le statut HTTP pour la déconnexion
        self.assertEqual(response.status_code, status.HTTP_200_OK)
