from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User

class AuthenticationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='gitadmin', password='Ocealia31520')

    def test_login(self):
        url = reverse('login')
        data = {'username': 'gitadmin', 'password': 'Ocealia31520'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('username', response.data)

    def test_logout(self):
        self.client.login(username='gitadmin', password='Ocealia31520')
        url = reverse('logout')
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
