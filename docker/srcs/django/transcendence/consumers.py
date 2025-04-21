import json
import random
import logging
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
                "points": 3,
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
                game_type = g.name
                await self.channel_layer.group_send(
                    f"user_{p1}",
                    {
                        "type": "match_start",
                        "match_id": match.id,
                        "player1": p1,
                        "player2": p2,
                        "powerups_enabled": match.powerups_enabled,
                        "points_to_win": match.points_to_win,
                        "game_type": game_type,
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
                        "game_type": game_type,
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
            "game_type": event["game_type"]
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

@database_sync_to_async
def process_game_end(match_id, winner_username, score):
    """
    Process a normal game end with a winner.
    Updates the match (ending it and setting the winner),
    and returns messages for both players.
    """
    m = Match.objects.get(id=match_id, ended_on__isnull=True)
    
    # Find the winner user object
    winner = CustomUser.objects.get(username=winner_username)
    
    # Determine the loser
    if m.player1 == winner:
        loser = m.player2
    else:
        loser = m.player1
        
    # Update match record
    m.ended_on = timezone.now()
    m.winner = winner
    m.result = score
    m.save()
    
    # Clean up any matchmaking entries
    Matchmaking.objects.filter(match=m).delete()
    
    return {
        "match_id": m.id,
        "winner": winner.username,
        "loser": loser.username,
        "msg_for_winner": f"Congratulations! You won against {loser.username}.",
        "msg_for_loser": f"Game over. {winner.username} won this match.",
        "final_score": m.final_score if hasattr(m, 'final_score') else None
    }

class PongConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.room_group_name = f'pong_{self.game_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        print(f"New client {self}")
        logging.info("New client %s %s", self, self.scope)

    async def disconnect(self, close_code):
        logging.info("losing %s %s", self, self.scope)
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        logging.info("removed from group %s", self)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'player_disconnect',
            }
        )
        logging.info("sent disconnect packet %s", self)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'player_disconnect':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'player_disconnect',
                }
            )

        elif message_type == 'paddle_position':
            player = data.get('player')
            position = data.get('position')

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'paddle_position',
                    'player': player,
                    'position': position,
                    'sender_channel_name': self.channel_name
                }
            )
        
        elif message_type == 'game_control':
            action = data.get('action')
            player_number = data.get('player_number')
    
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_control',
                    'action': action,
                    'player_number': player_number
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
                    'velocity': velocity,
                    'sender_channel_name': self.channel_name
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

        elif message_type == 'match_data':
            match_data = data.get('match_data')

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'match_data',
                    'match_data': match_data,
                    'sender_channel_name': self.channel_name
                }
            )

        elif message_type == 'game_over':
            winner_username = data.get('winner')
            match_id = data.get('match_id')
            score = data.get('score')
            result = await process_game_end(match_id, winner_username, score)

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_over',
                    'result': result
                }
            )
    
    async def player_disconnect(self, event):
        await self.send(text_data=json.dumps({
            'type': 'player_disconnect'
        }))
    
    async def paddle_position(self, event):
        if self.channel_name != event.get('sender_channel_name'):
            await self.send(text_data=json.dumps({
                'type': 'paddle_position',
                'player': event['player'],
                'position': event['position']
            }))

    async def game_control(self, event):
        action = event.get('action')
        player_number = event.get('player_number')

        await self.send(text_data=json.dumps({
            'type': 'game_control',
            'action': action,
            'player_number': player_number
        }))

    async def ball_update(self, event):
        if self.channel_name != event.get('sender_channel_name'):
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

    async def match_data(self, event):
        if self.channel_name != event.get('sender_channel_name'):
            await self.send(text_data=json.dumps({
                'type': 'match_data',
                'match_data': event['match_data']
            }))

    async def game_over(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_over',
            'result': event['result']
        }))

class CurveConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.room_group_name = f'curve_{self.game_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
    
    async def disconnect(self, close_code):

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'player_disconnect',
            }
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'player_disconnect':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'player_disconnect',
                }
            )

        if message_type == 'player_state':
            player = data.get('player')

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'player_state',
                    'player': player,
                    'sender_channel_name': self.channel_name
                }
            )

        elif message_type == 'pick_others':
            power_id = data.get('power_id')

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'pick_others',
                    'power_id': power_id,
                    'sender_channel_name': self.channel_name
                }
            )

        elif message_type == 'pick_general':

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'pick_general'
                }
            )

        elif message_type == 'game_powers':
            powers = data.get('powers')

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_powers',
                    'powers': powers
                }
            )

        elif message_type == 'collision':
            player_id = data.get('player_id')

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'collision',
                    'player_id': player_id,
                    'sender_channel_name': self.channel_name
                }
            )

        elif message_type == 'game_control':
            action = data.get('action')
            player_number = data.get('player_number')
    
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_control',
                    'action': action,
                    'player_number': player_number
                }
            )
        
        elif message_type == 'match_data':
            match_data = data.get('match_data')

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'match_data',
                    'match_data': match_data,
                    'sender_channel_name': self.channel_name
                }
            )

        elif message_type == 'game_over':
            winner_username = data.get('winner')
            match_id = data.get('match_id')
            score = data.get('score')
            result = await process_game_end(match_id, winner_username, score)

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_over',
                    'result': result
                }
            )

    async def player_disconnect(self, event):
        await self.send(text_data=json.dumps({
            'type': 'player_disconnect'
        }))
    

    async def player_state(self, event):
        if self.channel_name != event.get('sender_channel_name'):
            await self.send(text_data=json.dumps({
                'type': 'player_state',
                'player': event['player']
            }))

    async def pick_others(self, event):
        if self.channel_name != event.get('sender_channel_name'):
            await self.send(text_data=json.dumps({
                'type': 'pick_others',
                'power_id': event['power_id']
            }))

    async def pick_general(self, event):
        await self.send(text_data=json.dumps({
            'type': 'pick_general'
        }))

    async def collision(self, event):
        if self.channel_name != event.get('sender_channel_name'):
            await self.send(text_data=json.dumps({
                'type': 'collision',
                'player_id': event['player_id']
            }))
    
    async def game_powers(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_powers',
            'powers': event['powers']
        }))

    async def game_control(self, event):
        action = event.get('action')
        player_number = event.get('player_number')
    
        await self.send(text_data=json.dumps({
            'type': 'game_control',
            'action': action,
            'player_number': player_number
        }))

    async def match_data(self, event):
        if self.channel_name != event.get('sender_channel_name'):
            await self.send(text_data=json.dumps({
                'type': 'match_data',
                'match_data': event['match_data']
            }))

    async def game_over(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_over',
            'result': event['result']
        }))
