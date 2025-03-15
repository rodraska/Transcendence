// play.js
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
  }

  async onInit() {
    this.gameTypesContainer = this.querySelector("#game-types");
    this.searchingIndicator = this.querySelector("#searching-indicator");
    this.cancelSearchBtn = this.querySelector("#cancel-search-btn");
    this.matchFoundModal = this.querySelector("#matchFoundModal");
    this.matchInfoText = this.querySelector("#match-info");
    this.enterMatchBtn = this.querySelector("#enter-match-btn");
    this.cancelMatchBtn = this.querySelector("#cancel-match-btn");

    this.cancelSearchBtn.addEventListener("click", () => this.cancelSearch());
    this.enterMatchBtn.addEventListener("click", () => this.enterMatch());
    this.cancelMatchBtn.addEventListener("click", () => this.cancelMatch());

    this.modalInstance = new bootstrap.Modal(this.matchFoundModal, {
      backdrop: "static",
    });

    await this.fetchGameTypes();
    this.socket = getOrCreateSocket();
    this.setupLocalMessageHandler();
  }

  setupLocalMessageHandler() {
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.match_found) {
        const { match_id, player1, player2 } = data;
        this.matchInfoText.textContent = `Found Match #${match_id}: ${player1} vs ${player2}.`;
        window.currentMatchData = { matchId: match_id, player1, player2 };
        this.modalInstance.show();
      } else if (data.success === false) {
        alert(`Error: ${data.message}`);
      } else if (data.event === "match_forfeited") {
        alert(data.message);
        forceCloseModal(this.modalInstance);
        window.currentMatchData = null;
        Route.go("/play");
      } else {
        console.log("Local 'Play' message:", data);
      }
    };
  }

  async fetchGameTypes() {
    try {
      const res = await fetch("/api/game-types/", { credentials: "include" });
      if (!res.ok) {
        throw new Error(`Error fetching game types: ${res.status}`);
      }
      const gameTypes = await res.json();
      this.renderGameTypes(gameTypes);
    } catch (err) {
      console.error("Failed to load game types:", err);
      this.gameTypesContainer.textContent = "Failed to load game types.";
    }
  }

  renderGameTypes(gameTypes) {
    this.gameTypesContainer.innerHTML = "";
    gameTypes.forEach((type) => {
      const button = document.createElement("button");
      button.textContent = type.name;
      button.classList.add("btn", "btn-primary", "m-2");
      button.addEventListener("click", () => this.searchForMatch(type));
      this.gameTypesContainer.appendChild(button);
    });
  }

  searchForMatch(gameType) {
    if (this.isSearching) {
      alert("You're already searching for a match.");
      return;
    }
    this.isSearching = true;
    this.showSearchingUI(true);

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({ action: "join", game_type_id: gameType.id })
      );
    } else {
      console.error("WebSocket not open. Can't search for match right now.");
      this.isSearching = false;
      this.showSearchingUI(false);
    }
  }

  showSearchingUI(isSearching) {
    if (isSearching) {
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
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
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
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action: "forfeit" }));
    }
    window.currentMatchData = null;
    alert("You canceled this match.");
  }

  giveUpMatch() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action: "forfeit" }));
      alert("You forfeited the match.");
    } else {
      console.warn("WebSocket not open. No real-time forfeit possible.");
    }
    this.isSearching = false;
    this.showSearchingUI(false);
  }
}

export default Play;
