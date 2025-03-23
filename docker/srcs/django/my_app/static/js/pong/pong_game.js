import Component from "../spa/component.js"
import Ball from "./ball.js"
import PongPlayer from "./player.js"
import { update, ft_start, ft_pause, ft_stop } from "./script.js"
import { initial_conditions, initial_ball } from "./initial.js"
import { update_positions, collision_2, collision_1, check_goal, collision_tb, collisions } from "./collisions.js" 
import { paint_black, paint_squares, paint_score, paint_ball, paint_players, paint_pong_gameover, paint_stop, paint_loop } from "./paint.js"
import { handleSocketMessage, sendPaddlePosition, sendBallUpdate, sendScoreUpdate, sendGameControl } from "./socket_messages.js"
import { gameControlEvents } from "./events.js"
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

        this.pongSocket = null;
        this.playerNumber = null;
        this.gameReady = false;
        this.scoreChanged = false;

        this.map = null;
        this.pong_ctx = null;
        this.width = null;
        this.height = null;

        this.b_radius = 7.5;
        this.b_vel_i = 6;
        this.b_vel_f = 12;
        this.p_width = 20;
        this.p_height = 100;
        this.p_offest = 20;
        this.p_vel = 5;
        this.s_height = 100;
        this.s_width = 50;
        this.win_score = 3;
        this.isPaused = false;
        this.isStart = false;
        this.animationID = null;

        this.ball = new Ball();
        this.p1 = new PongPlayer([0, 0]);
        this.p2 = new PongPlayer([0, 0]);
    
        this.update = update;
        this.ft_start = ft_start;
        this.ft_pause = ft_pause;
        this.ft_stop = ft_stop;
        this.initial_conditions = initial_conditions;
        this.initial_ball = initial_ball;
        this.update_positions = update_positions;
        this.collision_2 = collision_2;
        this.collision_1 = collision_1;
        this.check_goal = check_goal;
        this.collision_tb = collision_tb;
        this.collisions = collisions;
        this.paint_black = paint_black;
        this.paint_squares = paint_squares;
        this.paint_score = paint_score;
        this.paint_ball = paint_ball;
        this.paint_players = paint_players;
        this.paint_pong_gameover = paint_pong_gameover;
        this.paint_stop = paint_stop;
        this.paint_loop = paint_loop;

        this.gameControlEvents = gameControlEvents;
        this.handleSocketMessage = handleSocketMessage;
        this.sendPaddlePosition = sendPaddlePosition;
        this.sendBallUpdate = sendBallUpdate;
        this.sendScoreUpdate = sendScoreUpdate;
        this.sendGameControl = sendGameControl;
    }

    onInit() {
        window.pong_game = this;
        this.getElements(0);
        this.gameControlEvents();
    }

    getElements(attempts)
    {
        const map = document.getElementById('pong');
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const stopBtn = document.getElementById('stop-btn');
        if (!map || !startBtn || !pauseBtn || !stopBtn) {
            if (attempts < 10) {
                setTimeout(() => this.getElements(attempts + 1), 300)
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

        this.setupPong(map, startBtn, pauseBtn, stopBtn);
    }

    setupPong(map, startBtn, pauseBtn, stopBtn)
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

const FtPongGame = PongGame.prototype;

export default PongGame;