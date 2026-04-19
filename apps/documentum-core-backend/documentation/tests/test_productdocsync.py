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


# ---------------------------------------------------------------------------
# Tests API ImpactDocumentaire
# ---------------------------------------------------------------------------

from documentation.models import ImpactDocumentaire, Projet, Rubrique


def _make_projet(gamme) -> Projet:
    return Projet.objects.create(nom="Projet Test", description="Test")


def _make_rubrique(projet: Projet, titre: str = "Rubrique Test") -> Rubrique:
    return Rubrique.objects.create(
        titre=titre,
        contenu_xml="<topic><title>Test</title></topic>",
        projet=projet,
    )


class ImpactDocumentaireAPITest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="test3", password="test")
        self.client.force_authenticate(user=self.user)
        gamme = Gamme.objects.create(nom="Gamme Impact Test")
        self.produit = Produit.objects.create(
            nom="Produit Impact", abreviation="PI", gamme=gamme
        )
        self.fonctionnalite = Fonctionnalite.objects.create(
            produit=self.produit,
            nom="Fonctionnalité Impact",
            id_fonctionnalite="FI001",
            code="FI",
        )
        self.version = VersionProduit.objects.create(
            produit=self.produit, numero="1.0"
        )
        self.evolution = EvolutionProduit.objects.create(
            version_produit=self.version,
            fonctionnalite=self.fonctionnalite,
            type="evolution",
        )
        self.projet = _make_projet(gamme)
        self.rubrique = _make_rubrique(self.projet)

    def _post_impact(self):
        return self.client.post("/api/impacts/", {
            "evolution_produit": self.evolution.pk,
            "rubrique": self.rubrique.pk,
        })

    # 1. Création
    def test_creation_impact(self):
        resp = self._post_impact()
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["statut"], "a_faire")
        self.assertEqual(resp.data["rubrique_titre"], self.rubrique.titre)

    # 2. Filtrage par evolution_produit
    def test_filtrage_par_evolution_produit(self):
        self._post_impact()
        autre_rubrique = _make_rubrique(self.projet, titre="Autre Rubrique")
        autre_evolution = EvolutionProduit.objects.create(
            version_produit=self.version,
            fonctionnalite=self.fonctionnalite,
            type="correctif",
        )
        self.client.post("/api/impacts/", {
            "evolution_produit": autre_evolution.pk,
            "rubrique": autre_rubrique.pk,
        })
        resp = self.client.get(
            f"/api/impacts/?evolution_produit={self.evolution.pk}"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        for item in resp.data:
            self.assertEqual(item["evolution_produit"], self.evolution.pk)

    # 3. Filtrage par rubrique
    def test_filtrage_par_rubrique(self):
        self._post_impact()
        autre_rubrique = _make_rubrique(self.projet, titre="Autre Rubrique 2")
        autre_evolution = EvolutionProduit.objects.create(
            version_produit=self.version,
            fonctionnalite=self.fonctionnalite,
            type="correctif",
        )
        self.client.post("/api/impacts/", {
            "evolution_produit": autre_evolution.pk,
            "rubrique": autre_rubrique.pk,
        })
        resp = self.client.get(f"/api/impacts/?rubrique={self.rubrique.pk}")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        for item in resp.data:
            self.assertEqual(item["rubrique"], self.rubrique.pk)

    # 4. Mise à jour du statut
    def test_update_statut(self):
        impact = ImpactDocumentaire.objects.create(
            evolution_produit=self.evolution,
            rubrique=self.rubrique,
        )
        resp = self.client.patch(
            f"/api/impacts/{impact.pk}/update_statut/",
            {"statut": "en_cours"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["statut"], "en_cours")
        impact.refresh_from_db()
        self.assertEqual(impact.statut, "en_cours")

    # 5. Doublon interdit
    def test_doublon_interdit(self):
        self._post_impact()
        resp = self._post_impact()
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    # 6. Statut invalide refusé
    def test_statut_invalide_refuse(self):
        impact = ImpactDocumentaire.objects.create(
            evolution_produit=self.evolution,
            rubrique=self.rubrique,
        )
        resp = self.client.patch(
            f"/api/impacts/{impact.pk}/update_statut/",
            {"statut": "inconnu"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    # 7. Suppression
    def test_suppression(self):
        resp_create = self._post_impact()
        impact_id = resp_create.data["id"]
        resp_delete = self.client.delete(f"/api/impacts/{impact_id}/")
        self.assertEqual(resp_delete.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            ImpactDocumentaire.objects.filter(pk=impact_id).exists()
        )


# ---------------------------------------------------------------------------
# Tests ImpactDocumentaire — champ notes
# ---------------------------------------------------------------------------

class ImpactDocumentaireNotesTest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="test4", password="test")
        self.client.force_authenticate(user=self.user)
        gamme = Gamme.objects.create(nom="Gamme Notes Test")
        produit = Produit.objects.create(nom="Produit Notes", abreviation="PN", gamme=gamme)
        fonctionnalite = Fonctionnalite.objects.create(
            produit=produit, nom="Fonctionnalité Notes", id_fonctionnalite="FN001", code="FN"
        )
        version = VersionProduit.objects.create(produit=produit, numero="1.0")
        evolution = EvolutionProduit.objects.create(
            version_produit=version, fonctionnalite=fonctionnalite, type="evolution"
        )
        projet = Projet.objects.create(nom="Projet Notes", description="Test")
        rubrique = Rubrique.objects.create(
            titre="Rubrique Notes", contenu_xml="<topic><title>Notes</title></topic>", projet=projet
        )
        self.impact = ImpactDocumentaire.objects.create(
            evolution_produit=evolution, rubrique=rubrique
        )

    # 1. Mise à jour des notes
    def test_update_notes(self):
        resp = self.client.patch(
            f"/api/impacts/{self.impact.pk}/update_notes/",
            {"notes": "Mettre à jour la section 3.2"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["notes"], "Mettre à jour la section 3.2")
        self.impact.refresh_from_db()
        self.assertEqual(self.impact.notes, "Mettre à jour la section 3.2")

    # 2. Notes vides autorisées
    def test_notes_vide_autorise(self):
        self.impact.notes = "Ancienne note"
        self.impact.save()
        resp = self.client.patch(
            f"/api/impacts/{self.impact.pk}/update_notes/",
            {"notes": ""},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["notes"], "")

    # 3. update_statut ne touche pas aux notes (pas d'interférence)
    def test_update_statut_ne_modifie_pas_notes(self):
        self.impact.notes = "Note importante"
        self.impact.save()
        self.client.patch(
            f"/api/impacts/{self.impact.pk}/update_statut/",
            {"statut": "en_cours"},
            format="json",
        )
        self.impact.refresh_from_db()
        self.assertEqual(self.impact.notes, "Note importante")
        self.assertEqual(self.impact.statut, "en_cours")


# ---------------------------------------------------------------------------
# Tests API Rubrique — action usages
# ---------------------------------------------------------------------------

from documentation.models import Map, MapRubrique


class RubriqueUsagesTest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="test5", password="test")
        self.client.force_authenticate(user=self.user)
        gamme = Gamme.objects.create(nom="Gamme Usages")
        self.projet = Projet.objects.create(nom="Projet Usages", description="Test")
        self.rubrique = Rubrique.objects.create(
            titre="Rubrique Usages",
            contenu_xml="<topic><title>Usages</title></topic>",
            projet=self.projet,
        )

    # 1. Rubrique dans 2 maps → 2 entrées
    def test_usages_deux_maps(self):
        map1 = Map.objects.create(nom="Map A", projet=self.projet)
        map2 = Map.objects.create(nom="Map B", projet=self.projet)
        MapRubrique.objects.create(map=map1, rubrique=self.rubrique, ordre=1)
        MapRubrique.objects.create(map=map2, rubrique=self.rubrique, ordre=1)

        resp = self.client.get(f"/api/rubriques/{self.rubrique.pk}/usages/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 2)
        map_ids = {entry["map_id"] for entry in resp.data}
        self.assertIn(map1.pk, map_ids)
        self.assertIn(map2.pk, map_ids)
        for entry in resp.data:
            self.assertIn("map_nom", entry)
            self.assertIn("projet_id", entry)
            self.assertIn("projet_nom", entry)

    # 2. Rubrique dans aucune map → liste vide
    def test_usages_aucune_map(self):
        resp = self.client.get(f"/api/rubriques/{self.rubrique.pk}/usages/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data, [])
