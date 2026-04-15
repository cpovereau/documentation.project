from unittest.mock import patch

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User

from documentation.models import Gamme, Projet, VersionProjet, Map, Rubrique, MapRubrique


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


# ---------------------------------------------------------------------------
# Fixtures partagées
# ---------------------------------------------------------------------------

def _make_project(user, suffix=""):
    gamme = Gamme.objects.create(nom=f"Gamme{suffix}", description="test")
    projet = Projet.objects.create(
        nom=f"Projet{suffix}", description="test", gamme=gamme, auteur=user
    )
    version = VersionProjet.objects.create(
        projet=projet, version_numero="1.0.0", is_active=True
    )
    map_obj = Map.objects.create(nom=f"Map{suffix}", projet=projet, is_master=True)
    return projet, version, map_obj


def _make_rubrique(projet, version, user, titre="Rubrique"):
    return Rubrique.objects.create(
        projet=projet,
        version_projet=version,
        titre=titre,
        contenu_xml="<topic><title>Test</title></topic>",
        auteur=user,
        is_active=True,
    )


# ---------------------------------------------------------------------------
# Lot 3 — POST /api/maps/{id}/structure/attach/
# ---------------------------------------------------------------------------

class StructureAttachTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="attach_user")
        self.client.force_authenticate(user=self.user)

        self.projet, self.version, self.map = _make_project(self.user, "_attach")
        self.rubrique = _make_rubrique(self.projet, self.version, self.user)

        # Projet différent pour test cross-project
        self.autre_projet, self.autre_version, _ = _make_project(self.user, "_attach_autre")
        self.rubrique_autre = _make_rubrique(
            self.autre_projet, self.autre_version, self.user, titre="Autre"
        )

    def test_attach_valid(self):
        url = reverse("map-structure-attach", args=[self.map.id])
        response = self.client.post(url, {"rubrique_id": self.rubrique.id}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            MapRubrique.objects.filter(map=self.map, rubrique=self.rubrique).exists()
        )

    def test_attach_wrong_project_returns_400(self):
        url = reverse("map-structure-attach", args=[self.map.id])
        response = self.client.post(
            url, {"rubrique_id": self.rubrique_autre.id}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # La rubrique ne doit pas avoir été attachée
        self.assertFalse(
            MapRubrique.objects.filter(map=self.map, rubrique=self.rubrique_autre).exists()
        )

    def test_attach_duplicate_returns_400(self):
        MapRubrique.objects.create(map=self.map, rubrique=self.rubrique, ordre=1)
        url = reverse("map-structure-attach", args=[self.map.id])
        response = self.client.post(url, {"rubrique_id": self.rubrique.id}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_attach_missing_rubrique_id_returns_400(self):
        url = reverse("map-structure-attach", args=[self.map.id])
        response = self.client.post(url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_attach_unauthenticated_returns_403_or_401(self):
        self.client.force_authenticate(user=None)
        url = reverse("map-structure-attach", args=[self.map.id])
        response = self.client.post(url, {"rubrique_id": self.rubrique.id}, format="json")
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


# ---------------------------------------------------------------------------
# Lot 2 — DELETE /api/rubriques/{id}/ : protection contre la cascade structurelle
# ---------------------------------------------------------------------------

class RubriqueDeleteProtectionTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="delete_user")
        self.client.force_authenticate(user=self.user)

        self.projet, self.version, self.map = _make_project(self.user, "_delete")
        self.rubrique_liee = _make_rubrique(
            self.projet, self.version, self.user, titre="Liée"
        )
        self.map_rubrique = MapRubrique.objects.create(
            map=self.map, rubrique=self.rubrique_liee, ordre=1
        )
        self.rubrique_orpheline = _make_rubrique(
            self.projet, self.version, self.user, titre="Orpheline"
        )

    def test_delete_linked_rubrique_is_refused(self):
        url = reverse("rubrique-detail", args=[self.rubrique_liee.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # La rubrique doit toujours exister
        self.assertTrue(Rubrique.objects.filter(pk=self.rubrique_liee.pk).exists())

    def test_delete_linked_rubrique_returns_explicit_message(self):
        url = reverse("rubrique-detail", args=[self.rubrique_liee.id])
        response = self.client.delete(url)
        body = response.json()
        # Le message doit contenir la clé 'rubrique' (format DRF standard)
        self.assertIn("rubrique", body)

    def test_delete_orphan_rubrique_is_allowed(self):
        url = reverse("rubrique-detail", args=[self.rubrique_orpheline.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Rubrique.objects.filter(pk=self.rubrique_orpheline.pk).exists())


# ---------------------------------------------------------------------------
# Lot 1 — Uniformisation du format d'erreur
# ---------------------------------------------------------------------------

class ErrorFormatHomogeneityTests(APITestCase):
    """
    Vérifie que les routes critiques remontent des erreurs en format DRF standard
    (pas de wrapper {"error": ..., "fields": ...} maison).
    """

    def setUp(self):
        self.user = User.objects.create_user(username="errfmt_user")
        self.client.force_authenticate(user=self.user)

        self.projet, self.version, self.map = _make_project(self.user, "_errfmt")
        self.rubrique = _make_rubrique(self.projet, self.version, self.user)

    def test_structure_attach_missing_rubrique_id_format(self):
        """
        structure_attach : champ manquant → format DRF standard.
        """
        url = reverse("map-structure-attach", args=[self.map.id])
        response = self.client.post(url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        body = response.json()
        # Format DRF : {"rubrique_id": [...]}
        self.assertNotIn("error", body)
        self.assertIn("rubrique_id", body)

    def test_structure_attach_business_error_format(self):
        """
        structure_attach : erreur métier (rubrique d'un autre projet) → format DRF standard.
        """
        autre_projet, autre_version, _ = _make_project(self.user, "_errfmt_autre")
        rubrique_autre = _make_rubrique(autre_projet, autre_version, self.user)

        url = reverse("map-structure-attach", args=[self.map.id])
        response = self.client.post(url, {"rubrique_id": rubrique_autre.id}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        body = response.json()
        # Format DRF : pas de wrapper {"error": ..., "fields": ...}
        self.assertNotIn("fields", body)

    def test_rubrique_update_invalid_data_format(self):
        """
        RubriqueViewSet.update : données invalides → format DRF standard (pas de wrapper maison).
        """
        url = reverse("rubrique-detail", args=[self.rubrique.id])
        # Payload incomplet — pas de 'projet'
        response = self.client.put(url, {"titre": ""}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        body = response.json()
        # Format DRF standard : pas de wrapper {"error": ..., "fields": ...}
        self.assertNotIn("fields", body)


# ---------------------------------------------------------------------------
# Sprint 2 — Création de projet canonique
# ---------------------------------------------------------------------------

def _project_payload(gamme_id):
    """Payload minimal valide pour la création d'un projet."""
    return {
        "nom": "Projet test",
        "description": "Description test",
        "gamme_id": gamme_id,
    }


class CreateProjectCanonicalTests(APITestCase):
    """T-01 — POST /api/projets/ : endpoint canonique."""

    def setUp(self):
        self.user = User.objects.create_user(username="canon_user")
        self.client.force_authenticate(user=self.user)
        self.gamme = Gamme.objects.create(nom="Gamme canon", description="test")

    def test_creates_all_invariants(self):
        url = reverse("projet-list")
        response = self.client.post(url, _project_payload(self.gamme.id), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        body = response.json()
        projet_id = body["projet"]["id"]

        self.assertTrue(Projet.objects.filter(pk=projet_id).exists())
        self.assertTrue(
            VersionProjet.objects.filter(projet_id=projet_id, is_active=True).exists()
        )
        self.assertTrue(
            Map.objects.filter(projet_id=projet_id, is_master=True).exists()
        )
        self.assertTrue(Rubrique.objects.filter(projet_id=projet_id).exists())
        map_obj = Map.objects.get(projet_id=projet_id, is_master=True)
        self.assertTrue(MapRubrique.objects.filter(map=map_obj).exists())

    def test_response_contains_projet_and_map(self):
        url = reverse("projet-list")
        response = self.client.post(url, _project_payload(self.gamme.id), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        body = response.json()
        self.assertIn("projet", body)
        self.assertIn("map", body)
        self.assertTrue(body["map"]["is_master"])

    def test_unauthenticated_returns_401_or_403(self):
        self.client.force_authenticate(user=None)
        url = reverse("projet-list")
        response = self.client.post(url, _project_payload(self.gamme.id), format="json")
        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )

    def test_missing_nom_returns_400(self):
        url = reverse("projet-list")
        payload = _project_payload(self.gamme.id)
        del payload["nom"]
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class CreateProjectAtomicityTests(APITestCase):
    """T-03 — Atomicité : toute erreur interne doit provoquer un rollback complet."""

    def setUp(self):
        self.user = User.objects.create_user(username="atomic_user")
        self.client.force_authenticate(user=self.user)
        self.gamme = Gamme.objects.create(nom="Gamme atomic", description="test")

    def test_rollback_on_map_creation_failure(self):
        count_before = Projet.objects.count()

        with patch(
            "documentation.services.Map.objects.create",
            side_effect=Exception("Map creation simulated failure"),
        ):
            url = reverse("projet-list")
            response = self.client.post(
                url, _project_payload(self.gamme.id), format="json"
            )

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(Projet.objects.count(), count_before)

    def test_rollback_on_rubrique_creation_failure(self):
        count_before = Projet.objects.count()

        with patch(
            "documentation.services.Rubrique.objects.create",
            side_effect=Exception("Rubrique creation simulated failure"),
        ):
            url = reverse("projet-list")
            response = self.client.post(
                url, _project_payload(self.gamme.id), format="json"
            )

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(Projet.objects.count(), count_before)


class CreateProjectInvariantsTests(APITestCase):
    """T-04 — Invariants : version active unique, map master présente."""

    def setUp(self):
        self.user = User.objects.create_user(username="invariant_user")
        self.client.force_authenticate(user=self.user)
        self.gamme = Gamme.objects.create(nom="Gamme invariant", description="test")

    def test_exactly_one_active_version(self):
        url = reverse("projet-list")
        response = self.client.post(url, _project_payload(self.gamme.id), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        projet_id = response.json()["projet"]["id"]
        self.assertEqual(
            VersionProjet.objects.filter(projet_id=projet_id, is_active=True).count(), 1
        )

    def test_exactly_one_master_map(self):
        url = reverse("projet-list")
        response = self.client.post(url, _project_payload(self.gamme.id), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        projet_id = response.json()["projet"]["id"]
        self.assertEqual(
            Map.objects.filter(projet_id=projet_id, is_master=True).count(), 1
        )

    def test_root_map_rubrique_has_no_parent(self):
        url = reverse("projet-list")
        response = self.client.post(url, _project_payload(self.gamme.id), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        projet_id = response.json()["projet"]["id"]
        map_obj = Map.objects.get(projet_id=projet_id, is_master=True)
        root_mr = MapRubrique.objects.filter(map=map_obj).first()
        self.assertIsNotNone(root_mr)
        self.assertIsNone(root_mr.parent)

    def test_version_number_is_1_0_0(self):
        url = reverse("projet-list")
        response = self.client.post(url, _project_payload(self.gamme.id), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        projet_id = response.json()["projet"]["id"]
        version = VersionProjet.objects.get(projet_id=projet_id)
        self.assertEqual(version.version_numero, "1.0.0")


# ---------------------------------------------------------------------------
# Sprint 3 — Nettoyage et sécurisation
# ---------------------------------------------------------------------------

class DeadRouteAbsenceTests(APITestCase):
    """
    Vérifie que les routes supprimées (code mort) ne sont plus enregistrées.
    Les URLs mortes n'avaient de toute façon pas de name= utilisable pour reverse(),
    donc on teste que le resolver ne les connaît plus.
    """

    def setUp(self):
        self.user = User.objects.create_user(username="deadroute_user")
        self.client.force_authenticate(user=self.user)

    def test_create_map_view_name_not_registered(self):
        """create_map n'est plus dans les URL patterns."""
        from django.urls import NoReverseMatch
        with self.assertRaises(NoReverseMatch):
            reverse("create_map")

    def test_map_rubriques_view_name_not_registered(self):
        """map_rubriques n'est plus dans les URL patterns."""
        from django.urls import NoReverseMatch
        with self.assertRaises(NoReverseMatch):
            reverse("map_rubriques", args=[1])


class LegacyRoutesRemovedTests(APITestCase):
    """
    Vérifie que toutes les routes legacy supprimées en Phase B ne sont plus résolubles.
    """

    def test_create_project_api_not_registered(self):
        from django.urls import NoReverseMatch
        with self.assertRaises(NoReverseMatch):
            reverse("create_project_api")

    def test_add_rubrique_to_map_not_registered(self):
        from django.urls import NoReverseMatch
        with self.assertRaises(NoReverseMatch):
            reverse("add_rubrique_to_map")

    def test_map_rubrique_indent_not_registered(self):
        from django.urls import NoReverseMatch
        with self.assertRaises(NoReverseMatch):
            reverse("map_rubrique_indent", args=[1])

    def test_map_rubrique_outdent_not_registered(self):
        from django.urls import NoReverseMatch
        with self.assertRaises(NoReverseMatch):
            reverse("map_rubrique_outdent", args=[1])

    def test_map_reorder_compat_not_registered(self):
        from django.urls import NoReverseMatch
        with self.assertRaises(NoReverseMatch):
            reverse("map_reorder_compat", args=[1])


class CanonicalRoutesFullCoverageTests(APITestCase):
    """
    Vérifie que les endpoints canoniques couvrent 100 % des flux
    précédemment servis par les routes legacy.
    """

    def setUp(self):
        self.user = User.objects.create_user(username="canon_coverage_user")
        self.client.force_authenticate(user=self.user)

        self.projet, self.version, self.map = _make_project(self.user, "_canon_cov")
        self.r1 = _make_rubrique(self.projet, self.version, self.user, titre="R1")
        self.r2 = _make_rubrique(self.projet, self.version, self.user, titre="R2")
        self.mr1 = MapRubrique.objects.create(map=self.map, rubrique=self.r1, ordre=1)
        self.mr2 = MapRubrique.objects.create(map=self.map, rubrique=self.r2, ordre=2)

    def _assert_requires_auth(self, url, data=None):
        self.client.force_authenticate(user=None)
        response = self.client.post(url, data or {}, format="json")
        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )
        self.client.force_authenticate(user=self.user)

    # --- Création projet ---

    def test_create_project_canonical_requires_auth(self):
        gamme = Gamme.objects.create(nom="Gamme auth test", description="test")
        self._assert_requires_auth(
            reverse("projet-list"), _project_payload(gamme.id)
        )

    # --- structure/create (remplace create-rubrique) ---

    def test_structure_create_works(self):
        url = reverse("map-structure-create", args=[self.map.id])
        response = self.client.post(url, {
            "titre": "Nouvelle rubrique",
            "contenu_xml": "<topic><title>Test</title></topic>",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_structure_create_requires_auth(self):
        self._assert_requires_auth(
            reverse("map-structure-create", args=[self.map.id]),
            {"titre": "Test", "contenu_xml": "<topic/>"},
        )

    # --- structure/{id}/indent (remplace map-rubriques/{id}/indent) ---

    def test_structure_indent_works(self):
        url = reverse("map-structure-indent", kwargs={"pk": self.map.id, "map_rubrique_id": self.mr2.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_structure_indent_requires_auth(self):
        self._assert_requires_auth(
            reverse("map-structure-indent", kwargs={"pk": self.map.id, "map_rubrique_id": self.mr2.id})
        )

    # --- structure/{id}/outdent (remplace map-rubriques/{id}/outdent) ---

    def test_structure_outdent_after_indent(self):
        # indenter d'abord mr2
        self.client.post(
            reverse("map-structure-indent", kwargs={"pk": self.map.id, "map_rubrique_id": self.mr2.id})
        )
        url = reverse("map-structure-outdent", kwargs={"pk": self.map.id, "map_rubrique_id": self.mr2.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    # --- structure/reorder (remplace maps/{id}/reorder) ---

    def test_structure_reorder_works(self):
        url = reverse("map-structure-reorder", args=[self.map.id])
        response = self.client.post(
            url,
            {"orderedIds": [self.mr2.id, self.mr1.id]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_structure_reorder_requires_auth(self):
        self._assert_requires_auth(
            reverse("map-structure-reorder", args=[self.map.id]),
            {"orderedIds": [self.mr1.id, self.mr2.id]},
        )

    # --- GET rubriques (inchangé, sert toujours par MapViewSet.rubriques) ---

    def test_rubriques_list_canonical_still_works(self):
        url = reverse("map-rubriques", args=[self.map.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.json(), list)


class HealthCheckTests(APITestCase):
    """Lot 2 Sprint 5 — monitoring minimal : endpoint /health/ sans authentification."""

    def test_healthcheck_returns_200(self):
        url = reverse("healthcheck")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_healthcheck_returns_status_ok(self):
        url = reverse("healthcheck")
        response = self.client.get(url)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_healthcheck_no_auth_required(self):
        """Le healthcheck doit répondre même sans token (AllowAny)."""
        self.client.credentials()  # supprime toute auth
        url = reverse("healthcheck")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class Sprint5LogCleanupTests(APITestCase):
    """
    Lot 1 Sprint 5 — vérifie l'absence de bruits de log parasites sur les flux critiques.
    Ces tests vérifient que les opérations se terminent sans erreur, pas le contenu des logs
    (les logs structurés sont visibles en run avec --verbosity=2 ou dans l'infra de log).
    """

    def setUp(self):
        self.user = User.objects.create_user(username="log_test_user")
        self.client.force_authenticate(user=self.user)

        self.gamme = Gamme.objects.create(nom="G-Log")
        self.projet = Projet.objects.create(nom="P-Log", gamme=self.gamme, auteur=self.user)
        self.version = VersionProjet.objects.create(
            projet=self.projet, version_numero="1.0.0", is_active=True
        )
        self.map = Map.objects.create(nom="M-Log", projet=self.projet, is_master=True)
        self.rubrique1 = Rubrique.objects.create(
            projet=self.projet, version_projet=self.version,
            titre="R1", contenu_xml="", auteur=self.user, is_active=True, revision_numero=1,
        )
        self.rubrique2 = Rubrique.objects.create(
            projet=self.projet, version_projet=self.version,
            titre="R2", contenu_xml="", auteur=self.user, is_active=True, revision_numero=1,
        )
        self.mr1 = MapRubrique.objects.create(map=self.map, rubrique=self.rubrique1, ordre=1)
        self.mr2 = MapRubrique.objects.create(map=self.map, rubrique=self.rubrique2, ordre=2)

    def test_reorder_produces_no_error(self):
        url = reverse("map-structure-reorder", kwargs={"pk": self.map.id})
        response = self.client.post(
            url, {"orderedIds": [self.mr2.id, self.mr1.id]}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_indent_produces_no_error(self):
        url = reverse("map-structure-indent", kwargs={"pk": self.map.id, "map_rubrique_id": self.mr2.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_outdent_produces_no_error(self):
        # indent d'abord pour pouvoir outdenter
        from documentation.services import indent_map_rubrique, outdent_map_rubrique
        indent_map_rubrique(map_id=self.map.id, map_rubrique_id=self.mr2.id)
        url = reverse("map-structure-outdent", kwargs={"pk": self.map.id, "map_rubrique_id": self.mr2.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
