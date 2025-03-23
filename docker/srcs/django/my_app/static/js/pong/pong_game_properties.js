import Ball from "./ball.js"
import PongPlayer from "./player.js"
import { update, ft_start, ft_pause, ft_stop } from "./script.js"
import { initial_conditions, initial_ball } from "./initial.js"
import { update_positions, collision_2, collision_1, check_goal, collision_tb, collisions } from "./collisions.js" 
import { paint_black, paint_squares, paint_score, paint_ball, paint_players, paint_pong_gameover, paint_stop, paint_loop } from "./paint.js"
import { handleSocketMessage, sendPaddlePosition, sendBallUpdate, sendScoreUpdate, sendGameControl } from "./pong_socket_messages.js"
import { gameControlEvents } from "./events.js"

const initializePongGameProperties = function()
{
    return {
        pongSocket: null,
        playerNumber: null,
        gameReady: false,
        scoreChanged: false,

        map: null,
        pong_ctx: null,
        width: null,
        height: null,

        b_radius: 7.5,
        b_vel_i: 6,
        b_vel_f: 12,
        p_width: 20,
        p_height: 100,
        p_offest: 20,
        p_vel: 5,
        s_height: 100,
        s_width: 50,
        win_score: 3,
        isPaused: false,
        isStart: false,
        animationID: null,

        ball: new Ball(),
        p1: new PongPlayer([0, 0]),
        p2: new PongPlayer([0, 0]),
    
        update: update,
        ft_start: ft_start,
        ft_pause: ft_pause,
        ft_stop: ft_stop,
        initial_conditions: initial_conditions,
        initial_ball: initial_ball,
        update_positions: update_positions,
        collision_2: collision_2,
        collision_1: collision_1,
        check_goal: check_goal,
        collision_tb: collision_tb,
        collisions: collisions,
        paint_black: paint_black,
        paint_squares: paint_squares,
        paint_score: paint_score,
        paint_ball: paint_ball,
        paint_players: paint_players,
        paint_pong_gameover: paint_pong_gameover,
        paint_stop: paint_stop,
        paint_loop: paint_loop,

        gameControlEvents: gameControlEvents,
        handleSocketMessage: handleSocketMessage,
        sendPaddlePosition: sendPaddlePosition,
        sendBallUpdate: sendBallUpdate,
        sendScoreUpdate: sendScoreUpdate,
        sendGameControl: sendGameControl
    }
}

export { initializePongGameProperties }