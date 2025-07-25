# documentation/urls.py
from django.conf.urls import handler404, handler500
# from documentation import views
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GammeViewSet, ProduitViewSet, ProjetViewSet, RubriqueViewSet, VersionProjetViewSet, FonctionnaliteViewSet, AudienceViewSet, TagViewSet, ProfilPublicationViewSet, InterfaceUtilisateurViewSet, get_csrf_token, login_view, logout_view, CreateProjectAPIView, get_project_details, CreateMapView, get_type_sortie_choices #check_orthographe, 
from .utils import publier_map, get_formats_publication

router = DefaultRouter()
router.register(r'gammes', GammeViewSet)
router.register(r'produits', ProduitViewSet)
router.register(r'projets', ProjetViewSet)
router.register(r'rubriques', RubriqueViewSet)
router.register(r'versions', VersionProjetViewSet)
router.register(r'fonctionnalites', FonctionnaliteViewSet)
router.register(r'audiences', AudienceViewSet)
router.register(r'tags', TagViewSet)
router.register(r'profils-publication', ProfilPublicationViewSet)
router.register(r'interfaces', InterfaceUtilisateurViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('csrf/', get_csrf_token, name='csrf'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('projet/create/', CreateProjectAPIView.as_view(), name='create_project_api'),
    path('projets/<int:pk>/details/', get_project_details, name='project_details'),
    path('api/maps/', CreateMapView.as_view(), name='create_map'),
    path('api/publier-map/<int:map_id>/', publier_map, name='publier_map'),
    path('api/formats-publication/', get_formats_publication, name='formats_publication'),
    path("type-sortie/", get_type_sortie_choices, name="type_sortie_choices"),
    # path('api/orthographe/', check_orthographe, name='check_orthographe'),
]

handler404 = 'documentation.views.custom_404'
handler500 = 'documentation.views.custom_500'