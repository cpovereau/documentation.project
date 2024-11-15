# documentation/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Projet, Gamme, Rubrique

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class ProjetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Projet
        fields = '__all__'
        extra_kwargs = {'auteur': {'read_only': True}}

    def create(self, validated_data):
        auteur = self.context['request'].user  # Obtenez l'utilisateur connecté
        projet = Projet.objects.create(**validated_data, auteur=auteur)
        return projet

class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gamme
        fields = '__all__'

class RubriqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rubrique
        fields = '__all__'  # Spécifiez ici les champs que vous voulez inclure

