# documentation/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Projet, Gamme, Rubrique

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

    class Meta:
        model = Projet
        fields = [
            'id', 'nom', 'description', 'gamme', 'gamme_id', 'version_numero',
            'date_creation', 'date_mise_a_jour', 'auteur'
        ]
        extra_kwargs = {'auteur': {'read_only': True}}

    def create(self, validated_data):
        auteur = self.context['request'].user
        return Projet.objects.create(**validated_data, auteur=auteur)

class RubriqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rubrique
        fields = '__all__'  # Spécifiez ici les champs que vous voulez inclure

