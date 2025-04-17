import { players_free, begin_iter, curr_iter, end_iter, players_play, ft_start, ft_pause, ft_stop } from "./curve_single_script.js"
import { paint_gg, final_paint, paint_line, paint_curve, paint_offset, reset_paint, paint_powerup } from "./curve_single_paint.js"
import { ft_round, players_spawn, players_load, players_still } from "./curve_single_round.js"
import { gamePaintHist, gamePaintPlayers, gamePaintArcs, gamePaintPowers, gamePaintArrows, saveCanvas, restoreCanvas, gameSaveHist, gameGeneralizedCoordinates, gameHoles, gamePickPowers, gameCheckCollision } from "./curve_single_game_functions.js"
import { dist, new_powerup, checkRGB } from "./curve_single_utils.js"
import { PowerUp, PowerSpeed, PowerSlow, PowerGod, PowerRubber } from "./curve_single_powerup.js"
import { curveGameControlEvents } from "./curve_single_events.js"
import { getCurveHtmlElements } from "./curve_single_html_elements.js"

const initializeCurveGameProperties = function()
{
    return {
        curveSocket: null,
        playerNumber: null,
        myPlayer: null,
        name: null,
        gameReady: null,
        isOver: false,
        score: "",

        players: [],
        powers: [],
        round: 1,
        dead: 0,
        erase: false,
        round_winner: 0,
        game_winner: 0,
        points_to_win: 3,
        powerups_enabled: 0,
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
            3: PowerGod,
            4: PowerSpeed,
            5: PowerSlow,
            6: PowerRubber
        },

        powerColors: {
            1: "lime",
            2: "yellow",
            3: "pink",
            4: "lime",
            5: "yellow",
            6: "white"
        },

        baseIters: {
            1: 180,
            2: 600,
            3: 360,
            4: 180,
            5: 300,
            6: 25,
        },

        currentIters: {
            begin: 0,
            end: 0,
            load: 0,
            6: 0
        },
    
        playerColors: {
            1: "blue",
            2: "red"
        },
    
        playerRGB: {
            1: [0, 0, 255],
            2: [255, 0, 0]
        },
    
        playerControls: {
            1: ["ArrowUp", "ArrowLeft"],
            2: ["d", "a"]
        },
    
        playerArrows: {
            1: ["Up", "Left"],
            2: ["D", "A"]
        },
    
        playerScores: {
            0: 0,
            1: 0,
            2: 0
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
        gamePaintHist: gamePaintHist,
        gamePaintPlayers: gamePaintPlayers,
        gamePaintArcs: gamePaintArcs,
        gamePaintPowers: gamePaintPowers,
        gamePaintArrows: gamePaintArrows,
        gameSaveHist: gameSaveHist,
        gameGeneralizedCoordinates: gameGeneralizedCoordinates,
        gameHoles: gameHoles,
        gamePickPowers: gamePickPowers,
        gameCheckCollision: gameCheckCollision,
        saveCanvas: saveCanvas,
        restoreCanvas: restoreCanvas,
        dist: dist,
        checkRGB: checkRGB,
        new_powerup: new_powerup,

        curveGameControlEvents: curveGameControlEvents,
        getCurveHtmlElements: getCurveHtmlElements,
    }
}

export { initializeCurveGameProperties }