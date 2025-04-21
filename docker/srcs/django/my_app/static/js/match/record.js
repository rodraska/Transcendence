import Component from "../spa/component.js";
import Route from "../spa/route.js";

class Record extends Component {
  constructor() {
    super("static/html/record.html");
    this.matches = [];
  }

  async onInit() {
    if (!window.loggedInUserName) {
        Route.go('/login');
        return;
    }

    this.listElement = this.querySelector("#match-record-list");
    this.statsElement = this.querySelector("#stats-by-game-type");
    this.filterElement = this.querySelector("#game-filter");

    if (!window.loggedInUserId) {
      this.listElement.innerHTML =
        "<p class='text-danger'>No user is logged in.</p>";
      return;
    }

    try {
      const response = await fetch(
        `/api/match_record/${window.loggedInUserId}/`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      this.matches = data.matches || [];

      this.calculateAndDisplayStats();
      this.populateFilterOptions();
      this.displayMatches();
    } catch (err) {
      console.error("Error fetching match record:", err);
      this.listElement.innerHTML = `<p class='text-danger'>Error: ${err.message}</p>`;
    }

    this.filterElement.addEventListener("change", () => this.displayMatches());
  }

  calculateAndDisplayStats() {
    const statsByGameType = {};

    this.matches.forEach((match) => {
      if (match.winner === null || !match.ended_on) return;

      const gameType = match.game_type;
      if (!statsByGameType[gameType]) {
        statsByGameType[gameType] = { totalGames: 0, wins: 0, losses: 0 };
      }

      statsByGameType[gameType].totalGames += 1;
      if (match.winner === window.loggedInUserName) {
        statsByGameType[gameType].wins += 1;
      } else {
        statsByGameType[gameType].losses += 1;
      }
    });

    this.statsElement.innerHTML = "";

    Object.keys(statsByGameType).forEach((gameType) => {
      const stats = statsByGameType[gameType];
      const totalGames = stats.totalGames;
      const wins = stats.wins;
      const losses = stats.losses;

      const winPercentage = totalGames
        ? Math.round((wins / totalGames) * 100)
        : 0;
      const lossPercentage = totalGames
        ? Math.round((losses / totalGames) * 100)
        : 0;

      const statsColumn = document.createElement("div");
      statsColumn.classList.add("col-md-4", "mb-3");

      statsColumn.innerHTML = `
        <div class="card p-3">
          <h5 class="card-title">${gameType}</h5>
          <p><strong>Total Games:</strong> ${totalGames}</p>
          <p class="text-success"><strong>Wins:</strong> ${wins}</p>
          <div class="progress" style="height: 20px;">
            <div class="progress-bar bg-success" role="progressbar" style="width: ${winPercentage}%" aria-valuenow="${winPercentage}" aria-valuemin="0" aria-valuemax="100">${winPercentage}%</div>
          </div>
          <p class="text-danger"><strong>Losses:</strong> ${losses}</p>
          <div class="progress" style="height: 20px;">
            <div class="progress-bar bg-danger" role="progressbar" style="width: ${lossPercentage}%" aria-valuenow="${lossPercentage}" aria-valuemin="0" aria-valuemax="100">${lossPercentage}%</div>
          </div>
        </div>
      `;

      this.statsElement.appendChild(statsColumn);
    });
  }

  populateFilterOptions() {
    const gameTypes = [
      ...new Set(this.matches.map((match) => match.game_type)),
    ];
    gameTypes.forEach((game) => {
      const option = document.createElement("option");
      option.value = game;
      option.textContent = game;
      this.filterElement.appendChild(option);
    });
  }

  displayMatches() {
    this.listElement.innerHTML = "";

    const selectedGame = this.filterElement.value;
    const filteredMatches =
      selectedGame === "all"
        ? this.matches
        : this.matches.filter((match) => match.game_type === selectedGame);

    if (filteredMatches.length === 0) {
      this.listElement.innerHTML = "<p>No matches found.</p>";
      return;
    }

    filteredMatches.forEach((match) => {
      if (match.winner === null && !match.ended_on) {
        return;
      }

      const li = document.createElement("li");
      li.classList.add("list-group-item", "d-flex", "justify-content-between");

      const winnerText = `<strong class="text-success">${match.winner}</strong>`;
      const matchDate = new Date(match.ended_on);
      const dateTimeString = `${matchDate.toLocaleDateString(
        "en-GB"
      )} ${matchDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;

      let extraInfo = "";
      if (match.result === "forfeit") {
        const forfeiter =
          match.winner === match.player1 ? match.player2 : match.player1;
        extraInfo = `<small class="text-danger mt-1">Forfeited by ${forfeiter}</small>`;
      } else if (match.result && match.result.includes("-")) {
        extraInfo = `<em>Score: ${match.result}</em>`;
      }

      li.innerHTML = `
        <div>
          <strong>${match.player1}</strong> vs <strong>${match.player2}</strong>
          <div>${extraInfo}</div>
          <small>${match.game_type} | ${dateTimeString}</small>
        </div>
        <div>${winnerText}</div>
      `;

      this.listElement.appendChild(li);
    });
  }
}

export default Record;
