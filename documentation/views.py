# documentation/views.py
import pdb
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .models import Projet, Rubrique, Gamme, Map
#import uuid  # Utilisé pour générer un token unique
import logging
from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.db import transaction
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
#from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import GammeSerializer, ProjetSerializer, RubriqueSerializer, UserSerializer, MapSerializer
from django.utils.timezone import now

# Initialisation du logger
logger = logging.getLogger(__name__)

# Pages d'erreur personnalisées
def custom_404(request):
    return render(request, "404.html", status=404)

def custom_500(request):
    return render(request, "500.html", status=500)

#ViewSet pour les gammes
class GammeViewSet(viewsets.ModelViewSet):
    queryset = Gamme.objects.all()  # Récupère toutes les gammes
    serializer_class = GammeSerializer

# ViewSet pour les projets
class ProjetViewSet(viewsets.ModelViewSet):
    queryset = Projet.objects.select_related('gamme').all()
    serializer_class = ProjetSerializer
    permission_classes = [IsAuthenticated] 
 
    def list(self, request, *args, **kwargs):
        print(f"Headers reçus : {request.headers}")
        print(f"Query Params : {request.query_params}")
        print(f"Utilisateur authentifié : {request.user}")
        print(f"Permissions utilisateur : {request.user.get_all_permissions()}")
        return super().list(request, *args, **kwargs)

# ViewSet pour les rubriques
class RubriqueViewSet(viewsets.ModelViewSet):
    queryset = Rubrique.objects.all()
    serializer_class = RubriqueSerializer

# Classe pour la création de projet
class CreateProjectAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic  # Assure que toutes les opérations sont atomiques
    def post(self, request, *args, **kwargs):
        # Création du projet
        serializer = ProjetSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            projet = serializer.save()  # Sauvegarde le projet

            # Vérifie s'il existe déjà une Map associée à ce projet
            if not Map.objects.filter(projet=projet).exists():
                # Création d'une Map par défaut associée au projet
                map_data = {
                    "nom": "Carte par défaut",
                    "projet": projet.id,
                    "is_master": True
                }
                map_serializer = MapSerializer(data=map_data)
                if map_serializer.is_valid():
                    map = map_serializer.save()  # Sauvegarde la Map
                    return Response({
                        "projet": serializer.data,
                        "map": MapSerializer(map).data
                    }, status=status.HTTP_201_CREATED)
                else:
                    # Supprime le projet si la création de la Map échoue
                    projet.delete()
                    return Response(map_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            # Si une Map existe déjà, retourne quand même la réponse de création du projet
            return Response({
                "projet": serializer.data,
                "map": "Une map par défaut est déjà associée à ce projet."
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Vue pour la consultation des projets
@api_view(['GET'])
def get_project_details(request, pk):
    projet = get_object_or_404(Projet.objects.select_related('gamme'), pk=pk)
    serializer = ProjetSerializer(projet)
    return Response(serializer.data)

#Classe pour la gestion des maps
class CreateMapView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MapSerializer(data=request.data)
        if serializer.is_valid():
            map_instance = serializer.save()
            return Response(MapSerializer(map_instance).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Vue pour la connexion
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])  # Permet l'accès sans authentification préalable
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        login(request, user)
        user_ip = request.META.get('REMOTE_ADDR', 'IP not found')
        timestamp = now().strftime("%Y-%m-%d %H:%M:%S")
        logger.info(f"{timestamp} - User '{username}' logged in from IP {user_ip}.")
        
        # Génération d'un token temporaire pour la connexion (UUID)
        token, _ = Token.objects.get_or_create(user=user)
        
        serializer = UserSerializer(user)
        return Response({
            "user": serializer.data,
            "token": token.key
        }, status=status.HTTP_200_OK)
    else:
        logger.warning(f"Failed login attempt for user '{username}' from IP {request.META.get('REMOTE_ADDR', 'IP not found')}")
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

# Vue pour la déconnexion
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])  # Permet l'accès sans authentification préalable
def logout_view(request):
    user = request.user
    if user.is_authenticated:
        user_ip = request.META.get('REMOTE_ADDR', 'IP not found')
        timestamp = now().strftime("%Y-%m-%d %H:%M:%S")
        logger.info(f"{timestamp} - User '{user.username}' logged out from IP {user_ip}.")
        logout(request)
        return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
