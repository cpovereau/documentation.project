from django.test import TestCase
from documentation.models import Produit


class ProduitModelTest(TestCase):

    def test_produit_creation(self):
        produit = Produit.objects.create(nom="Test", abreviation="TST")
        self.assertEqual(produit.nom, "Test")
