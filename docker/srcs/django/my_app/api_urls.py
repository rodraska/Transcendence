# my_app/api_urls.py
from django.urls import path
from .views import (
    current_user, register_user, main_login, send_friend_request,
    accept_friend_request, block_user, get_all_users, get_game_types,
    get_user_by_id, update_user_info, getMatchRecordByUserId
)

urlpatterns = [
    path('current_user/', current_user, name='current_user'),
    path("register/", register_user, name="register_user"),
    path("login/", main_login, name="main_login"),
    path("friend_request/send/", send_friend_request, name="send_friend_request"),
    path("friend_request/accept/", accept_friend_request, name="accept_friend_request"),
    path("friend_request/block/", block_user, name="block_user"),
    path("all-users/", get_all_users, name="all-users"),
    path("game-types/", get_game_types, name="game_types"),
    path("user/<int:user_id>/", get_user_by_id, name="get_user_by_id"),
    path("user/<int:user_id>/update/", update_user_info, name="update_user_info"),
    path("match_record/<int:user_id>/", getMatchRecordByUserId, name="get_match_record_by_user"),
]