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
    gamme = models.ForeignKey(Gamme, on_delete=models.CASCADE, related_name="produits")
    is_archived = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.gamme} - {self.nom}"

# --- Fonctionnalités ---
class Fonctionnalite(models.Model):
    produit = models.ForeignKey('Produit', on_delete=models.CASCADE, related_name="fonctionnalites")
    nom = models.CharField(max_length=100)
    id_fonctionnalite = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True, null=True)
    is_archived = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.nom} - {self.produit.nom} (ID: {self.id_fonctionnalite})"

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
    fonctionnalites = models.ManyToManyField('Fonctionnalite', related_name="audiences")
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
    version_numero = models.CharField(max_length=20, blank=True, null=True)
    date_lancement = models.DateTimeField(blank=True, null=True)
    notes_version = models.TextField(blank=True, null=True)
    gamme = models.ForeignKey(Gamme, on_delete=models.SET_NULL, null=True)

    def get_detailed_info(self):
        version = VersionProjet.objects.filter(projet=self).order_by('-date_lancement').first()
        return {
            "projet": self,
            "gamme": self.gamme,
            "version": version
        }

    def __str__(self):
        return self.nom

class VersionProjet(models.Model):
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name='versions')
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
    type_rubrique = models.ForeignKey('TypeRubrique', on_delete=models.CASCADE)
    titre = models.CharField(max_length=200)
    contenu_xml = models.TextField()
    auteur = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    date_creation = models.DateField(auto_now_add=True)
    date_mise_a_jour = models.DateField(auto_now=True)
    audience = models.CharField(max_length=200, default="générique")
    revision_numero = models.IntegerField()
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE)
    version = models.IntegerField()
    version_precedente = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    fonctionnalite = models.ForeignKey('Fonctionnalite', on_delete=models.SET_NULL, null=True, blank=True)
    version_projet = models.ForeignKey('VersionProjet', on_delete=models.CASCADE, related_name='rubriques', null=True)
    is_active = models.BooleanField(default=True)
    is_archived = models.BooleanField(default=False)
    locked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="locked_rubriques")
    locked_at = models.DateTimeField(null=True, blank=True)

    def clean(self):
        if self.contenu_xml:
            try:
                ET.fromstring(self.contenu_xml)
            except ET.ParseError as e:
                raise ValidationError(f"Le contenu XML est mal structuré : {e}")

    def __str__(self):
        return f"{self.titre} (Version {self.version})"

# --- Maps et Relations ---
class Map(models.Model):
    nom = models.CharField(max_length=255)
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name='maps')
    rubriques = models.ManyToManyField(
        Rubrique,
        through='MapRubrique',
        related_name='maps'
    )
    is_master = models.BooleanField(default=False)

    class Meta:
        ordering = ['nom']

    def __str__(self):
        return f"Map: {self.nom} ({'Master' if self.is_master else 'Child'})"

class MapRubrique(models.Model):
    map = models.ForeignKey('Map', on_delete=models.CASCADE)
    rubrique = models.ForeignKey('Rubrique', on_delete=models.CASCADE)
    ordre = models.PositiveIntegerField()
    parent = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True, related_name='enfants')

    class Meta:
        ordering = ['ordre']

    def __str__(self):
        return f"Rubrique: {self.rubrique.titre} in {self.map.nom} (Order: {self.ordre})"

# --- Médias ---
class Media(models.Model):
    TYPE_MEDIA_CHOICES = [
        ('image', 'Image'),
        ('video', 'Vidéo'),
    ]

    rubrique = models.ForeignKey(Rubrique, on_delete=models.CASCADE, related_name="medias")
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name="medias")
    type_media = models.CharField(max_length=50, choices=TYPE_MEDIA_CHOICES)
    nom_fichier = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    chemin_acces = models.TextField()

    class Meta:
        db_table = 'media'

    def __str__(self):
        return f"{self.nom_fichier} - {self.type_media}"

# --- Profils de publication ---
class ProfilPublication(models.Model):
    nom = models.CharField(max_length=255)
    type_sortie = models.CharField(max_length=50, choices=TYPE_SORTIE_CHOICES)
    map = models.ForeignKey(Map, on_delete=models.SET_NULL, null=True, blank=True, related_name='profils')
    parametres = models.JSONField(default=dict)
    is_archived = models.BooleanField(default=False)

    def __str__(self):
        return f"Profil: {self.nom} ({self.type_sortie})"

# --- Historique / Journalisation ---
class LogModification(models.Model):
    rubrique = models.ForeignKey(Rubrique, on_delete=models.CASCADE, related_name='modifications')
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name='modifications')
    utilisateur = models.CharField(max_length=100)
    date_modification = models.DateTimeField(auto_now=True)
    description = models.TextField()

    def __str__(self):
        return f"Modification de {self.rubrique} par {self.utilisateur} le {self.date_modification}"
