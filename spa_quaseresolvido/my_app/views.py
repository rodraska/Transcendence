from django.shortcuts import render

# Create your views here.
def index(request):
    return render(request, "index.html")

""" def home_view(request):
    return render(request, 'header.html')

def home_view(request):
    return render(request, 'home.html')

def profile_view(request):
    return render(request, 'profile.html')

def playgame_view(request):
    return render(request, 'play_games.html')

from django.shortcuts import render

def index(request):
    return render(request, 'index.html') """
