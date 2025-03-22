const dist = function([x1, y1], [x2, y2])
{
    return (Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)));
}

const give_points = function(id)
{
    for (let i = 0; i < this.players.length; i++)
    {
        (i != (id - 1) && this.players[i].stop == false) ? this.playerScores[i + 1] += 1 : null; 
        //document.getElementById("score" + (i + 1)).innerHTML = this.playerScores[i + 1];
    }
}

const new_powerup = function()
{
    if (this.playerNumber !== 1) return;
    let drop = 601;
    if (Math.floor(Math.random() * drop) > 1) return;
    outer : while (1)
    {
        var x = Math.floor(Math.random() * this.width) - this.width / 2;
        var y = Math.floor(Math.random() * this.height) - this.height / 2;
        for (let i = 0; i < this.players.length; i++)
            if (this.dist([x, y], this.players[i].pos) < 50) {continue outer};
        for (let j = 0; j < this.powers.length; j++)
            if (this.dist([x, y], this.powers[j].pos) < 20) {continue outer};
        break ;
    }
    //let id = Math.floor(Math.random() * 10) + 1; //all the power ups
    //id = Math.floor(Math.random() * 2); //specific range
    let id = 10; //specific powerup
    this.sendNewPower(new this.powerConstructors[id](id, [x, y], this.baseIters[id]));
    //this.powers.push(new this.powerConstructors[10](id, [x, y], this.baseIters[id]));
}

const checkRGB = function(pos, rgb)
{
    var posData = this.ctx.getImageData(pos[0], pos[1], 1, 1).data;
    for (let k = 0; k < 3; k++) if (posData[k] != rgb[k]) return (0);
    return (1);
}

export { dist, give_points, new_powerup, checkRGB }