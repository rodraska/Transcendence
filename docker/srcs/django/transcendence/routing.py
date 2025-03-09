from django.urls import re_path
from transcendence.consumers import MatchmakingConsumer
from transcendence.consumers import ChatConsumer
from transcendence.consumers import CurveConsumer

websocket_urlpatterns = [
    re_path(r"ws/matchmaking/$", consumers.MatchmakingConsumer.as_asgi()),
    re_path(r'ws/chat_room/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/curve_lobby/$', consumers.CurveConsumer.as_asgi()),
    re_path(r'ws/curve_game/$', consumers.CurveConsumer.as_asgi()),
]
