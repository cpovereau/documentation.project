# documentation/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Article  # Assurez-vous que le modèle Article est bien défini

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = '__all__'  # Spécifiez ici les champs que vous voulez inclure

