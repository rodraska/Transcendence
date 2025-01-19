FtGame.paint_gg = function()
{
    ctx.fillStyle = "rgba(64, 64, 64, 0.8)";
    ctx.fillRect(offset, height / 2 - 30, width - offset, 38);
    ctx.font = "20px 'Press Start 2P', cursive";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    if (this.game_winner == 0)
    {
        ctx.fillStyle = 'white';
        ctx.fillText("Player " + this.round_winner + " Wins This Round", width / 2, height / 2);
    }
    else
    {
        ctx.fillStyle = this.players[this.game_winner - 1].color;
        ctx.fillText("Player " + this.game_winner + " Wins The Game", width / 2, height / 2);
    }    
}

FtGame.final_paint = function()
{
    this.reset_paint();
    this.gamePaintHist();
    this.gamePaintPlayer();
    this.gamePaintPowers();
    this.paint_offset();
    this.paint_gg();
}

FtGame.paint_bulb = function()
{
    ctx.fillStyle = 'darkgray';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < this.players.length; i++)
    {
        for (let x = 0; x < this.players[i].powers.length; x++)
        {
            if (this.players[i].powers[x].id == 12)
            {
                ctx.save();
                ctx.beginPath();
                ctx.arc(this.players[i].truepos[0], this.players[i].truepos[1], 100, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.clip();
                this.restoreCanvas();
                this.gamePaintPlayer();
                this.gamePaintPowers();
                ctx.restore();
            }  
        }
    }
}

FtGame.paint_line = function(x_i, y_i, x_f, y_f)
{
    ctx.beginPath();
    ctx.moveTo(x_i, y_i);
    ctx.lineTo(x_f, y_f);
    ctx.stroke();
}

FtGame.paint_curve = function(x_i, y_i, x_m, y_m, x_f, y_f, w)
{
    ctx.beginPath();
    ctx.moveTo(x_i, y_i);
    ctx.quadraticCurveTo(x_m, y_m, x_f, y_f);
    ctx.lineWidth = w;
    ctx.stroke();
}

FtGame.paint_offset = function()
{
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, offset, canvas.height);
    ctx.fillRect(canvas.width, 0, -offset, canvas.height);
    ctx.fillRect(0, 0, canvas.width, offset);
    ctx.fillRect(0, canvas.height, canvas.width, -offset);
}

FtGame.reset_paint = function()
{
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0 , width, height);
}