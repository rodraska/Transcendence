import { _cos, _sin, check_powerup, count_powerup, hard_boundaries } from "./curve_player_utils.js"
import { paint_player, paint_hist, paint_arcs, paint_arrow } from "./curve_player_paint.js"
import { save_hist, generalized_coordinates, holes, processCollision, checkCollision } from "./curve_player_iteration.js"
import { pick_powerups, give_powerup, iter_power } from "./curve_player_power.js"

class Player
{
    back = [0, 0];
    mid = [0, 0];
    powers = [];
    vel = [0, 0];
    hole_iter = 0;
    turning = 0;
    god = false;
    stop = false;

    constructor(id, name, color, rgb, pos, theta, right, left, game)
    {
        this._cos=_cos;
        this._sin = _sin;
        this.check_powerup = check_powerup;
        this.count_powerup = count_powerup;
        this.hard_boundaries = hard_boundaries;
        this.paint_player = paint_player;
        this.paint_hist = paint_hist;
        this.paint_arcs = paint_arcs;
        this.paint_arrow = paint_arrow;
        this.save_hist = save_hist;
        this.generalized_coordinates = generalized_coordinates;
        this.holes = holes;
        this.processCollision = processCollision;
        this.checkCollision = checkCollision;
        this.pick_powerups = pick_powerups;
        this.give_powerup = give_powerup;
        this.iter_power = iter_power;

        this.id = id;
        this.name = name;
        this.color = color;
        this.rgb = rgb;
        this.pos = pos;
        this.truepos = [pos[0] + game.width / 2, pos[1] + game.height / 2];
        this.theta = theta;
        this.trig = [this._cos(0), this._sin(0)];
        this.right = right;
        this.left = left;
        this.game = game;
        this.vel_t = game.baseValues.vel;
        this.radius = game.baseValues.radius;
        this.turn_rate = game.baseValues.turn;
        this.hole_rate = game.baseValues.hole;

         
    }
}

export default Player;

const FtPlayer = Player.prototype;