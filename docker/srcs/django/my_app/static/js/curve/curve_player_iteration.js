const save_hist = function()
{
    this.back = {...this.mid};
    this.mid = {...this.truepos};
}

const generalized_coordinates = function()
{
    if (this.stop == true) return ;
    //Update position
    this.pos[0] += this.vel[0];
    this.pos[1] += this.vel[1];
    this.truepos[0] = this.pos[0] + this.game.width / 2;
    this.truepos[1] = this.pos[1] + this.game.height / 2;
    //Turning
    if (this.turning == 1) this.theta += this.turn_rate * Math.PI;   
    if (this.turning == 2) this.theta -= this.turn_rate * Math.PI;
    //Velocity
    this.trig[0] = this._cos(0);
    this.trig[1] = this._sin(0);
    this.vel[0] = this.vel_t * this.trig[0];
    this.vel[1] = this.vel_t * this.trig[1];
}


const holes = function()
{
    if (this.game.currentIters.begin < 160 || this.game.currentIters[10] > 0 || this.god == true || this.stop == true) return ;
    if (this.hole_iter > 0)
    {
        this.hole_iter--;
    }
    else
    {  
        let ratio = this.game.baseValues.vel / this.vel_t;
        if (Math.floor(Math.random() * this.hole_rate * ratio) == 0)
        {
            this.hole_iter = 12 * ratio;
        }
    }
}

const processCollision = function()
{
    this.game.give_points(this.id);
    this.stop = true;
    this.game.dead++;
    if (this.game.dead >= this.game.numberPlayers - 1) this.game.roundWinner();
    this.powers = [];
}

const checkCollision = function()
{
    if (this.god == true || this.stop == true) return ;
    for (let i = -1; i <= 1; i++)
    {
        let x1 = Math.floor(this.truepos[0] + this.radius * this._cos(1 / 3 * i));
        let y1 = Math.floor(this.truepos[1] + this.radius * this._sin(1 / 3 * i));
        for (let p = 0; p < this.game.players.length; p++)
        {
            if (this.game.checkRGB([x1, y1], this.game.players[p].rgb))
            {
                console.log(i);
                console.log('collision regular');
                this.game.sendCollision(this.id);
                //this.processCollision();
                return ;
            }
        }
        if (this.game.checkRGB([x1, y1], [255, 255, 255]))
        {
            console.log('collision white');
            this.game.sendCollision(this.id);
            //this.processCollision();
            return ;
        }
        if (this.hard_boundaries())
        {
            console.log('collision out');
            this.game.sendCollision(this.id);
            //this.processCollision();
            return ;
        }
    }
}

export { save_hist, generalized_coordinates, holes, processCollision, checkCollision }