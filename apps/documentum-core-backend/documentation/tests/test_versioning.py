"""
Tests — Chantier 6 Lot 2 : service de révision documentaire.

Couvre :
- compute_xml_hash (déterminisme, normalisation, cas limites)
- create_revision_if_changed (service unitaire)
- Intégration création rubrique → RevisionRubrique(1)
- Intégration sauvegarde via PUT /api/rubriques/{id}/
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from documentation.models import (
    Gamme,
    Map,
    MapRubrique,
    Projet,
    RevisionRubrique,
    Rubrique,
    VersionProjet,
)
from documentation.services import create_project, create_revision_if_changed, create_rubrique_in_map
from documentation.utils import compute_xml_hash

User = get_user_model()

XML_V1 = "<topic><title>Titre</title><body><p>Contenu initial.</p></body></topic>"
XML_V2 = "<topic><title>Titre</title><body><p>Contenu modifié.</p></body></topic>"
XML_V1_ESPACES = "<topic>  <title>Titre</title>  <body><p>Contenu initial.</p></body>  </topic>"


# ---------------------------------------------------------------------------
# 1. Tests unitaires — compute_xml_hash
# ---------------------------------------------------------------------------

class ComputeXmlHashTest(TestCase):
    """Vérifie le caractère déterministe et normalisé du hash."""

    def test_meme_xml_meme_hash(self):
        self.assertEqual(compute_xml_hash(XML_V1), compute_xml_hash(XML_V1))

    def test_xml_different_hash_different(self):
        self.assertNotEqual(compute_xml_hash(XML_V1), compute_xml_hash(XML_V2))

    def test_espacement_interne_significatif(self):
        """
        Limite documentée : ElementTree préserve les nœuds texte whitespace-only
        entre balises (.text / .tail). Deux XML avec espacement différent entre
        balises produisent des hashes différents — comportement correct XML.

        En pratique, TipTap sérialise de façon cohérente → pas de faux positifs
        sur les sauvegardes réelles de l'éditeur.
        """
        xml_compact = "<root><child>val</child></root>"
        xml_espaces = "<root>  <child>val</child>  </root>"
        # Ces deux chaînes sont des documents XML distincts (text nodes différents)
        self.assertNotEqual(compute_xml_hash(xml_compact), compute_xml_hash(xml_espaces))

    def test_attributs_reordonnes_hash_different(self):
        """
        Limite documentée : Python 3.13 ne trie pas les attributs dans ET.tostring().
        XML avec attributs dans un ordre différent → hashes différents.
        En pratique, TipTap sérialise les attributs dans un ordre constant pour
        un contenu donné — pas de faux positifs en usage réel.
        """
        xml_ab = '<tag a="1" b="2">val</tag>'
        xml_ba = '<tag b="2" a="1">val</tag>'
        # Comportement réel Python 3.13 : ordre préservé, hash distinct
        self.assertNotEqual(compute_xml_hash(xml_ab), compute_xml_hash(xml_ba))

    def test_chaine_vide_hash_stable(self):
        """Chaîne vide → hash de b"" (rubriques racines)."""
        import hashlib
        expected = hashlib.sha256(b"").hexdigest()
        self.assertEqual(compute_xml_hash(""), expected)
        self.assertEqual(compute_xml_hash("   "), expected)
        self.assertEqual(compute_xml_hash(None), expected)

    def test_xml_invalide_hash_du_texte_brut(self):
        """XML malformé → hash du texte brut sans lever d'exception."""
        xml_invalide = "<root><non_ferme>"
        h = compute_xml_hash(xml_invalide)
        self.assertIsInstance(h, str)
        self.assertEqual(len(h), 64)  # SHA-256 hex = 64 chars

    def test_declaration_xml_ignoree(self):
        """La déclaration <?xml ...?> est ignorée lors de la normalisation."""
        sans_decl = "<topic><title>T</title></topic>"
        avec_decl = '<?xml version="1.0" encoding="UTF-8"?><topic><title>T</title></topic>'
        self.assertEqual(compute_xml_hash(sans_decl), compute_xml_hash(avec_decl))


# ---------------------------------------------------------------------------
# 2. Tests unitaires — create_revision_if_changed (service)
# ---------------------------------------------------------------------------

class CreateRevisionIfChangedServiceTest(TestCase):
    """Tests unitaires directs sur le service, sans passer par l'API."""

    def setUp(self):
        self.user = User.objects.create_user(username="auteur", password="pass")
        self.gamme = Gamme.objects.create(nom="Gamme Test")
        result = create_project(
            data={"nom": "Projet Test", "description": "", "gamme": self.gamme},
            user=self.user,
        )
        self.projet = result["projet"]
        self.map = result["map"]
        # Rubrique racine créée par create_project — elle possède déjà RevisionRubrique(1)
        self.rubrique = result["rubrique"]

    # --- Cas : contenu modifié ---

    def test_xml_modifie_cree_revision(self):
        initial_count = RevisionRubrique.objects.filter(rubrique=self.rubrique).count()
        revision = create_revision_if_changed(
            rubrique=self.rubrique,
            new_xml=XML_V1,
            user=self.user,
        )
        self.assertIsNotNone(revision)
        self.assertEqual(
            RevisionRubrique.objects.filter(rubrique=self.rubrique).count(),
            initial_count + 1,
        )

    def test_xml_modifie_numero_incremente(self):
        """Le numero de la nouvelle révision est bien dernier + 1."""
        rev = create_revision_if_changed(
            rubrique=self.rubrique,
            new_xml=XML_V1,
            user=self.user,
        )
        self.assertEqual(rev.numero, 2)  # La rubrique racine a déjà la révision 1

        rev2 = create_revision_if_changed(
            rubrique=self.rubrique,
            new_xml=XML_V2,
            user=self.user,
        )
        self.assertEqual(rev2.numero, 3)

    def test_xml_modifie_hash_stocke(self):
        rev = create_revision_if_changed(
            rubrique=self.rubrique,
            new_xml=XML_V1,
            user=self.user,
        )
        self.assertEqual(rev.hash_contenu, compute_xml_hash(XML_V1))

    def test_xml_modifie_contenu_stocke(self):
        rev = create_revision_if_changed(
            rubrique=self.rubrique,
            new_xml=XML_V1,
            user=self.user,
        )
        self.assertEqual(rev.contenu_xml, XML_V1)

    def test_xml_modifie_auteur_stocke(self):
        rev = create_revision_if_changed(
            rubrique=self.rubrique,
            new_xml=XML_V1,
            user=self.user,
        )
        self.assertEqual(rev.auteur, self.user)

    # --- Cas : contenu identique ---

    def test_xml_identique_retourne_none(self):
        """Si le hash est le même, le service retourne None."""
        # Forcer un contenu connu sur la rubrique
        self.rubrique.contenu_xml = XML_V1
        self.rubrique.save(update_fields=["contenu_xml"])

        result = create_revision_if_changed(
            rubrique=self.rubrique,
            new_xml=XML_V1,
            user=self.user,
        )
        self.assertIsNone(result)

    def test_xml_identique_pas_de_revision_cree(self):
        self.rubrique.contenu_xml = XML_V1
        self.rubrique.save(update_fields=["contenu_xml"])
        count_avant = RevisionRubrique.objects.filter(rubrique=self.rubrique).count()

        create_revision_if_changed(
            rubrique=self.rubrique,
            new_xml=XML_V1,
            user=self.user,
        )
        self.assertEqual(
            RevisionRubrique.objects.filter(rubrique=self.rubrique).count(),
            count_avant,
        )

    def test_xml_identique_espacement_different_cree_revision(self):
        """
        Limite documentée : ElementTree préserve les whitespace text nodes.
        XML compact vs XML avec espaces inter-balises → hashes différents → révision créée.
        TipTap produisant un XML cohérent, ce cas n'arrive pas en usage réel.
        """
        xml_compact = "<root><child>val</child></root>"
        xml_espaces = "<root>  <child>val</child>  </root>"

        self.rubrique.contenu_xml = xml_compact
        self.rubrique.save(update_fields=["contenu_xml"])
        count_avant = RevisionRubrique.objects.filter(rubrique=self.rubrique).count()

        create_revision_if_changed(
            rubrique=self.rubrique,
            new_xml=xml_espaces,
            user=self.user,
        )
        # Comportement attendu : les deux XML sont distincts → révision créée
        self.assertEqual(
            RevisionRubrique.objects.filter(rubrique=self.rubrique).count(),
            count_avant + 1,
        )

    # --- Vérification : le service ne modifie pas rubrique.contenu_xml ---

    def test_service_ne_modifie_pas_contenu_xml_rubrique(self):
        """create_revision_if_changed ne doit pas toucher rubrique.contenu_xml.
        La mise à jour est sous la responsabilité de l'appelant (serializer.save())."""
        xml_original = self.rubrique.contenu_xml
        create_revision_if_changed(
            rubrique=self.rubrique,
            new_xml=XML_V1,
            user=self.user,
        )
        self.rubrique.refresh_from_db()
        self.assertEqual(self.rubrique.contenu_xml, xml_original)


# ---------------------------------------------------------------------------
# 3. Tests d'intégration — création de rubrique → RevisionRubrique(1)
# ---------------------------------------------------------------------------

class RevisionInitialeCreationTest(TestCase):
    """Vérifie que la révision initiale est créée dans tous les points d'entrée."""

    def setUp(self):
        self.user = User.objects.create_user(username="auteur", password="pass")
        self.gamme = Gamme.objects.create(nom="Gamme Test")
        result = create_project(
            data={"nom": "Projet Test", "description": "", "gamme": self.gamme},
            user=self.user,
        )
        self.projet = result["projet"]
        self.map = result["map"]

    def test_create_project_cree_revision_1_sur_rubrique_racine(self):
        """create_project() doit créer RevisionRubrique(numero=1) pour la rubrique racine."""
        rubrique_racine = Rubrique.objects.get(
            projet=self.projet, titre="Racine documentaire"
        )
        self.assertEqual(
            RevisionRubrique.objects.filter(rubrique=rubrique_racine, numero=1).count(),
            1,
        )

    def test_create_rubrique_in_map_cree_revision_1(self):
        """create_rubrique_in_map() doit créer RevisionRubrique(numero=1)."""
        mr = create_rubrique_in_map(
            map_id=self.map.id,
            titre="Nouvelle rubrique",
            contenu_xml=XML_V1,
            auteur=self.user,
        )
        self.assertEqual(
            RevisionRubrique.objects.filter(rubrique=mr.rubrique, numero=1).count(),
            1,
        )

    def test_create_rubrique_in_map_hash_correct(self):
        mr = create_rubrique_in_map(
            map_id=self.map.id,
            titre="Rubrique hash",
            contenu_xml=XML_V1,
            auteur=self.user,
        )
        rev = RevisionRubrique.objects.get(rubrique=mr.rubrique, numero=1)
        self.assertEqual(rev.hash_contenu, compute_xml_hash(XML_V1))

    def test_create_rubrique_in_map_contenu_xml_vide_cree_revision_1(self):
        """Une rubrique avec contenu vide reçoit quand même une RevisionRubrique(1)."""
        mr = create_rubrique_in_map(
            map_id=self.map.id,
            titre="Rubrique vide",
            contenu_xml="",
            auteur=self.user,
        )
        self.assertEqual(
            RevisionRubrique.objects.filter(rubrique=mr.rubrique, numero=1).count(),
            1,
        )


# ---------------------------------------------------------------------------
# 4. Tests d'intégration API — PUT /api/rubriques/{id}/
# ---------------------------------------------------------------------------

class RubriqueUpdateRevisionAPITest(TestCase):
    """Tests d'intégration via l'API REST."""

    def setUp(self):
        self.user = User.objects.create_user(username="auteur", password="pass")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.gamme = Gamme.objects.create(nom="Gamme Test")

        result = create_project(
            data={"nom": "Projet API Test", "description": "", "gamme": self.gamme},
            user=self.user,
        )
        self.projet = result["projet"]
        self.map = result["map"]

        mr = create_rubrique_in_map(
            map_id=self.map.id,
            titre="Rubrique API",
            contenu_xml=XML_V1,
            auteur=self.user,
        )
        self.rubrique = mr.rubrique

    def _put(self, payload):
        return self.client.put(
            f"/api/rubriques/{self.rubrique.id}/",
            payload,
            format="json",
        )

    def _patch(self, payload):
        return self.client.patch(
            f"/api/rubriques/{self.rubrique.id}/",
            payload,
            format="json",
        )

    # --- XML modifié via PUT ---

    def test_put_xml_modifie_cree_revision(self):
        count_avant = RevisionRubrique.objects.filter(rubrique=self.rubrique).count()
        response = self._put({
            "titre": self.rubrique.titre,
            "contenu_xml": XML_V2,
            "projet": self.projet.id,
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            RevisionRubrique.objects.filter(rubrique=self.rubrique).count(),
            count_avant + 1,
        )

    def test_put_xml_modifie_numero_incremente(self):
        self._put({
            "titre": self.rubrique.titre,
            "contenu_xml": XML_V2,
            "projet": self.projet.id,
        })
        derniere = RevisionRubrique.objects.filter(rubrique=self.rubrique).order_by("-numero").first()
        self.assertEqual(derniere.numero, 2)

    def test_put_xml_modifie_revision_courante_numero_dans_reponse(self):
        """La réponse API doit inclure revision_courante_numero mis à jour."""
        response = self._put({
            "titre": self.rubrique.titre,
            "contenu_xml": XML_V2,
            "projet": self.projet.id,
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn("revision_courante_numero", response.data)
        self.assertEqual(response.data["revision_courante_numero"], 2)

    # --- XML identique via PUT ---

    def test_put_xml_identique_pas_de_revision(self):
        count_avant = RevisionRubrique.objects.filter(rubrique=self.rubrique).count()
        response = self._put({
            "titre": self.rubrique.titre,
            "contenu_xml": XML_V1,  # identique à l'état initial
            "projet": self.projet.id,
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            RevisionRubrique.objects.filter(rubrique=self.rubrique).count(),
            count_avant,
        )

    def test_put_xml_identique_revision_courante_numero_inchange(self):
        response = self._put({
            "titre": self.rubrique.titre,
            "contenu_xml": XML_V1,
            "projet": self.projet.id,
        })
        self.assertEqual(response.data["revision_courante_numero"], 1)

    # --- Renommage seul (PATCH sans contenu_xml) ---

    def test_patch_titre_seul_pas_de_revision(self):
        """PATCH avec titre uniquement (sans contenu_xml) ne crée pas de révision."""
        count_avant = RevisionRubrique.objects.filter(rubrique=self.rubrique).count()
        response = self._patch({"titre": "Nouveau titre"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            RevisionRubrique.objects.filter(rubrique=self.rubrique).count(),
            count_avant,
        )

    # --- Contrat de réponse ---

    def test_reponse_contient_revision_courante_numero(self):
        """GET /api/rubriques/{id}/ doit exposer revision_courante_numero."""
        response = self.client.get(f"/api/rubriques/{self.rubrique.id}/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("revision_courante_numero", response.data)
        self.assertEqual(response.data["revision_courante_numero"], 1)

    def test_multiple_saves_xml_different_numero_sequentiel(self):
        """Trois sauvegardes avec XML différents → révisions 1, 2, 3."""
        self._put({"titre": self.rubrique.titre, "contenu_xml": XML_V2, "projet": self.projet.id})
        xml_v3 = "<topic><title>V3</title><body><p>V3</p></body></topic>"
        self._put({"titre": self.rubrique.titre, "contenu_xml": xml_v3, "projet": self.projet.id})

        numeros = list(
            RevisionRubrique.objects.filter(rubrique=self.rubrique)
            .order_by("numero")
            .values_list("numero", flat=True)
        )
        self.assertEqual(numeros, [1, 2, 3])

    def test_creation_api_directe_cree_revision_1(self):
        """POST /api/rubriques/ crée bien une RevisionRubrique(numero=1)."""
        version = VersionProjet.objects.get(projet=self.projet, is_active=True)
        response = self.client.post(
            "/api/rubriques/",
            {
                "titre": "Rubrique directe",
                "contenu_xml": XML_V1,
                "projet": self.projet.id,
                "version_projet": version.id,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        rubrique_id = response.data["id"]
        self.assertEqual(
            RevisionRubrique.objects.filter(rubrique_id=rubrique_id, numero=1).count(),
            1,
        )
