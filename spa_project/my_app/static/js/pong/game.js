class PongGame 
{
    constructor()
    {
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
        this.animationID;
        this.ball = new Ball();
        this.p1 = new PongPlayer([-width / 2 + this.p_width / 2 + this.p_offest, 0]);
        this.p2 = new PongPlayer([width / 2 - this.p_width / 2 - this.p_offest, 0]);
    }
}

const FtPongGame = PongGame.prototype;