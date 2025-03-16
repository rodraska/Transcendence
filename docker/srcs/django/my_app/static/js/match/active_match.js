import Component from "../spa/component.js";
import { getOrCreateSocket } from "../index.js";

class ActiveMatch extends Component {
  constructor() {
    super("static/html/active_match.html");
  }

  onInit() {
    this.player1Name = this.querySelector("#player1-name");
    this.player2Name = this.querySelector("#player2-name");
    this.player1Forfeit = this.querySelector("#player1-forfeit");
    this.player2Forfeit = this.querySelector("#player2-forfeit");
    this.loadMatchData();
    this.setupForfeitButtons();
  }

  loadMatchData() {
    if (!window.currentMatchData) {
      this.player1Name.textContent = "Unknown";
      this.player2Name.textContent = "Unknown";
      return;
    }
    const { player1, player2 } = window.currentMatchData;
    this.player1Name.textContent = player1;
    this.player2Name.textContent = player2;
  }

  setupForfeitButtons() {
    const forfeitSelf = () => {
      const socket = getOrCreateSocket();
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        alert("WebSocket not ready. Can't forfeit.");
        return;
      }
      socket.send(JSON.stringify({ action: "forfeit" }));
      alert("You forfeited the match.");
      window.currentMatchData = null;
      window.location.hash = "#/play";
    };

    if (window.loggedInUserName === window.currentMatchData?.player1) {
      this.player2Forfeit.style.display = "none";
      this.player1Forfeit.addEventListener("click", forfeitSelf);
    } else {
      this.player1Forfeit.style.display = "none";
      this.player2Forfeit.addEventListener("click", forfeitSelf);
    }
  }
}

export default ActiveMatch;
