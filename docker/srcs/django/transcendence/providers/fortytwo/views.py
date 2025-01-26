from allauth.socialaccount.providers.oauth2.views import (
    OAuth2Adapter,
    OAuth2LoginView,
    OAuth2CallbackView,
)
from .provider import FortyTwoProvider  # Static import, assuming no circular dependency
import requests
import logging

logger = logging.getLogger(__name__)


class FortyTwoOAuth2Adapter(OAuth2Adapter):
    provider_id = FortyTwoProvider.id  # Reference the provider's `id` dynamically
    access_token_url = "https://api.intra.42.fr/oauth/token"
    authorize_url = "https://api.intra.42.fr/oauth/authorize"
    profile_url = "https://api.intra.42.fr/v2/me"

    def complete_login(self, request, app, token, **kwargs):
        # Fetch user profile data from 42 API
        headers = {"Authorization": f"Bearer {token.token}"}
        resp = requests.get(self.profile_url, headers=headers)
        resp.raise_for_status()  # Ensure proper error handling for HTTP errors
        extra_data = resp.json()

        # Use provider to create social login instance
        return self.get_provider().sociallogin_from_response(request, extra_data)


# Register OAuth2 views for login and callback
oauth2_login = OAuth2LoginView.adapter_view(FortyTwoOAuth2Adapter)
oauth2_callback = OAuth2CallbackView.adapter_view(FortyTwoOAuth2Adapter)
