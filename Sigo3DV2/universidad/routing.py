from django.urls import path
from .consumers import *

websocket_urlpatterns = [
    path('ws/user/', UserConsumer.as_asgi()),
]

