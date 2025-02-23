import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "transcendence.settings")
django.setup()  # Ensure Django is initialized before Channels loads

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from transcendence.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
