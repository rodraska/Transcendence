import Component from "../spa/component.js"
import Route from "../spa/route.js";
import { initializeCurveGameProperties } from "./curve_single_game_properties.js"
//import "./curve_single_events.js"

class CurveSingle extends Component
{
    constructor()
    {
        super('static/html/curve_single.html');

        Object.assign(this, initializeCurveGameProperties());
    }

    onInit() {
        if (!window.loggedInUserName) {
            Route.go('/login');
            return;
        }

        window.curve_game = this;
        this.getCurveHtmlElements(0);
        this.curveGameControlEvents();
    }
}

export default CurveSingle;
