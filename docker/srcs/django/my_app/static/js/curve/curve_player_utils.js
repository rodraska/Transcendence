const _cos = function(factor)
{
    return (Math.cos(this.theta + factor * Math.PI));
}

const _sin = function(factor)
{
    return (Math.sin(this.theta + factor * Math.PI));
}

const check_powerup = function(id)
{
    for (let i = 0; i < this.powers.length; i++)
        if (this.powers[i].id == id) return (i);
    return (-1);
}

const count_powerup = function(id)
{
    let count = 0;
    for (let i = 0; i < this.powers.length; i++)
        if (this.powers[i].id == id) count++;
    return (count);
}

const hard_boundaries = function()
{
    var coords = this.pos;
    if (coords[0] >= this.game.width / 2 - this.game.offset) return (1);
    if (coords[0] <= - this.game.width / 2 + this.game.offset) return (1);
    if (coords[1] >= this.game.height / 2 - this.game.offset) return (1);
    if (coords[1] <= - this.game.height / 2 + this.game.offset) return (1);
    return (0);
}

export { _cos, _sin, check_powerup, count_powerup, hard_boundaries }
