from allauth.socialaccount.providers.oauth2.provider import OAuth2Provider

class FortyTwoProvider(OAuth2Provider):
    id = "fortytwo"
    name = "42"
    account_class = None  # Atualize com sua classe de conta, se necessário

    @property
    def oauth2_adapter_class(self):
        # Importação dinâmica para evitar ciclos
        from .views import FortyTwoOAuth2Adapter
        return FortyTwoOAuth2Adapter

    def get_default_scope(self):
        return ["public"]

    def extract_uid(self, data):
        return str(data["id"])

    def extract_common_fields(self, data):
        return {
            "username": data["login"],
            "first_name": data["first_name"],
            "last_name": data["last_name"],
            "email": data["email"],
            "avatar_url": data.get('image', {}).get('link', ''), 
        }
