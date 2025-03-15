from django.urls import re_path
from transcendence.consumers import MatchmakingConsumer

websocket_urlpatterns = [
    re_path(r"ws/matchmaking/$", MatchmakingConsumer.as_asgi()),
]
