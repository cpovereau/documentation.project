from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Projet, Gamme, Produit, Rubrique, Map, VersionProjet, Fonctionnalite, Tag, ProfilPublication, InterfaceUtilisateur, Audience

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class GammeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gamme
        fields = ['id', 'nom', 'description', 'is_archived']

class ProduitSerializer(serializers.ModelSerializer):
    gamme_nom = serializers.CharField(source='gamme.nom', read_only=True)

    class Meta:
        model = Produit
        fields = ['id', 'nom', 'description', 'gamme', 'gamme_nom', 'is_archived']

class MapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Map
        fields = ['id', 'nom', 'projet', 'is_master']

    def create(self, validated_data):
        # Validation ou logique supplémentaire si nécessaire
        return Map.objects.create(**validated_data)

class VersionProjetSerializer(serializers.ModelSerializer):
    class Meta:
        model = VersionProjet
        fields = ['id', 'version_numero', 'date_lancement', 'is_active', 'is_archived']

class ProjetSerializer(serializers.ModelSerializer):
    gamme = GammeSerializer(read_only=True)
    gamme_id = serializers.PrimaryKeyRelatedField(
        queryset=Gamme.objects.all(), source='gamme', write_only=True
    )
    maps = MapSerializer(many=True, read_only=True)
    versions = VersionProjetSerializer(many=True, read_only=True, source='versions')

    class Meta:
        model = Projet
        fields = [
            'id', 'nom', 'description', 'gamme', 'gamme_id', 'maps', 'versions',
            'version_numero', 'date_creation', 'date_mise_a_jour', 'auteur'
        ]
        extra_kwargs = {'auteur': {'read_only': True}}

    def create(self, validated_data):
        # Créer le projet
        auteur = self.context['request'].user
        projet = Projet.objects.create(**validated_data, auteur=auteur)

        return projet

class FonctionnaliteSerializer(serializers.ModelSerializer):
    produit_nom = serializers.CharField(source='produit.nom', read_only=True)
    class Meta:
        model = Fonctionnalite
        fields = ['id', 'produit', 'produit_nom', 'nom', 'id_fonctionnalite', 'code', 'is_archived']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'nom', 'is_archived']

class ProfilPublicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfilPublication
        fields = ['id', 'nom', 'type_sortie', 'parametres', 'map', 'is_archived']

class InterfaceUtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterfaceUtilisateur
        fields = ['id', 'nom', 'code', 'is_archived']

class AudienceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audience
        fields = ['id', 'nom', 'description', 'is_archived']

class AudienceSerializer(serializers.ModelSerializer):
    fonctionnalites = FonctionnaliteSerializer(many=True, read_only=True)
    fonctionnalite_ids = serializers.PrimaryKeyRelatedField(
        queryset=Fonctionnalite.objects.all(), source='fonctionnalites', write_only=True, many=True
    )

    class Meta:
        model = Audience
        fields = ['id', 'nom', 'description', 'fonctionnalites', 'fonctionnalite_ids', 'is_archived']


class RubriqueSerializer(serializers.ModelSerializer):
    fonctionnalite = FonctionnaliteSerializer(read_only=True)
    fonctionnalite_id = serializers.PrimaryKeyRelatedField(
        queryset=Fonctionnalite.objects.all(), source='fonctionnalite', write_only=True, allow_null=True
    )
    locked_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Rubrique
        fields = [
            'id', 'titre', 'contenu_xml', 'projet', 'type_rubrique',
            'fonctionnalite', 'fonctionnalite_id', 'version_projet',
            'is_active', 'is_archived', 'date_creation', 'date_mise_a_jour',
            'locked_by', 'locked_at', 'revision_numero', 'audience', 'version', 'version_precedente'
        ]
    
    def validate(self, data):
        projet = data.get('projet')
        version_projet = data.get('version_projet')

        if version_projet and version_projet.projet != projet:
            raise serializers.ValidationError("La version associée ne correspond pas au projet sélectionné.")

        return data
