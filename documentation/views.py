# documentation/views.py
import pdb
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .models import Projet, Rubrique
import uuid  # Utilisé pour générer un token unique
import logging
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import ProjetSerializer, RubriqueSerializer, UserSerializer
from django.utils.timezone import now

# Initialisation du logger
logger = logging.getLogger(__name__)

# Pages d'erreur personnalisées
def custom_404(request):
    return render(request, "404.html", status=404)

def custom_500(request):
    return render(request, "500.html", status=500)

# ViewSet pour les projets
class ProjetViewSet(viewsets.ModelViewSet):
    queryset = Projet.objects.all()
    serializer_class = ProjetSerializer

# ViewSet pour les rubriques
class RubriqueViewSet(viewsets.ModelViewSet):
    queryset = Rubrique.objects.all()
    serializer_class = RubriqueSerializer

# Classe pour la création de projet
class CreateProjectAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        #pdb.set_trace()
        serializer = ProjetSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
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
