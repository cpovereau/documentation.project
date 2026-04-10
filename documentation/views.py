# documentation/views.py
import csv
import io
import os
import json
import logging
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from django.conf import settings
from rest_framework.generics import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import (
    api_view,
    permission_classes,
    renderer_classes,
    action,
    parser_classes,
)
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.renderers import JSONRenderer
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser
from .models import (
    Projet,
    VersionProjet,
    Gamme,
    Produit,
    Map,
    MapRubrique,
    Fonctionnalite,
    Audience,
    Tag,
    ProfilPublication,
    InterfaceUtilisateur,
    Rubrique,
    Media,
)
from .utils import get_active_version, clone_version, generate_dita_template
from documentation.constants.publication import TYPE_SORTIE_CHOICES

# import uuid  # Utilisé pour générer un token unique
import requests
import logging
from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.contrib.auth import authenticate, login, logout
from django.db import transaction
from django.db.models import QuerySet
from rest_framework.authtoken.models import Token
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from io import TextIOWrapper
from .serializers import (
    ProjetSerializer,
    GammeSerializer,
    ProduitSerializer,
    MapSerializer,
    MapRubriqueSerializer,
    MapStructureReorderSerializer,
    FonctionnaliteSerializer,
    VersionProjetSerializer,
    AudienceSerializer,
    AudienceCreateSerializer,
    TagSerializer,
    ProfilPublicationSerializer,
    InterfaceUtilisateurSerializer,
    ProjetMiniSerializer,
    MapMiniSerializer,
    MapRubriqueStructureSerializer,
    MapRubriqueCreateSerializer,
    RubriqueSerializer,
    CreateRubriqueInMapSerializer,
    MapStructureAttachSerializer,
    UserSerializer,
    MediaSerializer,
)
from .services import (
    add_rubrique_to_map,
    create_project,
    create_rubrique_in_map,
    indent_map_rubrique,
    outdent_map_rubrique,
    reorder_map_rubriques,
)
from django.utils.timezone import now


@api_view(["GET"])
@permission_classes([AllowAny])
def healthcheck(request):
    """
    GET /health/
    Retourne {"status": "ok"} si l'application répond normalement.
    Aucune dépendance externe — vérifie uniquement que le process est vivant.
    """
    return Response({"status": "ok"}, status=status.HTTP_200_OK)


# Middleware CSRF pour les vues API
@ensure_csrf_cookie
@api_view(["GET"])
def get_csrf_token(request):
    return Response({"detail": "CSRF cookie set"})


# Initialisation du logger
logger = logging.getLogger(__name__)

# Configuration de l'URL de l'API LanguageTool
LANGUAGETOOL_API_URL = "http://localhost:8010/v2/check"


# Pages d'erreur personnalisées
def custom_404(request):
    return render(request, "404.html", status=404)


def custom_500(request):
    return render(request, "500.html", status=500)


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
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    @action(detail=True, methods=["patch"])
    def archive(self, request, pk=None):
        model = self.queryset.model
        try:
            instance = model.objects.get(pk=pk)
        except model.DoesNotExist:
            logger.warning(f"[Archive] Objet {model.__name__} ID={pk} introuvable")
            return Response(
                {"detail": "Objet non trouvé."}, status=status.HTTP_404_NOT_FOUND
            )

        if hasattr(instance, "is_archived") and not instance.is_archived:
            instance.is_archived = True
            instance.save()
            logger.info(
                f"[Archive] {model.__name__} ID={instance.id} archivé par {request.user.username}"
            )
            return Response(
                self.serializer_class(instance).data, status=status.HTTP_200_OK
            )

        return Response(
            {"detail": "Objet déjà archivé ou non archivable."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    @action(detail=True, methods=["patch"])
    def restore(self, request, pk=None):
        model = self.queryset.model
        try:
            instance = model.objects.get(pk=pk)
        except model.DoesNotExist:
            logger.warning(f"[Restore] Objet {model.__name__} ID={pk} introuvable")
            return Response(
                {"detail": "Objet non trouvé."}, status=status.HTTP_404_NOT_FOUND
            )

        if hasattr(instance, "is_archived") and instance.is_archived:
            instance.is_archived = False
            instance.save()
            logger.info(
                f"[Restore] {model.__name__} ID={instance.id} restauré par {request.user.username}"
            )
            return Response(
                self.serializer_class(instance).data, status=status.HTTP_200_OK
            )

        return Response(
            {"detail": "Objet déjà actif ou non archivable."},
            status=status.HTTP_400_BAD_REQUEST,
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
        logger.info(
            f"[Produit] '{produit.nom}' mis à jour par {self.request.user.username}"
        )


# ViewSet pour les fonctionnalités
class FonctionnaliteViewSet(ArchivableModelViewSet):
    queryset = Fonctionnalite.objects.all()
    serializer_class = FonctionnaliteSerializer
    permission_classes = [IsAuthenticated]


class AudienceViewSet(ArchivableModelViewSet):
    queryset = Audience.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
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
    queryset = Projet.objects.select_related("gamme", "auteur").all()
    serializer_class = ProjetSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = create_project(data=serializer.validated_data, user=request.user)
        projet = result["projet"]

        # Rechargement pour sérialisation complète (relations versions, maps)
        projet = (
            Projet.objects.prefetch_related("versions", "maps")
            .select_related("gamme", "auteur")
            .get(pk=projet.pk)
        )
        return Response(
            {
                "projet": ProjetSerializer(projet).data,
                "map": MapSerializer(result["map"]).data,
            },
            status=status.HTTP_201_CREATED,
        )

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


# ViewSet pour les Versions de projet
class VersionProjetViewSet(viewsets.ModelViewSet):
    queryset = VersionProjet.objects.all()
    serializer_class = VersionProjetSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["post"], url_path="clone")
    @transaction.atomic
    def clone(self, request, pk=None):
        """
        Clone une version de projet existante, y compris ses données associées.
        Retourne la nouvelle version.
        """
        # 1️⃣ Récupération de la version source
        version_source = get_object_or_404(VersionProjet, pk=pk)

        try:
            # 2️⃣ Appel à la logique métier centralisée
            new_version = clone_version(version_source)

            # 3️⃣ Log et retour structuré
            logger.info(
                f"[Clonage] Version '{version_source.version_numero}' "
                f"du projet '{version_source.projet.nom}' clonée par {request.user.username}"
            )

            return Response(
                {
                    "message": "Version clonée avec succès",
                    "source_version": VersionProjetSerializer(version_source).data,
                    "new_version": VersionProjetSerializer(new_version).data,
                },
                status=status.HTTP_201_CREATED,
            )

        except ValidationError as e:
            logger.warning(f"[Clonage] Erreur de validation : {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.exception(f"[Clonage] Erreur inattendue pour la version ID={pk}")
            return Response(
                {"error": "Erreur interne lors du clonage", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# Vue pour obtenir la structure documentaire complète d’un projet
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def projet_structure_view(request, projet_id: int):
    """
    Retourne la structure documentaire complète d’un projet :
    - projet
    - map master
    - structure MapRubrique ordonnée
    """
    try:
        projet = Projet.objects.get(pk=projet_id)
    except Projet.DoesNotExist:
        return Response(
            {"error": "Projet introuvable."},
            status=status.HTTP_404_NOT_FOUND,
        )

    try:
        map_master = Map.objects.get(projet=projet, is_master=True)
    except Map.DoesNotExist:
        return Response(
            {"error": "Aucune map master définie pour ce projet."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Structure ordonnée de la map
    structure_qs = (
        MapRubrique.objects.filter(map=map_master)
        .select_related("rubrique", "parent")
        .order_by("ordre")
    )

    data = {
        "projet": ProjetMiniSerializer(projet).data,
        "map": MapMiniSerializer(map_master).data,
        "structure": MapRubriqueStructureSerializer(structure_qs, many=True).data,
    }

    logger.info(f"[ProjetStructure] Chargement structure projet_id={projet_id}")

    return Response(data, status=status.HTTP_200_OK)


# ViewSet pour les maps
class MapViewSet(viewsets.ModelViewSet):
    queryset = Map.objects.all()
    serializer_class = MapSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["get", "post"])
    def rubriques(self, request, pk=None):
        map_obj = self.get_object()

        if request.method == "GET":
            qs = MapRubrique.objects.filter(map=map_obj).order_by("ordre")
            serializer = MapRubriqueStructureSerializer(qs, many=True)
            return Response(serializer.data)

        if request.method == "POST":
            serializer = MapRubriqueCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            map_rubrique = serializer.save(map=map_obj)

            return Response(
                MapRubriqueSerializer(map_rubrique).data,
                status=status.HTTP_201_CREATED,
            )

    @action(detail=True, methods=["get"], url_path="structure")
    def structure(self, request, pk=None):
        map_obj = self.get_object()

        structure_qs = (
            MapRubrique.objects.filter(map=map_obj)
            .select_related("rubrique", "parent")
            .order_by("ordre")
        )

        serializer = MapRubriqueStructureSerializer(structure_qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="structure/create")
    def structure_create(self, request, pk=None):
        serializer = CreateRubriqueInMapSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        mr = create_rubrique_in_map(
            map_id=int(pk),
            titre=data["titre"],
            contenu_xml=data["contenu_xml"],
            auteur=request.user,
            parent_id=data.get("parent"),
            insert_after_id=data.get("insert_after"),
            insert_before_id=data.get("insert_before"),
        )

        return Response(MapRubriqueSerializer(mr).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="structure/reorder")
    def structure_reorder(self, request, pk=None):
        serializer = MapStructureReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        reorder_map_rubriques(
            map_id=int(pk),
            parent_id=data.get("parentId"),
            ordered_ids=data["orderedIds"],
        )

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(
        detail=True,
        methods=["post"],
        url_path=r"structure/(?P<map_rubrique_id>\d+)/indent",
    )
    def structure_indent(self, request, pk=None, map_rubrique_id=None):
        indent_map_rubrique(
            map_id=int(pk),
            map_rubrique_id=int(map_rubrique_id),
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(
        detail=True,
        methods=["post"],
        url_path=r"structure/(?P<map_rubrique_id>\d+)/outdent",
    )
    def structure_outdent(self, request, pk=None, map_rubrique_id=None):
        outdent_map_rubrique(
            map_id=int(pk),
            map_rubrique_id=int(map_rubrique_id),
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"], url_path="structure/attach")
    def structure_attach(self, request, pk=None):
        """
        POST /api/maps/{id}/structure/attach/
        Attache une rubrique existante à la map via le service add_rubrique_to_map.
        Endpoint canonique — remplace à terme POST /api/map-rubriques/.
        """
        serializer = MapStructureAttachSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        mr = add_rubrique_to_map(
            map_id=int(pk),
            rubrique_id=data["rubrique_id"],
            parent_id=data.get("parent_id"),
            ordre=data.get("ordre"),
        )
        return Response(MapRubriqueSerializer(mr).data, status=status.HTTP_201_CREATED)

# ViewSet pour les rubriques
class RubriqueViewSet(viewsets.ModelViewSet):
    queryset = (
        Rubrique.objects.select_related("projet", "version_projet", "type_rubrique")
        .select_related("fonctionnalite")
        .all()
    )
    serializer_class = RubriqueSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        projet = serializer.validated_data.get("projet")
        version_projet = VersionProjet.objects.filter(
            projet=projet, is_active=True
        ).first()

        if not version_projet:
            raise ValidationError(
                {"version_projet": ["Aucune version active pour ce projet."]}
            )

        rubrique = serializer.save(version_projet=version_projet)
        logger.info(
            f"[Rubrique] '{rubrique.titre}' créée pour '{rubrique.projet.nom}' par {request.user.username}"
        )
        return Response(self.get_serializer(rubrique).data, status=201)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=kwargs.get("partial", False)
        )
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            rubrique = Rubrique.objects.select_for_update().get(pk=instance.pk)

            projet = serializer.validated_data.get("projet", rubrique.projet)
            version_projet = serializer.validated_data.get(
                "version_projet", rubrique.version_projet
            )

            if version_projet and version_projet.projet != projet:
                raise ValidationError(
                    {"version_projet": ["La version ne correspond pas au projet."]}
                )

            rubrique = serializer.save()
            logger.info(
                f"[Rubrique] '{rubrique.titre}' mise à jour par {request.user.username}"
            )
            return Response(self.get_serializer(rubrique).data, status=200)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if MapRubrique.objects.filter(rubrique=instance).exists():
            raise ValidationError(
                {
                    "rubrique": [
                        "Impossible de supprimer cette rubrique : "
                        "elle est encore utilisée dans une structure documentaire."
                    ]
                }
            )
        logger.info(
            f"[Rubrique] '{instance.titre}' supprimée par {request.user.username}"
        )
        return super().destroy(request, *args, **kwargs)


# Vue pour la consultation des projets
@api_view(["GET"])
def get_project_details(request, pk):
    projet = get_object_or_404(Projet.objects.select_related("gamme"), pk=pk)
    serializer = ProjetSerializer(projet)
    return Response(serializer.data)


# Vue pour publier les formats de publication
@api_view(["GET"])
def get_type_sortie_choices(request):
    return Response(
        [{"value": val, "label": label} for val, label in TYPE_SORTIE_CHOICES]
    )


# Vue pour gérer les médias (images)
class MediaViewSet(viewsets.ModelViewSet):
    queryset = Media.objects.all()
    serializer_class = MediaSerializer
    permission_classes = [IsAuthenticated]


# Vue pour vérifier l'orthographe via LanguageTool
@api_view(["POST"])
def check_orthographe_view(request):
    texte = request.data.get("text", "")
    if not texte:
        return Response(
            {"error": "Texte manquant."}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        response = requests.post(
            LANGUAGETOOL_API_URL,
            data={
                "text": texte,
                "language": "fr",
            },
            timeout=5,
        )
        response.raise_for_status()
        result = response.json()
        return Response(result)
    except requests.RequestException as e:
        logger.exception("Erreur lors de l'appel à LanguageTool")
        return Response(
            {"error": "Erreur de connexion à LanguageTool."},
            status=status.HTTP_502_BAD_GATEWAY,
        )


# Vue pour la connexion
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(request, username=username, password=password)

    if user is not None:
        login(request, user)
        user_ip = request.META.get("REMOTE_ADDR", "IP not found")
        timestamp = now().strftime("%Y-%m-%d %H:%M:%S")
        logger.info(f"{timestamp} - User '{username}' logged in from IP {user_ip}.")

        # Génération d'un token temporaire pour la connexion (UUID)
        token, _ = Token.objects.get_or_create(user=user)

        serializer = UserSerializer(user)
        return Response(
            {"user": serializer.data, "token": token.key}, status=status.HTTP_200_OK
        )
    else:
        logger.warning(
            f"Failed login attempt for user '{username}' from IP {request.META.get('REMOTE_ADDR', 'IP not found')}"
        )
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST
        )


# Vue pour la déconnexion
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def logout_view(request):
    user = request.user
    if user.is_authenticated:
        user_ip = request.META.get("REMOTE_ADDR", "IP not found")
        timestamp = now().strftime("%Y-%m-%d %H:%M:%S")
        logger.info(
            f"{timestamp} - User '{user.username}' logged out from IP {user_ip}."
        )
        logout(request)
        return Response(
            {"message": "Logged out successfully"}, status=status.HTTP_200_OK
        )
    else:
        return Response(
            {"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED
        )


# Vue pour l'import des fonctionnalités
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser])
def import_fonctionnalites(request):
    """
    Permet d'importer des fonctionnalités à partir d'un fichier CSV.
    Le frontend envoie :
    - file (CSV)
    - mapping: champ→colonne (ex: nom=1, id_fonctionnalite=0, description=2)
    - produit: ID du produit cible
    - skip_header: "true" pour ignorer l’en-tête
    """
    try:
        file = request.FILES.get("file")
        mapping_raw = request.POST.get("mapping")
        produit_id = request.POST.get("produit")
        skip_header = request.POST.get("skip_header", "false") == "true"

        if not all([file, mapping_raw, produit_id]):
            return Response({"error": "Paramètres manquants."}, status=400)

        try:
            mapping = json.loads(mapping_raw)
        except json.JSONDecodeError:
            return Response(
                {"error": "Le mapping n’est pas un JSON valide."}, status=400
            )

        produit = Produit.objects.filter(id=produit_id).first()
        if not produit:
            return Response({"error": "Produit introuvable."}, status=400)

        decoded = file.read().decode("utf-8-sig")
        reader = csv.reader(io.StringIO(decoded), delimiter=";")

        results = []
        for idx, row in enumerate(reader):
            if skip_header and idx == 0:
                continue

            try:
                nom = row[mapping["nom"]].strip()
                code = row[mapping["code"]].strip()
                id_fonctionnalite = row[mapping["id_fonctionnalite"]].strip()

                # --- validations ---
                if not nom or not code:
                    raise ValueError("Champs obligatoires manquants.")

                if len(code) > 5:
                    raise ValueError("Identifiant trop long (> 5 caractères).")

                if len(id_fonctionnalite) > 10:
                    raise ValueError(
                        "id_fonctionnalite ne doit pas dépasser 10 caractères."
                    )

                if Fonctionnalite.objects.filter(produit=produit, code=code).exists():
                    raise ValueError(f"Le code '{code}' existe déjà pour ce produit.")

                if Fonctionnalite.objects.filter(
                    id_fonctionnalite=id_fonctionnalite
                ).exists():
                    raise ValueError(
                        f"L’identifiant '{id_fonctionnalite}' est déjà utilisé."
                    )

                fct = Fonctionnalite.objects.create(
                    produit=produit,
                    nom=nom,
                    code=code,
                    id_fonctionnalite=id_fonctionnalite,
                )
                results.append({"line": idx + 1, "status": "success", "id": fct.id})

            except Exception as e:
                results.append(
                    {"line": idx + 1, "status": "error", "message": str(e), "row": row}
                )

        logger.info("[ImportFCT] Import terminé : %s lignes traitées", len(results))
        return Response({"import_result": results}, status=201)

    except Exception as e:
        logger.exception("[Import FCT] Erreur inattendue")
        return Response({"error": "Erreur serveur", "detail": str(e)}, status=500)


# Vue pour vérifier les noms de médias existants
@api_view(["GET"])
@permission_classes([IsAuthenticated])
@renderer_classes([JSONRenderer])
def check_media_names(request):
    from .models import Media, Produit, Fonctionnalite, InterfaceUtilisateur

    produit_id = request.GET.get("produit")
    fonctionnalite_id = request.GET.get("fonctionnalite")
    interface_id = request.GET.get("interface")

    try:
        produit = Produit.objects.get(id=int(produit_id))
        fonctionnalite = Fonctionnalite.objects.get(id=int(fonctionnalite_id))
        interface = InterfaceUtilisateur.objects.get(id=int(interface_id))
    except (
        Produit.DoesNotExist,
        Fonctionnalite.DoesNotExist,
        InterfaceUtilisateur.DoesNotExist,
    ):
        return Response({"error": "Entité introuvable."}, status=404)
    except Exception as e:
        return Response({"error": f"Erreur interne : {str(e)}"}, status=500)

    prefix = f"{produit.abreviation}-{fonctionnalite.code}-{interface.code}"
    medias = Media.objects.filter(nom_fichier__startswith=prefix)
    noms_existants = sorted([m.nom_fichier for m in medias])

    return Response({"prefix": prefix, "existing": noms_existants})


# Vue pour l'enregistrement des images
@extend_schema(
    methods=["POST"],
    description="Importe un média (image) dans la base Documentum.",
    request={
        "multipart/form-data": {
            "type": "object",
            "properties": {
                "file": {"type": "string", "format": "binary"},
                "produit": {"type": "integer"},
                "fonctionnalite": {"type": "integer"},
                "interface": {"type": "integer"},
                "nom_fichier": {"type": "string"},
                "remplacer": {"type": "boolean"},
                "remplacer_nom_fichier": {"type": "string"},
            },
            "required": [
                "file",
                "produit",
                "fonctionnalite",
                "interface",
                "nom_fichier",
            ],
        }
    },
    responses={
        201: OpenApiTypes.OBJECT,
        200: OpenApiTypes.OBJECT,
        400: OpenApiTypes.OBJECT,
        409: OpenApiTypes.OBJECT,
        500: OpenApiTypes.OBJECT,
    },
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser])
def upload_media(request):
    try:
        # --- Récupération des données POST
        fichier = request.FILES.get("file")
        produit_id = request.POST.get("produit")
        fonctionnalite_id = request.POST.get("fonctionnalite")
        interface_id = request.POST.get("interface")
        nom_fichier = request.POST.get("nom_fichier")
        remplacer = request.POST.get("remplacer", "false") == "true"
        remplacer_nom = request.POST.get("remplacer_nom_fichier")

        # --- Extensions autorisées
        ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif"]
        extension = nom_fichier.split(".")[-1].lower()
        if extension not in ALLOWED_EXTENSIONS:
            return Response({"error": "Format non supporté."}, status=400)

        # --- Vérification des champs obligatoires
        if not all([fichier, produit_id, fonctionnalite_id, interface_id, nom_fichier]):
            return Response({"error": "Paramètres manquants."}, status=400)

        # --- Récupération de l’objet produit (les autres non utilisés ici)
        try:
            produit = Produit.objects.get(pk=produit_id)
        except Produit.DoesNotExist:
            return Response({"error": "Produit introuvable."}, status=404)

        # --- Construction du chemin de stockage
        relative_path = nom_fichier
        absolute_path = os.path.join(settings.MEDIA_ROOT, relative_path)

        # --- Si fichier existant
        if default_storage.exists(relative_path):
            if not remplacer:
                return Response({"error": "Le fichier existe déjà."}, status=409)
            else:
                default_storage.delete(relative_path)

        # --- Enregistrement manuel du fichier pour éviter les suffixes automatiques
        with default_storage.open(relative_path, "wb") as destination:
            for chunk in fichier.chunks():
                destination.write(chunk)

        # --- Remplacement d’un média existant
        if remplacer and remplacer_nom:
            media = Media.objects.filter(nom_fichier=remplacer_nom).first()
            if media:
                media.nom_fichier = nom_fichier
                media.chemin_acces = relative_path
                media.produit = produit
                media.save()
                logger.info(
                    f"[Media] {nom_fichier} remplacé via {request.user.username}"
                )
                return Response({"message": "Média remplacé avec succès."}, status=200)

        # --- Création d’une nouvelle entrée
        Media.objects.create(
            produit=produit,
            rubrique=None,
            type_media="image",
            nom_fichier=nom_fichier,
            chemin_acces=relative_path,
            description="",
        )
        logger.info(
            f"[Media] Nouveau média {nom_fichier} importé via {request.user.username}"
        )
        return Response({"message": "Média importé avec succès."}, status=201)

    except Exception as e:
        logger.exception("[Media] Erreur lors de l'import")
        return Response({"error": "Erreur serveur", "detail": str(e)}, status=500)


# Vue pour générer un template DITA
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .utils import generate_dita_template, get_active_version


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_dita(request):
    """
    Body JSON attendu (tous facultatifs sauf titre) :
    { "titre": "...", "audience": "...", "produit": "...", "fonctionnalites": ["AUTH", "MEN"], "type_dita": "topic" }
    La version est déduite de la version active du projet si 'projet_id' est fourni.
    """
    data = request.data or {}
    titre = data.get("titre", "Nouvelle rubrique")
    type_dita = data.get("type_dita", "topic")
    audience = data.get("audience")
    produit = data.get("produit")
    fonctionnalites = data.get("fonctionnalites") or []
    projet_id = data.get("projet_id")

    version_num = None
    if projet_id:
        from .models import Projet

        projet = Projet.objects.filter(id=projet_id).first()
        if projet:
            v = get_active_version(projet)
            version_num = v.version_numero if v else None

    xml = generate_dita_template(
        type_dita=type_dita,
        auteur=request.user.get_full_name() or request.user.username or "?",
        titre=titre,
        audience=audience,
        version=version_num,
        produit=produit,
        fonctionnalites=fonctionnalites,
    )
    return Response({"xml": xml})
