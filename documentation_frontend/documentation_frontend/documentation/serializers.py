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

class MapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Map
        fields = ['id', 'nom', 'projet', 'is_master']

    def create(self, validated_data):
        # Validation ou logique supplémentaire si nécessaire
        return Map.objects.create(**validated_data)

class ProjetSerializer(serializers.ModelSerializer):
    gamme = GammeSerializer(read_only=True)
    gamme_id = serializers.PrimaryKeyRelatedField(
        queryset=Gamme.objects.all(), source='gamme', write_only=True
    )
    maps = MapSerializer(many=True, read_only=True)

    class Meta:
        model = Projet
        fields = [
            'id', 'nom', 'description', 'gamme', 'gamme_id', 'maps', 'version_numero',
            'date_creation', 'date_mise_a_jour', 'auteur'
        ]
        extra_kwargs = {'auteur': {'read_only': True}}

    def create(self, validated_data):
        # Créer le projet
        auteur = self.context['request'].user
        projet = Projet.objects.create(**validated_data, auteur=auteur)

        return projet

class RubriqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rubrique
        fields = '__all__'  # Spécifiez ici les champs que vous voulez inclure

