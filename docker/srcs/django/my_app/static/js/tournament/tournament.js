import Component from "../spa/component.js";
import PongPage from "../pong/pong.js";

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
      if (!alias || alias.length < 5 || players.indexOf(alias) !== -1) {
        return;
      }
      players.push(alias);
    }

    const randomizedPlayers = this.shuffleArray(players);

    this.tournamentState = [];
    if (count === 2) {
      this.tournamentState.push({
        round: "Final",
        players: [randomizedPlayers[0], randomizedPlayers[1]],
        winner: null,
      });
    } else if (count === 3) {
      this.tournamentState.push({
        round: "Semi-final",
        players: [randomizedPlayers[0], randomizedPlayers[1]],
        winner: null,
      });
      this.tournamentState.push({
        round: "Final",
        players: [null, randomizedPlayers[2]],
        winner: null,
      });
    } else if (count === 4) {
      this.tournamentState.push({
        round: "Semi-final 1",
        players: [randomizedPlayers[0], randomizedPlayers[1]],
        winner: null,
      });
      this.tournamentState.push({
        round: "Semi-final 2",
        players: [randomizedPlayers[2], randomizedPlayers[3]],
        winner: null,
      });
      this.tournamentState.push({
        round: "Final",
        players: [null, null],
        winner: null,
      });
    }

    this.startButton.disabled = true;
    this.startNextGameBtn.style.display = "block";
    this.bracketDiv.classList.add("border", "rounded", "p-3");
    this.updateBracketDisplay();
  }

  updateBracketDisplay() {
    let html = "";
    for (const match of this.tournamentState) {
      html += `<h2 class="mt-3">${match.round}</h2>`;
      if (match.players[0] && match.players[1]) {
        html += `<p>${match.players[0]} vs ${match.players[1]}</p>`;
      } else if (match.players[0] || match.players[1]) {
        html += `<p>${
          match.players[0] ? match.players[0] : match.players[1]
        } (bye)</p>`;
      }
      if (match.winner) {
        html += `<p><strong>Winner: ${match.winner}</strong></p>`;
      }
    }
    this.bracketDiv.innerHTML = html;
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
      alert("No pending matches.");
      return;
    }
    if (
      this.tournamentState.length === 2 &&
      (!nextMatch.players[0] || !nextMatch.players[1])
    ) {
      const winnerAlias = nextMatch.players[0] || nextMatch.players[1];
      nextMatch.winner = winnerAlias;
      this.updateBracketDisplay();
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
    window.tournamentGameFinished = function (winner) {
      self.currentMatch.winner = winner;
      if (
        self.tournamentState.length === 2 &&
        self.currentMatch.round === "Semi-final"
      ) {
        self.tournamentState[1].players[0] = winner;
      }
      if (
        self.tournamentState.length === 3 &&
        self.currentMatch.round.startsWith("Semi-final")
      ) {
        const finalMatch = self.tournamentState.find(
          (m) => m.round === "Final"
        );
        if (!finalMatch.players[0]) {
          finalMatch.players[0] = winner;
        } else if (!finalMatch.players[1]) {
          finalMatch.players[1] = winner;
        }
      }
      self.updateBracketDisplay();
      self.gameModal.hide();
      window.tournamentGameFinished = null;
      window.currentTournamentMatch = null;
    };
    this.gameModal.show();
  }

  resetTournament() {
    this.tournamentState = [];
    this.bracketDiv.innerHTML = "";
    this.playersContainer.innerHTML = "";
    this.startButton.disabled = false;
    this.startNextGameBtn.style.display = "none";
    this.playerCountSelect.value = "2";
    this.updatePlayers();
  }
  confirmGameResult() {
    const selected = document.querySelector(
      'input[name="winnerRadio"]:checked'
    );
    if (!selected) {
      alert("Please select a winner.");
      return;
    }
    const winner = selected.value;
    this.currentMatch.winner = winner;

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
    if (this.currentMatch.round === "Final") {
      alert(`Tournament Winner: ${winner}`);
    }
    this.gameModal.hide();
    this.updateBracketDisplay();
  }
}

export default TournamentPage;
