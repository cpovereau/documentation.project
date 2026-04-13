# documentation/tests/test_revisions_endpoint.py
"""
Tests de l'endpoint GET /api/rubriques/{id}/revisions/ (Lot 4).

Couverture :
- Rubrique avec plusieurs révisions — ordre décroissant garanti
- Rubrique avec une seule révision
- Rubrique inexistante → 404
- Cohérence du payload (champs, types, valeurs)
- Accès non authentifié → 401/403
"""
from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from documentation.models import (
    Gamme,
    Map,
    Projet,
    RevisionRubrique,
    Rubrique,
    VersionProjet,
)
from documentation.services import create_initial_revision, create_revision_if_changed


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_user(username="u"):
    return User.objects.create_user(username=username, password="pw")


def _make_rubrique(user, xml="<topic/>", titre="R"):
    gamme = Gamme.objects.create(nom=f"G-{titre}")
    projet = Projet.objects.create(nom=f"P-{titre}", description="", gamme=gamme, auteur=user)
    version = VersionProjet.objects.create(
        projet=projet, version_numero="1.0.0", is_active=True
    )
    rubrique = Rubrique.objects.create(
        projet=projet,
        version_projet=version,
        titre=titre,
        contenu_xml=xml,
        auteur=user,
        is_active=True,
    )
    create_initial_revision(rubrique=rubrique, user=user)
    return rubrique


def _url(rubrique_id):
    return f"/api/rubriques/{rubrique_id}/revisions/"


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class RubriqueRevisionsEndpointTest(APITestCase):

    def setUp(self):
        self.user = _make_user("testuser")
        self.client.force_authenticate(user=self.user)

    # --- 404 ---

    def test_rubrique_inexistante_retourne_404(self):
        response = self.client.get(_url(99999))
        self.assertEqual(response.status_code, 404)

    # --- Accès non authentifié ---

    def test_non_authentifie_retourne_401_ou_403(self):
        self.client.force_authenticate(user=None)
        rubrique = _make_rubrique(self.user)
        response = self.client.get(_url(rubrique.id))
        self.assertIn(response.status_code, [401, 403])

    # --- Rubrique avec une seule révision ---

    def test_une_revision_retourne_liste_de_un(self):
        rubrique = _make_rubrique(self.user)
        response = self.client.get(_url(rubrique.id))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 1)

    def test_une_revision_numero_est_1(self):
        rubrique = _make_rubrique(self.user)
        response = self.client.get(_url(rubrique.id))
        self.assertEqual(response.json()[0]["numero"], 1)

    # --- Cohérence du payload ---

    def test_payload_contient_tous_les_champs_attendus(self):
        rubrique = _make_rubrique(self.user)
        response = self.client.get(_url(rubrique.id))
        item = response.json()[0]
        for champ in ("id", "numero", "hash_contenu", "contenu_xml", "auteur_username", "date_creation"):
            self.assertIn(champ, item, f"Champ manquant : {champ}")

    def test_auteur_username_est_correct(self):
        rubrique = _make_rubrique(self.user)
        response = self.client.get(_url(rubrique.id))
        self.assertEqual(response.json()[0]["auteur_username"], self.user.username)

    def test_contenu_xml_correspond_au_xml_initial(self):
        rubrique = _make_rubrique(self.user, xml="<topic id='t1'/>")
        response = self.client.get(_url(rubrique.id))
        self.assertEqual(response.json()[0]["contenu_xml"], "<topic id='t1'/>")

    def test_hash_contenu_est_chaine_64_chars(self):
        rubrique = _make_rubrique(self.user)
        response = self.client.get(_url(rubrique.id))
        hash_val = response.json()[0]["hash_contenu"]
        self.assertIsInstance(hash_val, str)
        self.assertEqual(len(hash_val), 64)

    # --- Plusieurs révisions : ordre décroissant ---

    def test_plusieurs_revisions_ordre_decroissant(self):
        rubrique = _make_rubrique(self.user, xml="<v1/>")

        rubrique.contenu_xml = "<v1/>"  # DB state for comparison
        rubrique.save(update_fields=["contenu_xml"])
        create_revision_if_changed(rubrique=rubrique, new_xml="<v2/>", user=self.user)
        rubrique.contenu_xml = "<v2/>"
        rubrique.save(update_fields=["contenu_xml"])

        create_revision_if_changed(rubrique=rubrique, new_xml="<v3/>", user=self.user)
        rubrique.contenu_xml = "<v3/>"
        rubrique.save(update_fields=["contenu_xml"])

        response = self.client.get(_url(rubrique.id))
        self.assertEqual(response.status_code, 200)
        numeros = [item["numero"] for item in response.json()]
        self.assertEqual(numeros, sorted(numeros, reverse=True))

    def test_plusieurs_revisions_le_plus_recent_en_premier(self):
        rubrique = _make_rubrique(self.user, xml="<v1/>")

        create_revision_if_changed(rubrique=rubrique, new_xml="<v2/>", user=self.user)
        rubrique.contenu_xml = "<v2/>"
        rubrique.save(update_fields=["contenu_xml"])

        response = self.client.get(_url(rubrique.id))
        items = response.json()
        self.assertEqual(items[0]["numero"], 2)
        self.assertEqual(items[-1]["numero"], 1)

    def test_nombre_de_revisions_correct(self):
        rubrique = _make_rubrique(self.user, xml="<v1/>")

        for i in range(2, 6):
            new_xml = f"<v{i}/>"
            create_revision_if_changed(rubrique=rubrique, new_xml=new_xml, user=self.user)
            rubrique.contenu_xml = new_xml
            rubrique.save(update_fields=["contenu_xml"])

        response = self.client.get(_url(rubrique.id))
        self.assertEqual(len(response.json()), 5)

    def test_revision_identique_ne_cree_pas_de_nouvelle_entree(self):
        rubrique = _make_rubrique(self.user, xml="<topic/>")
        # Appel avec le même contenu → aucune révision créée
        create_revision_if_changed(rubrique=rubrique, new_xml="<topic/>", user=self.user)

        response = self.client.get(_url(rubrique.id))
        self.assertEqual(len(response.json()), 1)

    # --- Lecture seule : POST interdit ---

    def test_post_non_supporte(self):
        rubrique = _make_rubrique(self.user)
        response = self.client.post(_url(rubrique.id), {})
        self.assertEqual(response.status_code, 405)
