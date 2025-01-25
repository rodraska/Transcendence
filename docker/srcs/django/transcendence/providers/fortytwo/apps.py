from django.apps import AppConfig


class FortyTwoConfig(AppConfig):
    name = "transcendence.providers.fortytwo"
    label = "fortytwo_provider"

    def ready(self):
        from allauth.socialaccount.providers import registry
        from .provider import FortyTwoProvider
        registry.register(FortyTwoProvider)
