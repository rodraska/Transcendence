# transcendence/adapter.py

from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
import logging

logger = logging.getLogger(__name__)

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def save_user(self, request, sociallogin, form=None):
        user = super().save_user(request, sociallogin, form)
        extra_data = sociallogin.account.extra_data

        # Extract avatar_url from the nested 'image' object
        avatar_url = extra_data.get('image', {}).get('link', '')

        if avatar_url:
            user.avatar_url = avatar_url
            user.save(update_fields=['avatar_url'])
        else:
            logger.debug(f"No avatar_url found for user {user.username}.")

        return user
