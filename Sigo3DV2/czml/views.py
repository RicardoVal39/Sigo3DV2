import json
import math
import networkx as nx

from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from universidad.models import Interfaz, Room

from .models import CzmlObject, Node, Edge, Route, Category, RouteNode

@csrf_exempt
def edit_czml_objects(request):
    '''
        Obtener, crear, editar o eliminar objetos CZML, mediante json.
    '''
    if request.method == 'GET':
        objects = CzmlObject.objects.all()
        objects_dict = [obj.to_dict() for obj in objects]
        return JsonResponse({'objects': objects_dict})
    if request.method == 'POST':    
        data = json.loads(request.body)
        if data['function'] == 'search':
            print(data)
            keyword = data['keyword']
            # Filtrar objetos por referencia
            objects = CzmlObject.objects.filter(type_object="Modelo")
            objects_filtered =objects.filter(name__icontains=keyword).order_by('name') if keyword != '' else objects.order_by('name')
            object_ids = set(objects_filtered.values_list('pk', flat=True))

            #Filtrar objetos por nombre
            objectsN = CzmlObject.objects.filter(type_object="Modelo")
            objectsN_filtered =objectsN.filter(name_presentation__icontains=keyword).order_by('name').exclude(pk__in=object_ids) if keyword != '' else objectsN.order_by('name').exclude(pk__in=object_ids)
            object_idsN = set(objectsN_filtered.values_list('pk', flat=True))
            
            rooms = Room.objects.filter(name__icontains=keyword) if keyword != '' else Room.objects.none()
            room_objects = CzmlObject.objects.filter(pk__in=rooms.values_list('object_father', flat=True)).exclude(pk__in=object_ids).exclude(pk__in=object_idsN)
            final_objects = list(objects_filtered) + list(room_objects) + list(objectsN_filtered)
            final_objects = list(set(final_objects))  # Eliminar duplicados
            final_objects = sorted(final_objects, key=lambda x: x.name)  # Ordenar por nombre
            objects_dict = [
                {
                    "id": obj.id_object,
                    "name": obj.name,
                    "name_presentation": obj.name_presentation,
                    "type_object": obj.type_object,
                    "description": obj.description,
                    "is_activated": obj.is_activated,
                    "latitud": obj.location.latitude,
                    "longitud": obj.location.longitude,
                    "altitud": obj.location.altitude,
                    "heading": obj.heading,
                    "pitch": obj.pitch,
                    "roll": obj.roll,
                    "scale": obj.scale,
                    "image_object": obj.image_object.url if obj.image_object else None,
                    "category_object": obj.category_object.name if obj.category_object else None,  
                    "count_rooms": len(Room.objects.filter(object_father=obj.id_object)),
                    "rooms": [
                        {
                            "id": room.id,
                            "name": room.name,
                            "type_room": room.type_room.name if room.type_room else None,
                            "floor": room.floor,
                            "location": {
                                "latitude": room.location.latitude,
                                "longitude": room.location.longitude,
                                "altitude": room.location.altitude
                            } if room.location else None
                        }
                        for room in Room.objects.filter(object_father=obj.id_object)
                    ]
                }
                for obj in final_objects
            ]
            
            return JsonResponse({'objects': objects_dict})
        
        if data['function'] == 'save':
            obj, created = CzmlObject.objects.update_or_create(
                id_object=data['id_object'],
                defaults={
                    'name': data['name'],
                    'type_object': data['type_object'],
                    'is_activated': data['is_activated'],
                    'location': Node.objects.get(pk=data['location'])
                }
            )
            print(created)
            return JsonResponse({'status': 'success', 'created': created, 'message': f'Objeto {obj.name} {"creado" if created else "actualizado"}'})
    if request.method == 'PUT':
        data = json.loads(request.body)
        try:
            obj = CzmlObject.objects.get(id_object=data['pk'])
            location = obj.location
            location.latitude = data['Latitud']
            location.longitude = data['Longitud']
            location.altitude = data['Altitud']
            location.save()
            obj.name = data['Nombre']
            obj.heading = data['Heading']
            obj.pitch = data['Pitch']
            obj.roll = data['Roll']
            obj.scale = data['Scale']
            # obj.is_activated = data['is_activated']
            obj.save()
            return JsonResponse({'status': 'success', 'message': f'Objeto {obj.name} actualizado'})
        except CzmlObject.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Objeto no encontrado'}, status=404)
    if request.method == 'DELETE':
        id_object = json.loads(request.body).get('id_object', None)
        try:
            obj = CzmlObject.objects.get(id_object=id_object)
            obj.delete()
            return JsonResponse({'status': 'success', 'message': f'Objeto {obj.name} eliminado'})
        except CzmlObject.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Objeto no encontrado'}, status=404)

@csrf_exempt
def edit_nodes(request):
    '''
        Obtener, crear, editar o eliminar los nodos.
    '''
    if request.method == 'GET':
        objects = Node.objects.all()
        objects_dict = [obj.to_dict() for obj in objects]
        return JsonResponse({'objects': objects_dict})
        
    if request.method == 'POST':
        data = json.loads(request.body)
        if data['function'] == 'search':
            keyword = data['keyword']
            objects = Node.objects.filter(name__icontains=keyword)
            objects_dict = [obj.to_dict() for obj in objects]
            return JsonResponse({'objects': objects_dict})
        if data['function'] == 'save':
            obj, created = Node.objects.update_or_create(
                pk=data['pk'],
                defaults={
                    'name': data['Nombre'],
                    'category_node': Category.objects.get(pk=data['Categoría']),
                    'latitude': data['Latitud'],
                    'longitude': data['Longitud'],
                    'altitude': data['Altitud'] 
                }
            )
            print(obj)
            return JsonResponse({'status': 'success', 'created': created, 'message': f'Nodo {obj.name} {"creado" if created else "--actualizado"}'})  
    if request.method == 'PUT':
        data = json.loads(request.body)
        obj = Node.objects.get(pk=data['pk'])
        try:
            obj.name = data['Nombre']
            obj.category_node = Category.objects.get(id=data['Categoría'])
            obj.latitude = data['Latitud']
            obj.longitude = data['Longitud']
            obj.altitude = data['Altitud']
            obj.save()
            return JsonResponse({'status': 'success', 'message': f'Nodo {obj.name} actualizado'})
        except Node.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Nodo no encontrado'}, status=404)

    if request.method == 'DELETE':
        try:
            data = json.loads(request.body)    
            node = Node.objects.get(pk=data.get('pk'))
            node.delete()
            return JsonResponse({'status': 'success', 'message': f'Nodo {node.name} eliminado'})
        except Node.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Nodo no encontrado'}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@csrf_exempt
def edit_edges(request):
    if request.method == 'GET':
        objects = Edge.objects.all()
        objects_dict = [obj.to_dict() for obj in objects]
        return JsonResponse({'objects': objects_dict})
    if request.method == 'POST':
        data = json.loads(request.body)
        start_node = Node.objects.get(id=data['Punto_Inicial'])
        end_node = Node.objects.get(id=data['Punto_Final'])
        if not Edge.objects.filter(start_node=end_node,end_node=start_node).exists():
            obj, created = Edge.objects.update_or_create(
                start_node=start_node,
                end_node=end_node,
                defaults={
                    'distance': data['Distancia']
                }
            )
            return JsonResponse({'status': 'success', 'created': created, 'message': f'Camino {obj.start_node.pk} - {obj.end_node.pk} {"creado" if created else "actualizado"}'})
        return JsonResponse({'status': 'success', 'message': f'Camino {obj.start_node} - {obj.end_node} ya existe'})
    if request.method == 'PUT':
        data = json.loads(request.body)
        start_node = data['Punto_Inicial']
        end_node = data['Punto_Final']
        obj = Edge.objects.filter(start_node=start_node, end_node=end_node).first()
        if not obj:
            obj = Edge.objects.filter(start_node=end_node, end_node=start_node).first()
        if obj:    
            obj.distance = data['Distancia']
            obj.save()
            return JsonResponse({'status': 'success', 'message': f'Camino {obj.start_node.pk} - {obj.end_node.pk} actualizado'})
        return JsonResponse({'status': 'error', 'message': 'Camino no encontrado'})
        
    if request.method == 'DELETE':
        print(json.loads(request.body))
        start_node = int(json.loads(request.body).get('Punto_Inicial', None))
        end_node = int(json.loads(request.body).get('Punto_Final', None))
        try:
            obj = Edge.objects.filter(start_node=start_node, end_node=end_node).first()
            if not obj:
                obj = Edge.objects.filter(start_node=end_node, end_node=start_node).first()
            obj.delete()
            return JsonResponse({'status': 'success', 'message': f'Camino {obj.start_node.pk} - {obj.end_node.pk} eliminado'})
        except Edge.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Camino no encontrado'}, status=404)

def create_graph():
    G = nx.Graph()

    nodes = Node.objects.all()
    for node in nodes:
        G.add_node(node.id, pos=(node.latitude, node.longitude))

    edges = Edge.objects.all()
    for edge in edges:
        G.add_edge(edge.start_node.id, edge.end_node.id, weight=edge.distance)
        G.add_edge( edge.end_node.id,edge.start_node.id, weight=edge.distance)

    return G

def generate_routes(request):
    print(request.body)
    data = json.loads(request.body)
    print(data)
    if request.method == 'POST':    
        if data['function'] == 'generate':
            G = create_graph()
            nodes = Node.objects.exclude(category_node__name="Camino")
            node_ids = list(nodes.values_list("id", flat=True))
            
            # Borrar rutas previas
            Route.objects.all().delete()

            done_pairs = set()  # Para evitar duplicados A→B y B→A

            count = 0
            with transaction.atomic():
                for start_node in node_ids:
                    lengths, paths = nx.single_source_dijkstra(G, source=start_node, weight='weight')
                    
                    for end_node, total_distance in lengths.items():
                        if start_node == end_node or end_node not in node_ids:
                            continue

                        pair = tuple(sorted((start_node, end_node)))
                        if pair in done_pairs:
                            continue
                        done_pairs.add(pair)

                        count += 1
                        path = paths[end_node]

                        print(f"Ruta {count}: {start_node} -> {end_node}")
                        print(f"Ruta: {path}, Distancia: {total_distance}")
                        print("_" * 50)

                        # Guardar ruta A → B
                        route_ab = Route.objects.create(
                            start_node_id=start_node,
                            end_node_id=end_node,
                            total_distance=total_distance
                        )
                        for i, node_id in enumerate(path):
                            RouteNode.objects.create(route=route_ab, node_id=node_id, order=i)

                        # Guardar ruta B → A (misma distancia, ruta invertida)
                        route_ba = Route.objects.create(
                            start_node_id=end_node,
                            end_node_id=start_node,
                            total_distance=total_distance
                        )
                        for i, node_id in enumerate(reversed(path)):
                            RouteNode.objects.create(route=route_ba, node_id=node_id, order=i)
            return JsonResponse({'status': 'success'})
        if data['function'] == 'get':
            start_node = Node.objects.get(id = data['start_node'])
            end_node = Node.objects.get(id = data['end_node'])
            route = Route.objects.filter(start_node=start_node, end_node=end_node)
            if route.exists():
                route = route.first()
                path = RouteNode.objects.filter(route=route).order_by('order')
                path_dict = [rnode.node.pk for rnode in path]
                
                return JsonResponse({'path': path_dict})
            else:
                return JsonResponse({'status': 'error', 'message': 'Ruta no encontrada, debes verificar los caminos'}, status=404)
        if data['function'] == 'end_nodes':
            start_node = Node.objects.get(id = data['start_node'])
            routes = Route.objects.filter(start_node=start_node)
            ids_end_nodes = []
            for route in routes:
                if route.end_node.id not in ids_end_nodes:
                    ids_end_nodes.append(route.end_node.id)
            end_nodes = Node.objects.filter(id__in=ids_end_nodes).order_by('name')
            end_nodes_dict = [
                {
                    "pk": node.id,
                    "name": node.name,
                }
                for node in end_nodes
            ]
            return JsonResponse({'nodes': end_nodes_dict})
        if data['function'] == 'start_nodes':
            routes = Route.objects.all()
            ids_start_nodes = []
            for route in routes:
                if route.start_node.pk not in ids_start_nodes:
                    ids_start_nodes.append(route.start_node.pk)
            start_nodes = Node.objects.filter(pk__in=ids_start_nodes).order_by('name')
            start_nodes_dict = [
                {
                    "pk": node.id,
                    "name": node.name,
                }
                for node in start_nodes
            ]
            return JsonResponse({'nodes': start_nodes_dict})              

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)
    
