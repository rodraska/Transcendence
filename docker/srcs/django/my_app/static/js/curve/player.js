import { _cos, _sin, trueIndex, check_powerup, count_powerup, hard_boundaries } from "./player_utils.js"

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

    constructor(id, color, rgb, pos, theta, right, left, game)
    {
        this._cos=_cos;
        this._sin = _sin;
        this.trueIndex = trueIndex;
        this.check_powerup = check_powerup;
        this.count_powerup = count_powerup;
        this.hard_boundaries = hard_boundaries;

        this.id = id;
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