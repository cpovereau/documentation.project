# documentation/views.py
from rest_framework import viewsets
from .models import Article
from .serializers import ArticleSerializer
import logging
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import UserSerializer

logger = logging.getLogger(__name__)

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer

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
