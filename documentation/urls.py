# documentation/urls.py
from django.conf.urls import handler404, handler500
from documentation import views
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjetViewSet, ModuleViewSet, RubriqueViewSet, login_view, logout_view

router = DefaultRouter()
router.register(r'projets', ProjetViewSet)
router.register(r'modules', ModuleViewSet)
router.register(r'rubriques', RubriqueViewSet)

urlpatterns = [
    path('', include(router.urls)),  # Inclut les routes de RubriqueViewSet
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
]

handler404 = 'documentation.views.custom_404'
handler500 = 'documentation.views.custom_500'