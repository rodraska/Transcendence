import Component from "../spa/component.js";
import PongPage from "../pong/pong.js";
import { showToast } from "../utils/toast.js";
import Route from "../spa/route.js";

class TournamentPage extends Component {
  constructor() {
    super("static/html/tournament.html");
    this.tournamentState = [];
  }

  onInit() {
    this.playerCountSelect = document.getElementById("playerCount");
    this.playersContainer = document.getElementById("playersContainer");
    this.startButton = document.getElementById("startTournament");
    this.resetButton = document.getElementById("resetTournament");
    this.bracketDiv = document.getElementById("bracket");
    this.nextMatchDiv = document.getElementById("nextMatch");
    this.startNextGameBtn = document.getElementById("startNextGame");

    this.startNextGameBtn.style.display = "none";

    this.gameModalElement = document.getElementById("gameModal");
    this.gameModal = new bootstrap.Modal(this.gameModalElement);
    this.gameMatchInfo = document.getElementById("gameMatchInfo");

    this.playerCountSelect.addEventListener(
      "change",
      this.updatePlayers.bind(this)
    );
    this.startButton.addEventListener("click", this.initTournament.bind(this));
    this.resetButton.addEventListener("click", this.resetTournament.bind(this));
    this.startNextGameBtn.addEventListener(
      "click",
      this.openNextGameModal.bind(this)
    );

    this.updatePlayers();
    this.validatePlayerNames();
    this.loadMyTournaments();
  }

  updatePlayers() {
    const count = parseInt(this.playerCountSelect.value, 10);
    this.playersContainer.innerHTML = "";
    for (let i = 1; i <= count; i++) {
      const formGroup = document.createElement("div");
      formGroup.className = "mb-3";

      const label = document.createElement("label");
      label.setAttribute("for", "player" + i);
      label.className = "form-label";
      label.textContent = `Player ${i} Alias:`;

      const input = document.createElement("input");
      input.type = "text";
      input.className = "form-control";
      input.id = "player" + i;
      input.placeholder = "Enter alias for player " + i;

      formGroup.appendChild(label);
      formGroup.appendChild(input);

      const errorDiv = document.createElement("div");
      errorDiv.className = "text-danger small d-none";
      errorDiv.id = input.id + "_error";
      formGroup.appendChild(errorDiv);

      this.playersContainer.appendChild(formGroup);
      input.addEventListener("input", this.validatePlayerNames.bind(this));
      input.addEventListener("blur", () => {
        const errorDiv = document.getElementById(input.id + "_error");
        const alias = input.value.trim();
        let errorMsg = "";
        if (alias.length > 0 && alias.length < 5) {
          errorMsg = "Alias must be at least 5 characters long.";
        } else if (alias) {
          const inputs = this.playersContainer.querySelectorAll("input");
          let countAlias = 0;
          inputs.forEach((el) => {
            if (el.value.trim() === alias) countAlias++;
          });
          if (countAlias > 1) {
            errorMsg = "Duplicate alias detected.";
          }
        }
        if (errorMsg) {
          input.style.borderColor = "red";
          errorDiv.textContent = errorMsg;
          errorDiv.classList.remove("d-none");
        } else {
          input.style.borderColor = "";
          errorDiv.textContent = "";
          errorDiv.classList.add("d-none");
        }
      });
    }
  }

  validatePlayerNames() {
    const count = parseInt(this.playerCountSelect.value, 10);
    let valid = true;
    const inputs = this.playersContainer.querySelectorAll("input");
    const names = [];
    inputs.forEach((input) => {
      const alias = input.value.trim();
      if (alias === "" || alias.length < 5) {
        valid = false;
      }
      if (alias) {
        if (names.includes(alias)) {
          valid = false;
        } else {
          names.push(alias);
        }
      }
    });
    this.startButton.disabled = !valid;
  }

  shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  initTournament() {
    const count = parseInt(this.playerCountSelect.value, 10);
    const players = [];
    for (let i = 1; i <= count; i++) {
      const alias = document.getElementById("player" + i).value.trim();
      if (!alias || alias.length < 5 || players.indexOf(alias) !== -1) return;
      players.push(alias);
    }
    const randomizedPlayers = this.shuffleArray(players);
    this.tournamentState = [];
    if (count === 2) {
      this.tournamentState.push({
        round: "Final",
        players: [randomizedPlayers[0], randomizedPlayers[1]],
        winner: null,
        result: null,
      });
    } else if (count === 3) {
      this.tournamentState.push({
        round: "Semi-final",
        players: [randomizedPlayers[0], randomizedPlayers[1]],
        winner: null,
        result: null,
      });
      this.tournamentState.push({
        round: "Final",
        players: [null, randomizedPlayers[2]],
        winner: null,
        result: null,
      });
    } else if (count === 4) {
      this.tournamentState.push({
        round: "Semi-final 1",
        players: [randomizedPlayers[0], randomizedPlayers[1]],
        winner: null,
        result: null,
      });
      this.tournamentState.push({
        round: "Semi-final 2",
        players: [randomizedPlayers[2], randomizedPlayers[3]],
        winner: null,
        result: null,
      });
      this.tournamentState.push({
        round: "Final",
        players: [null, null],
        winner: null,
        result: null,
      });
    }
    this.startButton.disabled = true;
    this.startNextGameBtn.style.display = "block";
    this.bracketDiv.classList.add("border", "rounded", "p-3");
    this.updateBracketDisplay();
    this.announceNextMatch();
  }

  updateBracketDisplay() {
    let html = `<div class="card mb-3"><div class="card-header">Tournament Bracket</div><div class="card-body">`;
    for (const match of this.tournamentState) {
      html += `<h5>${match.round}</h5>`;
      if (match.players[0] && match.players[1]) {
        html += `<p>${match.players[0]} vs ${match.players[1]}</p>`;
      } else if (match.players[0] || match.players[1]) {
        const totalPlayers = parseInt(this.playerCountSelect.value, 10);
        if (totalPlayers < 4) {
          html += `<p>${
            match.players[0] ? match.players[0] : match.players[1]
          } (bye)</p>`;
        } else {
          html += `<p>${
            match.players[0] ? match.players[0] : match.players[1]
          }</p>`;
        }
      }
      if (match.winner) {
        html += `<p class="fw-bold">Winner: ${match.winner}</p>`;
      }
      if (match.result) {
        html += `<p class="fw-bold">Result: ${match.result}</p>`;
      }
      html += `<hr>`;
    }
    html += `</div></div>`;
    this.bracketDiv.innerHTML = html;
  }

  announceNextMatch() {
    const nextMatch = this.getNextPendingMatch();
    let html = `<div class="alert alert-info" role="alert">`;
    if (nextMatch) {
      html += `<strong>Next Match:</strong> ${nextMatch.players[0]} vs ${nextMatch.players[1]}`;
    } else {
      html += `No pending matches. Tournament concluded.`;
    }
    html += `</div>`;
    this.nextMatchDiv.innerHTML = html;
  }

  getNextPendingMatch() {
    return this.tournamentState.find((match) => {
      return match.winner === null && match.players[0] && match.players[1];
    });
  }

  openNextGameModal() {
    if (!customElements.get("pong-component")) {
      customElements.define("pong-component", PongPage);
    }
    const nextMatch = this.getNextPendingMatch();
    if (!nextMatch) {
      showToast("No pending matches.", "warning", "Tournament");
      return;
    }
    // For bye matches in 2-player tournaments, auto-advance and save results
    if (
      this.tournamentState.length === 2 &&
      (!nextMatch.players[0] || !nextMatch.players[1])
    ) {
      const winnerAlias = nextMatch.players[0] || nextMatch.players[1];
      nextMatch.winner = winnerAlias;
      nextMatch.result = "Bye";
      this.updateBracketDisplay();
      this.announceNextMatch();
      this.saveTournamentResult();
      return;
    }
    this.currentMatch = nextMatch;
    window.currentTournamentMatch = this.currentMatch;
    this.gameMatchInfo.textContent = `${nextMatch.players[0]} vs ${nextMatch.players[1]}`;
    const container = this.getElementById("pongGameContainer");
    container.innerHTML = "";
    const pongElement = document.createElement("pong-component");
    container.appendChild(pongElement);
    const self = this;
    window.tournamentGameFinished = function (resultData) {
      // resultData is: { winner: 'alias', result: 'score1:score2' }
      self.currentMatch.winner = resultData.winner;
      self.currentMatch.result = resultData.result;

      // If the tournament has a semi-final -> final flow:
      if (
        self.tournamentState.length === 3 &&
        self.currentMatch.round.startsWith("Semi-final")
      ) {
        const finalMatch = self.tournamentState.find(
          (m) => m.round === "Final"
        );
        if (!finalMatch.players[0]) {
          finalMatch.players[0] = resultData.winner;
        } else if (!finalMatch.players[1]) {
          finalMatch.players[1] = resultData.winner;
        }
      }

      // If 3-player scenario or a 2-match bracket
      if (
        self.tournamentState.length === 2 &&
        self.currentMatch.round === "Semi-final"
      ) {
        // The final is always index 1
        self.tournamentState[1].players[0] = resultData.winner;
      }

      self.updateBracketDisplay();
      self.announceNextMatch();
      self.gameModal.hide();
      window.tournamentGameFinished = null;
      window.currentTournamentMatch = null;

      // If the final is concluded, save results and handle end-of-tournament UI
      if (
        self.currentMatch.round === "Final" &&
        self.tournamentState.every((m) => m.winner)
      ) {
        // Show End Tournament button or do immediate final flow:
        self.finishTournament();
      }
    };
    this.gameModal.show();
  }

  confirmGameResult() {
    const selected = document.querySelector(
      'input[name="winnerRadio"]:checked'
    );
    if (!selected) {
      showToast("Please select a winner.", "warning", "Tournament");
      return;
    }
    const winner = selected.value;
    this.currentMatch.winner = winner;
    // Optionally update result for this match if known
    // For example, set a result string (you can customize as needed)
    this.currentMatch.result = this.p1.score + ":" + this.p2.score;
    if (
      this.tournamentState.length === 2 &&
      this.currentMatch.round === "Semi-final"
    ) {
      this.tournamentState[1].players[0] = winner;
    }
    if (
      this.tournamentState.length === 3 &&
      this.currentMatch.round.startsWith("Semi-final")
    ) {
      const finalMatch = this.tournamentState.find((m) => m.round === "Final");
      if (!finalMatch.players[0]) {
        finalMatch.players[0] = winner;
      } else if (!finalMatch.players[1]) {
        finalMatch.players[1] = winner;
      }
    }
    this.updateBracketDisplay();
    this.announceNextMatch();
    if (this.currentMatch.round === "Final") {
      this.saveTournamentResult();
    }
    this.gameModal.hide();
  }

  // Saves tournament results to the backend and reloads past tournaments.
  saveTournamentResult(callback) {
    const tournamentResult = {
      tournament: this.tournamentState,
      timestamp: new Date().toISOString(),
    };
    fetch("/api/save_tournament_result/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tournamentResult),
    })
      .then((res) => res.json())
      .then((data) => {
        showToast("Tournament saved successfully.", "success", "Tournament");
        this.loadMyTournaments();
        if (typeof callback === "function") {
          callback();
        }
      })
      .catch((err) => {
        console.error("Error saving tournament:", err);
        showToast("Error saving tournament.", "danger", "Tournament");
        if (typeof callback === "function") {
          callback();
        }
      });
  }

  loadMyTournaments() {
    fetch("/api/get_tournaments/")
      .then((res) => res.json())
      .then((data) => {
        let html = `<div class="card">
                      <div class="card-header">My Tournaments</div>
                      <div class="card-body">`;
        if (data && data.tournaments && data.tournaments.length) {

          data.tournaments.forEach((tourney) => {
            html += this.renderTournamentCard(tourney);
          });
        } else {
          html += `<p>No results</p>`;
        }
        html += `</div></div>`;
        document.getElementById("myTournaments").innerHTML = html;
      })
      .catch((err) => console.error("Error loading tournaments:", err));
  }

  resetTournament() {
    this.tournamentState = [];
    this.bracketDiv.innerHTML = "";
    this.nextMatchDiv.innerHTML = "";
    this.playersContainer.innerHTML = "";
    this.startButton.disabled = false;
    this.startNextGameBtn.style.display = "none";
    this.playerCountSelect.value = "2";
    this.updatePlayers();
  }

  finishTournament() {
    // Disable "Start Next Game" button
    this.startNextGameBtn.textContent = "End Tournament";
    this.startNextGameBtn.onclick = () => {
      // Announce final winner if you want a quick toast
      const finalMatch = this.tournamentState.find((m) => m.round === "Final");
      if (finalMatch && finalMatch.winner) {
        // Example: Using showToast or any small text
        showToast(
          `Tournament Winner: ${finalMatch.winner}`,
          "info",
          "Tournament"
        );
      }

      // Save results to DB, then redirect
      this.saveTournamentResult(() => {
        // Callback after successful save
        Route.go("/play");
      });
    };
  }

  renderTournamentCard(tourney) {
    // Format the creation date/time
    const createdDate = new Date(tourney.created_on).toLocaleString();

    // Build HTML for each match in the tournament
    let matchesHtml = "";
    (tourney.results || []).forEach((match) => {
      matchesHtml += `
        <div class="mb-3 border-bottom pb-2">
          <h5 class="mb-1">${match.round}</h5>
          <p class="mb-1"><strong>Match:</strong> ${match.players.join(
            " vs "
          )}</p>
          <p class="mb-1"><strong>Score:</strong> ${match.result}</p>
          <p class="mb-1"><strong>Winner:</strong> ${match.winner}</p>
        </div>
      `;
    });

    return `
      <div class="card mb-3">
        <div class="card-header">
          <strong>Played On:</strong> ${createdDate}
        </div>
        <div class="card-body">
          ${matchesHtml || "<p>No matches found.</p>"}
        </div>
      </div>
    `;
  }
}

export default TournamentPage;
