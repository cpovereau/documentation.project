# documentation/views.py
from rest_framework import viewsets
from .models import Projet, Module, Rubrique
import logging
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from .serializers import ProjetSerializer, ModuleSerializer, RubriqueSerializer, UserSerializer

def custom_404(request, exception):
    return render(request, "404.html", status=404)

def custom_500(request):
    return render(request, "500.html", status=500)

logger = logging.getLogger(__name__)

class ProjetDetailView(viewsets.ModelViewSet):
    def get(self, request, pk):
        try:
            projet = Projet.objects.get(pk=pk)
            serializer = ProjetSerializer(projet)
            return Response(serializer.data)
        except Projet.DoesNotExist:
            raise NotFound(detail="Projet non trouvé", code=404)

class ProjetViewSet(viewsets.ModelViewSet):
    queryset = Projet.objects.all()
    serializer_class = ProjetSerializer

class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer

class RubriqueViewSet(viewsets.ModelViewSet):
    queryset = Rubrique.objects.all()
    serializer_class = RubriqueSerializer

@csrf_exempt
@api_view(['POST'])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        logger.info(f"User {username} logged in.")
        serializer = UserSerializer(user)
        return Response(serializer.data)
    else:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['POST'])
def logout_view(request):
    user = request.user
    logger.info(f"User {user.username} logged out.")
    logout(request)
    return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
