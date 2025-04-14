import Component from "../spa/component.js"
import { initializePongGameProperties } from "./pong_single_game_properties.js"
import "./pong_single_events.js"

class PongSingle extends Component
{
    constructor()
    {
        super('static/html/pong_single.html');

        Object.assign(this, initializePongGameProperties());
    }

    onInit() {
        window.pong_game = this;
        this.getPongHtmlElements(0);
        this.gameControlEvents();
    }
}

export default PongSingle;