import Component from "../spa/component.js";
import Route from "../spa/route.js";
import {
  getOrCreateSocket,
  addSocketListener,
  removeSocketListener,
} from "../utils/socketManager.js";
import { showToast } from "../utils/toast.js";
import {
  getInvites,
  subscribe as subInv,
  unsubscribe as unsubInv,
  removeInvite,
} from "../utils/inviteStore.js";

function forceCloseModal(modalInstance) {
  if (modalInstance) modalInstance.hide();
  document.body.classList.remove("modal-open");
  document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
}

class Play extends Component {
  constructor() {
    super("static/html/play.html");
    this.isSearching = false;
    this.modalInstance = null;
    this.customModalInstance = null;
    this.currentPendingId = null;
  }

  async onInit() {
    window.playInstance = this;
    this.boundUnloadHandler = () => {
      this.cancelSearch();
    };
    window.addEventListener("beforeunload", this.boundUnloadHandler);

    this.boundVisibilityHandler = () => {
      if (document.hidden && this.isSearching) {
        this.cancelSearch();
      }
    };
    document.addEventListener("visibilitychange", this.boundVisibilityHandler);
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
    this.singleplayerGameTypesContainer = this.querySelector(
      "#singleplayer-game-types"
    );
    this.inviteList = this.querySelector("#invite-list");
    this.noInvitesMsg = this.querySelector("#no-invites-msg");

    this.cancelSearchBtn.addEventListener("click", () => this.cancelSearch());
    this.enterMatchBtn.addEventListener("click", () => this.enterMatch());
    this.cancelMatchBtn.addEventListener("click", () => this.cancelMatch());
    this.customGameBtn.addEventListener("click", () =>
      this.openCustomGameModal()
    );
    this.customCreateBtn.addEventListener("click", () =>
      this.createCustomGame()
    );

    this.tournamentBtn = this.querySelector("#tournament-btn");
    this.tournamentBtn?.addEventListener("click", () => {
      Route.go("/tournament");
    });

    window.addEventListener("online", () => this.updateConnectionStatus(true));
    window.addEventListener("offline", () =>
      this.updateConnectionStatus(false)
    );
    this.updateConnectionStatus(navigator.onLine);

    this.modalInstance = new bootstrap.Modal(this.matchFoundModal, {
      backdrop: "static",
    });
    this.customModalInstance = new bootstrap.Modal(this.customModal);

    await this.fetchGameTypes();

    this.renderInvites(getInvites());
    subInv((invites) => this.renderInvites(invites));

    this.socket = getOrCreateSocket();

    this.playSocketListener = (d) => {
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
        if (d.pending_id) this.currentPendingId = d.pending_id;
      } else if (d.waiting_confirm) {
        this.matchInfoText.textContent = d.message;
        this.enterMatchBtn.classList.add("d-none");
      } else if (d.match_start) {
        forceCloseModal(this.modalInstance);
        window.currentMatchData = {
          matchId: d.match_id,
          player1: d.player1,
          player2: d.player2,
          powerups_enabled: d.powerups_enabled,
          points_to_win: d.points_to_win,
          game_type: d.game_type,
        };
        if (d.game_type === "Curve") Route.go("/curve");
        else if (d.game_type === "Pong") Route.go("/pong");
        else Route.go("/active-match");
      } else if (d.invite_declined) {
        showToast(d.message, "warning");
        forceCloseModal(this.modalInstance);
        window.currentMatchData = null;
        Route.go("/play");
      } else if (d.error) {
        showToast(`Error: ${d.message}`, "danger");
      } else if (d.event === "match_cancelled") {
        showToast(d.message, "warning");
        forceCloseModal(this.modalInstance);
        this.isSearching = false;
        this.showSearchingUI(false);
        window.currentMatchData = null;
        Route.go("/play");
      } else if (d.event === "match_forfeited") {
        showToast(d.message, "warning");
        forceCloseModal(this.modalInstance);
        window.currentMatchData = null;
        Route.go("/play");
      }
    };

    addSocketListener(this.playSocketListener);
  }

  disconnectedCallback() {
    if (window.playInstance === this) {
      window.playInstance = null;
    }
    unsubInv(this.renderInvites);
    removeSocketListener(this.playSocketListener);
    window.removeEventListener("beforeunload", this.boundUnloadHandler);
    document.removeEventListener(
      "visibilitychange",
      this.boundVisibilityHandler
    );
  }

  renderInvites(invites) {
    this.inviteList.innerHTML = "";
    if (invites.length === 0) {
      this.noInvitesMsg.style.display = "block";
      return;
    }
    this.noInvitesMsg.style.display = "none";
    invites.forEach((inv) => {
      const card = document.createElement("div");
      card.className = "card shadow-sm";
      card.innerHTML = `
        <div class="card-body d-flex flex-column flex-md-row justify-content-between align-items-start">
          <div>
            <h6 class="card-title mb-1">${inv.from} invited you</h6>
            <p class="card-text small text-muted mb-2">
              ${inv.game_type} · ${inv.points_to_win} pts · Power‑ups ${
        inv.powerups ? "ON" : "OFF"
      }
            </p>
          </div>
          <div class="btn-group">
            <button class="btn btn-sm btn-primary">Accept</button>
            <button class="btn btn-sm btn-outline-secondary">Decline</button>
          </div>
        </div>`;
      const [acceptBtn, declineBtn] = card.querySelectorAll("button");
      acceptBtn.onclick = () => this.respondToInvite(inv.pending_id, true);
      declineBtn.onclick = () => this.respondToInvite(inv.pending_id, false);
      this.inviteList.appendChild(card);
    });
  }

  respondToInvite(pid, accept) {
    if (this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(
      JSON.stringify({
        action: accept ? "confirm_match" : "decline_pending",
        pending_id: pid,
      })
    );
    removeInvite(pid);
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
    this.singleplayerGameTypesContainer.innerHTML = "";
    types.forEach((t) => {
      const gameTypeSelection = this.querySelector("#custom-game-type");
      const gameType = document.createElement("option");
      gameType.value = `${t.id}`;
      gameType.innerText = `${t.name}`;
      gameTypeSelection.appendChild(gameType);

      const mpBtn = document.createElement("button");
      mpBtn.textContent = t.name;
      mpBtn.classList.add("btn", "btn-primary", "m-2");
      mpBtn.addEventListener("click", () => this.searchForMatch(t));
      this.gameTypesContainer.appendChild(mpBtn);

      const spBtn = document.createElement("button");
      spBtn.textContent = t.name;
      spBtn.classList.add("btn", "btn-primary", "m-2");
      spBtn.addEventListener("click", () => {
        if (t.name === "Pong") {
          Route.go("/pong_single");
        } else if (t.name === "Curve") {
          Route.go("/curve_single");
        }
      });
      this.singleplayerGameTypesContainer.appendChild(spBtn);
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
    } catch {}
  }

  searchForMatch(t) {
    if (this.isSearching) {
      showToast("You're already searching.", "warning");
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
      this.customGameBtn.classList.add("disabled");

      const buttons = this.gameTypesContainer.querySelectorAll("button");

      buttons.forEach((button) => {
        button.classList.add("disabled");
      });

      const buttonsSingle =
        this.singleplayerGameTypesContainer.querySelectorAll("button");

      buttonsSingle.forEach((button) => {
        button.classList.add("disabled");
      });

      this.querySelector("#tournament-btn").classList.add("disabled");
    } else {
      this.searchingIndicator.classList.add("d-none");
      this.cancelSearchBtn.classList.add("d-none");

      this.customGameBtn.classList.remove("disabled");

      const buttons = this.gameTypesContainer.querySelectorAll("button");

      buttons.forEach((button) => {
        button.classList.remove("disabled");
      });

      const buttonsSingle =
        this.singleplayerGameTypesContainer.querySelectorAll("button");

      buttonsSingle.forEach((button) => {
        button.classList.remove("disabled");
      });

      this.querySelector("#tournament-btn").classList.remove("disabled");
    }
  }

  cancelSearch() {
    if (this.currentPendingId) {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(
          JSON.stringify({
            action: "cancel_pending",
            pending_id: this.currentPendingId,
          })
        );
      }
      removeInvite(this.currentPendingId);
      this.currentPendingId = null;
      showToast("Invitation canceled.", "warning");
    } else {
      if (!this.isSearching) return;
      this.isSearching = false;
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ action: "cancel_search" }));
      }
      showToast("Search canceled.", "warning");
    }
    this.isSearching = false;
    this.showSearchingUI(false);
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
    showToast("Match canceled.", "warning");
  }

  async openCustomGameModal() {
    await this.populateOpponentSelect();
    this.customOpponentSelect.value = "";
    this.customPowerupsSwitch.checked = false;
    this.customPointsInput.value = "3";
    this.customModalInstance.show();
  }

  createCustomGame() {
    const opp = this.customOpponentSelect.value;
    const pw = this.customPowerupsSwitch.checked;
    const pts = parseInt(this.customPointsInput.value, 10);
    const gameTypeId = parseInt(this.customGameTypeSelect.value, 10);
    if (!opp) {
      showToast("Select opponent.", "danger");
      return;
    }
    if (isNaN(pts) || pts < 3 || pts > 10) {
      showToast("Points must be 3-20.", "danger");
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

  updateConnectionStatus(isOnline) {
    const mpButtons = this.gameTypesContainer.querySelectorAll("button");
    mpButtons.forEach((btn) => (btn.disabled = !isOnline));
    if (this.tournamentBtn) {
      this.tournamentBtn.disabled = !isOnline;
    }
    if (this.customGameBtn) {
      this.customGameBtn.disabled = !isOnline;
    }
  }

  onOffline() {
    this.insertAdjacentHTML("beforeend", "<button id='retry'>Retry</button>");
    this.querySelector("#retry").addEventListener("click", () => {
      location.reload();
    });
  }
}

export default Play;
