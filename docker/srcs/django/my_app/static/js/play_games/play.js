import Component from "../spa/component.js";
import Route from "../spa/route.js";
import { getOrCreateSocket } from "../utils/socketManager.js";

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
    this.inviteModalInstance = null;
    this.currentPendingId = null;
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
        this.currentPendingId = d.pending_id;
        this.matchInfoText.textContent = `Pending: ${d.player1} vs ${d.player2}.`;
        this.enterMatchBtn.classList.remove("d-none");
        this.modalInstance.show();
      } else if (d.waiting) {
        this.searchingIndicator.textContent = d.message;
        this.showSearchingUI(true);
      } else if (d.waiting_invite) {
        this.searchingIndicator.textContent = d.message;
        this.showSearchingUI(true);
        if (d.pending_id) {
          this.currentPendingId = d.pending_id;
        }
      } else if (d.custom_invite) {
        this.currentPendingId = d.pending_id;
        this.inviteInfoText.textContent = `${d.player1} invited you (${
          d.game_type
        }, Points: ${d.points_to_win}, Powerups: ${
          d.powerups_enabled ? "On" : "Off"
        }). Accept?`;
        this.inviteModalInstance.show();
      } else if (d.waiting_confirm) {
        this.matchInfoText.textContent = d.message;
        this.enterMatchBtn.classList.add("d-none");
      } else if (d.match_start) {
        forceCloseModal(this.modalInstance);
        document.body.classList.remove("modal-open");
        document
          .querySelectorAll(".modal-backdrop")
          .forEach((el) => el.remove());
        window.currentMatchData = {
          matchId: d.match_id,
          player1: d.player1,
          player2: d.player2,
          powerups_enabled: d.powerups_enabled,
          points_to_win: d.points_to_win,
        };
        Route.go("/active-match");
      } else if (d.invite_declined) {
        alert(d.message);
        forceCloseModal(this.modalInstance);
        window.currentMatchData = null;
        Route.go("/play");
      } else if (d.error) {
        alert(`Error: ${d.message}`);
      } else if (d.event === "match_cancelled") {
        alert(d.message);
        forceCloseModal(this.modalInstance);
        forceCloseModal(this.inviteModalInstance);
        this.isSearching = false;
        this.showSearchingUI(false);
        window.currentMatchData = null;
        Route.go("/play");
      } else if (d.event === "match_forfeited") {
        alert(d.message);
        forceCloseModal(this.modalInstance);
        forceCloseModal(this.inviteModalInstance);
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
      const availableUsers = users.filter((u) => u.is_online);
      if (availableUsers.length === 0) {
        this.customOpponentSelect.innerHTML =
          '<option value="" disabled selected>No online users</option>';
      } else {
        this.customOpponentSelect.innerHTML =
          '<option value="" disabled selected>-- Select an Opponent --</option>';
        availableUsers.forEach((u) => {
          const opt = document.createElement("option");
          opt.value = u.username;
          opt.textContent = u.username;
          this.customOpponentSelect.appendChild(opt);
        });
      }
    } catch (err) {
      console.error("Failed fetching opponents:", err);
    }
  }

  searchForMatch(t) {
    if (this.isSearching) {
      alert("You're already searching.");
      return;
    }
    this.isSearching = true;
    this.showSearchingUI(true);
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action: "queue", game_type_id: t.id }));
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
    if (this.socket.readyState === WebSocket.OPEN && this.currentPendingId) {
      this.socket.send(
        JSON.stringify({
          action: "confirm_match",
          pending_id: this.currentPendingId,
        })
      );
    }
  }

  cancelMatch() {
    this.isSearching = false;
    this.showSearchingUI(false);
    forceCloseModal(this.modalInstance);
    if (this.socket.readyState === WebSocket.OPEN && this.currentPendingId) {
      this.socket.send(
        JSON.stringify({
          action: "cancel_pending",
          pending_id: this.currentPendingId,
        })
      );
    }
    window.currentMatchData = null;
    alert("Match canceled.");
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
    const pts = parseInt(this.customPointsInput.value, 10);
    const gameTypeId = parseInt(this.customGameTypeSelect.value, 10);
    if (!opp) {
      alert("Select opponent.");
      return;
    }
    if (isNaN(pts) || pts < 5 || pts > 20) {
      alert("Points must be 5-20.");
      return;
    }
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          action: "invite_custom",
          opponent_username: opp,
          game_type_id: gameTypeId,
          points_to_win: pts,
          powerups_enabled: pw,
        })
      );
    }
    setTimeout(() => {
      document.activeElement.blur();
      if (this.currentPendingId) {
        this.socket.send(
          JSON.stringify({
            action: "confirm_match",
            pending_id: this.currentPendingId,
          })
        );
      }
      this.customModalInstance.hide();
    }, 500);
  }

  acceptInvite() {
    if (this.socket.readyState === WebSocket.OPEN && this.currentPendingId) {
      this.socket.send(
        JSON.stringify({
          action: "confirm_match",
          pending_id: this.currentPendingId,
        })
      );
      this.inviteModalInstance.hide();
      document.body.classList.remove("modal-open");
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
    }
  }

  declineInvite() {
    if (this.socket.readyState === WebSocket.OPEN && this.currentPendingId) {
      this.socket.send(
        JSON.stringify({
          action: "decline_pending",
          pending_id: this.currentPendingId,
        })
      );
    }
    this.inviteModalInstance.hide();
    window.currentMatchData = null;
  }
}

export default Play;
