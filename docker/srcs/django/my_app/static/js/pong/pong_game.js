import Component from "../spa/component.js"
import { initializePongGameProperties } from "./pong_game_properties.js"
import "./pong_events.js"

class PongGame extends Component
{
    constructor()
    {
        super('static/html/pong_game.html');
    
        Object.assign(this, initializePongGameProperties());

        console.log('username: ', window.loggedInUserName);

        this.matchData = window.currentMatchData;
    }

    onInit() {
        window.pong_game = this;
        this.getPongHtmlElements(0);
        this.setupPongSocket();
        this.sendMatchData(0);
        this.gameControlEvents();
    }
}

export default PongGame;