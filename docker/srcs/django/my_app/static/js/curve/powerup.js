class PowerUp
{
    constructor(id, pos, iters, player)
    {
        this.pos = pos;
        this.id = id;
        this.iters = iters;
        this.player = player;
    }
    checkApplyPower() 
    {
        if (this.player != null)
        {
            let count = 0;
            for (let i = 0; i < this.player.powers.length; i++) if (this.player.powers[i].id == this.id) count++;
            if (count < 4) this.powerApply();
        }
    }
    powerApply() {}
    powerRemove() {}
}

class PowerSpeed extends PowerUp
{
    constructor(id, pos, iters, player)
    {
        super(id, pos, iters, player);
        
    }
    powerApply()
    {
        this.player.vel_t *= 2;
        this.player.turn_rate *= 1.75;
    }   
    powerRemove()
    {
        this.player.vel_t /= 2;
        this.player.turn_rate /= 1.75;
    }
}

class PowerSlow extends PowerUp
{
    constructor(id, pos, iters, player)
    {
        super(id, pos, iters, player);
        
    }
    powerApply() 
    {
        this.player.vel_t /= 2;
        this.player.turn_rate /= 1.35;
    }
    powerRemove() 
    {
        this.player.vel_t *= 2;
        this.player.turn_rate *= 1.35;
    }
}

class PowerThin extends PowerUp
{
    constructor(id, pos, iters, player)
    {
        super(id, pos, iters, player);
        
    }
    powerApply() 
    {
        this.player.radius /= 2;
    }
    powerRemove() 
    {
        this.player.radius *= 2;
    }
}

class PowerSmallTurn extends PowerUp
{
    constructor(id, pos, iters, player)
    {
        super(id, pos, iters, player);
    }
    powerApply() 
    {
        this.player.turn_rate *= 1.6;
    }
    powerRemove() 
    {
        this.player.turn_rate /= 1.6;
    }
}

class PowerGod extends PowerUp
{
    constructor(id, pos, iters, player)
    {
        super(id, pos, iters, player);
    }
    powerApply() 
    {
        this.player.god = true;
    }
    powerRemove() 
    {
        this.player.god = false;
    }
}

class PowerBig extends PowerUp
{
    constructor(id, pos, iters, player)
    {
        super(id, pos, iters, player);
    }
    powerApply() 
    {
        this.player.radius *= 2;
    }
    powerRemove() 
    {
        this.player.radius /= 2;
    }
}

class PowerBigTurn extends PowerUp
{
    constructor(id, pos, iters, player)
    {
        super(id, pos, iters, player);
    }
    powerApply() 
    {
        this.player.turn_rate /= 1.75;
    }
    powerRemove() 
    {
        this.player.turn_rate *= 1.75;
    }
}

class PowerRubber extends PowerUp
{
    constructor(id, pos, iters, player)
    {
        super(id, pos, iters, player);
    }
    powerApply() {}
    powerRemove() {}
}

const powerConstructors = { //FtGame
    1: PowerSpeed,
    2: PowerSlow,
    3: PowerThin,
    4: PowerSmallTurn,
    5: PowerGod,
    6: PowerSpeed,
    7: PowerSlow,
    8: PowerBig,
    9: PowerBigTurn,
    10: PowerRubber
}

const FtPower = PowerUp.prototype; 

FtPower.paint_powerup = function()
{
    ctx.fillStyle = this.powerColors[this.id];
    ctx.beginPath();
    ctx.arc((this.pos[0]) + width / 2, (this.pos[1]) + height / 2, 20, 0, 2 * Math.PI);
    ctx.fill();
}

const new_powerup = function()
{
    let drop = 3001;
    if (Math.floor(Math.random() * drop) > 1) return;
    outer : while (1)
    {
        let x = Math.floor(Math.random() * this.width) - width / 2;
        let y = Math.floor(Math.random() * this.height) - height / 2;
        for (let i = 0; i < this.players.length; i++)
            if (this.dist([x, y], this.players[i].pos) < 50) {continue outer};
        for (let j = 0; j < this.powers.length; j++)
            if (this.dist([x, y], this.powers[j].pos) < 20) {continue outer};
        break ;
    }
    let id = Math.floor(Math.random() * 10) + 1; //all the power ups
    //id = Math.floor(Math.random() * 2); //specific range
    //id = 11; //specific powerup
    this.powers.push(new this.powerConstructors[10](id, [x, y], this.baseIters[id], null));
}

export { new_powerup }