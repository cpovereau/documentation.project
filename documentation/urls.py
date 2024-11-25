# documentation/urls.py
from django.conf.urls import handler404, handler500
from documentation import views
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GammeViewSet, ProjetViewSet, RubriqueViewSet, login_view, logout_view, CreateProjectAPIView, get_project_details

router = DefaultRouter()
router.register(r'gammes', GammeViewSet)
router.register(r'projets', ProjetViewSet)
router.register(r'rubriques', RubriqueViewSet)

urlpatterns = [
    path('', include(router.urls)),  # Inclut les routes de RubriqueViewSet
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('projet/create/', CreateProjectAPIView.as_view(), name='create_project_api'),
    path('projets/<int:pk>/details/', get_project_details, name='project_details'),
]

handler404 = 'documentation.views.custom_404'
handler500 = 'documentation.views.custom_500'