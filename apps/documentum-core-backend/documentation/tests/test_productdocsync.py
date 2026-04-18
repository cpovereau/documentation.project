# documentation/tests/test_productdocsync.py
"""
Tests d'intégration — ProductDocSync : VersionProduit et EvolutionProduit.

Invariants couverts :
- VersionProduit : unicité (produit, numero)
- VersionProduit : publication irréversible via /publier/
- VersionProduit : impossibilité de publier via PATCH statut=publiee
- VersionProduit : archivage interdit sur une version déjà publiée
- EvolutionProduit : réordonnancement correct
- EvolutionProduit : réordonnancement avec ID invalide → 400
- EvolutionProduit : archivage via /archive/
"""
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from documentation.models import (
    EvolutionProduit,
    Fonctionnalite,
    Gamme,
    Produit,
    VersionProduit,
)
from documentation.services import publier_version_produit, reorder_evolutions_produit


# ---------------------------------------------------------------------------
# Fixtures communes
# ---------------------------------------------------------------------------

def _make_produit() -> Produit:
    gamme = Gamme.objects.create(nom="Gamme Test")
    return Produit.objects.create(nom="Produit Test", abreviation="PT", gamme=gamme)


def _make_fonctionnalite(produit: Produit) -> Fonctionnalite:
    return Fonctionnalite.objects.create(
        produit=produit,
        nom="Fonctionnalité Test",
        id_fonctionnalite="FT001",
        code="FT",
    )


def _make_version(produit: Produit, numero: str = "1.0") -> VersionProduit:
    return VersionProduit.objects.create(produit=produit, numero=numero)


# ---------------------------------------------------------------------------
# Tests service publier_version_produit
# ---------------------------------------------------------------------------

class PublierVersionProduitServiceTest(APITestCase):

    def setUp(self):
        self.produit = _make_produit()

    def test_publie_version_en_preparation(self):
        version = _make_version(self.produit)
        result = publier_version_produit(version.pk)
        self.assertEqual(result.statut, "publiee")
        self.assertIsNotNone(result.date_publication)

    def test_publie_deja_publiee_leve_erreur(self):
        version = _make_version(self.produit, "2.0")
        publier_version_produit(version.pk)
        from rest_framework.exceptions import ValidationError
        with self.assertRaises(ValidationError):
            publier_version_produit(version.pk)

    def test_publie_archivee_leve_erreur(self):
        version = _make_version(self.produit, "3.0")
        version.statut = "archivee"
        version.save()
        from rest_framework.exceptions import ValidationError
        with self.assertRaises(ValidationError):
            publier_version_produit(version.pk)

    def test_publication_persistee_en_base(self):
        version = _make_version(self.produit, "4.0")
        publier_version_produit(version.pk)
        version.refresh_from_db()
        self.assertEqual(version.statut, "publiee")
        self.assertIsNotNone(version.date_publication)


# ---------------------------------------------------------------------------
# Tests service reorder_evolutions_produit
# ---------------------------------------------------------------------------

class ReorderEvolutionsProduitServiceTest(APITestCase):

    def setUp(self):
        self.produit = _make_produit()
        self.fonctionnalite = _make_fonctionnalite(self.produit)
        self.version = _make_version(self.produit)

    def _make_evolution(self, ordre: int = 0) -> EvolutionProduit:
        return EvolutionProduit.objects.create(
            version_produit=self.version,
            fonctionnalite=self.fonctionnalite,
            type="evolution",
            ordre=ordre,
        )

    def test_reorder_correct(self):
        e1 = self._make_evolution(ordre=0)
        e2 = self._make_evolution(ordre=1)
        e3 = self._make_evolution(ordre=2)
        reorder_evolutions_produit([e3.pk, e1.pk, e2.pk])
        e1.refresh_from_db()
        e2.refresh_from_db()
        e3.refresh_from_db()
        self.assertEqual(e3.ordre, 0)
        self.assertEqual(e1.ordre, 1)
        self.assertEqual(e2.ordre, 2)

    def test_reorder_id_invalide_leve_erreur(self):
        e1 = self._make_evolution()
        from rest_framework.exceptions import ValidationError
        with self.assertRaises(ValidationError):
            reorder_evolutions_produit([e1.pk, 99999])

    def test_reorder_liste_vide_leve_erreur(self):
        from rest_framework.exceptions import ValidationError
        with self.assertRaises(ValidationError):
            reorder_evolutions_produit([])


# ---------------------------------------------------------------------------
# Tests API VersionProduit
# ---------------------------------------------------------------------------

class VersionProduitAPITest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="test", password="test")
        self.client.force_authenticate(user=self.user)
        self.produit = _make_produit()

    def test_creation_version(self):
        resp = self.client.post("/api/versions-produit/", {
            "produit": self.produit.pk,
            "numero": "1.0",
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["statut"], "en_preparation")

    def test_unicite_produit_numero(self):
        VersionProduit.objects.create(produit=self.produit, numero="1.0")
        resp = self.client.post("/api/versions-produit/", {
            "produit": self.produit.pk,
            "numero": "1.0",
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_patch_statut_publiee_bloque(self):
        version = _make_version(self.produit, "2.0")
        resp = self.client.patch(f"/api/versions-produit/{version.pk}/", {
            "statut": "publiee",
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_publier_endpoint_succes(self):
        version = _make_version(self.produit, "3.0")
        resp = self.client.post(f"/api/versions-produit/{version.pk}/publier/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["statut"], "publiee")

    def test_publier_endpoint_deja_publiee(self):
        version = _make_version(self.produit, "4.0")
        self.client.post(f"/api/versions-produit/{version.pk}/publier/")
        resp = self.client.post(f"/api/versions-produit/{version.pk}/publier/")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_archivage_version_publiee_bloque(self):
        version = _make_version(self.produit, "5.0")
        self.client.post(f"/api/versions-produit/{version.pk}/publier/")
        resp = self.client.patch(f"/api/versions-produit/{version.pk}/", {
            "statut": "archivee",
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_filtrage_par_produit(self):
        autre_produit = Produit.objects.create(
            nom="Autre", abreviation="AP", gamme=self.produit.gamme
        )
        VersionProduit.objects.create(produit=self.produit, numero="1.0")
        VersionProduit.objects.create(produit=autre_produit, numero="1.0")
        resp = self.client.get(f"/api/versions-produit/?produit={self.produit.pk}")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        for v in resp.data:
            self.assertEqual(v["produit"], self.produit.pk)

    def test_delete_interdit(self):
        version = _make_version(self.produit, "6.0")
        resp = self.client.delete(f"/api/versions-produit/{version.pk}/")
        self.assertEqual(resp.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


# ---------------------------------------------------------------------------
# Tests API EvolutionProduit
# ---------------------------------------------------------------------------

class EvolutionProduitAPITest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="test2", password="test")
        self.client.force_authenticate(user=self.user)
        self.produit = _make_produit()
        self.fonctionnalite = _make_fonctionnalite(self.produit)
        self.version = _make_version(self.produit)

    def _post_evolution(self, type_="evolution"):
        return self.client.post("/api/evolutions-produit/", {
            "version_produit": self.version.pk,
            "fonctionnalite": self.fonctionnalite.pk,
            "type": type_,
            "description": "Test",
        })

    def test_creation_evolution(self):
        resp = self._post_evolution()
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["statut"], "draft")

    def test_reorder_endpoint(self):
        resp1 = self._post_evolution()
        resp2 = self._post_evolution()
        id1, id2 = resp1.data["id"], resp2.data["id"]
        resp = self.client.patch(
            "/api/evolutions-produit/reorder/",
            {"orderedIds": [id2, id1]},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        e1 = EvolutionProduit.objects.get(pk=id1)
        e2 = EvolutionProduit.objects.get(pk=id2)
        self.assertEqual(e2.ordre, 0)
        self.assertEqual(e1.ordre, 1)

    def test_reorder_id_invalide(self):
        resp = self.client.patch(
            "/api/evolutions-produit/reorder/",
            {"orderedIds": [99999]},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_archive_endpoint(self):
        resp = self._post_evolution()
        eid = resp.data["id"]
        resp_archive = self.client.patch(f"/api/evolutions-produit/{eid}/archive/")
        self.assertEqual(resp_archive.status_code, status.HTTP_200_OK)
        self.assertTrue(EvolutionProduit.objects.get(pk=eid).is_archived)

    def test_archivees_exclues_par_defaut(self):
        resp = self._post_evolution()
        eid = resp.data["id"]
        self.client.patch(f"/api/evolutions-produit/{eid}/archive/")
        list_resp = self.client.get(
            f"/api/evolutions-produit/?version_produit={self.version.pk}"
        )
        ids = [e["id"] for e in list_resp.data]
        self.assertNotIn(eid, ids)

    def test_filtrage_par_version_produit(self):
        autre_version = VersionProduit.objects.create(produit=self.produit, numero="2.0")
        self._post_evolution()
        self.client.post("/api/evolutions-produit/", {
            "version_produit": autre_version.pk,
            "fonctionnalite": self.fonctionnalite.pk,
            "type": "correctif",
        })
        resp = self.client.get(
            f"/api/evolutions-produit/?version_produit={self.version.pk}"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        for e in resp.data:
            self.assertEqual(e["version_produit"], self.version.pk)
