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

export { PowerUp, PowerSpeed, PowerSlow, PowerThin, PowerSmallTurn, PowerGod, PowerBig, PowerBigTurn, PowerRubber }