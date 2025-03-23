import Component from "../spa/component.js"
import { initializePongGameProperties } from "./pong_game_properties.js"
import "./events.js"

class PongGame extends Component
{
    static instanceCount = 0;
    constructor()
    {
        PongGame.instanceCount++;
        console.log(`Creating PongGame instance #${PongGame.instanceCount}`);
        console.trace("PongGame constructor called");
        super('static/html/pong_game.html');

        Object.assign(this, initializePongGameProperties());
    }

    onInit() {
        window.pong_game = this;
        this.getPongElements(0);
        this.gameControlEvents();
    }

    getPongElements(attempts)
    {
        const map = document.getElementById('pong');
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const stopBtn = document.getElementById('stop-btn');
        if (!map || !startBtn || !pauseBtn || !stopBtn) {
            if (attempts < 10) {
                setTimeout(() => this.getPongElements(attempts + 1), 300)
            }
            return;
        }

        this.startBtn = startBtn;
        this.pauseBtn = pauseBtn;
        this.stopBtn = stopBtn;
        this.map = map;
        this.pong_ctx = map.getContext('2d');
        this.pong_ctx.fillStyle = 'black';
        this.pong_ctx.fillRect(0, 0, map.clientWidth, map.height);

        this.width = map.width;
        this.height = map.height;

        this.p1.pos = [-this.width / 2 + this.p_width / 2 + this.p_offest, 0];
        this.p2.pos = [this.width / 2 - this.p_width / 2 - this.p_offest, 0];

        this.setupPongSocket();
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