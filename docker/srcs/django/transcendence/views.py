from django.shortcuts import render
from django.contrib.auth.decorators import login_required

def home(request):
    return render(request, 'index.html')

@login_required
def dashboard(request):
    return render(request, 'dashboard.html', {'avatar_url': request.user.avatar_url})