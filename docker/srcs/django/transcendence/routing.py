from django.urls import re_path
from transcendence.consumers import MatchmakingConsumer
from transcendence.consumers import ChatConsumer
from transcendence.consumers import PongConsumer
from transcendence.consumers import CurveConsumer

websocket_urlpatterns = [
    re_path(r"ws/matchmaking/$", MatchmakingConsumer.as_asgi()),
    re_path(r'ws/chat_room/$', ChatConsumer.as_asgi()),
    re_path(r'ws/pong_game/$', PongConsumer.as_asgi()),
    re_path(r'ws/curve_lobby/$', CurveConsumer.as_asgi()),
    re_path(r'ws/curve_game/$', CurveConsumer.as_asgi()),
]
