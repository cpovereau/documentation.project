from django.contrib import admin
from .models import (
    Projet, VersionProjet, Gamme, Produit, Rubrique, Map,
    Fonctionnalite, Audience, Media,
    RevisionRubrique, PublicationSnapshot,
)

@admin.register(Projet)
class ProjetAdmin(admin.ModelAdmin):
    list_display = ("nom", "auteur", "date_creation", "version_numero")
    search_fields = ("nom",)
    list_filter = ("gamme", "date_creation")

@admin.register(VersionProjet)
class VersionProjetAdmin(admin.ModelAdmin):
    list_display = ("projet", "version_numero", "date_lancement", "is_active")
    list_filter = ("is_active", "is_archived")
    ordering = ("-date_lancement",)

@admin.register(Gamme)
class GammeAdmin(admin.ModelAdmin):
    list_display = ("nom", "description")
    search_fields = ("nom",)

@admin.register(Produit)
class ProduitAdmin(admin.ModelAdmin):
    list_display = ("nom", "gamme", "abreviation", "is_archived")
    search_fields = ("nom", "abreviation")
    list_filter = ("gamme", "is_archived")
    ordering = ("gamme", "nom")

@admin.register(Rubrique)
class RubriqueAdmin(admin.ModelAdmin):
    list_display = ("titre", "type_rubrique", "date_creation", "projet")
    list_filter = ("type_rubrique", "projet")
    search_fields = ("titre",)

@admin.register(Map)
class MapAdmin(admin.ModelAdmin):
    list_display = ("nom", "projet", "is_master")
    list_filter = ("is_master",)

@admin.register(Fonctionnalite)
class FonctionnaliteAdmin(admin.ModelAdmin):
    list_display = ("nom", "produit", "code", "is_archived")
    search_fields = ("nom", "code")
    list_filter = ("produit", "is_archived")
    ordering = ("produit", "code")

@admin.register(Audience)
class AudienceAdmin(admin.ModelAdmin):
    list_display = ("nom",)
    filter_horizontal = ("fonctionnalites",)

@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ("nom_fichier", "type_media", "rubrique", "produit")
    list_filter = ("type_media",)
    search_fields = ("nom_fichier",)


@admin.register(RevisionRubrique)
class RevisionRubriqueAdmin(admin.ModelAdmin):
    list_display = ("rubrique", "numero", "auteur", "date_creation", "hash_contenu")
    list_filter = ("auteur",)
    search_fields = ("rubrique__titre",)
    ordering = ("rubrique", "numero")
    readonly_fields = ("rubrique", "numero", "contenu_xml", "hash_contenu", "auteur", "date_creation")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(PublicationSnapshot)
class PublicationSnapshotAdmin(admin.ModelAdmin):
    list_display = ("version_projet", "rubrique", "revision")
    list_filter = ("version_projet",)
    search_fields = ("rubrique__titre", "version_projet__version_numero")
    readonly_fields = ("version_projet", "rubrique", "revision")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
