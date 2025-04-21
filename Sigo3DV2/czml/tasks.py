
from asgiref.sync import async_to_sync
from celery import shared_task
from channels.layers import get_channel_layer

from django.conf import settings

from .models import Edge, Node, Route, RouteNode
import networkx as nx

@shared_task
def generate_routes_with_progress(group_name):
    print("Starting route generation...")
    G = nx.Graph()
    nodes = Node.objects.all()
    for node in nodes:
        G.add_node(node.id, pos=(node.latitude, node.longitude))

    edges = Edge.objects.all()
    for edge in edges:
        G.add_edge(edge.start_node.id, edge.end_node.id, weight=edge.distance)
        G.add_edge( edge.end_node.id,edge.start_node.id, weight=edge.distance)

    nodes = list(Node.objects.exclude(category_node__name="Camino").values_list("id", flat=True))
    total_routes = len(nodes) ** 2
    count = 0
    Route.objects.all().delete()
    
    for start_node in nodes:
        for end_node in nodes:
            if start_node != end_node:
                try:
                    path = nx.dijkstra_path(G, source=start_node, target=end_node, weight='weight')
                    total_distance = nx.dijkstra_path_length(G, source=start_node, target=end_node, weight='weight')
                    route = Route.objects.create(
                        start_node_id=start_node,
                        end_node_id=end_node,
                        total_distance=total_distance
                    )
                    for i, node_id in enumerate(path):
                        RouteNode.objects.create(
                            route=route,
                            node_id=node_id,
                            order=i
                        )
                    count += 1
                    progress = (count / total_routes) * 100
                    print(f"Progress: {progress}%")
                    
                    channel_layer = get_channel_layer()
                    
                    async_to_sync(channel_layer.group_send)(
                        group_name,
                        {
                            'type': 'send_progress',
                            'progress': progress
                        }
                    )

                except nx.NetworkXNoPath:
                    continue
    print("All routes generated successfully.")
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            'type': 'send_progress',
            'progress': 100,
            'status': 'done'
        }
    )