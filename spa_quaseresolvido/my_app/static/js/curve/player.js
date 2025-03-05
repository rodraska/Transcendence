class CurvePlayer
{
    back = [0, 0];
    mid = [0, 0];
    powers = [];
    vel = [0, 0];
    vel_t = game.baseValues.vel;
    radius = game.baseValues.radius;
    turn_rate = game.baseValues.turn;
    hole_rate = game.baseValues.hole;
    hole_iter = 0;
    turning = 0;
    god = false;
    stop = false;

    constructor(id, color, rgb, pos, theta, right, left)
    {
        this.id = id;
        this.color = color;
        this.rgb = rgb;
        this.pos = pos;
        this.truepos = [pos[0] + width / 2, pos[1] + height / 2];
        this.theta = theta;
        this.trig = [this._cos(0), this._sin(0)];
        this.right = right;
        this.left = left;
    }
}

const FtCurvePlayer = CurvePlayer.prototype;