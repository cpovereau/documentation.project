from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from documentation.constants.publication import TYPE_SORTIE_CHOICES
import xml.etree.ElementTree as ET
from django.utils.timezone import now


# --- Gammes et Produits ---
class Gamme(models.Model):
    nom = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    is_archived = models.BooleanField(default=False)

    def __str__(self):
        return self.nom


# --- Produits ---
class Produit(models.Model):
    nom = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    abreviation = models.CharField(max_length=4)
    gamme = models.ForeignKey(Gamme, on_delete=models.CASCADE, related_name="produits")
    is_archived = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.gamme} - {self.nom}"


# --- Fonctionnalités ---
class Fonctionnalite(models.Model):
    produit = models.ForeignKey(
        "Produit", on_delete=models.CASCADE, related_name="fonctionnalites"
    )
    nom = models.CharField(max_length=100)
    id_fonctionnalite = models.CharField(
        max_length=8, unique=True, default="0000"
    )  # Identifiant unique pour la fonctionnalité
    code = models.CharField(max_length=5)  # Exemple : 'ECIV', 'COMP', etc.
    is_archived = models.BooleanField(default=False)

    class Meta:
        unique_together = ("produit", "code")

    def __str__(self):
        return f"{self.nom} ({self.code}) – {self.produit.nom}"


# --- Tags ---
class Tag(models.Model):
    nom = models.CharField(max_length=100, unique=True)
    is_archived = models.BooleanField(default=False)

    def __str__(self):
        return self.nom


# --- Interfaces utilisateur ---
class InterfaceUtilisateur(models.Model):
    nom = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    is_archived = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.nom} ({self.code})"


# --- Audiences ---
class Audience(models.Model):
    nom = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    fonctionnalites = models.ManyToManyField("Fonctionnalite", related_name="audiences")
    is_archived = models.BooleanField(default=False)

    def __str__(self):
        return self.nom


# --- Projets et Versions ---
class Projet(models.Model):
    nom = models.CharField(max_length=200)
    description = models.TextField()
    auteur = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_mise_a_jour = models.DateTimeField(auto_now=True)
    # DÉPRÉCIÉ — doublon de VersionProjet.version_numero. À supprimer dans un lot ultérieur.
    version_numero = models.CharField(max_length=20, blank=True, null=True)
    # DÉPRÉCIÉ — doublon de VersionProjet.date_lancement. À supprimer dans un lot ultérieur.
    date_lancement = models.DateTimeField(blank=True, null=True)
    # DÉPRÉCIÉ — doublon de VersionProjet.notes_version. À supprimer dans un lot ultérieur.
    notes_version = models.TextField(blank=True, null=True)
    gamme = models.ForeignKey(Gamme, on_delete=models.SET_NULL, null=True)

    def get_detailed_info(self):
        version = (
            VersionProjet.objects.filter(projet=self)
            .order_by("-date_lancement")
            .first()
        )
        return {"projet": self, "gamme": self.gamme, "version": version}

    def __str__(self):
        return self.nom


class VersionProjet(models.Model):
    projet = models.ForeignKey(
        Projet, on_delete=models.CASCADE, related_name="versions"
    )
    version_numero = models.CharField(max_length=50)
    date_lancement = models.DateTimeField(blank=True, null=True)
    notes_version = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_archived = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.projet.nom} - v{self.version_numero}"


# --- Typage et Rubriques ---
class TypeRubrique(models.Model):
    nom = models.CharField(max_length=100)
    description = models.TextField()
    dtd = models.TextField()

    def __str__(self):
        return self.nom


class Rubrique(models.Model):
    type_rubrique = models.ForeignKey(
        "TypeRubrique", on_delete=models.SET_NULL, null=True, blank=True
    )
    titre = models.CharField(max_length=200)
    # État de travail courant (WIP). Les snapshots immuables sont dans RevisionRubrique.
    contenu_xml = models.TextField()
    auteur = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    date_creation = models.DateField(auto_now_add=True)
    date_mise_a_jour = models.DateField(auto_now=True)
    audience = models.CharField(max_length=200, default="générique")
    # DÉPRÉCIÉ — remplacé par RevisionRubrique.numero. Ne pas utiliser dans les nouveaux flux.
    revision_numero = models.IntegerField(default=1)
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE)
    # DÉPRÉCIÉ — ambigu, sans usage actif. À supprimer dans un lot ultérieur.
    version = models.IntegerField(default=1)
    # DÉPRÉCIÉ — design par copie non conforme au référentiel. À supprimer dans un lot ultérieur.
    version_precedente = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True
    )
    fonctionnalite = models.ForeignKey(
        "Fonctionnalite", on_delete=models.SET_NULL, null=True, blank=True
    )
    # Version de création de la rubrique. Conservé pour l'invariant de création (create_project, create_rubrique_in_map).
    version_projet = models.ForeignKey(
        "VersionProjet", on_delete=models.CASCADE, related_name="rubriques", null=True
    )
    is_active = models.BooleanField(default=True)
    is_archived = models.BooleanField(default=False)
    locked_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="locked_rubriques",
    )
    locked_at = models.DateTimeField(null=True, blank=True)

    def clean(self):
        if self.contenu_xml:
            try:
                ET.fromstring(self.contenu_xml)
            except ET.ParseError as e:
                raise ValidationError(f"Le contenu XML est mal structuré : {e}")

    def __str__(self):
        return f"{self.titre} (Version {self.version})"


# --- Versioning documentaire ---

class RevisionRubrique(models.Model):
    """
    Snapshot immuable d'une modification réelle du contenu XML d'une rubrique.

    Invariants :
    - Créée uniquement lorsque hash(nouveau_xml) ≠ hash(xml_courant).
    - Immuable après création : aucun update() autorisé.
    - numero est séquentiel par rubrique (1, 2, 3…).
    - contenu_xml est la copie exacte du XML au moment de la révision.

    Champ hash_contenu :
    - Algorithme : SHA-256
    - Encodage : hexadécimal, 64 caractères ASCII fixes
    - Calculé via utils.compute_xml_hash() — normalisation ElementTree appliquée
    - Invariant : deux appels sur le même contenu XML produisent toujours le même hash
    - Usage : détecter une modification réelle sans comparer les chaînes XML entières
    """
    rubrique = models.ForeignKey(
        "Rubrique", on_delete=models.CASCADE, related_name="revisions"
    )
    numero = models.PositiveIntegerField()
    contenu_xml = models.TextField()
    # SHA-256 hex — 64 caractères. Calculé par utils.compute_xml_hash().
    hash_contenu = models.CharField(max_length=64)
    auteur = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="revisions_rubriques"
    )
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("rubrique", "numero")
        ordering = ["rubrique", "numero"]
        verbose_name = "Révision de rubrique"
        verbose_name_plural = "Révisions de rubrique"

    def __str__(self):
        return f"Rubrique {self.rubrique_id} — Révision {self.numero}"


class PublicationSnapshot(models.Model):
    """
    Jointure figée entre une VersionProjet publiée et les révisions exactes
    de chaque rubrique au moment de la publication.

    Invariants :
    - Créée uniquement lors d'une publication (service publish_project).
    - Immuable après création : aucune modification ni suppression autorisée.
    - Une seule ligne par (version_projet, rubrique).
    - Permet de répondre : "quelles révisions exactes étaient publiées dans cette version ?"

    Périmètre v1 : basé sur la map master uniquement.
    """
    version_projet = models.ForeignKey(
        "VersionProjet", on_delete=models.CASCADE, related_name="publication_snapshots"
    )
    rubrique = models.ForeignKey(
        "Rubrique", on_delete=models.CASCADE, related_name="publication_snapshots"
    )
    revision = models.ForeignKey(
        "RevisionRubrique", on_delete=models.CASCADE, related_name="publication_snapshots"
    )

    class Meta:
        unique_together = ("version_projet", "rubrique")
        verbose_name = "Publication Snapshot"
        verbose_name_plural = "Publication Snapshots"

    def __str__(self):
        return (
            f"Snapshot v{self.version_projet.version_numero}"
            f" — Rubrique {self.rubrique_id}"
            f" — Révision {self.revision.numero}"
        )


# --- Maps et Relations ---
class Map(models.Model):
    nom = models.CharField(max_length=255)
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name="maps")
    rubriques = models.ManyToManyField(
        Rubrique, through="MapRubrique", related_name="maps"
    )
    is_master = models.BooleanField(default=False)

    class Meta:
        ordering = ["nom"]

    def __str__(self):
        return f"Map: {self.nom} ({'Master' if self.is_master else 'Child'})"


class MapRubrique(models.Model):
    map = models.ForeignKey("Map", on_delete=models.CASCADE)
    rubrique = models.ForeignKey("Rubrique", on_delete=models.CASCADE)
    ordre = models.PositiveIntegerField()
    parent = models.ForeignKey(
        "self", on_delete=models.CASCADE, blank=True, null=True, related_name="enfants"
    )

    class Meta:
        ordering = ["ordre"]

    def __str__(self):
        return (
            f"Rubrique: {self.rubrique.titre} in {self.map.nom} (Order: {self.ordre})"
        )


# --- Médias ---
class Media(models.Model):
    TYPE_MEDIA_CHOICES = [
        ("image", "Image"),
        ("video", "Vidéo"),
    ]

    rubrique = models.ForeignKey(
        Rubrique, on_delete=models.CASCADE, related_name="medias", null=True, blank=True
    )
    produit = models.ForeignKey(
        Produit, on_delete=models.CASCADE, related_name="medias"
    )
    type_media = models.CharField(max_length=50, choices=TYPE_MEDIA_CHOICES)
    nom_fichier = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    chemin_acces = models.TextField()

    class Meta:
        db_table = "media"

    def __str__(self):
        return f"{self.nom_fichier} - {self.type_media}"


# --- Profils de publication ---
class ProfilPublication(models.Model):
    nom = models.CharField(max_length=255)
    type_sortie = models.CharField(max_length=50, choices=TYPE_SORTIE_CHOICES)
    map = models.ForeignKey(
        Map, on_delete=models.SET_NULL, null=True, blank=True, related_name="profils"
    )
    parametres = models.JSONField(default=dict)
    is_archived = models.BooleanField(default=False)

    def __str__(self):
        return f"Profil: {self.nom} ({self.type_sortie})"


# --- Historique / Journalisation ---
class LogModification(models.Model):
    rubrique = models.ForeignKey(
        Rubrique, on_delete=models.CASCADE, related_name="modifications"
    )
    projet = models.ForeignKey(
        Projet, on_delete=models.CASCADE, related_name="modifications"
    )
    utilisateur = models.CharField(max_length=100)
    date_modification = models.DateTimeField(auto_now=True)
    description = models.TextField()

    def __str__(self):
        return f"Modification de {self.rubrique} par {self.utilisateur} le {self.date_modification}"
