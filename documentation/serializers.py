# documentation/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Projet, Module, Rubrique

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class ProjetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Projet
        fields = '__all__'

class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = '__all__'

class RubriqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rubrique
        fields = '__all__'  # Spécifiez ici les champs que vous voulez inclure

