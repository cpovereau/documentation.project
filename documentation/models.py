# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
import xml.etree.ElementTree as ET
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from django.db import models


class AuditActionUtilisateur(models.Model):
    utilisateur = models.CharField(max_length=100)
    action = models.CharField(max_length=50)
    cible_id = models.IntegerField(blank=True, null=True)
    cible_type = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    date_action = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'audit_action_utilisateur'


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class CarteRubrique(models.Model):
    map = models.ForeignKey('Map', models.DO_NOTHING, blank=True, null=True)
    rubrique = models.ForeignKey('Rubrique', models.DO_NOTHING, blank=True, null=True)
    ordre = models.IntegerField()
    relation = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'carte_rubrique'


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.SmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class FeedbackRelecture(models.Model):
    rubrique = models.ForeignKey('Rubrique', models.DO_NOTHING, blank=True, null=True)
    utilisateur = models.CharField(max_length=100)
    commentaire = models.TextField(blank=True, null=True)
    date_feedback = models.DateTimeField(blank=True, null=True)
    statut_feedback = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'feedback_relecture'

class Gamme(models.Model):
    nom = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nom

class HistoriqueExport(models.Model):
    map = models.ForeignKey('Map', models.DO_NOTHING, blank=True, null=True)
    format_export = models.CharField(max_length=50)
    date_export = models.DateTimeField(blank=True, null=True)
    utilisateur = models.CharField(max_length=100)
    chemin_export = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'historique_export'


class HistoriqueModification(models.Model):
    rubrique = models.ForeignKey('Rubrique', models.DO_NOTHING, blank=True, null=True)
    utilisateur = models.CharField(max_length=100)
    action = models.CharField(max_length=50, blank=True, null=True)
    date_action = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'historique_modification'


class Map(models.Model):
    TYPE_MAP_CHOICES = [
        ('maitre', 'Maître'),
        ('fille', 'Fille'),
        ('documentation', 'Documentation'),
        ('aide_en_ligne', 'Aide en ligne'),
        ('fiche_pratique', 'Fiche pratique'),
        ('cours', 'Cours'),
    ]
    
    nom = models.CharField(max_length=255)
    type_map = models.CharField(max_length=50, blank=True, null=True)
    projet = models.ForeignKey('Projet', models.DO_NOTHING, blank=True, null=True)
    structure_xml = models.TextField(blank=True, null=True)  # This field type is a guess.

    class Meta:
        managed = False
        db_table = 'map'

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

class Produit(models.Model):
    nom = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    gamme = models.ForeignKey(Gamme, on_delete=models.CASCADE, related_name="produits")

    def __str__(self):
        return f"{self.gamme} - {self.nom}"

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
    audience = models.CharField(max_length=200)
    revision_numero = models.IntegerField()
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE)
    version = models.IntegerField()
    version_precedente = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)

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
        managed = True  
        db_table = 'media'

    def __str__(self):
        return f"{self.nom_fichier} - {self.type_media} - {self.rubrique} - {self.produit}"


class ProfilUtilisateur(models.Model):
    nom_profil = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nom_profil

class QuestionReponse(models.Model):
    rubrique = models.ForeignKey('Rubrique', models.DO_NOTHING, blank=True, null=True)
    question = models.TextField()
    reponse = models.TextField()
    correcte = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'question_reponse'


class ReferenceExterne(models.Model):
    rubrique = models.ForeignKey('Rubrique', models.DO_NOTHING, blank=True, null=True)
    url = models.TextField()
    description = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'reference_externe'


    class Meta:
        managed = False
        db_table = 'rubrique'

    def clean(self):
        # Validation de la structure XML pour le champ contenu_xml
        if self.contenu_xml:
            try:
                ET.fromstring(self.contenu_xml)
            except ET.ParseError as e:
                raise ValidationError(f"Le contenu XML est mal structuré : {e}")

    def __str__(self):
        return f"{self.titre} ({self.type_rubrique} - {self.projet.nom} - {self.produit.nom})"


class RubriqueProfil(models.Model):
    rubrique = models.OneToOneField(Rubrique, models.DO_NOTHING, primary_key=True)  # The composite primary key (rubrique_id, profil_utilisateur_id) found, that is not supported. The first column is selected.
    profil_utilisateur = models.ForeignKey(ProfilUtilisateur, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'rubrique_profil'
        unique_together = (('rubrique', 'profil_utilisateur'),)


class RubriqueTag(models.Model):
    rubrique = models.OneToOneField(Rubrique, models.DO_NOTHING, primary_key=True)  # The composite primary key (rubrique_id, tag_id) found, that is not supported. The first column is selected.
    tag = models.ForeignKey('Tag', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'rubrique_tag'
        unique_together = (('rubrique', 'tag'),)

class Tag(models.Model):
    nom = models.CharField(unique=True, max_length=50)

    class Meta:
        managed = False
        db_table = 'tag'


class VersionProjet(models.Model):
    projet = models.ForeignKey(Projet, models.DO_NOTHING, blank=True, null=True)
    version_numero = models.CharField(max_length=50)
    date_lancement = models.DateTimeField(blank=True, null=True)
    notes_version = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'version_projet'

class LogModification(models.Model):
    rubrique = models.ForeignKey(Rubrique, on_delete=models.CASCADE, related_name='modifications')
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name='modifications')
    utilisateur = models.CharField(max_length=100)
    date_modification = models.DateTimeField(auto_now=True)
    description = models.TextField()

    def __str__(self):
        return f"Modification de {self.rubrique} par {self.utilisateur} le {self.date_modification}"
