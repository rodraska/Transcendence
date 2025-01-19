FtCurvePlayer._cos = function(factor)
{
    return (Math.cos(this.theta + factor * Math.PI));
}

FtCurvePlayer._sin = function(factor)
{
    return (Math.sin(this.theta + factor * Math.PI));
}

FtCurvePlayer.trueIndex = function(id)
{
    for (let i = 0; i < this.powers.length; i++) {if (this.powers[i].id == id) return (i)}
    return (-1);
}

FtCurvePlayer.falseIndex = function(id)
{
    if (id <= 9 && id != 5) return (-1);
    for (let i = 0; i < this.powers.length; i++) {if (this.powers[i].id == id) return (i)}
    return (-1);
}

FtCurvePlayer.check_powerup = function(id)
{
    for (let i = 0; i < this.powers.length; i++)
        if (this.powers[i].id == id) return (i);
    return (-1);
}

FtCurvePlayer.count_powerup = function(id)
{
    let count = 0;
    for (let i = 0; i < this.powers.length; i++)
        if (this.powers[i].id == id) count++;
    return (count);
}

FtCurvePlayer.hard_boundaries = function()
{
    var coords = this.pos;
    if (coords[0] >= width / 2 - offset) return (1);
    if (coords[0] <= - width / 2 + offset) return (1);
    if (coords[1] >= height / 2 - offset) return (1);
    if (coords[1] <= - height / 2 + offset) return (1);
    return (0);
}

FtCurvePlayer.soft_boundaries = function()
{
    if (game.currentIters[13] == 0) return ;
    if (this.pos[0] >= width / 2 - offset)
    {
        this.pos[0] -= (width - offset * 2);
        this.mid[0] -= (width - offset * 2);
        this.back[0] -= (width - offset * 2);
        
    }
    if (this.pos[0] <= - width / 2 + offset)
    {
        this.pos[0] += (width - offset * 2);
        this.mid[0] += (width - offset * 2);
        this.back[0] += (width - offset * 2);
    }
    if (this.pos[1] >= height / 2 - offset)
    {
        this.pos[1] -= (height - offset * 2);
        this.mid[1] -= (height - offset * 2);
        this.back[1] -= (height - offset * 2);
    }
    if (this.pos[1] <= - height / 2 + offset)
    {
        this.pos[1] += (height - offset * 2);
        this.mid[1] += (height - offset * 2);
        this.back[1] += (height - offset * 2);
    }
}