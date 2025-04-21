import Component from "../spa/component.js"
import Route from "../spa/route.js";
import { initializePongGameProperties } from "./pong_game_properties.js"
import "./pong_events.js"

class PongGame extends Component
{
    constructor()
    {
        super('static/html/pong_game.html');
    }

    onInit() {  
        this.matchData = window.currentMatchData;
        if (window.currentMatchData == undefined)
        {
            Route.go('/play');
            return;
        }
        Object.assign(this, initializePongGameProperties());
        window.pong_game = this;
        this.getPongHtmlElements(0);
        this.setupPongSocket();
        this.sendMatchData(0);
        this.gameControlEvents();
    }
}

export default PongGame;
