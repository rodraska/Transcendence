""" from django.urls import path
from . import views
from .views import home_view, profile_view

urlpatterns = [
    path("", views.index, name="index"),
    path('home/', home_view, name='home'),
    path('profile/', profile_view, name='profile'),
] """
from django.urls import path
from .views import index

urlpatterns = [
    path("", index, name="index"),
]
