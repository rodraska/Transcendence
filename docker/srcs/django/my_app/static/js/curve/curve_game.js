import Component from "../spa/component.js"
import { initializeCurveGameProperties } from "./curve_game_properties.js"
import "./curve_events.js"

class CurveGame extends Component
{
    constructor()
    {
        super('static/html/curve_game.html');

        Object.assign(this, initializeCurveGameProperties());

        this.matchData = window.currentMatchData;
    }

    onInit() {
        window.curve_game = this;
        this.getCurveHtmlElements(0);
        this.setupCurveSocket();
        this.sendMatchData(0);
        this.curveGameControlEvents();
    }
}

export default CurveGame;