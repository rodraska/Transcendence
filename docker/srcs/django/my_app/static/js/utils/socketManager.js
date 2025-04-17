import { addInvite, removeInvite } from "./inviteStore.js";
import { showToast } from "./toast.js";

let socket = null;
const listeners = new Set();

export function getOrCreateSocket() {
  if (socket) return socket;
  socket = new WebSocket(`wss://${location.host}/ws/matchmaking/`);
  socket.onmessage = (e) => {
    const d = JSON.parse(e.data);

    if (d.custom_invite) {
      addInvite({
        pending_id: d.pending_id,
        from: d.player1,
        game_type: d.game_type,
        points_to_win: d.points_to_win,
        powerups: d.powerups_enabled,
      });
      showToast(`${d.player1} invited you to a ${d.game_type} match`, "info");
    }

    if (d.friend_request) {
      showToast(`New friend request from ${d.from_username}`, "info");
    }

    if ((d.event === "match_cancelled" || d.invite_declined) && d.pending_id) {
      removeInvite(d.pending_id);
    }

    if (d.match_start && d.pending_id) removeInvite(d.pending_id);

    for (const fn of listeners) fn(d);
  };
  socket.onclose = () => {
    setTimeout(() => {
      socket = null;
      getOrCreateSocket();
    }, 1000);
  };
  return socket;
}

export function addSocketListener(fn) {
  listeners.add(fn);
}

export function removeSocketListener(fn) {
  listeners.delete(fn);
}
