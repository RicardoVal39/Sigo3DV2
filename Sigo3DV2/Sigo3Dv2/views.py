from django.shortcuts import render

from universidad.models import Interfaz
from czml.models import *


# @login_required
def sigo_3d(request):
    array_models = CzmlObject.objects.all()
    array_nodes = Node.objects.all().filter(category_node__context="nodos").order_by('name')
    array_Categories = Category.objects.all().order_by('context','name')
    array_Categories_nodes = Category.objects.all().filter(context="nodos").order_by('context','name')
    array_edges = Edge.objects.all()
    configurate_interface = Interfaz.objects.filter(is_activated=True).first()
    
    context = {
        "user": request.user.is_authenticated,
        "models": array_models,
        "nodes" : array_nodes,
        "edges" : array_edges,
        "categories_nodes" : array_Categories_nodes,
        "categories" : array_Categories,
        "configurate_interface": configurate_interface,
        }
    return render(request, 'Unillanos3D.html', context)
