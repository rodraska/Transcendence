import Component from "../spa/component.js";
import Route from "../spa/route.js";
import { getOrCreateSocket } from "../index.js";

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
          game_type: d.game_type,
        };
        this.modalInstance.show();
      } else if (d.waiting_invite) {
        // Instead of an alert, update the searching UI.
        this.searchingIndicator.textContent = d.message;
        this.showSearchingUI(true);
      } else if (d.custom_invite) {
        // For the invitee: show the custom game invitation modal.
        this.inviteInfoText.textContent = `${
          d.player1
        } has invited you to a custom match (${d.game_type}, Points: ${
          d.points_to_win
        }, Powerups: ${d.powerups_enabled ? "On" : "Off"}). Do you accept?`;
        window.currentMatchData = {
          matchId: d.match_id,
          player1: d.player1,
          player2: window.loggedInUserName,
          powerups_enabled: d.powerups_enabled,
          points_to_win: d.points_to_win,
          game_type: d.game_type,
        };
        this.inviteModalInstance.show();
      } else if (d.match_accepted) {
        // On acceptance, auto-redirect both players.
        window.currentMatchData = {
          matchId: d.match_id,
          player1: d.player1,
          player2: d.player2,
          powerups_enabled: d.powerups_enabled,
          points_to_win: d.points_to_win,
          game_type: d.game_type,
        };
        if (d.game_type === "Pong")
          Route.go("/pong");
        else if (d.game_type === "Curve")
          Route.go("/curve");
      } else if (d.error) {
        alert(`Error: ${d.message}`);
      } else if (d.event === "match_forfeited") {
        alert(d.message);
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
      alert("You're already searching for a match.");
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
    let pts = parseInt(this.customPointsInput.value, 10);
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
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
    }
  }

  declineInvite() {
    this.inviteModalInstance.hide();
    window.currentMatchData = null;
  }
}

export default Play;
