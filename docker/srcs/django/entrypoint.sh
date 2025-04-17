#!/bin/bash

set -e

python3 manage.py migrate --noinput

python3 manage.py collectstatic --noinput

python3 manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin')
EOF

python3 manage.py shell << EOF
from django.conf import settings
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp
from transcendence.models import GameType

INTENDED_SITE_ID = 1
INTENDED_DOMAIN = "localhost:8000"
INTENDED_NAME = "localhost:8000"

conflicting = Site.objects.filter(domain=INTENDED_DOMAIN).exclude(id=INTENDED_SITE_ID)
if conflicting.exists():
    conflicting.delete()

try:
    site = Site.objects.get(id=INTENDED_SITE_ID)
    site.domain = INTENDED_DOMAIN
    site.name = INTENDED_NAME
    site.save()
except Site.DoesNotExist:
    site = Site(id=INTENDED_SITE_ID, domain=INTENDED_DOMAIN, name=INTENDED_NAME)
    site.save()

GameType.objects.get_or_create(name="Pong")
GameType.objects.get_or_create(name="Curve")

cid = "$OAUTH42_CLIENT_ID"
secret = "$OAUTH42_SECRET"
print("DEBUG: OAUTH 42 cid=", repr(cid), "secret=", repr(secret))
if cid and secret:
    app, _ = SocialApp.objects.get_or_create(provider="fortytwo", name="42")
    app.client_id = cid
    app.secret = secret
    app.save()
    app.sites.add(site)
EOF

exec daphne -b 0.0.0.0 -p 8000 transcendence.asgi:application
