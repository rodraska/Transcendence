FtPongGame.initial_conditions = function()
{
    this.ball.pos[0] = 0;
    this.ball.pos[1] = 0;
    this.ball.vel[0] = 0;
    this.ball.vel[1] = 0;
    this.ball.vel_t = 0;
    this.p1.pos[0] = -width / 2 + this.p_width / 2 + this.p_offest;
    this.p1.pos[1] = 0;
    this.p2.pos[0] = width / 2 - this.p_width / 2 - this.p_offest;
    this.p2.pos[1] = 0;
}

FtPongGame.initial_ball = function()
{
    const randomSide = Math.floor(Math.random() * 2) + 1;
    if (randomSide == 1)
        this.ball.vel[0] = this.b_vel_i;
    else
        this.ball.vel[0] = -this.b_vel_i;
}