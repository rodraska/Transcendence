const initial_conditions = function()
{
    console.log('initial_conditions');
    this.ball.pos[0] = 0;
    this.ball.pos[1] = 0;
    this.ball.vel[0] = 0;
    this.ball.vel[1] = 0;
    this.ball.vel_t = 0;
    this.p1.pos[0] = -this.width / 2 + this.p_width / 2 + this.p_offest;
    this.p1.pos[1] = 0;
    this.p2.pos[0] = this.width / 2 - this.p_width / 2 - this.p_offest;
    this.p2.pos[1] = 0;
}

const initial_ball = function()
{
    console.log('initial_ball');
    const randomSide = Math.floor(Math.random() * 2) + 1;
    if (randomSide == 1)
        this.ball.vel[0] = this.b_vel_i;
    else
        this.ball.vel[0] = -this.b_vel_i;
}

export {initial_conditions, initial_ball}