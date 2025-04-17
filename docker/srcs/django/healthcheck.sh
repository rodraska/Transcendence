#!/bin/bash
set -e

python manage.py shell <<EOF
from django.conf import settings
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp
from transcendence.models import GameType
import sys

required_games = {"Pong", "Curve"}
existing_games = set(GameType.objects.values_list('name', flat=True))
if not required_games.issubset(existing_games):
    sys.exit(1)

if not Site.objects.filter(id=settings.SITE_ID).exists():
    sys.exit(1)

try:
    app = SocialApp.objects.get(provider='fortytwo')
except SocialApp.DoesNotExist:
    sys.exit(1)

if not app.sites.filter(id=settings.SITE_ID).exists():
    sys.exit(1)

sys.exit(0)
EOF