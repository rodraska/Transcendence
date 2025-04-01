Below is one possible way to organize **Bootstrap Toast** notifications in your app and replace all the raw `alert(...)` calls with them. After that, you’ll see an example of how to extend your **friend management** to use your existing **WebSocket** approach for real-time updates (including friend requests, status changes, etc.).

---

## 1. Create a General Toast Utility

First, set up a **toast manager** utility. You could create a file like `toast.js` (or `toastManager.js`) in your `/spa` or `/components` folder:

```js
// toast.js
let toastContainer = null;

/**
 * Creates or returns a toast container <div id="toast-container" ...>
 */
function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    // Position the toast container (for instance, top-right corner)
    toastContainer.style.position = "fixed";
    toastContainer.style.top = "1rem";
    toastContainer.style.right = "1rem";
    toastContainer.style.zIndex = 9999;
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

/**
 * Show a Bootstrap-like toast message.
 * @param {string} message - The message to display.
 * @param {string} [type='info'] - Bootstrap color scheme: 'info', 'success', 'warning', 'danger'
 * @param {string} [title=''] - Optional heading for the toast.
 */
export function showToast(message, type = "info", title = "") {
  const container = getToastContainer();

  // Create the toast DOM
  const toast = document.createElement("div");
  toast.classList.add(
    "toast",
    "show", // Make sure it’s initially visible
    "align-items-center",
    "border-0",
    `bg-${type}`,
    "text-white"
  );
  toast.style.minWidth = "250px";
  toast.style.marginBottom = "0.5rem";
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");

  // Optional: Add fade effect by toggling classes with JS if you want
  // (Though standard Toast with Bootstrap 5 might need initialization in JS.)

  const toastBody = document.createElement("div");
  toastBody.classList.add("d-flex", "p-3");

  // Title/Message HTML
  let contentHTML = "";
  if (title) {
    contentHTML += `<strong class="me-auto">${title}</strong><br/>`;
  }
  contentHTML += `<span>${message}</span>`;

  toastBody.innerHTML = contentHTML;

  // Dismiss button
  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.classList.add("btn-close", "btn-close-white", "me-2", "m-auto");
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.addEventListener("click", () => {
    toast.remove();
  });
  toastBody.appendChild(closeBtn);

  toast.appendChild(toastBody);
  container.appendChild(toast);

  // Auto-remove after a few seconds (if desired)
  setTimeout(() => {
    toast.remove();
  }, 5000);
}
```

Then, include this new file in your **HTML** (or import it in your JS modules wherever needed).

### Replacing `alert` with `showToast`

Wherever you have `alert("Some error")`, simply do:

```js
import { showToast } from "../path/to/toast.js";

// ...
showToast(`Error: ${d.message}`, "danger");
```

Or:

```js
showToast("Match canceled.", "warning", "Heads Up!");
```

…and so on, using `info`, `success`, `warning`, or `danger`.

---

## 2. Update Your `Play.js` to Use Toasts

Here’s your original `Play.js` with the **alerts** replaced by **showToast**. (Focus on the lines where `alert(...)` was replaced.)

```js
import Component from "../spa/component.js";
import Route from "../spa/route.js";
import { getOrCreateSocket } from "../index.js";
// Import toast
import { showToast } from "../components/toast.js";

function forceCloseModal(modalInstance) {
  if (modalInstance) modalInstance.hide();
  document.body.classList.remove("modal-open");
  const backdrop = document.querySelector(".modal-backdrop");
  if (backdrop) backdrop.remove();
}

class Play extends Component {
  constructor() {
    super("static/html/play.html");
    this.isSearching = false;
    this.modalInstance = null;
    this.customModalInstance = null;
    this.inviteModalInstance = null; // for custom game invites
  }

  async onInit() {
    this.gameTypesContainer = this.querySelector("#game-types");
    this.searchingIndicator = this.querySelector("#searching-indicator");
    this.cancelSearchBtn = this.querySelector("#cancel-search-btn");
    this.matchFoundModal = this.querySelector("#matchFoundModal");
    this.matchInfoText = this.querySelector("#match-info");
    this.enterMatchBtn = this.querySelector("#enter-match-btn");
    this.cancelMatchBtn = this.querySelector("#cancel-match-btn");
    this.customGameBtn = this.querySelector("#custom-game-btn");
    this.customModal = this.querySelector("#customGameModal");
    this.customOpponentSelect = this.querySelector("#custom-opponent");
    this.customPowerupsSwitch = this.querySelector("#custom-powerups");
    this.customPointsInput = this.querySelector("#custom-points");
    this.customCreateBtn = this.querySelector("#custom-create-btn");
    this.customGameTypeSelect = this.querySelector("#custom-game-type");
    // Invite modal elements
    this.inviteModal = this.querySelector("#inviteModal");
    this.inviteInfoText = this.querySelector("#invite-info");
    this.acceptInviteBtn = this.querySelector("#accept-invite-btn");
    this.declineInviteBtn = this.querySelector("#decline-invite-btn");

    this.cancelSearchBtn.addEventListener("click", () => this.cancelSearch());
    this.enterMatchBtn.addEventListener("click", () => this.enterMatch());
    this.cancelMatchBtn.addEventListener("click", () => this.cancelMatch());
    this.customGameBtn.addEventListener("click", () =>
      this.openCustomGameModal()
    );
    this.customCreateBtn.addEventListener("click", () =>
      this.createCustomGame()
    );
    // Invite modal event listeners
    this.acceptInviteBtn.addEventListener("click", () => this.acceptInvite());
    this.declineInviteBtn.addEventListener("click", () => this.declineInvite());

    this.modalInstance = new bootstrap.Modal(this.matchFoundModal, {
      backdrop: "static",
    });
    this.customModalInstance = new bootstrap.Modal(this.customModal);
    this.inviteModalInstance = new bootstrap.Modal(this.inviteModal, {
      backdrop: "static",
    });

    await this.fetchGameTypes();
    this.socket = getOrCreateSocket();
    this.setupSocketMessages();
    await this.populateOpponentSelect();
  }

  setupSocketMessages() {
    this.socket.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.match_found) {
        // This branch is used when a normal (auto-matched) game is found.
        this.matchInfoText.textContent = `Found Match #${d.match_id}: ${d.player1} vs ${d.player2}.`;
        window.currentMatchData = {
          matchId: d.match_id,
          player1: d.player1,
          player2: d.player2,
          powerups_enabled: d.powerups_enabled,
          points_to_win: d.points_to_win,
        };
        this.modalInstance.show();
      } else if (d.waiting_invite) {
        // Instead of an alert, show a toast and update the searching UI
        showToast(d.message, "info", "Custom Game");
        this.searchingIndicator.textContent = d.message;
        this.showSearchingUI(true);
      } else if (d.custom_invite) {
        // For the invitee: show the custom game invitation modal.
        this.inviteInfoText.textContent = `${d.player1} has invited you to a custom match (${d.game_type}, Points: ${d.points_to_win}, Powerups: ${d.powerups_enabled ? "On" : "Off"}). Do you accept?`;
        window.currentMatchData = {
          matchId: d.match_id,
          player1: d.player1,
          player2: window.loggedInUserName,
          powerups_enabled: d.powerups_enabled,
          points_to_win: d.points_to_win,
        };
        this.inviteModalInstance.show();
      } else if (d.match_accepted) {
        // On acceptance, auto-redirect both players.
        window.currentMatchData = {
          matchId: d.match_id,
          player1: d.player1,
          player2: d.player2,
        };
        Route.go("/active-match");
      } else if (d.error) {
        // Replaced alert with toast
        showToast(`Error: ${d.message}`, "danger");
      } else if (d.event === "match_forfeited") {
        showToast(d.message, "warning");
        forceCloseModal(this.modalInstance);
        window.currentMatchData = null;
        Route.go("/play");
      }
    };
  }

  async fetchGameTypes() {
    try {
      const r = await fetch("/api/game-types/", { credentials: "include" });
      if (!r.ok) throw new Error();
      const data = await r.json();
      this.renderGameTypes(data);
    } catch {
      this.gameTypesContainer.textContent = "Failed to load game types.";
    }
  }

  renderGameTypes(types) {
    this.gameTypesContainer.innerHTML = "";
    types.forEach((t) => {
      const btn = document.createElement("button");
      btn.textContent = t.name;
      btn.classList.add("btn", "btn-primary", "m-2");
      btn.addEventListener("click", () => this.searchForMatch(t));
      this.gameTypesContainer.appendChild(btn);
    });
  }

  async populateOpponentSelect() {
    try {
      const r = await fetch(
        `/api/all-users/?target_user_id=${window.loggedInUserId}`,
        { credentials: "include" }
      );
      const users = await r.json();
      this.customOpponentSelect.innerHTML =
        '<option value="" disabled selected>-- Select an Opponent --</option>';
      users.forEach((u) => {
        const opt = document.createElement("option");
        opt.value = u.username;
        opt.textContent = u.username;
        this.customOpponentSelect.appendChild(opt);
      });
    } catch (err) {
      console.error("Failed fetching opponents:", err);
    }
  }

  searchForMatch(t) {
    if (this.isSearching) {
      // replaced alert with toast
      showToast("You're already searching for a match.", "warning");
      return;
    }
    this.isSearching = true;
    this.showSearchingUI(true);
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action: "join", game_type_id: t.id }));
    } else {
      this.isSearching = false;
      this.showSearchingUI(false);
    }
  }

  showSearchingUI(s) {
    if (s) {
      this.searchingIndicator.classList.remove("d-none");
      this.cancelSearchBtn.classList.remove("d-none");
    } else {
      this.searchingIndicator.classList.add("d-none");
      this.cancelSearchBtn.classList.add("d-none");
    }
  }

  cancelSearch() {
    if (!this.isSearching) return;
    this.isSearching = false;
    this.showSearchingUI(false);
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action: "cancel_search" }));
    }
  }

  enterMatch() {
    this.isSearching = false;
    this.showSearchingUI(false);
    forceCloseModal(this.modalInstance);
    Route.go("/active-match");
  }

  cancelMatch() {
    this.isSearching = false;
    this.showSearchingUI(false);
    forceCloseModal(this.modalInstance);
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action: "forfeit" }));
    }
    window.currentMatchData = null;
    showToast("Match canceled.", "warning");
  }

  openCustomGameModal() {
    this.customOpponentSelect.value = "";
    this.customPowerupsSwitch.checked = false;
    this.customPointsInput.value = "10";
    this.customModalInstance.show();
  }

  createCustomGame() {
    const opp = this.customOpponentSelect.value;
    const pw = this.customPowerupsSwitch.checked;
    let pts = parseInt(this.customPointsInput.value, 10);
    const gameTypeId = parseInt(this.customGameTypeSelect.value, 10);

    if (!opp) {
      showToast("Select opponent.", "danger");
      return;
    }
    if (isNaN(pts) || pts < 5 || pts > 20) {
      showToast("Points must be 5-20.", "danger");
      return;
    }
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          action: "create_custom",
          opponent_username: opp,
          game_type_id: gameTypeId,
          points_to_win: pts,
          powerups_enabled: pw,
        })
      );
    }
    setTimeout(() => {
      this.customModalInstance.hide();
    }, 10);
  }

  acceptInvite() {
    if (
      this.socket.readyState === WebSocket.OPEN &&
      window.currentMatchData?.matchId
    ) {
      this.socket.send(
        JSON.stringify({
          action: "accept_invite",
          match_id: window.currentMatchData.matchId,
        })
      );
      this.inviteModalInstance.hide();
      document.body.classList.remove("modal-open");
      document
        .querySelectorAll(".modal-backdrop")
        .forEach((el) => el.remove());
    }
  }

  declineInvite() {
    this.inviteModalInstance.hide();
    window.currentMatchData = null;
  }
}

export default Play;
```

Everything else remains the same, except **any** line that was doing `alert("...")` is now using `showToast(..., type)`.

---

## 3. Friend Management Via WebSocket

### High-Level Approach

1. **On the server side**, you’d modify your `MatchmakingConsumer` (or create a second consumer) to handle friend-request–related events:
    
    - e.g. `action: "send_friend_request"`, `"accept_friend_request"`, `"online_status"`, etc.
        
2. **On the client side** (`FriendsPage.js`), you’d set up a socket (like you do in `Play.js`) to listen for these events.
    
3. When a user logs in (or loads the `FriendsPage`), you can:
    
    - Notify the server that this user is online (the server can keep a record or broadcast presence).
        
    - The server can broadcast to the user’s friends something like `{ "type": "friend_online", "username": "Bob" }`.
        
    - The friends’ pages pick up that event in `socket.onmessage` and update the UI in real time (change the user’s circle to green).
        

### Example Consumer Logic

You can **reuse** your existing `MatchmakingConsumer` for friend events or create a new `FriendsConsumer`. Suppose we add friend events to the same consumer for brevity:

```py
# In matchmaking.py or a new file like friends_consumer.py
@database_sync_to_async
def set_user_online(user):
    user.is_online = True
    user.save()

@database_sync_to_async
def set_user_offline(user):
    user.is_online = False
    user.save()

@database_sync_to_async
def notify_friends_that_im_online(user):
    """
    Suppose you have a Relationship model or a method that returns
    all of user’s accepted friends. For each friend, broadcast an event.
    """
    # Find all the friends of 'user'
    relationships = Relationship.objects.filter(
        Q(from_user=user, status="accepted") | Q(to_user=user, status="accepted")
    )
    friend_ids = set()
    for rel in relationships:
        friend_ids.add(rel.from_user_id)
        friend_ids.add(rel.to_user_id)
    friend_ids.discard(user.id)

    friends = CustomUser.objects.filter(id__in=friend_ids)
    # For each friend, we’ll send a channel_layer event
    return [f.username for f in friends]

class MatchmakingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_anonymous:
            await self.close()
            return
        self.user = self.scope["user"]
        await self.accept()

        # Join your personal group and/or a common group
        await self.channel_layer.group_add(f"user_{self.user.username}", self.channel_name)

        # Mark user as online in DB
        await set_user_online(self.user)

        # Notify user’s friends
        friend_usernames = await notify_friends_that_im_online(self.user)
        for friend_username in friend_usernames:
            await self.channel_layer.group_send(
                f"user_{friend_username}",
                {
                    "type": "friend_online",
                    "username": self.user.username,
                }
            )

    async def disconnect(self, close_code):
        # Mark user as offline in DB
        await set_user_offline(self.user)
        # Notify friends
        # ...
        await self.channel_layer.group_discard(f"user_{self.user.username}", self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get("action")

        # ...
        # keep your existing matchmaking logic
        # ...

        if action == "send_friend_request":
            # do the logic from your REST endpoint,
            # or just call the same code inside a database_sync_to_async function
            # then broadcast an event to the target user
            target_user_name = data["target_username"]
            # ...
            await self.channel_layer.group_send(
                f"user_{target_user_name}",
                {
                    "type": "friend_request_event",
                    "from_username": self.user.username
                }
            )

    # The method name must match the "type" field in the group_send:
    async def friend_request_event(self, event):
        await self.send(json.dumps({
            "friend_request": True,
            "from_username": event["from_username"]
        }))

    async def friend_online(self, event):
        # The friend is online
        await self.send(json.dumps({
            "event": "friend_online",
            "username": event["username"]
        }))

    # ... similarly friend_offline, friend_accepted, etc.
```

> **Note**: The approach above is just an illustration. You would tailor the logic to your existing Relationship model and how you track `is_online`. Possibly you maintain an `is_online` boolean on each `CustomUser`. Or you store a `last_seen` time. Or you use a Redis presence manager. The idea is the same: broadcast an event to the relevant user groups, handle it on the client.

### Updating `FriendsPage.js` to Use Sockets

Your `FriendsPage.js` can be updated to connect to the same socket server (like `getOrCreateSocket()`) and listen for events:

```js
import Component from "../spa/component.js";
import { getOrCreateSocket } from "../index.js";
import { showToast } from "../components/toast.js";

class FriendsPage extends Component {
  constructor() {
    super("static/html/friends.html");
    this.originalFriendsData = [];
    this.friendsData = [];
    this.currentPage = 1;
    this.friendsPerPage = 8;
    this.friendsList = null;
  }

  onInit() {
    this.friendsList = document.getElementById("friends-list");
    this.fetchFriends();
    this.setupSearch();
    this.setupModal();

    // 1. Setup the same socket used in Play.js
    this.socket = getOrCreateSocket();
    // 2. Listen for friend-related events
    this.socket.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.friend_request) {
        // "Someone sent you a friend request"
        showToast(`New friend request from ${data.from_username}`, "info");
        // Possibly re-fetch the friend list:
        this.fetchFriends();
      } else if (data.event === "friend_online") {
        showToast(`${data.username} is now online!`, "success");
        // re-fetch the friend list or directly update the UI
        this.updateOnlineStatus(data.username, true);
      }
      // handle other events: friend_offline, friend_accepted, etc.
    };
  }

  updateOnlineStatus(username, isOnline) {
    // If you store friend data in this.friendsData,
    // find the friend by username and set status to "online" or "offline"
    const friend = this.friendsData.find(f => f.name === username);
    if (friend) {
      friend.status = isOnline ? "online" : "offline";
      this.displayFriends(this.currentPage);
    }
  }

  fetchFriends() {
    fetch(`/api/all-users/?target_user_id=${window.loggedInUserId}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          showToast("Error getting users!", "danger");
        } else {
          this.originalFriendsData = data.map((user) => ({
            id: user.id,
            name: user.username,
            // e.g. read is_online from user or Relationship
            status: user.is_online ? "online" : "offline",
            photo: user.avatar_url || "https://...",
            isFriend:
              user.relationship?.status === "accepted",
            receivedFriendRequest:
              user.relationship?.status === "pending" &&
              user.relationship?.direction === "received",
            sentFriendRequest:
              user.relationship?.status === "pending" &&
              user.relationship?.direction === "sent",
          }));
          this.friendsData = [...this.originalFriendsData];
          this.displayFriends(this.currentPage);
          this.setupPagination();
        }
      })
      .catch((error) => console.error("Error getting users:", error));
  }

  // ... the rest of your existing methods
  // (displayFriends, setupFriendActions, action, etc.)
}

export default FriendsPage;
```

In that snippet:

- When the server broadcasts a `"type": "friend_online"` to `user_{friendUsername}`, the `onmessage` checks for `data.event === "friend_online"` and calls `updateOnlineStatus(...)`.
    
- `updateOnlineStatus` modifies `friendsData` and re-renders the list, turning that user’s `.status` circle green.
    

---

## 4. Summary

1. **Create a Toast Manager** (a simple function to insert bootstrap-like toast DOM elements into a container).
    
2. **Replace all `alert(...)`** calls with `showToast(...)`.
    
3. **Use your existing WebSocket** approach to handle friend events (either in the same `MatchmakingConsumer` or a dedicated `FriendsConsumer`), broadcasting events to each user’s personal channel (like `user_{username}`).
    
4. **On the `FriendsPage`**, connect to that socket, listen for events, and update the UI or show a toast.
    

This gives you real-time, toast-based notifications for match invites, friend requests, presence changes, etc., all with the familiar Bootstrappy look-and-feel.

That’s the general idea—feel free to adapt code style, method names, or the shape of your WebSocket messages as you see fit!

```py
import json
import random
from datetime import timedelta
from django.utils import timezone
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.apps import apps
from django.db.models import Q
from transcendence.models import Matchmaking, Match, CustomUser, GameType, Relationship

apps.check_apps_ready()

@database_sync_to_async
def get_match_info(match_id):
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
    m = Match.objects.filter(player1=user, ended_on__isnull=True).first()
    if not m:
        m = Match.objects.filter(player2=user, ended_on__isnull=True).first()
    if m:
        if m.player1 == user:
            opp = m.player2
        else:
            opp = m.player1
        m.ended_on = timezone.now()
        m.winner = opp
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
def set_user_online(user):
    user.is_online = True
    user.save()

@database_sync_to_async
def set_user_offline(user):
    user.is_online = False
    user.save()

@database_sync_to_async
def get_friends_of_user(user):
    r = Relationship.objects.filter(Q(from_user=user, status="accepted") | Q(to_user=user, status="accepted"))
    ids = set()
    for rel in r:
        ids.add(rel.from_user_id)
        ids.add(rel.to_user_id)
    if user.id in ids:
        ids.remove(user.id)
    users = CustomUser.objects.filter(id__in=ids)
    return [u.username for u in users]

@database_sync_to_async
def create_relationship(from_user, to_user):
    if Relationship.objects.filter(from_user=from_user, to_user=to_user).exists():
        return False, "Friend request already sent"
    Relationship.objects.create(from_user=from_user, to_user=to_user, status="pending")
    return True, "Friend request sent"

@database_sync_to_async
def accept_relationship(receiver, sender_username):
    sender = CustomUser.objects.get(username=sender_username)
    rel = Relationship.objects.get(from_user=sender, to_user=receiver, status="pending")
    rel.status = "accepted"
    rel.save()
    return True, "Friend request accepted"

@database_sync_to_async
def decline_relationship(receiver, sender_username):
    sender = CustomUser.objects.get(username=sender_username)
    rel = Relationship.objects.get(from_user=sender, to_user=receiver, status="pending")
    rel.delete()
    return True, "Friend request declined"

@database_sync_to_async
def cancel_relationship(sender, target_username):
    to_user = CustomUser.objects.get(username=target_username)
    rel = Relationship.objects.get(from_user=sender, to_user=to_user, status="pending")
    rel.delete()
    return True, "Friend request canceled"

@database_sync_to_async
def unfriend_users(u1, u2_username):
    u2 = CustomUser.objects.get(username=u2_username)
    r = Relationship.objects.filter((Q(from_user=u1, to_user=u2) | Q(from_user=u2, to_user=u1)), status="accepted").first()
    if r:
        r.delete()
        return True, "Friendship ended"
    return False, "No friendship found"

@database_sync_to_async
def cleanup_stale_entries():
    t = timezone.now() - timedelta(minutes=5)
    Matchmaking.objects.filter(match__isnull=True, created_at__lt=t).delete()

@database_sync_to_async
def create_custom_match(user, gtype, opp_user, pts, pwr):
    m = Match.objects.create(game_type=gtype, player1=user, player2=opp_user)
    m.points_to_win = pts
    m.powerups_enabled = pwr
    m.save()
    return m

@database_sync_to_async
def find_match(user, game_type_id):
    gt = GameType.objects.get(id=game_type_id)
    me = Matchmaking.objects.create(user=user, game_type=gt)
    pm = Matchmaking.objects.filter(game_type=gt, match__isnull=True).exclude(user=user).first()
    if not pm and game_type_id != 3:
        pm = Matchmaking.objects.filter(game_type_id=3, match__isnull=True).exclude(user=user).first()
    if pm and game_type_id == 3 and pm.game_type.id == 3:
        chosen = random.choice([1, 2])
        gt = GameType.objects.get(id=chosen)
    if pm:
        match = Match.objects.create(game_type=gt, player1=user, player2=pm.user)
        me.match = match
        me.game_type = gt
        me.save()
        pm.match = match
        pm.game_type = gt
        pm.save()
        return match
    return None

@database_sync_to_async
def accept_custom_match(match_id):
    try:
        match = Match.objects.get(id=match_id)
        return match
    except Match.DoesNotExist:
        return None

def build_error(msg):
    return json.dumps({"error": True, "message": msg})

def build_success(payload):
    return json.dumps(payload)

class MatchmakingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_anonymous:
            await self.close()
            return
        self.user = self.scope["user"]
        self.room_group_name = "matchmaking_lobby"
        await self.accept()
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.channel_layer.group_add(f"user_{self.user.username}", self.channel_name)
        await set_user_online(self.user)
        friends = await get_friends_of_user(self.user)
        for f in friends:
            await self.channel_layer.group_send(f"user_{f}", {"type": "friend_online", "username": self.user.username})
        await cleanup_stale_entries()

    async def disconnect(self, close_code):
        await set_user_offline(self.user)
        friends = await get_friends_of_user(self.user)
        for f in friends:
            await self.channel_layer.group_send(f"user_{f}", {"type": "friend_offline", "username": self.user.username})
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        await self.channel_layer.group_discard(f"user_{self.user.username}", self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get("action")
        if action == "join":
            game_type_id = data.get("game_type_id")
            await cleanup_stale_entries()
            match = await find_match(self.user, game_type_id)
            if match:
                match_info = await get_match_info(match.id)
                for username in [match_info["player1"], match_info["player2"]]:
                    await self.channel_layer.group_send(f"user_{username}", {"type": "match_found", **match_info})
            else:
                await self.send(build_error("No match found. Please try again."))
        elif action == "create_custom":
            opp_name = data.get("opponent_username")
            game_type_id = data.get("game_type_id")
            pts = data.get("points_to_win", 10)
            pwr = data.get("powerups_enabled", False)
            if not opp_name:
                await self.send(build_error("No opponent specified."))
                return
            try:
                selected_type = await database_sync_to_async(GameType.objects.get)(id=game_type_id)
                opp_user = await database_sync_to_async(CustomUser.objects.get)(username=opp_name)
                match = await create_custom_match(self.user, selected_type, opp_user, pts, pwr)
                await self.channel_layer.group_send(f"user_{opp_user.username}", {"type": "custom_invite", "match_id": match.id, "player1": self.user.username, "game_type": selected_type.name, "points_to_win": pts, "powerups_enabled": pwr})
                await self.send(build_success({"waiting_invite": True, "message": "Waiting for opponent to accept invitation..."}))
            except CustomUser.DoesNotExist:
                await self.send(build_error(f"User '{opp_name}' not found."))
            except GameType.DoesNotExist:
                await self.send(build_error(f"No GameType with ID={game_type_id}."))
        elif action == "accept_invite":
            match_id = data.get("match_id")
            match = await accept_custom_match(match_id)
            if match:
                match_info = await get_match_info(match.id)
                for username in [match_info["player1"], match_info["player2"]]:
                    await self.channel_layer.group_send(f"user_{username}", {"type": "match_accepted", **match_info})
            else:
                await self.send(build_error("Match not found or already accepted."))
        elif action == "forfeit":
            result = await process_forfeit(self.user)
            if not result:
                await self.send(build_error("Match not set."))
            else:
                await self.channel_layer.group_send(f"user_{self.user.username}", {"type": "match_forfeited", "message": result["msg_for_forfeiter"]})
                await self.channel_layer.group_send(f"user_{result['opponent']}", {"type": "match_forfeited", "message": result["msg_for_opponent"]})
                await self.send(build_success({"success": True, "message": result["msg_for_forfeiter"]}))
        elif action == "cancel_search":
            await self.send(build_error("Cancel search not implemented."))
        elif action == "send_friend_request":
            target_username = data.get("target_username")
            if not target_username:
                await self.send(build_error("Target username required"))
                return
            ok, msg = await create_relationship(self.user, await database_sync_to_async(CustomUser.objects.get)(username=target_username))
            if ok:
                await self.channel_layer.group_send(f"user_{target_username}", {"type": "friend_request_event", "from_username": self.user.username})
                await self.send(build_success({"message": msg}))
            else:
                await self.send(build_error(msg))
        elif action == "accept_friend_request":
            sender_username = data.get("sender_username")
            ok, msg = await accept_relationship(self.user, sender_username)
            if ok:
                await self.channel_layer.group_send(f"user_{sender_username}", {"type": "friend_accepted_event", "from_username": self.user.username})
                await self.send(build_success({"message": msg}))
            else:
                await self.send(build_error(msg))
        elif action == "decline_friend_request":
            sender_username = data.get("sender_username")
            ok, msg = await decline_relationship(self.user, sender_username)
            if ok:
                await self.channel_layer.group_send(f"user_{sender_username}", {"type": "friend_declined_event", "from_username": self.user.username})
                await self.send(build_success({"message": msg}))
            else:
                await self.send(build_error(msg))
        elif action == "cancel_friend_request":
            target_username = data.get("target_username")
            ok, msg = await cancel_relationship(self.user, target_username)
            if ok:
                await self.send(build_success({"message": msg}))
            else:
                await self.send(build_error(msg))
        elif action == "unfriend":
            target_username = data.get("target_username")
            ok, msg = await unfriend_users(self.user, target_username)
            if ok:
                await self.channel_layer.group_send(f"user_{target_username}", {"type": "unfriended_event", "from_username": self.user.username})
                await self.send(build_success({"message": msg}))
            else:
                await self.send(build_error(msg))

    async def custom_invite(self, event):
        await self.send(build_success({"custom_invite": True, "match_id": event["match_id"], "player1": event["player1"], "game_type": event["game_type"], "points_to_win": event["points_to_win"], "powerups_enabled": event["powerups_enabled"]}))

    async def match_found(self, event):
        await self.send(build_success({"match_found": True, **event}))

    async def match_accepted(self, event):
        await self.send(build_success({"match_accepted": True, **event}))

    async def match_forfeited(self, event):
        await self.send(build_success({"event": "match_forfeited", "message": event["message"]}))

    async def friend_request_event(self, event):
        await self.send(build_success({"friend_request": True, "from_username": event["from_username"]}))

    async def friend_accepted_event(self, event):
        await self.send(build_success({"friend_accepted": True, "from_username": event["from_username"]}))

    async def friend_declined_event(self, event):
        await self.send(build_success({"friend_declined": True, "from_username": event["from_username"]}))

    async def unfriended_event(self, event):
        await self.send(build_success({"unfriended": True, "from_username": event["from_username"]}))

    async def friend_online(self, event):
        await self.send(build_success({"event": "friend_online", "username": event["username"]}))

    async def friend_offline(self, event):
        await self.send(build_success({"event": "friend_offline", "username": event["username"]}))
```

Typically, you’d add an `is_online` field to your **CustomUser** model (which lives in the same table that stores all user attributes). For example:

```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    is_online = models.BooleanField(default=False)
    # any other custom fields...
```

Then, whenever you do something like:

```python
@database_sync_to_async
def set_user_online(user):
    user.is_online = True
    user.save()
```

…it updates that `is_online` column in your **CustomUser** table for that specific user record.
