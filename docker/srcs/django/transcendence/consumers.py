import json
import random
from datetime import timedelta
from django.utils import timezone
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.apps import apps
from transcendence.models import Matchmaking, Match, CustomUser, GameType, Relationship

apps.check_apps_ready()


class MatchmakingConsumer(AsyncWebsocketConsumer):
    pending_data = {}

    @database_sync_to_async
    def cleanup_stale_entries(self):
        t = timezone.now() - timedelta(minutes=5)
        Matchmaking.objects.filter(
            match__isnull=True, created_at__lt=t).delete()

    @database_sync_to_async
    def remove_waiting_entry(self, user):
        qs = Matchmaking.objects.filter(user=user, match__isnull=True)
        count = qs.count()
        qs.delete()
        return count > 0

    @database_sync_to_async
    def process_forfeit(self, user):
        m = Match.objects.filter(player1=user, ended_on__isnull=True).first()
        if not m:
            m = Match.objects.filter(
                player2=user, ended_on__isnull=True).first()
        if m:
            if m.player1 == user:
                opp = m.player2
            else:
                opp = m.player1
            m.ended_on = timezone.now()
            m.winner = opp
            m.result = "forfeit"
            m.save()
            Matchmaking.objects.filter(user=user, match=m).delete()
            return {
                "match_id": m.id,
                "forfeiter": user.username,
                "opponent": opp.username,
                "msg_for_forfeiter": f"You forfeited. {opp.username} wins.",
                "msg_for_opponent": f"{user.username} forfeited. You win!",
            }
        return None

    @database_sync_to_async
    def get_active_match(self, user):
        m = Match.objects.filter(player1=user, ended_on__isnull=True).first()
        if not m:
            m = Match.objects.filter(
                player2=user, ended_on__isnull=True).first()
        return m

    @database_sync_to_async
    def create_match_in_db(self, gtype, p1, p2, pts, pwr):
        return Match.objects.create(
            game_type=gtype,
            player1=p1,
            player2=p2,
            points_to_win=pts,
            powerups_enabled=pwr
        )

    @database_sync_to_async
    def get_user_by_name(self, username):
        return CustomUser.objects.get(username=username)

    @database_sync_to_async
    def get_game_type_by_id(self, gid):
        return GameType.objects.get(id=gid)

    @database_sync_to_async
    def create_pending_id(self):
        return f"pending_{random.randint(100000,999999)}"

    @database_sync_to_async
    def add_to_queue_sync(self, gid):
        g = GameType.objects.get(id=gid)
        Matchmaking.objects.create(user=self.user, game_type=g)
        p = Matchmaking.objects.filter(
            game_type_id=gid, match__isnull=True).exclude(user=self.user).first()
        if p:
            pid = f"pending_{random.randint(100000,999999)}"
            users = [self.user.username, p.user.username]
            self.pending_data[pid] = {
                "p1": users[0],
                "p2": users[1],
                "game_type": gid,
                "points": 10,
                "powerups": False,
                "confirmed": set(),
            }
            Matchmaking.objects.filter(
                user=self.user, match__isnull=True).delete()
            Matchmaking.objects.filter(
                user=p.user, match__isnull=True).delete()
            return {"pending_id": pid, "users": users}
        return None

    @database_sync_to_async
    def create_relationship_in_db(self, from_user, to_user_id):
        try:
            to_user = CustomUser.objects.get(pk=to_user_id)
        except CustomUser.DoesNotExist:
            return False, "Target user does not exist."
        if Relationship.objects.filter(from_user=from_user, to_user=to_user).exists():
            return False, "Friend request already sent."
        Relationship.objects.create(
            from_user=from_user, to_user=to_user, status="pending")
        return True, "Friend request sent."

    @database_sync_to_async
    def set_user_online(self, user):
        user.is_online = True
        user.save(update_fields=["is_online"])

    @database_sync_to_async
    def set_user_offline(self, user):
        user.is_online = False
        user.save(update_fields=["is_online"])

    async def add_to_queue(self, gid):
        return await self.add_to_queue_sync(gid)

    async def connect(self):
        if self.scope["user"].is_anonymous:
            await self.close()
            return
        self.user = self.scope["user"]
        await self.accept()
        await self.channel_layer.group_add(f"user_{self.user.username}", self.channel_name)
        await self.set_user_online(self.user)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(f"user_{self.user.username}", self.channel_name)
        await self.set_user_offline(self.user)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get("action")

        if action == "queue":
            gid = data.get("game_type_id")
            await self.cleanup_stale_entries()
            found = await self.add_to_queue(gid)
            if found:
                for u in found["users"]:
                    await self.channel_layer.group_send(
                        f"user_{u}",
                        {
                            "type": "match_found",
                            "pending_id": found["pending_id"],
                            "player1": found["users"][0],
                            "player2": found["users"][1],
                        }
                    )
            else:
                await self.send(json.dumps({"waiting": True, "message": "Searching for a match..."}))

        elif action == "cancel_search":
            active = await self.get_active_match(self.user)
            if active:
                result = await self.process_forfeit(self.user)
                if result is None:
                    await self.send(json.dumps({"error": True, "message": "Match not set."}))
                else:
                    await self.channel_layer.group_send(
                        f"user_{self.user.username}",
                        {"type": "match_forfeited",
                            "message": result["msg_for_forfeiter"]}
                    )
                    await self.channel_layer.group_send(
                        f"user_{result['opponent']}",
                        {"type": "match_forfeited",
                            "message": result["msg_for_opponent"]}
                    )
                    await self.send(json.dumps({"success": True, "message": "Match cancelled."}))
            else:
                cancelled = await self.remove_waiting_entry(self.user)
                if cancelled:
                    await self.send(json.dumps({"success": True, "message": "Match cancelled."}))
                else:
                    await self.send(json.dumps({"error": True, "message": "No search to cancel."}))

        elif action == "invite_custom":
            opp_name = data.get("opponent_username")
            gid = data.get("game_type_id")
            pts = data.get("points_to_win", 10)
            pwr = data.get("powerups_enabled", False)
            if not opp_name:
                await self.send(json.dumps({"error": True, "message": "No opponent specified."}))
                return
            try:
                user_opp = await self.get_user_by_name(opp_name)
                gtype = await self.get_game_type_by_id(gid)
                pid = await self.create_pending_id()
                self.pending_data[pid] = {
                    "p1": self.user.username,
                    "p2": user_opp.username,
                    "game_type": gtype.id,
                    "points": pts,
                    "powerups": pwr,
                    "confirmed": set(),
                }
                await self.channel_layer.group_send(
                    f"user_{user_opp.username}",
                    {
                        "type": "custom_invite",
                        "pending_id": pid,
                        "player1": self.user.username,
                        "game_type": gtype.name,
                        "points_to_win": pts,
                        "powerups_enabled": pwr,
                    }
                )
                await self.send(json.dumps({
                    "waiting_invite": True,
                    "message": "Waiting for opponent...",
                    "pending_id": pid
                }))
            except CustomUser.DoesNotExist:
                await self.send(json.dumps({"error": True, "message": f"User '{opp_name}' not found."}))
            except GameType.DoesNotExist:
                await self.send(json.dumps({"error": True, "message": f"No GameType with ID={gid}."}))

        elif action == "confirm_match":
            pid = data.get("pending_id")
            if not pid or pid not in self.pending_data:
                await self.send(json.dumps({"error": True, "message": "Invalid pending match."}))
                return
            self.pending_data[pid]["confirmed"].add(self.user.username)
            if len(self.pending_data[pid]["confirmed"]) == 1:
                await self.channel_layer.group_send(
                    f"user_{self.user.username}",
                    {
                        "type": "waiting_confirm",
                        "message": "Waiting for the other user to confirm..."
                    }
                )
            elif len(self.pending_data[pid]["confirmed"]) == 2:
                p1 = self.pending_data[pid]["p1"]
                p2 = self.pending_data[pid]["p2"]
                g = await self.get_game_type_by_id(self.pending_data[pid]["game_type"])
                pts = self.pending_data[pid]["points"]
                pwr = self.pending_data[pid]["powerups"]
                user1 = await self.get_user_by_name(p1)
                user2 = await self.get_user_by_name(p2)
                match = await self.create_match_in_db(g, user1, user2, pts, pwr)
                await self.channel_layer.group_send(
                    f"user_{p1}",
                    {
                        "type": "match_start",
                        "match_id": match.id,
                        "player1": p1,
                        "player2": p2,
                        "powerups_enabled": match.powerups_enabled,
                        "points_to_win": match.points_to_win,
                    }
                )
                await self.channel_layer.group_send(
                    f"user_{p2}",
                    {
                        "type": "match_start",
                        "match_id": match.id,
                        "player1": p1,
                        "player2": p2,
                        "powerups_enabled": match.powerups_enabled,
                        "points_to_win": match.points_to_win,
                    }
                )
                del self.pending_data[pid]

        elif action == "cancel_pending":
            pid = data.get("pending_id")
            if not pid or pid not in self.pending_data:
                await self.send(json.dumps({"error": True, "message": "Invalid pending match."}))
                return
            p1 = self.pending_data[pid]["p1"]
            p2 = self.pending_data[pid]["p2"]
            if self.user.username not in [p1, p2]:
                await self.send(json.dumps({"error": True, "message": "Not in this match."}))
                return
            await self.channel_layer.group_send(
                f"user_{p1}",
                {
                    "type": "match_cancelled",
                    "message": f"{self.user.username} cancelled the match.",
                }
            )
            await self.channel_layer.group_send(
                f"user_{p2}",
                {
                    "type": "match_cancelled",
                    "message": f"{self.user.username} cancelled the match.",
                }
            )
            if pid in self.pending_data:
                del self.pending_data[pid]

        elif action == "decline_pending":
            pid = data.get("pending_id")
            if not pid or pid not in self.pending_data:
                await self.send(json.dumps({"error": True, "message": "Invalid pending match."}))
                return
            p1 = self.pending_data[pid]["p1"]
            p2 = self.pending_data[pid]["p2"]
            if self.user.username not in [p1, p2]:
                await self.send(json.dumps({"error": True, "message": "Not in this match."}))
                return
            inviter = p1 if self.user.username != p1 else p2
            await self.channel_layer.group_send(
                f"user_{inviter}",
                {
                    "type": "invite_declined",
                    "message": f"{self.user.username} declined your invitation.",
                }
            )
            del self.pending_data[pid]
            await self.send(json.dumps({"success": True, "message": "Invitation declined."}))

        elif action == "forfeit":
            result = await self.process_forfeit(self.user)
            if result is None:
                await self.send(json.dumps({"error": True, "message": "Match not set."}))
            else:
                await self.channel_layer.group_send(
                    f"user_{self.user.username}",
                    {
                        "type": "match_forfeited",
                        "message": result["msg_for_forfeiter"],
                    }
                )
                await self.channel_layer.group_send(
                    f"user_{result['opponent']}",
                    {
                        "type": "match_forfeited",
                        "message": result["msg_for_opponent"],
                    }
                )
                await self.send(json.dumps({
                    "success": True,
                    "message": result["msg_for_forfeiter"]
                }))

        elif action == "send_friend_request":
            to_user_id = data.get("to_user_id")
            if not to_user_id:
                await self.send(json.dumps({"error": True, "message": "No target_user_id provided."}))
                return
            success, msg = await self.create_relationship_in_db(self.user, to_user_id)
            if success:
                try:
                    to_user = await database_sync_to_async(CustomUser.objects.get)(pk=to_user_id)
                except CustomUser.DoesNotExist:
                    await self.send(json.dumps({"error": True, "message": "Target user missing."}))
                    return

                await self.channel_layer.group_send(
                    f"user_{to_user.username}",
                    {
                        "type": "friend_request_event",
                        "from_username": self.user.username
                    }
                )
                await self.send(json.dumps({"success": True, "message": msg}))
            else:
                await self.send(json.dumps({"error": True, "message": msg}))

        else:
            await self.send(json.dumps({"error": True, "message": "Invalid action."}))

    async def match_found(self, event):
        await self.send(json.dumps({
            "match_found": True,
            "pending_id": event["pending_id"],
            "player1": event["player1"],
            "player2": event["player2"],
        }))

    async def custom_invite(self, event):
        await self.send(json.dumps({
            "custom_invite": True,
            "pending_id": event["pending_id"],
            "player1": event["player1"],
            "game_type": event["game_type"],
            "points_to_win": event["points_to_win"],
            "powerups_enabled": event["powerups_enabled"],
        }))

    async def match_start(self, event):
        await self.send(json.dumps({
            "match_start": True,
            "match_id": event["match_id"],
            "player1": event["player1"],
            "player2": event["player2"],
            "powerups_enabled": event["powerups_enabled"],
            "points_to_win": event["points_to_win"],
        }))

    async def waiting_confirm(self, event):
        await self.send(json.dumps({
            "waiting_confirm": True,
            "message": event["message"],
        }))

    async def invite_declined(self, event):
        await self.send(json.dumps({
            "invite_declined": True,
            "message": event["message"],
        }))

    async def match_cancelled(self, event):
        await self.send(json.dumps({
            "event": "match_cancelled",
            "message": event["message"],
        }))

    async def match_forfeited(self, event):
        await self.send(json.dumps({
            "event": "match_forfeited",
            "message": event["message"],
        }))

    async def friend_request_event(self, event):
        await self.send(json.dumps({
            "friend_request": True,
            "from_username": event["from_username"]
        }))
