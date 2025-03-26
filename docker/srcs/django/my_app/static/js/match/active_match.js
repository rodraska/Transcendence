import Component from "../spa/component.js";
import { getOrCreateSocket } from "../index.js";
import Route from "../spa/route.js";

class ActiveMatch extends Component {
  constructor() {
    super("static/html/active_match.html");
  }

  onInit() {
    this.player1Name = this.querySelector("#player1-name");
    this.player2Name = this.querySelector("#player2-name");
    this.player1Forfeit = this.querySelector("#player1-forfeit");
    this.player2Forfeit = this.querySelector("#player2-forfeit");
    this.customParams = this.querySelector("#custom-params");
    this.startGame = this.querySelector('#start-game');

    this.loadMatchData();
    this.setupForfeitButtons();
    this.setupStartGame();

    const socket = getOrCreateSocket();
    socket.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.event === "match_forfeited") {
        alert(d.message);
        window.currentMatchData = null;
        Route.go("/play");
      }

      else if (d.event === "start_game")
      {
        if (d.game_type === "Pong")
          Route.go("/pong");
        else if (d.game_type === "Curve")
          Route.go("/curve");
      }
        
    };
  }

  loadMatchData() {
    console.log('loadMatchData');
    if (!window.currentMatchData) {
      this.player1Name.textContent = "Unknown";
      this.player2Name.textContent = "Unknown";
      return;
    }
    console.log('currentMatchData: ', window.currentMatchData);
    const { player1, player2, powerups_enabled, points_to_win } =
      window.currentMatchData;
    this.player1Name.textContent = player1;
    this.player2Name.textContent = player2;
    if (window.currentMatchData.matchId) {
      this.customParams.innerHTML = `
        <p><strong>Powerups:</strong> ${powerups_enabled ? "On" : "Off"}</p>
        <p><strong>Points to Win:</strong> ${points_to_win ?? 10}</p>
      `;
    }
  }

  setupForfeitButtons() {
    const forfeitSelf = () => {
      const s = getOrCreateSocket();
      if (!s || s.readyState !== WebSocket.OPEN) {
        alert("WebSocket not ready.");
        return;
      }
      s.send(JSON.stringify({ action: "forfeit" }));
      window.currentMatchData = null;
      // Optionally, you can immediately route back:
      // Route.go("/play");
    };

    if (window.loggedInUserName === window.currentMatchData?.player1) {
      this.player2Forfeit.style.display = "none";
      this.player1Forfeit.addEventListener("click", forfeitSelf);
    } else {
      this.player1Forfeit.style.display = "none";
      this.player2Forfeit.addEventListener("click", forfeitSelf);
    }
  }

  setupStartGame() {
    const startGame = () => {
      const s = getOrCreateSocket();
      if (!s || s.readyState !== WebSocket.OPEN) {
        alert("Websocket not ready");
        return;
      }
      console.log("game_type: ", window.currentMatchData.game_type);
      s.send(JSON.stringify({ action: "start_game", game_type: window.currentMatchData.game_type }));
    }
    this.startGame.addEventListener("click", startGame);
  }
}

export default ActiveMatch;
