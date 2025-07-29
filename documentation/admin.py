from django.contrib import admin
from .models import Projet, VersionProjet, Gamme, Rubrique, Map, Fonctionnalite, Audience, Media

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
