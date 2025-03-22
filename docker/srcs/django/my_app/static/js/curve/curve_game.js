import Component from "../spa/component.js"
import { players_free, begin_iter, curr_iter, end_iter, players_play, ft_start, ft_pause, ft_stop } from "./script.js"
import { paint_gg, final_paint, paint_line, paint_curve, paint_offset, reset_paint, paint_powerup } from "./paint.js"
import { ft_round, players_spawn, players_load, players_still, roundWinner } from "./round.js"
import { gameCoordinates, gameSaveHist, gameHoles, gamePowers, gameCheckCollision, gamePaintHist, gamePaintPlayer, gamePaintArcs, gamePaintArrows, gamePaintPowers, saveCanvas, restoreCanvas } from "./game.js"
import { dist, give_points, new_powerup, checkRGB } from "./utils.js"
import { PowerUp, PowerSpeed, PowerSlow, PowerThin, PowerSmallTurn, PowerGod, PowerBig, PowerBigTurn, PowerRubber } from "./powerup.js"
import "./keys.js"

class CurveGame extends Component
{
    constructor()
    {
        super('static/html/curve_game.html');

        this.numberPlayers = 2;
        this.players = [];
        this.powers = [];
        this.round = 1;
        this.dead = 0;
        this.stp = 0;
        this.round_winner = 0;
        this.game_winner = 0;

        this.baseValues = {
        radius: 4.20,
        vel: 1.75,
        turn: 0.015,
        hole: 101
        }

        this.powerConstructors = {
            1: PowerSpeed,
            2: PowerSlow,
            3: PowerThin,
            4: PowerSmallTurn,
            5: PowerGod,
            6: PowerSpeed,
            7: PowerSlow,
            8: PowerBig,
            9: PowerBigTurn,
            10: PowerRubber
        }

        this.powerColors = {
            1: "lime",
            2: "yellow",
            3: "cyan",
            4: "blue",
            5: "pink",
            6: "green",
            7: "orange",
            8: "brown",
            9: "purple",
            10: "red",
            11: "gold",
            12: "lightgray",
            13: "violet",
            14: 'magenta',
            15: "white",
        }

        this.baseIters = {
            1: 180,
            2: 600,
            3: 900,
            4: 900,
            5: 360,
            6: 180,
            7: 300,
            8: 420,
            9: 300,
            10: 25
        }

        this.currentIters = {
            begin: 0,
            end: 0,
            load: 0,
            10: 0
        }
    
        this.playerColors = {
            1: "blue",
            2: "red",
            3: "yellow",
            4: "green"
        }
    
        this.playerRGB = {
            1: [0, 0, 255],
            2: [255, 0, 0],
            3: [255, 255, 0],
            4: [0, 255, 0]
        }
    
        this.playerControls = {
            1: ["ArrowUp", "ArrowLeft"],
            2: ["d", "a"],
            3: ["3", "1"],
            4: ["m", "b"]
        }
    
        this.playerArrows = {
            1: ["Up", "Left"],
            2: ["D", "A"],
            3: ["3", "1"],
            4: ["M", "B"]
        }
    
        this.playerScores = {
            0: 0,
            1: 0,
            2: 0,
            3: 0,
            4: 0
        }

        this.players_free = players_free;
        this.begin_iter = begin_iter;
        this.curr_iter = curr_iter;
        this.end_iter = end_iter;
        this.players_play = players_play 
        this.ft_start = ft_start;
        this.ft_pause = ft_pause;
        this.ft_stop = ft_stop;
        this.paint_gg = paint_gg;
        this.final_paint = final_paint;
        this.paint_line = paint_line;
        this.paint_curve = paint_curve;
        this.paint_offset = paint_offset;
        this.reset_paint = reset_paint;
        this.paint_powerup = paint_powerup;
        this.ft_round = ft_round;
        this.players_spawn = players_spawn;
        this.players_load = players_load;
        this.players_still = players_still;
        this.roundWinner = roundWinner;
        this.gameCoordinates = gameCoordinates;
        this.gameSaveHist = gameSaveHist;
        this.gameHoles = gameHoles;
        this.gamePowers = gamePowers;
        this.gameCheckCollision = gameCheckCollision;
        this.gamePaintHist = gamePaintHist;
        this.gamePaintPlayer = gamePaintPlayer;
        this.gamePaintArcs = gamePaintArcs;
        this.gamePaintArrows = gamePaintArrows;
        this.gamePaintPowers = gamePaintPowers;
        this.saveCanvas = saveCanvas;
        this.restoreCanvas = restoreCanvas;
        this.dist = dist;
        this.give_points = give_points;
        this.checkRGB = checkRGB;
        this.new_powerup = new_powerup;
    }

    onInit() {
        window.curve_game = this;
        this.getElements(0);

        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => {
                //this.sendGameControl('start');
                this.ft_start();
            });
        }
        if (this.pauseBtn) {
            this.pauseBtn.addEventListener('click', () => {
                //this.sendGameControl('pause');
                this.ft_pause();
            });
        }
        if (this.stopBtn) {
            this.stopBtn.addEventListener('click', () => {
                //this.sendGameControl('stop');
                this.ft_stop();
            });
        }
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
            return
        }
        this.setupCurve(canvas, playersPlay, playerList, startBtn, pauseBtn, stopBtn);

    }

    setupCurve(canvas, playersPlay, playerList, startBtn, pauseBtn, stopBtn)
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
            const type = data.type
            self.handleSocketMessage(data);
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
    }
    
    handleSocketMessage(data)
    {
        const type = data.type;

        switch (type)
        {
            case 'player_assign':
                this.playerNumber = data.player_number;
                console.log(`Assigned as player: ${this.playerNumber}`);
                break;

            case 'game_ready':
                console.log('Game is ready to start');
                this.gameReady = true;
                break;
                
            default:
                console.log('Unkown message type:', type);
        }
    }

    sendGameControl(action) {
        if (!this.curveSocket || this.curveSocket.readyState !== WebSocket.OPEN) {
            console.error("Curve socket not connected");
            return;
        }

        if (!['start', 'pause', 'stop'].includes(action)) {
            console.error("Invalid game control action: ", action);
            return;
        }

        this.curveSocket.send(JSON.stringify({
            'type': 'game_control',
            'action': action
        }))
    }
}

export default CurveGame;