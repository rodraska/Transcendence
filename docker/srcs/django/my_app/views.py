from datetime import timedelta, timezone
import json
import os
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_POST
from django.contrib.auth import get_user_model, authenticate, login
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from transcendence.models import Matchmaking, Relationship, CustomUser, GameType, Match
from django.db.models import Q
from django.core.files.storage import default_storage 
from django.core.files.base import ContentFile

def index(request):
    return render(request, "my_index.html")

def current_user(request):
    if request.user.is_authenticated:
        data = {
            "user_id": request.user.id,
            "logged_in": True,
            "username": request.user.username,
            "avatar_url": getattr(request.user, "avatar_url", None),
        }
    else:
        data = {"logged_in": False}
    return JsonResponse(data)

User = get_user_model()

@csrf_exempt
@require_POST
def register_user(request):
    try:
        data = json.loads(request.body)
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        confirm_password = data.get("confirm_password")
        if not all([username, email, password, confirm_password]):
            return JsonResponse({"error": "All fields are required."}, status=400)
        if password != confirm_password:
            return JsonResponse({"error": "Passwords do not match."}, status=400)
        if User.objects.filter(username=username).exists():
            return JsonResponse({"error": "Username already exists."}, status=400)
        if User.objects.filter(email=email).exists():
            return JsonResponse({"error": "Email already exists."}, status=400)
        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()
        return JsonResponse({"message": "User created successfully."}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
@require_POST
def main_login(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "Invalid JSON"}, status=400)
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return JsonResponse({"success": False, "error": "Username and password are required."}, status=400)
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return JsonResponse({"success": True})
    else:
        return JsonResponse({"success": False, "error": "Invalid credentials."}, status=401)

@csrf_exempt
@login_required
def send_friend_request(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST is allowed."}, status=405)
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    to_user_id = data.get("to_user_id")
    if not to_user_id:
        return JsonResponse({"error": "Target user ID is required."}, status=400)
    from_user = request.user
    try:
        to_user = CustomUser.objects.get(pk=to_user_id)
    except CustomUser.DoesNotExist:
        return JsonResponse({"error": "Target user does not exist."}, status=404)
    if Relationship.objects.filter(from_user=from_user, to_user=to_user).exists():
        return JsonResponse({"error": "Friend request already sent."}, status=400)
    Relationship.objects.create(from_user=from_user, to_user=to_user, status="pending")
    return JsonResponse({"message": "Friend request sent."}, status=201)

@csrf_exempt
@login_required
def accept_friend_request(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST is allowed."}, status=405)
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    from_user_id = data.get("from_user_id")
    if not from_user_id:
        return JsonResponse({"error": "Sender user ID is required."}, status=400)
    try:
        relationship = Relationship.objects.get(
            from_user__id=from_user_id,
            to_user=request.user,
            status="pending"
        )
    except Relationship.DoesNotExist:
        return JsonResponse({"error": "No pending request found."}, status=404)
    relationship.status = "accepted"
    relationship.save()
    return JsonResponse({"message": "Friend request accepted."})

@csrf_exempt
@login_required
def decline_friend_request(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST is allowed."}, status=405)
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    from_user_id = data.get("from_user_id")
    if not from_user_id:
        return JsonResponse({"error": "Sender user ID is required."}, status=400)
    try:
        relationship = Relationship.objects.get(
            from_user_id=from_user_id,
            to_user=request.user,
            status="pending"
        )
    except Relationship.DoesNotExist:
        return JsonResponse({"error": "No pending request found."}, status=404)
    relationship.delete()
    return JsonResponse({"message": "Friend request declined."})

@csrf_exempt
@login_required
def cancel_friend_request(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST is allowed."}, status=405)
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    to_user_id = data.get("to_user_id")
    if not to_user_id:
        return JsonResponse({"error": "Target user ID is required."}, status=400)
    try:
        relationship = Relationship.objects.get(
            from_user=request.user,
            to_user_id=to_user_id,
            status="pending"
        )
    except Relationship.DoesNotExist:
        return JsonResponse({"error": "No pending request found."}, status=404)
    relationship.delete()
    return JsonResponse({"message": "Friend request cancelled."})

@csrf_exempt
@login_required
def unfriend(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST is allowed."}, status=405)
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    user_id = data.get("user_id")
    if not user_id:
        return JsonResponse({"error": "User ID is required."}, status=400)
    try:
        relationship = Relationship.objects.get(
            (Q(from_user=request.user, to_user_id=user_id) | Q(from_user_id=user_id, to_user=request.user)),
            status="accepted"
        )
    except Relationship.DoesNotExist:
        return JsonResponse({"error": "No friendship found."}, status=404)
    relationship.delete()
    return JsonResponse({"message": "Friendship ended."})

@csrf_exempt
@login_required
def reject_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST is allowed."}, status=405)
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    target_user_id = data.get("target_user_id")
    if not target_user_id:
        return JsonResponse({"error": "Target user ID is required."}, status=400)
    from_user = request.user
    try:
        relationship = Relationship.objects.filter(from_user=from_user, to_user_id=target_user_id).first()
        if relationship:
            relationship.status = "rejected"
            relationship.save()
        else:
            to_user = CustomUser.objects.get(pk=target_user_id)
            Relationship.objects.create(from_user=from_user, to_user=to_user, status="rejected")
    except CustomUser.DoesNotExist:
        return JsonResponse({"error": "Target user does not exist."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"message": "User rejected."})

@csrf_exempt
@login_required
def block_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST is allowed."}, status=405)
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    target_user_id = data.get("target_user_id")
    if not target_user_id:
        return JsonResponse({"error": "Target user ID is required."}, status=400)
    from_user = request.user
    try:
        relationship = Relationship.objects.filter(from_user=from_user, to_user__id=target_user_id).first()
        if relationship:
            relationship.status = "blocked"
            relationship.save()
        else:
            to_user = CustomUser.objects.get(pk=target_user_id)
            Relationship.objects.create(from_user=from_user, to_user=to_user, status="blocked")
    except CustomUser.DoesNotExist:
        return JsonResponse({"error": "Target user does not exist."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"message": "User blocked."})


@csrf_exempt
@login_required
def get_all_users(request):
    if request.method != "GET":
        return JsonResponse({"error": "Only GET is allowed."}, status=405)
    target_user_id = request.GET.get("target_user_id")
    if not target_user_id:
        return JsonResponse({"error": "Target user ID is required."}, status=400)
    try:
        target_id = int(target_user_id)
        users_qs = CustomUser.objects.exclude(id=target_id)
        users = list(users_qs.values("id", "username", "avatar_url"))
        relationships = Relationship.objects.filter(Q(from_user_id=target_id) | Q(to_user_id=target_id))
        relationship_map = {}
        for rel in relationships:
            if rel.status == "accepted":
                if rel.from_user_id == target_id:
                    relationship_map[rel.to_user_id] = {"status": "accepted", "direction": "accepted"}
                elif rel.to_user_id == target_id:
                    relationship_map[rel.from_user_id] = {"status": "accepted", "direction": "accepted"}
            else:
                if rel.from_user_id == target_id:
                    relationship_map[rel.to_user_id] = {"status": rel.status, "direction": "sent"}
                elif rel.to_user_id == target_id:
                    relationship_map[rel.from_user_id] = {"status": rel.status, "direction": "received"}
        for user in users:
            user["relationship"] = relationship_map.get(user["id"])
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse(users, safe=False)

@csrf_exempt
@login_required
def get_game_types(request):
    if request.method != "GET":
        return JsonResponse({"error": "Only GET is allowed."}, status=405)
    try:
        data = GameType.objects
        data_parsed = list(data.values("id", "name"))
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse(data_parsed, safe=False)

@csrf_exempt
@login_required
def search_for_match(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed."}, status=405)

    try:
        data = json.loads(request.body)
        game_type_id = data.get("game_type_id")
        user = request.user

        if not game_type_id:
            return JsonResponse({"error": "Game type is required."}, status=400)

        game_type = GameType.objects.get(id=game_type_id)

        # Check if user is already in queue
        if Matchmaking.objects.filter(user=user, match__isnull=True).exists():
            return JsonResponse({"error": "You are already searching for a match."}, status=400)

        # Insert user into matchmaking
        Matchmaking.objects.create(game_type=game_type, user=user)
        
        return JsonResponse({"message": "Searching for match..."})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    
def find_match():
    matchmaking_entries = Matchmaking.objects.filter(match__isnull=True).order_by("created_at")

    for entry in matchmaking_entries:
        potential_match = Matchmaking.objects.filter(
            match__isnull=True,
            game_type__in=[entry.game_type.id, 3]
        ).exclude(user=entry.user).first()

        if potential_match:
            match = Match.objects.create(
                game_type=entry.game_type,
                player1=entry.user,
                player2=potential_match.user
            )

            entry.match = match
            entry.started_on = timezone.now()
            entry.save()

            potential_match.match = match
            potential_match.started_on = timezone.now()
            potential_match.save()

            return match

    return None

@csrf_exempt
@login_required
def search_for_match(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed."}, status=405)

    try:
        data = json.loads(request.body)
        game_type_id = data.get("game_type_id")
        user = request.user

        if not game_type_id:
            return JsonResponse({"error": "Game type is required."}, status=400)

        game_type = GameType.objects.get(id=game_type_id)

        if Matchmaking.objects.filter(user=user, match__isnull=True).exists():
            return JsonResponse({"error": "You are already searching for a match."}, status=400)

        Matchmaking.objects.create(game_type=game_type, user=user)
        
        return JsonResponse({"message": "Searching for match..."})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    
def cleanup_stale_entries():
    timeout = timezone.now() - timedelta(minutes=5)
    Matchmaking.objects.filter(match__isnull=True, created_at__lt=timeout).delete()

@csrf_exempt
@login_required
def get_user_by_id(request, user_id):
    if request.method != "GET":
        return JsonResponse({"error": "Only GET is allowed."}, status=405)
    try:
        user = CustomUser.objects.get(pk=user_id)
    except CustomUser.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)
    
    data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "avatar_url": user.avatar_url,
    }
    return JsonResponse(data)

""" @csrf_exempt
@login_required
def update_user_info(request, user_id):
    if request.method not in ["PUT", "PATCH"]:
        return JsonResponse({"error": "Only PUT/PATCH is allowed."}, status=405)
    if request.user.id != user_id:
        return JsonResponse({"error": "You cannot update another user's information."}, status=403)
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    
    if "email" in data:
        request.user.email = data["email"]
    if "first_name" in data:
        request.user.first_name = data["first_name"]
    if "last_name" in data:
        request.user.last_name = data["last_name"]
    if "avatar_url" in data:
        request.user.avatar_url = data["avatar_url"]
    
    try:
        request.user.save()
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    
    return JsonResponse({"message": "User updated successfully."}) """

@csrf_exempt
@login_required
def update_user_info(request, user_id):
    if request.method not in ["PUT", "PATCH"]:
        return JsonResponse({"error": "Only PUT/PATCH is allowed."}, status=405)
    if request.user.id != user_id:
        return JsonResponse({"error": "You cannot update another user's information."}, status=403)
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    
    if "email" in data:
        request.user.email = data["email"]
    if "first_name" in data:
        request.user.first_name = data["first_name"]
    if "last_name" in data:
        request.user.last_name = data["last_name"]
    
    try:
        request.user.save()
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    
    return JsonResponse({"message": "User updated successfully."})


@csrf_exempt
@login_required
def update_avatar(request, user_id):
    user = request.user

    if request.method == "POST":
        if "avatar_url" in request.POST:
            # O usuário selecionou um avatar da lista
            avatar_url = request.POST["avatar_url"]
            user.avatar_url = avatar_url
            user.save()
            return JsonResponse({"avatar_url": avatar_url})

        elif "avatar" in request.FILES:
            # O usuário fez upload de um arquivo
            avatar = request.FILES["avatar"]
            avatar_filename = f"{user.username}_{avatar.name}"
            avatar_path = os.path.join("staticfiles", "avatars", avatar_filename)

            # Salvar o arquivo
            saved_path = default_storage.save(avatar_path, ContentFile(avatar.read()))
            avatar_url = f"/static/avatars/{avatar_filename}"  # Gera a URL da imagem

            # Atualizar no perfil do usuário
            user.avatar_url = avatar_url
            user.save()

            return JsonResponse({"avatar_url": avatar_url})

    return JsonResponse({"error": "Nenhum avatar enviado ou selecionado."}, status=400)


@csrf_exempt
@login_required
def getMatchRecordByUserId(request, user_id):
    if request.method != "GET":
        return JsonResponse({"error": "Only GET is allowed."}, status=405)
    try:
        user = CustomUser.objects.get(pk=user_id)
    except CustomUser.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)
    matches = Match.objects.filter(Q(player1=user) | Q(player2=user)).select_related(
        "game_type", "player1", "player2", "winner"
    )
    record = []
    for m in matches:
        record.append({
            "match_id": m.id,
            "game_type": m.game_type.name,
            "player1": m.player1.username,
            "player2": m.player2.username,
            "winner": m.winner.username if m.winner else None,
            "started_on": m.started_on,
            "ended_on": m.ended_on,
        })
    return JsonResponse({"matches": record}, safe=False)