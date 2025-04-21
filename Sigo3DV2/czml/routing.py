from django.urls import path

from czml import consumers


websocket_urlpatterns = [
    path('ws/route_progress/', consumers.ProgressConsumer.as_asgi()),
]