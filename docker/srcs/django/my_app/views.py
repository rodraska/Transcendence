import json
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_POST
from django.contrib.auth import get_user_model, authenticate, login
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from transcendence.models import Relationship, CustomUser, GameType
from django.db.models import Q

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
