from django.urls import re_path
from transcendence.consumers import MatchmakingConsumer
from transcendence.consumers import PongConsumer

websocket_urlpatterns = [
    re_path(r"ws/matchmaking/$", MatchmakingConsumer.as_asgi()),
    re_path(r'ws/pong_game/(?P<game_id>\d+)/$', PongConsumer.as_asgi()),
]
