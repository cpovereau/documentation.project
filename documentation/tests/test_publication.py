# documentation/tests/test_publication.py
"""
Tests du service de publication versionnante (Lot 3).

Couverture :
- bump_minor_version()
- _get_last_published_version()
- _build_rubrique_revision_map()
- _detect_changes()
- publish_project() — service complet (mocked export)
- get_publication_diff()
- API POST /api/publier-map/{id}/
- API GET /api/projets/{id}/publication-diff/
"""
from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase

from documentation.models import (
    Gamme,
    Map,
    MapRubrique,
    Produit,
    Projet,
    PublicationSnapshot,
    RevisionRubrique,
    Rubrique,
    VersionProjet,
)
from documentation.services import (
    _build_rubrique_revision_map,
    _detect_changes,
    _get_last_published_version,
    bump_minor_version,
    create_initial_revision,
    get_publication_diff,
    publish_project,
)


# ---------------------------------------------------------------------------
# Helpers de fixtures
# ---------------------------------------------------------------------------

def _make_user(username="auteur"):
    return User.objects.create_user(username=username, password="pw")


def _make_projet(user, version_numero="1.0.0"):
    gamme = Gamme.objects.create(nom="G")
    projet = Projet.objects.create(nom="P", description="", gamme=gamme, auteur=user)
    version = VersionProjet.objects.create(
        projet=projet,
        version_numero=version_numero,
        is_active=True,
    )
    map_obj = Map.objects.create(nom="Master", projet=projet, is_master=True)
    return projet, version, map_obj


def _make_rubrique(projet, version, user, titre="R", xml="<topic/>"):
    r = Rubrique.objects.create(
        projet=projet,
        version_projet=version,
        titre=titre,
        contenu_xml=xml,
        auteur=user,
        is_active=True,
    )
    create_initial_revision(rubrique=r, user=user)
    return r


def _attach(map_obj, rubrique, ordre=1, parent=None):
    return MapRubrique.objects.create(
        map=map_obj, rubrique=rubrique, ordre=ordre, parent=parent
    )


def _publish_snapshot(version, rubrique, revision):
    """Crée un PublicationSnapshot manuellement pour simuler une publication passée."""
    version.is_active = False
    version.save(update_fields=["is_active"])
    return PublicationSnapshot.objects.create(
        version_projet=version, rubrique=rubrique, revision=revision
    )


# ---------------------------------------------------------------------------
# 1. bump_minor_version
# ---------------------------------------------------------------------------

class BumpMinorVersionTest(TestCase):

    def test_basique(self):
        self.assertEqual(bump_minor_version("1.0.0"), "1.1.0")

    def test_patch_remis_a_zero(self):
        self.assertEqual(bump_minor_version("2.3.7"), "2.4.0")

    def test_minor_superieur_a_9(self):
        self.assertEqual(bump_minor_version("1.9.0"), "1.10.0")

    def test_format_invalide(self):
        with self.assertRaises(ValueError):
            bump_minor_version("1.0")

    def test_format_invalide_quatre_parties(self):
        with self.assertRaises(ValueError):
            bump_minor_version("1.0.0.0")


# ---------------------------------------------------------------------------
# 2. _get_last_published_version
# ---------------------------------------------------------------------------

class GetLastPublishedVersionTest(TestCase):

    def setUp(self):
        self.user = _make_user()
        self.projet, self.wip, self.map_obj = _make_projet(self.user)

    def test_none_si_aucune_publication(self):
        self.assertIsNone(_get_last_published_version(self.projet))

    def test_retourne_version_publiee(self):
        rubrique = _make_rubrique(self.projet, self.wip, self.user)
        revision = RevisionRubrique.objects.get(rubrique=rubrique, numero=1)
        _publish_snapshot(self.wip, rubrique, revision)

        published = _get_last_published_version(self.projet)
        self.assertIsNotNone(published)
        self.assertFalse(published.is_active)

    def test_retourne_la_plus_recente(self):
        from django.utils.timezone import now
        import datetime

        r1 = _make_rubrique(self.projet, self.wip, self.user, titre="R1")
        rev1 = RevisionRubrique.objects.get(rubrique=r1, numero=1)
        _publish_snapshot(self.wip, r1, rev1)
        self.wip.date_lancement = now() - datetime.timedelta(days=10)
        self.wip.save(update_fields=["date_lancement"])

        wip2 = VersionProjet.objects.create(
            projet=self.projet, version_numero="1.1.0", is_active=True
        )
        r2 = _make_rubrique(self.projet, wip2, self.user, titre="R2", xml="<topic2/>")
        rev2 = RevisionRubrique.objects.get(rubrique=r2, numero=1)
        _publish_snapshot(wip2, r2, rev2)
        wip2.date_lancement = now()
        wip2.save(update_fields=["date_lancement"])

        last = _get_last_published_version(self.projet)
        self.assertEqual(last.version_numero, "1.1.0")


# ---------------------------------------------------------------------------
# 3. _build_rubrique_revision_map
# ---------------------------------------------------------------------------

class BuildRubriqueRevisionMapTest(TestCase):

    def setUp(self):
        self.user = _make_user()
        self.projet, self.wip, self.map_obj = _make_projet(self.user)

    def test_map_vide(self):
        result = _build_rubrique_revision_map(self.map_obj)
        self.assertEqual(result, {})

    def test_une_rubrique(self):
        r = _make_rubrique(self.projet, self.wip, self.user)
        _attach(self.map_obj, r)
        result = _build_rubrique_revision_map(self.map_obj)
        self.assertIn(r.id, result)
        self.assertEqual(result[r.id].numero, 1)

    def test_plusieurs_rubriques(self):
        r1 = _make_rubrique(self.projet, self.wip, self.user, titre="R1")
        r2 = _make_rubrique(self.projet, self.wip, self.user, titre="R2", xml="<r2/>")
        _attach(self.map_obj, r1, ordre=1)
        _attach(self.map_obj, r2, ordre=2)
        result = _build_rubrique_revision_map(self.map_obj)
        self.assertEqual(len(result), 2)
        self.assertIn(r1.id, result)
        self.assertIn(r2.id, result)

    def test_retourne_la_derniere_revision(self):
        from documentation.services import create_revision_if_changed

        r = _make_rubrique(self.projet, self.wip, self.user)
        _attach(self.map_obj, r)

        # Le service compare new_xml avec locked.contenu_xml (état DB).
        # Il faut appeler le service AVANT de sauvegarder le nouveau contenu,
        # sinon les deux hashes sont identiques et aucune révision n'est créée.
        create_revision_if_changed(rubrique=r, new_xml="<topic2/>", user=self.user)
        r.contenu_xml = "<topic2/>"
        r.save(update_fields=["contenu_xml"])

        result = _build_rubrique_revision_map(self.map_obj)
        self.assertEqual(result[r.id].numero, 2)

    def test_rubrique_hors_map_non_incluse(self):
        r_in = _make_rubrique(self.projet, self.wip, self.user, titre="in")
        r_out = _make_rubrique(self.projet, self.wip, self.user, titre="out", xml="<out/>")
        _attach(self.map_obj, r_in)
        # r_out n'est pas dans la map
        result = _build_rubrique_revision_map(self.map_obj)
        self.assertIn(r_in.id, result)
        self.assertNotIn(r_out.id, result)


# ---------------------------------------------------------------------------
# 4. _detect_changes
# ---------------------------------------------------------------------------

class DetectChangesTest(TestCase):

    def test_premiere_publication_tout_nouveau(self):
        rubrique_revision_map = {1: object(), 2: object()}
        result = _detect_changes(rubrique_revision_map, last_published=None)
        self.assertTrue(result["has_changes"])
        self.assertEqual(set(result["nouvelles"]), {1, 2})
        self.assertEqual(result["modifiees"], [])
        self.assertEqual(result["retirees"], [])

    def test_premiere_publication_map_vide(self):
        result = _detect_changes({}, last_published=None)
        self.assertFalse(result["has_changes"])

    def test_aucun_changement(self):
        from unittest.mock import MagicMock

        rev = MagicMock()
        rev.id = 10

        snap = MagicMock()
        snap.rubrique_id = 1
        snap.revision_id = 10

        last_published = MagicMock()
        last_published.publication_snapshots.all.return_value = [snap]

        result = _detect_changes({1: rev}, last_published=last_published)
        self.assertFalse(result["has_changes"])
        self.assertEqual(result["nouvelles"], [])
        self.assertEqual(result["modifiees"], [])
        self.assertEqual(result["retirees"], [])

    def test_rubrique_modifiee(self):
        from unittest.mock import MagicMock

        rev_new = MagicMock()
        rev_new.id = 20  # ≠ 10

        snap = MagicMock()
        snap.rubrique_id = 1
        snap.revision_id = 10

        last_published = MagicMock()
        last_published.publication_snapshots.all.return_value = [snap]

        result = _detect_changes({1: rev_new}, last_published=last_published)
        self.assertTrue(result["has_changes"])
        self.assertIn(1, result["modifiees"])

    def test_rubrique_retiree(self):
        from unittest.mock import MagicMock

        snap = MagicMock()
        snap.rubrique_id = 99
        snap.revision_id = 5

        last_published = MagicMock()
        last_published.publication_snapshots.all.return_value = [snap]

        # Map courante ne contient plus la rubrique 99
        result = _detect_changes({}, last_published=last_published)
        self.assertTrue(result["has_changes"])
        self.assertIn(99, result["retirees"])

    def test_nouvelle_rubrique(self):
        from unittest.mock import MagicMock

        rev = MagicMock()
        rev.id = 1

        snap = MagicMock()
        snap.rubrique_id = 10
        snap.revision_id = 1

        last_published = MagicMock()
        last_published.publication_snapshots.all.return_value = [snap]

        # Rubrique 10 connue + rubrique 20 nouvelle
        rev2 = MagicMock()
        rev2.id = 1

        result = _detect_changes({10: rev, 20: rev2}, last_published=last_published)
        self.assertTrue(result["has_changes"])
        self.assertIn(20, result["nouvelles"])


# ---------------------------------------------------------------------------
# 5. publish_project — service complet (export mocké)
# ---------------------------------------------------------------------------

EXPORT_STUB = {"status": "stub", "message": "Export DITA non implémenté."}


class PublishProjectServiceTest(TestCase):

    def setUp(self):
        self.user = _make_user()
        self.projet, self.wip, self.map_obj = _make_projet(self.user)

    @patch("documentation.services.export_map_to_dita", return_value=EXPORT_STUB)
    def test_premiere_publication_cree_snapshots(self, _mock):
        r = _make_rubrique(self.projet, self.wip, self.user)
        _attach(self.map_obj, r)

        result = publish_project(
            projet=self.projet, map_obj=self.map_obj, format_output="pdf", user=self.user
        )

        self.assertTrue(result["has_changes"])
        self.assertEqual(result["version_publiee"], "1.0.0")
        self.assertEqual(result["nouvelle_version_wip"], "1.1.0")
        self.assertEqual(PublicationSnapshot.objects.count(), 1)

    @patch("documentation.services.export_map_to_dita", return_value=EXPORT_STUB)
    def test_version_wip_figee_apres_publication(self, _mock):
        r = _make_rubrique(self.projet, self.wip, self.user)
        _attach(self.map_obj, r)

        publish_project(
            projet=self.projet, map_obj=self.map_obj, format_output="pdf", user=self.user
        )

        self.wip.refresh_from_db()
        self.assertFalse(self.wip.is_active)

    @patch("documentation.services.export_map_to_dita", return_value=EXPORT_STUB)
    def test_nouvelle_version_wip_creee(self, _mock):
        r = _make_rubrique(self.projet, self.wip, self.user)
        _attach(self.map_obj, r)

        publish_project(
            projet=self.projet, map_obj=self.map_obj, format_output="pdf", user=self.user
        )

        new_wip = VersionProjet.objects.filter(
            projet=self.projet, is_active=True
        ).first()
        self.assertIsNotNone(new_wip)
        self.assertEqual(new_wip.version_numero, "1.1.0")

    @patch("documentation.services.export_map_to_dita", return_value=EXPORT_STUB)
    def test_aucun_changement_pas_de_bump(self, _mock):
        r = _make_rubrique(self.projet, self.wip, self.user)
        _attach(self.map_obj, r)
        revision = RevisionRubrique.objects.get(rubrique=r, numero=1)

        # Simuler une publication antérieure avec la même révision
        _publish_snapshot(self.wip, r, revision)
        # Créer une nouvelle version WIP
        VersionProjet.objects.create(
            projet=self.projet, version_numero="1.1.0", is_active=True
        )

        result = publish_project(
            projet=self.projet, map_obj=self.map_obj, format_output="pdf", user=self.user
        )

        self.assertFalse(result["has_changes"])
        self.assertIsNone(result["nouvelle_version_wip"])
        # Pas de nouveau snapshot créé
        self.assertEqual(PublicationSnapshot.objects.count(), 1)

    @patch("documentation.services.export_map_to_dita", return_value=EXPORT_STUB)
    def test_map_vide_leve_erreur(self, _mock):
        from rest_framework.exceptions import ValidationError

        with self.assertRaises(ValidationError):
            publish_project(
                projet=self.projet,
                map_obj=self.map_obj,
                format_output="pdf",
                user=self.user,
            )

    @patch("documentation.services.export_map_to_dita", return_value=EXPORT_STUB)
    def test_export_stub_inclus_dans_resultat(self, _mock):
        r = _make_rubrique(self.projet, self.wip, self.user)
        _attach(self.map_obj, r)

        result = publish_project(
            projet=self.projet, map_obj=self.map_obj, format_output="pdf", user=self.user
        )

        self.assertEqual(result["export"]["status"], "stub")

    @patch("documentation.services.export_map_to_dita", return_value=EXPORT_STUB)
    def test_snapshots_multiples_rubriques(self, _mock):
        r1 = _make_rubrique(self.projet, self.wip, self.user, titre="R1")
        r2 = _make_rubrique(self.projet, self.wip, self.user, titre="R2", xml="<r2/>")
        _attach(self.map_obj, r1, ordre=1)
        _attach(self.map_obj, r2, ordre=2)

        publish_project(
            projet=self.projet, map_obj=self.map_obj, format_output="pdf", user=self.user
        )

        self.assertEqual(PublicationSnapshot.objects.count(), 2)


# ---------------------------------------------------------------------------
# 6. get_publication_diff
# ---------------------------------------------------------------------------

class GetPublicationDiffTest(TestCase):

    def setUp(self):
        self.user = _make_user()
        self.projet, self.wip, self.map_obj = _make_projet(self.user)

    def test_premiere_fois_tout_nouveau(self):
        r = _make_rubrique(self.projet, self.wip, self.user)
        _attach(self.map_obj, r)

        diff = get_publication_diff(projet=self.projet, map_obj=self.map_obj)

        self.assertTrue(diff["has_changes"])
        self.assertEqual(diff["version_wip_courante"], "1.0.0")
        self.assertIsNone(diff["derniere_version_publiee"])
        self.assertEqual(diff["changements"]["nouvelles"], 1)
        self.assertEqual(diff["changements"]["modifiees"], 0)
        self.assertEqual(diff["changements"]["retirees"], 0)

    def test_aucun_changement_apres_publication(self):
        r = _make_rubrique(self.projet, self.wip, self.user)
        _attach(self.map_obj, r)
        revision = RevisionRubrique.objects.get(rubrique=r, numero=1)
        _publish_snapshot(self.wip, r, revision)

        VersionProjet.objects.create(
            projet=self.projet, version_numero="1.1.0", is_active=True
        )

        diff = get_publication_diff(projet=self.projet, map_obj=self.map_obj)

        self.assertFalse(diff["has_changes"])
        self.assertEqual(diff["derniere_version_publiee"], "1.0.0")


# ---------------------------------------------------------------------------
# 7. API POST /api/publier-map/{id}/
# ---------------------------------------------------------------------------

class PublierMapAPITest(APITestCase):

    def setUp(self):
        self.user = _make_user(username="api_user")
        self.client.force_authenticate(user=self.user)
        self.projet, self.wip, self.map_obj = _make_projet(self.user)

    def _url(self, map_id):
        return f"/api/publier-map/{map_id}/"

    @patch("documentation.services.export_map_to_dita", return_value=EXPORT_STUB)
    def test_publication_reussie(self, _mock):
        r = _make_rubrique(self.projet, self.wip, self.user)
        _attach(self.map_obj, r)

        response = self.client.post(self._url(self.map_obj.id), {"format": "pdf"})

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["version_publiee"], "1.0.0")
        self.assertEqual(data["nouvelle_version_wip"], "1.1.0")

    @patch("documentation.services.export_map_to_dita", return_value=EXPORT_STUB)
    def test_map_inexistante_retourne_404(self, _mock):
        response = self.client.post(self._url(99999), {"format": "pdf"})
        self.assertEqual(response.status_code, 404)

    @patch("documentation.services.export_map_to_dita", return_value=EXPORT_STUB)
    def test_map_non_master_retourne_400(self, _mock):
        child_map = Map.objects.create(
            nom="Child", projet=self.projet, is_master=False
        )
        r = _make_rubrique(self.projet, self.wip, self.user)
        _attach(child_map, r)

        response = self.client.post(self._url(child_map.id), {"format": "pdf"})
        self.assertEqual(response.status_code, 400)

    @patch("documentation.services.export_map_to_dita", return_value=EXPORT_STUB)
    def test_format_invalide_retourne_400(self, _mock):
        r = _make_rubrique(self.projet, self.wip, self.user)
        _attach(self.map_obj, r)

        response = self.client.post(self._url(self.map_obj.id), {"format": "docx"})
        self.assertEqual(response.status_code, 400)

    def test_non_authentifie_retourne_401(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self._url(self.map_obj.id), {"format": "pdf"})
        self.assertIn(response.status_code, [401, 403])


# ---------------------------------------------------------------------------
# 8. API GET /api/projets/{id}/publication-diff/
# ---------------------------------------------------------------------------

class PublicationDiffAPITest(APITestCase):

    def setUp(self):
        self.user = _make_user(username="diff_user")
        self.client.force_authenticate(user=self.user)
        self.projet, self.wip, self.map_obj = _make_projet(self.user)

    def _url(self, projet_id):
        return f"/api/projets/{projet_id}/publication-diff/"

    def test_diff_avec_changements(self):
        r = _make_rubrique(self.projet, self.wip, self.user)
        _attach(self.map_obj, r)

        response = self.client.get(self._url(self.projet.id))

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["has_changes"])
        self.assertEqual(data["changements"]["nouvelles"], 1)

    def test_projet_inexistant_retourne_404(self):
        response = self.client.get(self._url(99999))
        self.assertEqual(response.status_code, 404)

    def test_non_authentifie_retourne_401(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self._url(self.projet.id))
        self.assertIn(response.status_code, [401, 403])

    def test_projet_sans_master_map_retourne_404(self):
        # Supprimer la map master créée dans setUp
        self.map_obj.delete()

        response = self.client.get(self._url(self.projet.id))
        self.assertEqual(response.status_code, 404)
