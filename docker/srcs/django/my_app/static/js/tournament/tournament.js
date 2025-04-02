import Component from "../spa/component.js";

class TournamentPage extends Component {
  constructor() {
    super("static/html/tournament.html");
    // Holds the tournament state (an array of match objects)
    this.tournamentState = [];
  }

  onInit() {
    // Get DOM elements from the loaded template
    this.playerCountSelect = document.getElementById("playerCount");
    this.playersContainer = document.getElementById("playersContainer");
    this.startButton = document.getElementById("startTournament");
    this.bracketDiv = document.getElementById("bracket");
    this.startNextGameBtn = document.getElementById("startNextGame");

    // Modal elements
    this.gameModalElement = document.getElementById("gameModal");
    this.gameModal = new bootstrap.Modal(this.gameModalElement);
    this.gameMatchInfo = document.getElementById("gameMatchInfo");
    this.winnerSelectionDiv = document.getElementById("winnerSelection");
    this.confirmGameBtn = document.getElementById("confirmGameBtn");

    // Bind event listeners
    this.playerCountSelect.addEventListener(
      "change",
      this.updatePlayers.bind(this)
    );
    this.startButton.addEventListener("click", this.initTournament.bind(this));
    this.startNextGameBtn.addEventListener(
      "click",
      this.openNextGameModal.bind(this)
    );
    this.confirmGameBtn.addEventListener(
      "click",
      this.confirmGameResult.bind(this)
    );

    // Initialize player input fields
    this.updatePlayers();
  }

  updatePlayers() {
    const count = parseInt(this.playerCountSelect.value, 10);
    this.playersContainer.innerHTML = ""; // Clear any existing inputs

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
      this.playersContainer.appendChild(formGroup);
    }
  }

  // Simple array shuffling function
  shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  initTournament() {
    const count = parseInt(this.playerCountSelect.value, 10);
    const players = [];

    // Collect player aliases; alert if any are empty.
    for (let i = 1; i <= count; i++) {
      const alias = document.getElementById("player" + i).value.trim();
      if (!alias) {
        alert("Please fill in all player aliases.");
        return;
      }
      players.push(alias);
    }

    // Randomize order for initial seeding.
    const randomizedPlayers = this.shuffleArray(players);

    // Build tournament state based on the number of players.
    this.tournamentState = [];
    if (count === 2) {
      // Only one match (final)
      this.tournamentState.push({
        round: "Final",
        players: [randomizedPlayers[0], randomizedPlayers[1]],
        winner: null,
      });
    } else if (count === 3) {
      // One semi-final and one final (bye given)
      this.tournamentState.push({
        round: "Semi-final",
        players: [randomizedPlayers[0], randomizedPlayers[1]],
        winner: null,
      });
      // For final, the bye player goes automatically into one slot.
      this.tournamentState.push({
        round: "Final",
        players: [null, randomizedPlayers[2]],
        winner: null,
      });
    } else if (count === 4) {
      // Two semi-finals then a final.
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

    this.updateBracketDisplay();
  }

  updateBracketDisplay() {
    let html = "";
    for (const match of this.tournamentState) {
      html += `<h2 class="mt-3">${match.round}</h2>`;
      if (match.players[0] && match.players[1]) {
        html += `<p>${match.players[0]} vs ${match.players[1]}</p>`;
      } else if (match.players[0] || match.players[1]) {
        // For a bye scenario
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

  // Returns the next match object that is pending (winner is null and both players are set)
  getNextPendingMatch() {
    return this.tournamentState.find((match) => {
      return match.winner === null && match.players[0] && match.players[1];
    });
  }

  openNextGameModal() {
    const nextMatch = this.getNextPendingMatch();
    if (!nextMatch) {
      alert("No pending matches. Tournament might be complete.");
      return;
    }
    // Display match information in the modal.
    this.currentMatch = nextMatch;
    this.gameMatchInfo.textContent = `Match: ${nextMatch.players[0]} vs ${nextMatch.players[1]}`;

    // Build radio buttons to choose the winner.
    this.winnerSelectionDiv.innerHTML = `
      <div class="form-check">
        <input class="form-check-input" type="radio" name="winnerRadio" id="winner1" value="${nextMatch.players[0]}">
        <label class="form-check-label" for="winner1">
          ${nextMatch.players[0]}
        </label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="radio" name="winnerRadio" id="winner2" value="${nextMatch.players[1]}">
        <label class="form-check-label" for="winner2">
          ${nextMatch.players[1]}
        </label>
      </div>
    `;
    // Show the modal.
    this.gameModal.show();
  }

  confirmGameResult() {
    // Get selected winner from the radio buttons.
    const selected = document.querySelector(
      'input[name="winnerRadio"]:checked'
    );
    if (!selected) {
      alert("Please select a winner.");
      return;
    }
    const winner = selected.value;
    // Update current match with the winner.
    this.currentMatch.winner = winner;

    // Propagate winner to next round if needed.
    // For a 3-player tournament, if the semi-final is done, update the final.
    if (
      this.tournamentState.length === 2 &&
      this.currentMatch.round === "Semi-final"
    ) {
      // For our state, assume final match players: [null, bye]
      this.tournamentState[1].players[0] = winner;
    }
    // For a 4-player tournament, assign winners to the final.
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
    // If final match is played, record the tournament winner.
    if (this.currentMatch.round === "Final") {
      alert(`Tournament Winner: ${winner}`);
    }
    this.gameModal.hide();
    this.updateBracketDisplay();
  }
}

export default TournamentPage;
