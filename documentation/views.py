import pprint
from rest_framework.generics import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny
from .models import Projet, VersionProjet, Gamme, Produit, Map, Fonctionnalite, Audience, Tag, ProfilPublication, InterfaceUtilisateur, Rubrique
from .utils import get_active_version, clone_version
#import uuid  # Utilisé pour générer un token unique
import logging
from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.db import transaction, connection
from django.db.models import QuerySet
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from .serializers import ProjetSerializer, GammeSerializer, ProduitSerializer, MapSerializer, FonctionnaliteSerializer, VersionProjetSerializer, AudienceSerializer, AudienceCreateSerializer, TagSerializer, ProfilPublicationSerializer, InterfaceUtilisateurSerializer, RubriqueSerializer, UserSerializer
from django.utils.timezone import now

# Initialisation du logger
logger = logging.getLogger(__name__)

# Middleware CSRF pour les vues API
@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'message': 'Token CSRF envoyé'})

# Pages d'erreur personnalisées
def custom_404(request):
    return render(request, "404.html", status=404)

def custom_500(request):
    return render(request, "500.html", status=500)

# Visualisation des requêtes SQL dans la console
def debug_queries():
    pprint.pprint(connection.queries)


class ArchivableModelViewSet(viewsets.ModelViewSet):
    """
    ViewSet générique pour les entités avec champ is_archived.
    Fournit :
    - Filtrage GET automatique via ?archived=true|false
    - Actions PATCH : /<id>/archive/ et /<id>/restore/
    """

    def get_queryset(self) -> QuerySet:
        queryset = super().get_queryset()
        archived = self.request.query_params.get("archived")
        try:
            if archived == "true":
                return queryset.filter(is_archived=True)
            elif archived == "false":
                return queryset.filter(is_archived=False)
            return queryset
        except Exception as e:
            logger.exception("[ArchivableViewSet] Erreur dans get_queryset()")
            return queryset.none()
    
    def destroy(self, request, *args, **kwargs):
        return Response(
        {"error": "Suppression interdite. Utilisez l'archivage."},
        status=status.HTTP_405_METHOD_NOT_ALLOWED
    )

    @action(detail=True, methods=["patch"])
    def archive(self, request, pk=None):
        model = self.queryset.model
        try:
            instance = model.objects.get(pk=pk)
        except model.DoesNotExist:
            logger.warning(f"[Archive] Objet {model.__name__} ID={pk} introuvable")
            return Response({"detail": "Objet non trouvé."}, status=status.HTTP_404_NOT_FOUND)

        if hasattr(instance, 'is_archived') and not instance.is_archived:
            instance.is_archived = True
            instance.save()
            logger.info(f"[Archive] {model.__name__} ID={instance.id} archivé par {request.user.username}")
            return Response(self.serializer_class(instance).data, status=status.HTTP_200_OK)

        return Response(
            {"detail": "Objet déjà archivé ou non archivable."},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=["patch"])
    def restore(self, request, pk=None):
        model = self.queryset.model
        try:
            instance = model.objects.get(pk=pk)
        except model.DoesNotExist:
            logger.warning(f"[Restore] Objet {model.__name__} ID={pk} introuvable")
            return Response({"detail": "Objet non trouvé."}, status=status.HTTP_404_NOT_FOUND)

        if hasattr(instance, 'is_archived') and instance.is_archived:
            instance.is_archived = False
            instance.save()
            logger.info(f"[Restore] {model.__name__} ID={instance.id} restauré par {request.user.username}")
            return Response(self.serializer_class(instance).data, status=status.HTTP_200_OK)

        return Response(
            {"detail": "Objet déjà actif ou non archivable."},
            status=status.HTTP_400_BAD_REQUEST
        )

# ViewSet pour les gammes
class GammeViewSet(ArchivableModelViewSet):
    queryset = Gamme.objects.all()
    serializer_class = GammeSerializer
    permission_classes = [IsAuthenticated]

# ViewSet pour les produits
class ProduitViewSet(ArchivableModelViewSet):
    queryset = Produit.objects.all()
    serializer_class = ProduitSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        produit = serializer.save()
        logger.info(f"[Produit] '{produit.nom}' mis à jour par {self.request.user.username}")

# ViewSet pour les fonctionnalités
class FonctionnaliteViewSet(ArchivableModelViewSet):
    queryset = Fonctionnalite.objects.all()
    serializer_class = FonctionnaliteSerializer
    permission_classes = [IsAuthenticated]

class AudienceViewSet(ArchivableModelViewSet):
    queryset = Audience.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return AudienceCreateSerializer
        return AudienceSerializer

# ViewSet pour les tags
class TagViewSet(ArchivableModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated]

# ViewSet pour les publications de profil
class ProfilPublicationViewSet(ArchivableModelViewSet):
    queryset = ProfilPublication.objects.all()
    serializer_class = ProfilPublicationSerializer
    permission_classes = [IsAuthenticated]

# ViewSet pour les interfaces utilisateur
class InterfaceUtilisateurViewSet(ArchivableModelViewSet):
    queryset = InterfaceUtilisateur.objects.all()
    serializer_class = InterfaceUtilisateurSerializer
    permission_classes = [IsAuthenticated]

# ViewSet pour les projets
class ProjetViewSet(viewsets.ModelViewSet):
    queryset = Projet.objects.select_related('projet').all()
    serializer_class = ProjetSerializer
    permission_classes = [IsAuthenticated] 
 
    def list(self, request, *args, **kwargs):
        print(f"Headers reçus : {request.headers}")
        print(f"Query Params : {request.query_params}")
        print(f"Utilisateur authentifié : {request.user}")
        print(f"Permissions utilisateur : {request.user.get_all_permissions()}")
        return super().list(request, *args, **kwargs)

# ViewSet pour les Versions de projet
class VersionProjetViewSet(viewsets.ModelViewSet):
    queryset = VersionProjet.objects.all()
    serializer_class = VersionProjetSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        try:
            projet = serializer.validated_data['projet']
            serializer.save(projet=projet, is_active=True)
            logger.info(f"[Création] Nouvelle version active créée pour le projet '{projet.nom}'")
        except Exception as e:
            logger.exception("Erreur lors de la création d'une version")
            raise ValidationError(f"Erreur lors de la création de la version : {str(e)}")

    def perform_update(self, serializer):
        try:
            instance = serializer.instance
            if serializer.validated_data.get('is_active'):
                # Désactiver les autres versions actives
                count = VersionProjet.objects.filter(
                    projet=instance.projet, is_active=True
                ).exclude(pk=instance.pk).update(is_active=False)
                logger.info(f"{count} version(s) désactivée(s) pour le projet '{instance.projet.nom}'")

            serializer.save()
            logger.info(f"[Mise à jour] Version '{instance.version_numero}' mise à jour pour le projet '{instance.projet.nom}'")
        except Exception as e:
            logger.exception("Erreur lors de la mise à jour d'une version")
            raise ValidationError(f"Erreur lors de la mise à jour de la version : {str(e)}")

    @transaction.atomic
    def clone(self, request, pk=None):
        try:
            version_projet = get_object_or_404(VersionProjet, pk=pk)
            new_version = clone_version(version_projet)
            logger.info(f"[Clonage] Version {version_projet.version_numero} clonée avec succès pour le projet '{version_projet.projet.nom}'")
            return Response({
                "message": "Version clonée avec succès",
                "new_version": VersionProjetSerializer(new_version).data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.exception(f"Erreur lors du clonage de la version {pk}")
            return Response({
                "error": "Échec du clonage",
                "detail": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
   
# ViewSet pour les rubriques
class RubriqueViewSet(viewsets.ModelViewSet):
    queryset = Rubrique.objects.select_related('projet', 'version_projet', 'type_rubrique')\
                               .prefetch_related('fonctionnalite').all()
    serializer_class = RubriqueSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.warning("[Rubrique] Données invalides à la création")
            return Response({"error": "Erreur de validation", "fields": serializer.errors}, status=400)

        try:
            projet = serializer.validated_data.get('projet')
            version_projet = VersionProjet.objects.filter(projet=projet, is_active=True).first()

            if not version_projet:
                logger.warning(f"[Rubrique] Création échouée : pas de version active pour {projet}")
                return Response({"error": "Aucune version active pour ce projet."}, status=400)

            rubrique = serializer.save(version_projet=version_projet)
            logger.info(f"[Rubrique] '{rubrique.titre}' créée pour '{rubrique.projet.nom}' par {request.user.username}")
            return Response(self.get_serializer(rubrique).data, status=201)
        except Exception as e:
            logger.exception("Erreur lors de la création d'une rubrique")
            return Response({"error": "Erreur interne", "detail": str(e)}, status=500)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get("partial", False))
        if not serializer.is_valid():
            logger.warning("[Rubrique] Données invalides à la mise à jour")
            return Response({"error": "Erreur de validation", "fields": serializer.errors}, status=400)

        try:
            with transaction.atomic():
                rubrique = Rubrique.objects.select_for_update().get(pk=instance.pk)

                projet = serializer.validated_data.get('projet', rubrique.projet)
                version_projet = serializer.validated_data.get('version_projet', rubrique.version_projet)

                if version_projet and version_projet.projet != projet:
                    logger.warning("[Rubrique] Conflit version/projet")
                    return Response({
                        "error": "La version ne correspond pas au projet."
                    }, status=400)

                rubrique = serializer.save()
                logger.info(f"[Rubrique] '{rubrique.titre}' mise à jour par {request.user.username}")
                return Response(self.get_serializer(rubrique).data, status=200)
        except Exception as e:
            logger.exception("Erreur lors de la mise à jour d'une rubrique")
            return Response({"error": "Erreur interne", "detail": str(e)}, status=500)

# Classe pour la création de projet
class CreateProjectAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        serializer = ProjetSerializer(data=request.data, context={'request': request})

        if not serializer.is_valid():
            logger.warning("[Projet] Données invalides à la création")
            return Response({
                "error": "Erreur de validation",
                "fields": serializer.errors
            }, status=400)

        try:
            projet = serializer.save()
            logger.info(f"[Projet] Projet '{projet.nom}' créé par {request.user.username}")

            version = VersionProjet.objects.create(
                projet=projet,
                version_numero="1.0.0",
                date_lancement=now(),
                notes_version="Version initiale",
                is_active=True
            )
            logger.info(f"[Version] Version initiale '1.0.0' créée pour le projet '{projet.nom}'")

            map_data = {
                "nom": "Carte par défaut",
                "projet": projet.id,
                "is_master": True
            }
            map_serializer = MapSerializer(data=map_data)

            if map_serializer.is_valid():
                map = map_serializer.save()
                logger.info(f"[Map] Carte par défaut créée pour le projet '{projet.nom}'")
                return Response({
                    "projet": ProjetSerializer(projet).data,
                    "map": MapSerializer(map).data
                }, status=201)
            else:
                projet.delete()
                logger.warning(f"[Map] Échec création de la map par défaut pour projet '{projet.nom}', rollback.")
                return Response({
                    "error": "Erreur lors de la création de la carte par défaut",
                    "fields": map_serializer.errors
                }, status=400)

        except Exception as e:
            logger.exception("[Projet] Erreur inattendue lors de la création du projet")
            return Response({
                "error": "Erreur interne",
                "detail": str(e)
            }, status=500)

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
