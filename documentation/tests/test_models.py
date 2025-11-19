import pytest
from documentation.models import Produit

@pytest.mark.django_db
def test_produit_creation():
    produit = Produit.objects.create(nom="Test", abreviation="TST")
    assert produit.nom == "Test"
