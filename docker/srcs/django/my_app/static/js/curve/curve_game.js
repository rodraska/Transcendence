import Component from "../spa/component.js"
import Route from "../spa/route.js";
import { initializeCurveGameProperties } from "./curve_game_properties.js"
import "./curve_events.js"

class CurveGame extends Component
{
    constructor()
    {
        super('static/html/curve_game.html');
    }

    onInit() {
        this.matchData = window.currentMatchData;
        if (window.currentMatchData == undefined)
        {
            Route.go('/play');
            return;
        }
        Object.assign(this, initializeCurveGameProperties());
        window.curve_game = this;
        this.getCurveHtmlElements(0);
        this.setupCurveSocket();
        this.sendMatchData(0);
        this.curveGameControlEvents();
    }
}

export default CurveGame;
