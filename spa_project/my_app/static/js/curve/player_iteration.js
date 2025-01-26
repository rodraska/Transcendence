FtCurvePlayer.save_hist = function()
{
    this.back = {...this.mid};
    this.mid = {...this.truepos};
}

FtCurvePlayer.generalized_coordinates = function()
{
    if (this.stop == true) return ;
    //Update position
    this.pos[0] += this.vel[0];
    this.pos[1] += this.vel[1];
    this.soft_boundaries();
    this.truepos[0] = this.pos[0] + width / 2;
    this.truepos[1] = this.pos[1] + height / 2;
    //Turning
    if (this.turning == 1) this.theta += this.turn_rate * Math.PI;   
    if (this.turning == 2) this.theta -= this.turn_rate * Math.PI;
    //Velocity
    this.trig[0] = this._cos(0);
    this.trig[1] = this._sin(0);
    this.vel[0] = this.vel_t * this.trig[0];
    this.vel[1] = this.vel_t * this.trig[1];
}


FtCurvePlayer.holes = function()
{
    if (game.currentIters.begin < 160 || game.currentIters[15] > 0 || this.god == true || this.stop == true) return ;
    if (this.hole_iter > 0)
    {
        this.hole_iter--;
    }
    else
    {  
        let ratio = game.baseValues.vel / this.vel_t;
        if (Math.floor(Math.random() * this.hole_rate * ratio) == 0)
        {
            this.hole_iter = 12 * ratio;
        }
    }
}

FtCurvePlayer.processCollision = function()
{
    game.give_points(this.id);
    this.stop = true;
    game.dead++;
    if (game.dead >= game.numberCurvePlayers - 1) game.roundWinner();
    b = 0;
    if ((x = this.falseIndex(12)) != -1) {b = (this.powers[x].iters < 60) ? this.powers[x].iters : 60}
    this.powers = [];
    b > 0 ? this.powers.push(new PowerUp(12, [0, 0], b)) : null;
}

FtCurvePlayer.checkCollision = function()
{
    if (this.god == true || this.stop == true) return ;
    outer: for (let i = -1; i <= 1; i++)
    {
        let x1 = Math.floor(this.truepos[0] + this.radius * this._cos(1 / 3 * i));
        let y1 = Math.floor(this.truepos[1] + this.radius * this._sin(1 / 3 * i));
        for (let p = 0; p < game.players.length; p++)
        {
            if (game.checkRGB([x1, y1], game.players[p].rgb))
            {
                console.log(i);
                console.log('collision regular');
                this.processCollision();
                return ;
            }
        }
        if (game.currentIters[13] > 0) continue outer;
        if (game.checkRGB([x1, y1], [255, 255, 255]))
        {
            console.log('collision white');
            this.processCollision();
            return ;
        }
        if (this.hard_boundaries())
        {
            console.log('collision out');
            this.processCollision();
            return ;
        }
    }
}
