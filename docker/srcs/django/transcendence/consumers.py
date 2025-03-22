from transcendence.models import Matchmaking, Match, CustomUser, GameType, ChatRoom, Message
from datetime import timedelta
from datetime import datetime
from django.utils import timezone
from channels.db import database_sync_to_async
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.apps import apps
import random
import logging

logger = logging.getLogger(__name__)

apps.check_apps_ready()


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
            await self.cleanup_stale_entries_async()

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
                await self.handle_error("No match found. Please try again.", redirect="/play")

        elif action == "forfeit":
            result = await self.give_up_match()
            if result.get("error"):
                await self.handle_error(result["message"], redirect="/play")
            else:
                await self.send(text_data=json.dumps(result))

    async def match_found(self, event):
        await self.send(text_data=json.dumps({
            "match_found": True,
            "match_id": event["match_id"],
            "player1": event["player1"],
            "player2": event["player2"],
        }))

    @database_sync_to_async
    def find_match(self, game_type_id):
        game_type = GameType.objects.get(id=game_type_id)
        matchmaking_entry = Matchmaking.objects.create(
            user=self.user, game_type=game_type)

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
        Matchmaking.objects.filter(
            match__isnull=True, created_at__lt=timeout).delete()

    @database_sync_to_async
    def get_active_match(self):
        return (
            Match.objects.select_related('player1', 'player2')
            .filter(player1=self.user, ended_on__isnull=True).first()
            or
            Match.objects.select_related('player1', 'player2')
            .filter(player2=self.user, ended_on__isnull=True).first()
        )

    @database_sync_to_async
    def delete_matchmaking_entry(self, match):
        Matchmaking.objects.filter(user=self.user, match=match).delete()

    @database_sync_to_async
    def save_match(self, match):
        match.save()

    async def give_up_match(self):
        try:
            match = await self.get_active_match()
            if match:
                opponent = match.player1 if match.player2 == self.user else match.player2
                match.ended_on = timezone.now()
                match.winner = opponent
                await self.save_match(match)
                await self.delete_matchmaking_entry(match)
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "opponent_forfeited",
                        "forfeiter_name": self.user.username,
                        "opponent_name": opponent.username,
                    }
                )
                return {"success": True, "message": f"You forfeited. {opponent.username} wins."}
            else:
                return {"error": True, "message": "Match not properly set. Redirecting to play."}
        except Exception as e:
            return {"error": True, "message": f"Error: {str(e)}"}

    async def opponent_forfeited(self, event):
        if self.user.username == event["forfeiter_name"]:
            return
        await self.send(text_data=json.dumps({
            "event": "match_forfeited",
            "message": f"{event['forfeiter_name']} forfeited. You win!",
        }))

    async def handle_error(self, message, redirect="/play"):
        """
        Encapsulated error handler. Sends an error message to the client with
        instructions (like redirecting back to the play component).
        """
        await self.send(text_data=json.dumps({
            "error": True,
            "message": message,
            "redirect": redirect
        }))

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("ChatConsumer connect")
        self.room_id = '42'
        self.room_group_name = f'chat_{self.room_id}'
        self.user = self.scope["user"]

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        messages = await self.get_messages()
        for message in messages:
            await self.send(text_data=json.dumps({
                'message': message['content'],
                'user': message['username'],
                'timestamp': message['timestamp']
            }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        logger.error('chat receive')
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json['message']

            if not message.strip():
                return
    
            username = self.scope["user"].username 
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            try:
                await self.save_message(message)
            except Exception as e:
                logger.error(f"Error saving message: {e}")

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'user': username,
                    'timestamp': timestamp
                }
            )
        except Exception as e:
            logger.error(f"Error in receive: {e}")

    async def chat_message(self, event):
        logger.error('chat chatmessage')
        message = event['message']
        user = event['user']
        timestamp = event['timestamp']

        await self.send(text_data=json.dumps({
            'message': message,
            'user': user,
            'timestamp': timestamp
        }))

    @database_sync_to_async
    def save_message(self, message):
        room = ChatRoom.objects.get(id=self.room_id)
        Message.objects.create(room=room, sender=self.user, content=message)

    @database_sync_to_async
    def get_messages(self):
        room = ChatRoom.objects.get(id=self.room_id)
        messages = room.messages.order_by('timestamp')[:50]
        return [
            {
                'content': message.content,
                'username': message.sender.username,
                'timestamp': message.timestamp.strftime("%Y-%m-%d %H:%M:%S")
            }
            for message in messages
        ]

class PongConsumer(AsyncWebsocketConsumer):
    connected_players = {}

    async def connect(self):
        self.game_id = '24'
        self.room_group_name = f'pong_{self.game_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        self.player_number = await self.get_next_player_number()

        if self.player_number > 0:
            await self.send(text_data=json.dumps({
                'type': 'player_assign',
                'player_number': self.player_number
            }))
        
        if self.player_number == 2:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_ready'
                }
            )

    async def disconnect(self, close_code):
        if hasattr(self, 'game_id') and self.player_number > 0:
            if self.game_id in self.connected_players:
                self.connected_players.pop(self.game_id, None)

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def get_next_player_number(self):
        if self.game_id not in self.connected_players:
            self.connected_players[self.game_id] = 1
            return 1
    
        elif self.connected_players[self.game_id] == 1:
            self.connected_players[self.game_id] = 2
            return 2
        
        return 0

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'paddle_position':
            player = data.get('player')
            position = data.get('position')

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'paddle_position',
                    'player': player,
                    'position': position
                }
            )
        
        elif message_type == 'game_control':
            action = data.get('action')
    
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_control',
                    'action': action
                }
            )

        elif message_type == 'ball_update':
            position = data.get('position')
            velocity = data.get('velocity')
    
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'ball_update',
                    'position': position,
                    'velocity': velocity
                }
            )
        
        elif message_type == 'score_update':
            signal = data.get('signal')
            p1_score = data.get('p1_score')
            p2_score = data.get('p2_score')
    
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'score_update',
                    'signal': signal,
                    'p1_score': p1_score,
                    'p2_score': p2_score
                }
        )
    
    async def paddle_position(self, event):
        await self.send(text_data=json.dumps({
            'type': 'paddle_position',
            'player': event['player'],
            'position': event['position']
        }))

    async def game_control(self, event):
        action = event.get('action')
    
        await self.send(text_data=json.dumps({
            'type': 'game_control',
            'action': action
        }))

    async def ball_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'ball_update',
            'position': event['position'],
                'velocity': event['velocity']
        }))

    async def score_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'score_update',
            'signal': event['signal'],
            'p1_score': event['p1_score'],
            'p2_score': event['p2_score']
        }))

    async def player_assign(self, event):
        await self.send(text_data=json.dumps({
            'type': 'player_assign',
            'player_number': event['player_number']
        }))

    async def game_ready(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_ready'
        }))

class CurveConsumer(AsyncWebsocketConsumer):
    connected_players = {}

    async def connect(self):
        self.game_id = '48'
        self.room_group_name = f'curve_{self.game_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        self.player_number = await self.get_next_player_number()

        if self.player_number > 0:
            await self.send(text_data=json.dumps({
                'type': 'player_assign',
                'player_number': self.player_number
            }))
        
        if self.player_number == 2:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_ready'
                }
            )
    
    async def disconnect(self, close_code):
        if hasattr(self, 'game_id') and self.player_number > 0:
            if self.game_id in self.connected_players:
                self.connected_players.pop(self.game_id, None)

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def get_next_player_number(self):
        if self.game_id not in self.connected_players:
            self.connected_players[self.game_id] = 1
            return 1
    
        elif self.connected_players[self.game_id] == 1:
            self.connected_players[self.game_id] = 2
            return 2
        
        return 0

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'player_state':
            player = data.get('player')

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'player_state',
                    'player': player
                }
            )
        
        elif message_type == 'new_power':
            power = data.get('power')

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'new_power',
                    'power': power
                }
            )

        elif message_type == 'game_control':
            action = data.get('action')
    
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_control',
                    'action': action
                }
            )

    async def player_state(self, event):
        await self.send(text_data=json.dumps({
            'type': 'player_state',
            'player': event['player']
        }))

    async def new_power(self, event):
        await self.send(text_data=json.dumps({
            'type': 'new_power',
            'power': event['power']
        }))

    async def game_control(self, event):
        action = event.get('action')
    
        await self.send(text_data=json.dumps({
            'type': 'game_control',
            'action': action
        }))

    async def player_assign(self, event):
        await self.send(text_data=json.dumps({
            'type': 'player_assign',
            'player_number': event['player_number']
        }))

    async def game_ready(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_ready'
        }))
