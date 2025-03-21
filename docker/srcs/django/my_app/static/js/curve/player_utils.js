FtPlayer._cos = function(factor)
{
    return (Math.cos(this.theta + factor * Math.PI));
}

FtPlayer._sin = function(factor)
{
    return (Math.sin(this.theta + factor * Math.PI));
}

FtPlayer.trueIndex = function(id)
{
    for (let i = 0; i < this.powers.length; i++) {if (this.powers[i].id == id) return (i)}
    return (-1);
}

FtPlayer.check_powerup = function(id)
{
    for (let i = 0; i < this.powers.length; i++)
        if (this.powers[i].id == id) return (i);
    return (-1);
}

FtPlayer.count_powerup = function(id)
{
    let count = 0;
    for (let i = 0; i < this.powers.length; i++)
        if (this.powers[i].id == id) count++;
    return (count);
}

FtPlayer.hard_boundaries = function()
{
    var coords = this.pos;
    if (coords[0] >= width / 2 - offset) return (1);
    if (coords[0] <= - width / 2 + offset) return (1);
    if (coords[1] >= height / 2 - offset) return (1);
    if (coords[1] <= - height / 2 + offset) return (1);
    return (0);
}
