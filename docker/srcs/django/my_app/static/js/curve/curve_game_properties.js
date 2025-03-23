import { players_free, begin_iter, curr_iter, end_iter, players_play, ft_start, ft_pause, ft_stop } from "./curve_script.js"
import { paint_gg, final_paint, paint_line, paint_curve, paint_offset, reset_paint, paint_powerup } from "./curve_paint.js"
import { ft_round, players_spawn, players_load, players_still, roundWinner } from "./curve_round.js"
import { gameCoordinates, gameSaveHist, gameHoles, gamePowers, gameCheckCollision, gamePaintHist, gamePaintPlayer, gamePaintArcs, gamePaintArrows, gamePaintPowers, saveCanvas, restoreCanvas } from "./curve_game_functions.js"
import { dist, give_points, new_powerup, checkRGB } from "./curve_utils.js"
import { PowerUp, PowerSpeed, PowerSlow, PowerThin, PowerSmallTurn, PowerGod, PowerBig, PowerBigTurn, PowerRubber } from "./curve_powerup.js"
import { handleSocketMessage, sendPlayerState, sendNewPower, sendPickPower, sendPickOthers, sendPickGeneral, sendGameControl } from "./curve_socket_messages.js"
import { curveGameControlEvents } from "./curve_events.js"
import { getCurveHtmlElements } from "./curve_html_elements.js"
import { setupCurveSocket } from "./curve_socket_setup.js"

const initializeCurveGameProperties = function()
{
    return {
        curveSocket: null,
        playerNumber: null,
        gameReady: null,

        numberPlayers: 2,
        players: [],
        powers: [],
        round: 1,
        dead: 0,
        stp: 0,
        erase: false,
        round_winner: 0,
        game_winner: 0,
        isPaused: false,
        isStart: false,
        animationID: null,

        baseValues: {
        radius: 4.20,
        vel: 0.75,
        turn: 0.015,
        hole: 101
        },

        powerConstructors: {
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
        },

        powerColors: {
            1: "lime",
            2: "yellow",
            3: "cyan",
            4: "blue",
            5: "pink",
            6: "green",
            7: "orange",
            8: "brown",
            9: "purple",
            10: "white"
        },

        baseIters: {
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
        },

        currentIters: {
            begin: 0,
            end: 0,
            load: 0,
            10: 0
        },
    
        playerColors: {
            1: "blue",
            2: "red",
            3: "yellow",
            4: "green"
        },
    
        playerRGB: {
            1: [0, 0, 255],
            2: [255, 0, 0],
            3: [255, 255, 0],
            4: [0, 255, 0]
        },
    
        playerControls: {
            1: ["ArrowUp", "ArrowLeft"],
            2: ["d", "a"],
            3: ["3", "1"],
            4: ["m", "b"]
        },
    
        playerArrows: {
            1: ["Up", "Left"],
            2: ["D", "A"],
            3: ["3", "1"],
            4: ["M", "B"]
        },
    
        playerScores: {
            0: 0,
            1: 0,
            2: 0,
            3: 0,
            4: 0
        },

        players_free: players_free,
        begin_iter: begin_iter,
        curr_iter: curr_iter,
        end_iter: end_iter,
        players_play: players_play ,
        ft_start: ft_start,
        ft_pause: ft_pause,
        ft_stop: ft_stop,
        paint_gg: paint_gg,
        final_paint: final_paint,
        paint_line: paint_line,
        paint_curve: paint_curve,
        paint_offset: paint_offset,
        reset_paint: reset_paint,
        paint_powerup: paint_powerup,
        ft_round: ft_round,
        players_spawn: players_spawn,
        players_load: players_load,
        players_still: players_still,
        roundWinner: roundWinner,
        gameCoordinates: gameCoordinates,
        gameSaveHist: gameSaveHist,
        gameHoles: gameHoles,
        gamePowers: gamePowers,
        gameCheckCollision: gameCheckCollision,
        gamePaintHist: gamePaintHist,
        gamePaintPlayer: gamePaintPlayer,
        gamePaintArcs: gamePaintArcs,
        gamePaintArrows: gamePaintArrows,
        gamePaintPowers: gamePaintPowers,
        saveCanvas: saveCanvas,
        restoreCanvas: restoreCanvas,
        dist: dist,
        give_points: give_points,
        checkRGB: checkRGB,
        new_powerup: new_powerup,

        curveGameControlEvents: curveGameControlEvents,
        handleSocketMessage: handleSocketMessage,
        sendPlayerState: sendPlayerState,
        sendNewPower: sendNewPower,
        sendPickPower: sendPickPower,
        sendPickOthers: sendPickOthers,
        sendPickGeneral: sendPickGeneral,
        sendGameControl: sendGameControl,
        getCurveHtmlElements: getCurveHtmlElements,
        setupCurveSocket: setupCurveSocket
    }
}

export { initializeCurveGameProperties }