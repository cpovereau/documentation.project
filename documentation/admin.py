from django.contrib import admin
from .models import Projet, Module, Rubrique, Map, Media

admin.site.register(Projet)
admin.site.register(Module)
admin.site.register(Rubrique)
admin.site.register(Map)
admin.site.register(Media)