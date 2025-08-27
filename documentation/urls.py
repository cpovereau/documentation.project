# documentation/urls.py
from django.conf.urls import handler404, handler500
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GammeViewSet,
    ProduitViewSet,
    ProjetViewSet,
    RubriqueViewSet,
    VersionProjetViewSet,
    FonctionnaliteViewSet,
    AudienceViewSet,
    TagViewSet,
    ProfilPublicationViewSet,
    InterfaceUtilisateurViewSet,
    get_csrf_token,
    login_view,
    logout_view,
    CreateProjectAPIView,
    get_project_details,
    CreateMapView,
    get_type_sortie_choices,
    import_fonctionnalites,
    MediaViewSet,
    check_media_names,
    upload_media,
    generate_dita,
    check_orthographe_view,
)
from .utils import publier_map, get_formats_publication
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

# Create a router and register the viewsets
router = DefaultRouter()
router.register(r"gammes", GammeViewSet)
router.register(r"produits", ProduitViewSet)
router.register(r"projets", ProjetViewSet)
router.register(r"rubriques", RubriqueViewSet)
router.register(r"versions", VersionProjetViewSet)
router.register(r"fonctionnalites", FonctionnaliteViewSet)
router.register(r"audiences", AudienceViewSet)
router.register(r"tags", TagViewSet)
router.register(r"profils-publication", ProfilPublicationViewSet)
router.register(r"interfaces", InterfaceUtilisateurViewSet)
router.register(r"media-items", MediaViewSet)

urlpatterns = [
    path("csrf/", get_csrf_token, name="csrf"),
    path("login/", login_view, name="login"),
    path("logout/", logout_view, name="logout"),
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path("docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("projet/create/", CreateProjectAPIView.as_view(), name="create_project_api"),
    path("projets/<int:pk>/details/", get_project_details, name="project_details"),
    path("api/maps/", CreateMapView.as_view(), name="create_map"),
    path("api/publier-map/<int:map_id>/", publier_map, name="publier_map"),
    path(
        "api/formats-publication/", get_formats_publication, name="formats_publication"
    ),
    path("type-sortie/", get_type_sortie_choices, name="type_sortie_choices"),
    path(
        "import/fonctionnalites/", import_fonctionnalites, name="import_fonctionnalites"
    ),
    path("medias-check-nom/", check_media_names, name="check_media_names"),
    path("import/media/", upload_media, name="upload_media"),
    path("", include(router.urls)),
    path("api/dita-template/", generate_dita, name="generate_dita_template"),
    path("api/orthographe/", check_orthographe_view, name="check_orthographe"),
]

# Custom error handlers
handler404 = "documentation.views.custom_404"
handler500 = "documentation.views.custom_500"
