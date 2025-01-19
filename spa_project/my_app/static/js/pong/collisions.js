FtGame.update_positions = function()
{
    this.ball.pos[0] += this.ball.vel[0];
    this.ball.pos[1] += this.ball.vel[1];
    this.ball.vel_t = Math.sqrt(Math.pow(this.ball.vel[0], 2) + Math.pow(this.ball.vel[1], 2));

    if (this.p2.moving === true)
        this.p2.pos[1] += this.p2.vel;
    if (this.p1.moving === true)
        this.p1.pos[1] += this.p1.vel;
}

FtGame.collision_2 = function()
{
    if (this.ball.pos[0] + this.b_radius >= width / 2 - this.p_offest - this.p_width)
    {
        dist = this.ball.pos[1] - this.p2.pos[1];
        if (this.ball.pos[1] >= this.p2.pos[1] && this.ball.pos[1] <= this.p2.pos[1] + this.p_height / 2)
        {
            theta = (90 / this.p_height * dist) * Math.PI / 180;
            this.ball.vel[1] = this.ball.vel_t * Math.sin(theta);
            this.ball.vel[0] = -this.b_vel_f;
        } 
        else if (this.ball.pos[1] <= this.p2.pos[1] && this.ball.pos[1] >= this.p2.pos[1] - this.p_height / 2)
        {
            theta = (90 / this.p_height * dist) * Math.PI / 180; 
            this.ball.vel[1] = this.ball.vel_t * Math.sin(theta);
            this.ball.vel[0] = -this.b_vel_f;
        }
    }
}

FtGame.collision_1 = function()
{
    if (this.ball.pos[0] + this.b_radius <= - width / 2 + this.p_offest + this.p_width)
    {
        dist = this.ball.pos[1] - this.p1.pos[1];
        if (this.ball.pos[1] >= this.p1.pos[1] && this.ball.pos[1] <= this.p1.pos[1] + this.p_height / 2)
        {
            theta = (90 / this.p_height * dist) * Math.PI / 180;
            this.ball.vel[1] = this.ball.vel_t * Math.sin(theta);
            this.ball.vel[0] = this.b_vel_f;
        }
        else if (this.ball.pos[1] <= this.p1.pos[1] && this.ball.pos[1] >= this.p1.pos[1] - this.p_height / 2)
        {
            theta = (90 / this.p_height * dist) * Math.PI / 180; 
            this.ball.vel[1] = this.ball.vel_t * Math.sin(theta);
            this.ball.vel[0] = this.b_vel_f;
        }
    }
}

FtGame.check_goal = function()
{
    if (this.ball.pos[0] + this.b_radius >= width / 2)
    {
        this.p1.score += 1;
        this.isStart = false;
        return (1);
    }
    if (this.ball.pos[0] + this.b_radius <=  - width / 2)
    {
        this.p2.score += 1;
        this.isStart = false;
        return (1);
    }
    if (this.p1.score === this.win_score || this.p2.score === this.win_score)
        return (2);
    return (0);
}

FtGame.collision_tb = function()
{
    if (this.ball.pos[1] + this.b_radius >= height / 2 || this.ball.pos[1] + this.b_radius <= - height / 2)
        this.ball.vel[1] *= -1;
}

FtGame.collisions = function()
{
    this.collision_1();
    this.collision_2();
    this.collision_tb();
}