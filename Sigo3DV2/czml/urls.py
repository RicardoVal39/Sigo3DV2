#from django.contrib import admin
from django.urls import path

from . import views

urlpatterns = [
    path('edit_czml_objects/', views.edit_czml_objects, name="edit_czml_objects"),
    path('edit_nodes/', views.edit_nodes, name="edit_nodes"),
    path('edit_edges/', views.edit_edges, name="edit_edges"),
    path('generate_routes/', views.generate_routes, name="generate_routes"),

]
