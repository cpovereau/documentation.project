# documentation/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Projet, Gamme, Rubrique, Map

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class GammeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gamme
        fields = ['id', 'nom', 'description']

class ProjetSerializer(serializers.ModelSerializer):
    gamme = GammeSerializer(read_only=True)
    gamme_id = serializers.PrimaryKeyRelatedField(
        queryset=Gamme.objects.all(), source='gamme', write_only=True
    )

    # Ajoutez un champ pour la Map, éventuellement en read-only, pour l'inclure dans la réponse si nécessaire
    map = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Projet
        fields = [
            'id', 'nom', 'description', 'gamme', 'gamme_id', 'version_numero',
            'date_creation', 'date_mise_a_jour', 'auteur', 'map'
        ]
        extra_kwargs = {'auteur': {'read_only': True}}

    def create(self, validated_data):
        # Créer le projet
        auteur = self.context['request'].user
        projet = Projet.objects.create(**validated_data, auteur=auteur)

        # Créer la "Map" par défaut associée au projet nouvellement créé
        Map.objects.create(
            nom="Carte par défaut",
            projet=projet,
            is_master=True
        )

        return projet

class MapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Map
        fields = ['id', 'nom', 'projet', 'is_master']  # Incluez les champs pertinents

    def create(self, validated_data):
        # Validation ou logique supplémentaire si nécessaire
        return Map.objects.create(**validated_data)

class RubriqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rubrique
        fields = '__all__'  # Spécifiez ici les champs que vous voulez inclure

