class PowerUp
{
    constructor(id, pos, iters)
    {
        this.pos = pos;
        this.id = id;
        this.iters = iters;
    }
    checkApplyPower(player) 
    {
        if (player != null)
        {
            let count = 0;
            for (let i = 0; i < player.powers.length; i++) if (player.powers[i].id == this.id) count++;
            if (count < 4) this.powerApply(player);
        }
    }
    powerApply(player) {}
    powerRemove(player) {}
}

class PowerSpeed extends PowerUp
{
    constructor(id, pos, iters)
    {
        super(id, pos, iters);
        
    }
    powerApply(player)
    {
        player.vel_t *= 2;
        player.turn_rate *= 1.75;
    }   
    powerRemove(player)
    {
        player.vel_t /= 2;
        player.turn_rate /= 1.75;
    }
}

class PowerSlow extends PowerUp
{
    constructor(id, pos, iters)
    {
        super(id, pos, iters);
        
    }
    powerApply(player) 
    {
        this.player.vel_t /= 2;
        this.player.turn_rate /= 1.35;
    }
    powerRemove(player) 
    {
        this.player.vel_t *= 2;
        this.player.turn_rate *= 1.35;
    }
}

class PowerThin extends PowerUp
{
    constructor(id, pos, iters)
    {
        super(id, pos, iters);
        
    }
    powerApply(player) 
    {
        player.radius /= 2;
    }
    powerRemove(player) 
    {
        player.radius *= 2;
    }
}

class PowerSmallTurn extends PowerUp
{
    constructor(id, pos, iters)
    {
        super(id, pos, iters);
    }
    powerApply(player) 
    {
        player.turn_rate *= 1.6;
    }
    powerRemove(player) 
    {
        player.turn_rate /= 1.6;
    }
}

class PowerGod extends PowerUp
{
    constructor(id, pos, iters)
    {
        super(id, pos, iters);
    }
    powerApply(player) 
    {
        player.god = true;
    }
    powerRemove(player) 
    {
        player.god = false;
    }
}

class PowerBig extends PowerUp
{
    constructor(id, pos, iters)
    {
        super(id, pos, iters);
    }
    powerApply(player) 
    {
        player.radius *= 2;
    }
    powerRemove(player) 
    {
        player.radius /= 2;
    }
}

class PowerBigTurn extends PowerUp
{
    constructor(id, pos, iters)
    {
        super(id, pos, iters);
    }
    powerApply(player) 
    {
        player.turn_rate /= 1.75;
    }
    powerRemove(player) 
    {
        player.turn_rate *= 1.75;
    }
}

class PowerRubber extends PowerUp
{
    constructor(id, pos, iters)
    {
        super(id, pos, iters);
    }
    powerApply(player) {}
    powerRemove(player) {}
}

export { PowerUp, PowerSpeed, PowerSlow, PowerThin, PowerSmallTurn, PowerGod, PowerBig, PowerBigTurn, PowerRubber }