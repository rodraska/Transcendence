import json
import random
from datetime import timedelta
from django.utils import timezone
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.apps import apps
from transcendence.models import Matchmaking, Match, CustomUser, GameType

apps.check_apps_ready()


@database_sync_to_async
def get_match_info(match_id):
    """
    Synchronously retrieve all the required match information.
    This ensures that related model lookups occur in a synchronous context.
    """
    match = Match.objects.get(id=match_id)
    return {
        "match_id": match.id,
        "player1": match.player1.username,
        "player2": match.player2.username,
        "powerups_enabled": match.powerups_enabled,
        "points_to_win": match.points_to_win,
    }


@database_sync_to_async
def process_forfeit(user):
    """
    Process a forfeit for the given user.
    Finds the active match (if any), determines the opponent,
    updates the match (ending it and setting the winner),
    deletes any matchmaking entries, and returns messages for both players.
    """
    # Look for an active match where the user is player1.
    m = Match.objects.filter(player1=user, ended_on__isnull=True).first()
    if not m:
        # If not, check if the user is player2.
        m = Match.objects.filter(player2=user, ended_on__isnull=True).first()
    if m:
        # Determine opponent
        if m.player1 == user:
            opp = m.player2
        else:
            opp = m.player1

        m.ended_on = timezone.now()
        m.winner = opp
        m.save()

        # Delete any associated matchmaking entries.
        Matchmaking.objects.filter(user=user, match=m).delete()

        return {
            "match_id": m.id,
            "forfeiter": user.username,
            "opponent": opp.username,
            "msg_for_forfeiter": f"You forfeited. {opp.username} wins.",
            "msg_for_opponent": f"{user.username} forfeited. You win!",
        }
    return None


class MatchmakingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_anonymous:
            await self.close()
            return
        await self.accept()
        self.user = self.scope["user"]
        self.room_group_name = "matchmaking_lobby"
        # Join both the global lobby and a personal group for direct invites.
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.channel_layer.group_add(f"user_{self.user.username}", self.channel_name)
        await self.cleanup_stale_entries_async()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        await self.channel_layer.group_discard(f"user_{self.user.username}", self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get("action")
        if action == "join":
            game_type_id = data.get("game_type_id")
            await self.cleanup_stale_entries_async()
            match = await self.find_match(game_type_id)
            if match:
                match_info = await get_match_info(match.id)
                # Notify both players that a match has been found.
                for username in [match_info["player1"], match_info["player2"]]:
                    await self.channel_layer.group_send(
                        f"user_{username}",
                        {
                            "type": "match_found",
                            **match_info,
                        }
                    )
            else:
                await self.handle_error("No match found. Please try again.")
        elif action == "create_custom":
            opp_name = data.get("opponent_username")
            game_type_id = data.get("game_type_id")
            pts = data.get("points_to_win", 10)
            pwr = data.get("powerups_enabled", False)
            if not opp_name:
                await self.handle_error("No opponent specified.")
                return
            try:
                selected_type = await database_sync_to_async(GameType.objects.get)(id=game_type_id)
                opp_user = await database_sync_to_async(CustomUser.objects.get)(username=opp_name)
                match = await self.create_custom_match(selected_type, opp_user, pts, pwr)
                # Send a custom invite event to the opponent’s personal group.
                await self.channel_layer.group_send(
                    f"user_{opp_user.username}",
                    {
                        "type": "custom_invite",
                        "match_id": match.id,
                        "player1": self.user.username,
                        "game_type": selected_type.name,
                        "points_to_win": pts,
                        "powerups_enabled": pwr,
                    }
                )
                # Inform the creator that the invite is pending.
                await self.send(json.dumps({
                    "waiting_invite": True,
                    "message": "Waiting for opponent to accept invitation..."
                }))
            except CustomUser.DoesNotExist:
                await self.handle_error(f"User '{opp_name}' not found.")
            except GameType.DoesNotExist:
                await self.handle_error(f"No GameType with ID={game_type_id}.")
        elif action == "accept_invite":
            match_id = data.get("match_id")
            match = await self.accept_custom_match(match_id)
            if match:
                match_info = await get_match_info(match.id)
                # Notify both players that the match has been accepted.
                for username in [match_info["player1"], match_info["player2"]]:
                    await self.channel_layer.group_send(
                        f"user_{username}",
                        {
                            "type": "match_accepted",
                            **match_info,
                        }
                    )
            else:
                await self.handle_error("Match not found or already accepted.")
        elif action == "forfeit":
            result = await process_forfeit(self.user)
            if result is None:
                await self.handle_error("Match not set.")
            else:
                # Broadcast forfeiture message to both players.
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
                # Optionally return success.
                await self.send(json.dumps({
                    "success": True,
                    "message": result["msg_for_forfeiter"],
                }))
        elif action == "cancel_search":
            # Optionally handle canceling a search.
            await self.handle_error("Cancel search not implemented.")

    async def custom_invite(self, event):
        # This event is sent to the opponent for a custom game invite.
        await self.send(json.dumps({
            "custom_invite": True,
            "match_id": event["match_id"],
            "player1": event["player1"],
            "game_type": event["game_type"],
            "points_to_win": event["points_to_win"],
            "powerups_enabled": event["powerups_enabled"],
        }))

    async def match_found(self, event):
        await self.send(json.dumps({
            "match_found": True,
            **event,
        }))

    async def match_accepted(self, event):
        # Send a dedicated event so the client can auto-redirect.
        await self.send(json.dumps({
            "match_accepted": True,
            **event,
        }))

    async def match_forfeited(self, event):
        # Broadcast a forfeiture message to the client.
        await self.send(json.dumps({
            "event": "match_forfeited",
            "message": event["message"],
        }))

    @database_sync_to_async
    def create_custom_match(self, gtype, opp_user, pts, pwr):
        m = Match.objects.create(
            game_type=gtype,
            player1=self.user,
            player2=opp_user
        )
        m.points_to_win = pts
        m.powerups_enabled = pwr
        m.save()
        return m

    @database_sync_to_async
    def find_match(self, game_type_id):
        gt = GameType.objects.get(id=game_type_id)
        me = Matchmaking.objects.create(user=self.user, game_type=gt)
        pm = Matchmaking.objects.filter(
            game_type=gt, match__isnull=True
        ).exclude(user=self.user).first()
        if not pm and game_type_id != 3:
            pm = Matchmaking.objects.filter(
                game_type_id=3, match__isnull=True
            ).exclude(user=self.user).first()
        if pm and game_type_id == 3 and pm.game_type.id == 3:
            chosen = random.choice([1, 2])
            gt = GameType.objects.get(id=chosen)
        if pm:
            match = Match.objects.create(
                game_type=gt, player1=self.user, player2=pm.user
            )
            me.match = match
            me.game_type = gt
            me.save()
            pm.match = match
            pm.game_type = gt
            pm.save()
            return match
        return None

    @database_sync_to_async
    def accept_custom_match(self, match_id):
        try:
            match = Match.objects.get(id=match_id)
            # Optionally update match status here.
            return match
        except Match.DoesNotExist:
            return None

    @database_sync_to_async
    def cleanup_stale_entries_async(self):
        t = timezone.now() - timedelta(minutes=5)
        Matchmaking.objects.filter(
            match__isnull=True, created_at__lt=t).delete()

    @database_sync_to_async
    def get_active_match(self):
        m = Match.objects.filter(
            player1=self.user, ended_on__isnull=True
        ).first()
        if not m:
            m = Match.objects.filter(
                player2=self.user, ended_on__isnull=True
            ).first()
        return m

    @database_sync_to_async
    def delete_matchmaking_entry(self, match):
        Matchmaking.objects.filter(user=self.user, match=match).delete()

    @database_sync_to_async
    def save_match(self, match):
        match.save()

    async def handle_error(self, msg):
        await self.send(json.dumps({
            "error": True,
            "message": msg
        }))
