# my_app/api_urls.py
from django.urls import path
from .views import current_user, register_user, main_login, send_friend_request, accept_friend_request, decline_friend_request, unfriend, block_user, cancel_friend_request, get_all_users, get_game_types

urlpatterns = [
    path('current_user/', current_user, name='current_user'),
	path("register/", register_user, name="register_user"),
	path("login/", main_login, name="main_login"),
	path("friend_request/send/", send_friend_request, name="send_friend_request"),
    path("friend_request/accept/", accept_friend_request, name="accept_friend_request"),
    path("friend_request/decline/", decline_friend_request, name="decline_friend_request"),
    path("friend_request/cancel/", cancel_friend_request, name="cancel_friend_request"),
    path("friend_request/unfriend/", unfriend, name="unfriend"),
    path("friend_request/block/", block_user, name="block_user"),
	path("all-users/", get_all_users, name="all-users"),
	path("game-types/", get_game_types, name="game_types"),
]
