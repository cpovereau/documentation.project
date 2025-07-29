from django.contrib import admin
from django.urls import path, include

# URL patterns for the documentation project
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
    path('', include('documentation.urls')),
]