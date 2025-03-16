import Component from "../spa/component.js";

class Record extends Component {
  constructor() {
    super("static/html/record.html");
  }

  async onInit() {
    this.listElement = this.querySelector("#match-record-list");
    if (!window.loggedInUserId) {
      this.listElement.innerHTML = "No user is logged in.";
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
      if (!data.matches) {
        this.listElement.innerHTML = "No matches found.";
        return;
      }
      this.listElement.innerHTML = "";
      data.matches.forEach((match) => {
        const li = document.createElement("li");
        li.classList.add("list-group-item");
        const winner = match.winner || "None";
        li.textContent = `Match #${match.match_id}: ${match.player1} vs ${match.player2} | Game: ${match.game_type} | Winner: ${winner}`;
        this.listElement.appendChild(li);
      });
    } catch (err) {
      console.error("Error fetching match record:", err);
      this.listElement.innerHTML = `Error: ${err.message}`;
    }
  }
}

export default Record;
