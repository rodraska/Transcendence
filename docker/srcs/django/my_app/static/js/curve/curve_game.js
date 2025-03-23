import Component from "../spa/component.js"
import { initializeCurveGameProperties } from "./curve_game_properties.js"
import "./keys.js"

class CurveGame extends Component
{
    constructor()
    {
        super('static/html/curve_game.html');

        Object.assign(this, initializeCurveGameProperties());
    }

    onInit() {
        window.curve_game = this;
        this.getElements(0);
        this.curveGameControlEvents();
    }

    getElements(attempts)
    {
        const canvas = document.getElementById('curve');
        const playersPlay = document.getElementById('playersPlay');
        const playerList = document.getElementById('playerList');
        const startBtn = document.getElementById('start_btn');
        const pauseBtn = document.getElementById('pause_btn');
        const stopBtn = document.getElementById('stop_btn');
        if (!canvas || !playersPlay || !playerList || !startBtn || !pauseBtn || !stopBtn) {
            if (attempts < 10) {
                setTimeout(() => this.getElements(attempts + 1), 300)
            }
            return;
        }

        this.startBtn = startBtn;
        this.pauseBtn = pauseBtn;
        this.stopBtn = stopBtn;
        this.canvas = canvas;
        this.playersPlay = playersPlay;
        this.playerList = playerList;
        this.ctx = canvas.getContext('2d');
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.s_canvas = document.createElement("canvas");
        this.s_canvas.width = canvas.width;
        this.s_canvas.height = canvas.height;
        this.s_ctx = this.s_canvas.getContext('2d');

        this.offset = 4;
        this.width = canvas.width;
        this.height = canvas.height;

        this.playersPlay.textContent = this.numberCurvePlayers + ' CurvePlayers';
            
        for (let i = 0; i < this.numberCurvePlayers; i++)
        {
            let playerNumber = i + 1;
            //Create div element
            let playerDiv = document.createElement('div');
            playerDiv.style.display = 'flex';
            //CurvePlayer Name
            let playerName = document.createElement('p');
            playerName.textContent = 'CurvePlayer ' + playerNumber;
            playerName.style.justifyContent = 'left';
            playerName.style.flexGrow = '1';
            //CurvePlayer Score
            let playerScore = document.createElement('p');
            playerScore.textContent = '0';
            playerScore.id = 'score' + playerNumber;
            playerScore.style.justifyContent = 'left';
            playerScore.style.flexGrow = '1';
            playerDiv.appendChild(playerName);
            playerDiv.appendChild(playerScore);
            this.playerList.appendChild(playerDiv);
        }
        this.setupCurveSocket();
    }

    setupCurveSocket()
    {
        const self = this;

        const curveSocket = new WebSocket(`ws://localhost:8000/ws/curve_game/`);
        this.curveSocket = curveSocket;

        curveSocket.onopen = function() {
            console.log('Curve socket onopen');
        }

        curveSocket.onerror = function(e) {
            console.error('Curve socket error:', e);
        }

        curveSocket.onclose = function(e) {
            console.log('Curve socket closed:', e.code, e.reason);
        }

        curveSocket.onmessage = function(e)
        {
            const data = JSON.parse(e.data);
            //console.log("Curve socket onmessage:", data);
            self.handleSocketMessage(data);
        }
    }
}

export default CurveGame;