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

const checkRGB = function(pos, rgb)
{
    var posData = this.ctx.getImageData(pos[0], pos[1], 1, 1).data;
    for (let k = 0; k < 3; k++) if (posData[k] != rgb[k]) return (0);
    return (1);
}

export { dist, give_points, checkRGB }