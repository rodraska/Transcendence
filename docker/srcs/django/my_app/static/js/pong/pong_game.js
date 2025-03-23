import Component from "../spa/component.js"
import { initializePongGameProperties } from "./pong_game_properties.js"
import "./pong_events.js"

class PongGame extends Component
{
    constructor()
    {
        super('static/html/pong_game.html');

        Object.assign(this, initializePongGameProperties());
    }

    onInit() {
        window.pong_game = this;
        this.getPongHtmlElements(0);
        this.setupPongSocket();
        this.gameControlEvents();
    }

    setupPongSocket()
    {
        const self = this;

        const pongSocket = new WebSocket(`ws://localhost:8000/ws/pong_game/`);
        this.pongSocket = pongSocket;

        pongSocket.onopen = function() {
            console.log("Pong socket open");
        };
        
        pongSocket.onerror = function(e) {
            console.error('Pong socket error:', e)
        };

        pongSocket.onclose = function(e) {
            console.log('Pong socket closed:', e.code, e.reason)
        };

        pongSocket.onmessage = function(e) {
            const data = JSON.parse(e.data);
            //console.log("Pong socket onmessage:", data);
            self.handleSocketMessage(data);
        };
    }
}

export default PongGame;