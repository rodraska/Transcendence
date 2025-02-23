from datetime import timedelta, timezone
from channels.db import database_sync_to_async
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.apps import apps
import random

apps.check_apps_ready()

from transcendence.models import Matchmaking, Match, CustomUser, GameType

class MatchmakingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_anonymous:
            await self.close()
        else:
            await self.accept()
            self.user = self.scope["user"]
            self.room_group_name = "matchmaking_lobby"
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            print(f"User {self.user} connected to matchmaking.")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        print(f"User {self.user} disconnected from matchmaking.")

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get("action")
        game_type_id = data.get("game_type_id")

        if action == "join":
            await self.cleanup_stale_entries_async()
            match = await self.find_match(game_type_id)
            if match:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "match_found",
                        "match_id": match.id,
                        "player1": match.player1.username,
                        "player2": match.player2.username,
                    }
                )
            else:
                await self.send(text_data=json.dumps({"match_found": False}))

        elif action == "forfeit":
            result = await self.give_up_match()
            await self.send(text_data=json.dumps(result))

    async def match_found(self, event):
        """Send match details to all players in the room."""
        await self.send(text_data=json.dumps({
            "match_found": True,
            "match_id": event["match_id"],
            "player1": event["player1"],
            "player2": event["player2"],
        }))


@database_sync_to_async
def find_match(self, game_type_id):
    """Finds a suitable match for the player and ensures they get a valid game type."""
    game_type = GameType.objects.get(id=game_type_id)
    matchmaking_entry = Matchmaking.objects.create(user=self.user, game_type=game_type)

    potential_match = Matchmaking.objects.filter(
        game_type=game_type,
        match__isnull=True
    ).exclude(user=self.user).first()

    if not potential_match and game_type_id != 3:
        potential_match = Matchmaking.objects.filter(
            game_type_id=3,
            match__isnull=True
        ).exclude(user=self.user).first()

    if potential_match and game_type_id == 3 and potential_match.game_type.id == 3:
        chosen_game_type = random.choice([1, 2])
        game_type = GameType.objects.get(id=chosen_game_type)

    if potential_match:
        match = Match.objects.create(
            game_type=game_type,
            player1=self.user,
            player2=potential_match.user
        )
        matchmaking_entry.match = match
        matchmaking_entry.game_type = game_type
        matchmaking_entry.save()

        potential_match.match = match
        potential_match.game_type = game_type
        potential_match.save()
        
        return match

    return None

@database_sync_to_async
def cleanup_stale_entries_async(self):
		timeout = timezone.now() - timedelta(minutes=5)
		Matchmaking.objects.filter(match__isnull=True, created_at__lt=timeout).delete()
          
@database_sync_to_async
def give_up_match(self):
	"""Allows a user to forfeit their match, declares opponent as winner."""
	try:
		match = Match.objects.filter(player1=self.user, ended_on__isnull=True).first() or \
				Match.objects.filter(player2=self.user, ended_on__isnull=True).first()

		if match:
			opponent = match.player1 if match.player2 == self.user else match.player2
			match.ended_on = timezone.now()
			match.winner = opponent
			match.save()

			Matchmaking.objects.filter(user=self.user, match=match).delete()

			opponent_room = f"matchmaking_{opponent.id}"
			self.channel_layer.group_send(
				opponent_room,
				{
					"type": "match_forfeited",
					"message": f"{self.user.username} forfeited. You win!"
				}
			)

			return {"success": True, "message": f"You forfeited. {opponent.username} wins."}
		else:
			return {"success": False, "message": "No active match found."}

	except Exception as e:
		return {"success": False, "message": f"Error: {str(e)}"}