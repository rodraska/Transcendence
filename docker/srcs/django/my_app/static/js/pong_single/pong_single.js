import Component from "../spa/component.js";
import Route from "../spa/route.js";
import { initializePongGameProperties } from "./pong_single_game_properties.js";
import "./pong_single_events.js";

class PongSingle extends Component {
  constructor() {
    super("static/html/pong_single.html");

    Object.assign(this, initializePongGameProperties());
  }

  onInit() {
    if (!window.loggedInUserName) {
        Route.go('/login');
        return;
    }

    window.pong_game = this;
    this.getPongHtmlElements(0);
    this.gameControlEvents();

    if (window.currentTournamentMatch?.players) {
      const [alias1, alias2] = window.currentTournamentMatch.players;
      this.p2.name = alias1;
      this.p1.name = alias2;
    }
  }
}

export default PongSingle;
