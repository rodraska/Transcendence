from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings


class CustomUser(AbstractUser):
    avatar_url = models.URLField(blank=True, null=True)


class Relationship(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('blocked', 'Blocked'),
    )
    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="relationships_sent",
        on_delete=models.CASCADE
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="relationships_received",
        on_delete=models.CASCADE
    )
    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('from_user', 'to_user')

    def __str__(self):
        return f"{self.from_user.username} -> {self.to_user.username}: {self.status}"


class GameType(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Matchmaking(models.Model):
    game_type = models.ForeignKey(GameType, on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    match = models.ForeignKey(
        'Match', null=True, blank=True, on_delete=models.SET_NULL)
    won = models.BooleanField(null=True, blank=True)
    started_on = models.DateTimeField(null=True, blank=True)
    ended_on = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Match(models.Model):
    game_type = models.ForeignKey(GameType, on_delete=models.CASCADE)
    player1 = models.ForeignKey(
        CustomUser, related_name="match_player1", on_delete=models.CASCADE)
    player2 = models.ForeignKey(
        CustomUser, related_name="match_player2", on_delete=models.CASCADE)
    winner = models.ForeignKey(
        CustomUser, null=True, blank=True, on_delete=models.SET_NULL)
    started_on = models.DateTimeField(auto_now_add=True)
    ended_on = models.DateTimeField(null=True, blank=True)

class ChatRoom(models.Model):
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.name

class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

class Player(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    game = models.ForeignKey(Match, on_delete=models.SET_NULL, null=True, related_name='players')
    points = models.IntegerField(default=0)
    joined_at = models.DateTimeField(null=True, blank=True)

    #def __str__(self):
        #return self.user.username
    
    class Meta:
        ordering = ['joined_at']

    def join_game(self, game):
        self.game = game
        self.joined_at = timezone.now()
        self.save()

    def leave_game(self):
        self.game = None
        self.joined_at = None
        self.save()
    points_to_win = models.IntegerField(default=10)
    powerups_enabled = models.BooleanField(default=False)
