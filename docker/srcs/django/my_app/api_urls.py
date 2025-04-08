# my_app/api_urls.py
from django.urls import path
from .views import (
    current_user, get_tournaments, register_user, main_login, save_tournament_result, send_friend_request,
    accept_friend_request, decline_friend_request, unfriend, block_user, cancel_friend_request, get_all_users, get_game_types,
    get_user_by_id, update_user_info, getMatchRecordByUserId, update_avatar
)

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
    path("user/<int:user_id>/", get_user_by_id, name="get_user_by_id"),
    path("user/<int:user_id>/update/", update_user_info, name="update_user_info"),
    path("match_record/<int:user_id>/", getMatchRecordByUserId, name="get_match_record_by_user"),
    path("user/<int:user_id>/update_avatar/", update_avatar, name="update_avatar"),
    path("save_tournament_result/", save_tournament_result, name="save_tournament_result"),
    path("get_tournaments/", get_tournaments, name="get_tournaments"),
]
