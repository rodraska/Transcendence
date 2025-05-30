const update_positions = function()
{
    this.ball.pos[0] += this.ball.vel[0];
    this.ball.pos[1] += this.ball.vel[1];

    if (this.p1.moving === true) {
        this.p1.pos[1] += this.p1.vel;
    }

    if (this.p2.moving === true) {
        this.p2.pos[1] += this.p2.vel;
    }
    this.ball.vel_t = Math.sqrt(Math.pow(this.ball.vel[0], 2) + Math.pow(this.ball.vel[1], 2));
}

const collision_1 = function()
{
    if (this.ball.pos[0] + this.b_radius >= this.width / 2 - this.p_offest - this.p_width)
    {
        const dist = this.ball.pos[1] - this.p1.pos[1];
        if (this.ball.pos[1] >= this.p1.pos[1] && this.ball.pos[1] <= this.p1.pos[1] + this.p_height / 2)
        {
            const theta = (90 / this.p_height * dist) * Math.PI / 180;
            this.ball.vel[1] = this.ball.vel_t * Math.sin(theta);
            this.ball.vel[0] = -this.b_vel_f * this.boost;
        } 
        else if (this.ball.pos[1] <= this.p1.pos[1] && this.ball.pos[1] >= this.p1.pos[1] - this.p_height / 2)
        {
            const theta = (90 / this.p_height * dist) * Math.PI / 180; 
            this.ball.vel[1] = this.ball.vel_t * Math.sin(theta);
            this.ball.vel[0] = -this.b_vel_f * this.boost;
        }
    }
}

const collision_2 = function()
{
    if (this.ball.pos[0] + this.b_radius <= - this.width / 2 + this.p_offest + this.p_width)
    {
        const dist = this.ball.pos[1] - this.p2.pos[1];
        if (this.ball.pos[1] >= this.p2.pos[1] && this.ball.pos[1] <= this.p2.pos[1] + this.p_height / 2)
        {
            const theta = (90 / this.p_height * dist) * Math.PI / 180;
            this.ball.vel[1] = this.ball.vel_t * Math.sin(theta);
            this.ball.vel[0] = this.b_vel_f * this.boost;
        }
        else if (this.ball.pos[1] <= this.p2.pos[1] && this.ball.pos[1] >= this.p2.pos[1] - this.p_height / 2)
        {
            const theta = (90 / this.p_height * dist) * Math.PI / 180; 
            this.ball.vel[1] = this.ball.vel_t * Math.sin(theta);
            this.ball.vel[0] = this.b_vel_f * this.boost;
        }
    }
}

const check_goal = function()
{
    if (this.ball.pos[0] + this.b_radius <=  - this.width / 2)
    {
        this.p1.score += 1;
        this.isStart = false;
        console.log('GOAL PLAYER 1');
        return (1);
    }
    if (this.ball.pos[0] + this.b_radius >= this.width / 2)
    {
        this.p2.score += 1;
        this.isStart = false;
        console.log('GOAL PLAYER 2');
        return (1);
    }
    if (this.p1.score === this.points_to_win || this.p2.score === this.points_to_win)
    {
        this.score = this.p1.score + "-" + this.p2.score;
        return (2);
    }
    return (0);
}

const collision_tb = function()
{
    if (this.ball.pos[1] + this.b_radius >= this.height / 2 || this.ball.pos[1] + this.b_radius <= - this.height / 2)
        this.ball.vel[1] *= -1;
}

const collisions = function()
{
    this.collision_1();
    this.collision_2();
    this.collision_tb();
}

export { update_positions, collision_2, collision_1, check_goal, collision_tb, collisions } 