#!/bin/bash

set -e

python3 manage.py migrate --noinput

python3 manage.py collectstatic --noinput

python3 manage.py shell << EOF
import os
from django.contrib.auth import get_user_model
User = get_user_model()
username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
if username and email and password and not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password)
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
if cid and secret:
    app, _ = SocialApp.objects.get_or_create(provider="fortytwo", name="42")
    app.client_id = cid
    app.secret = secret
    app.save()
    app.sites.add(site)
EOF

exec daphne -b 0.0.0.0 -p 8000 transcendence.asgi:application
