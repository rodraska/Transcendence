const dist = function([x1, y1], [x2, y2])
{
    return (Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)));
}

const new_powerup = function()
{
    if (this.playerNumber !== 1 || this.powerups_enabled == false) return;
    let drop = 601;
    if (Math.floor(Math.random() * drop) > 1) return;
    outer : while (1)
    {
        var x = Math.floor(Math.random() * this.width) - this.width / 2;
        var y = Math.floor(Math.random() * this.height) - this.height / 2;
        for (let i = 0; i < this.players.length; i++)
            if (this.dist([x, y], this.players[i].pos) < 50) {continue outer};
        for (let j = 0; j < this.powers.length; j++)
            if (this.dist([x, y], this.powers[j].pos) < 50) {continue outer};
        break ;
    }
    //let id = Math.floor(Math.random() * 6) + 1; //all the power ups
    let id = 4; //specific powerup
    this.powers.push(new this.powerConstructors[id](id, [x, y], this.baseIters[id]));
    this.sendGamePowers(this.powers);
}

const checkRGB = function(pos, rgb)
{
    var posData = this.ctx.getImageData(pos[0], pos[1], 1, 1).data;
    for (let k = 0; k < 3; k++) if (posData[k] != rgb[k]) return (0);
    return (1);
}

export { dist, new_powerup, checkRGB }