from django.test import TestCase
from documentation.models import Gamme, Produit


class ProduitModelTest(TestCase):
    def test_produit_creation(self):
        gamme = Gamme.objects.create(nom="Hebergement")
        produit = Produit.objects.create(
            nom="Test",
            abreviation="TST",
            gamme=gamme,
        )
        self.assertEqual(produit.nom, "Test")
        self.assertEqual(produit.gamme, gamme)
