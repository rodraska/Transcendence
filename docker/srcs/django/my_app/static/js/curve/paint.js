const paint_gg = function()
{
    this.ctx.fillStyle = "rgba(64, 64, 64, 0.8)";
    this.ctx.fillRect(this.offset, this.height / 2 - 30, this.width - this.offset, 38);
    this.ctx.font = "20px 'Press Start 2P', cursive";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "bottom";
    if (this.game_winner == 0)
    {
        this.ctx.fillStyle = 'white';
        this.ctx.fillText("Player " + this.round_winner + " Wins This Round", this.width / 2, this.height / 2);
    }
    else
    {
        this.ctx.fillStyle = this.players[this.game_winner - 1].color;
        this.ctx.fillText("Player " + this.game_winner + " Wins The Game", this.width / 2, this.height / 2);
    }    
}

const final_paint = function()
{
    this.reset_paint();
    this.gamePaintHist();
    this.gamePaintPlayer();
    this.gamePaintPowers();
    this.paint_offset();
    this.paint_gg();
}

const paint_line = function(x_i, y_i, x_f, y_f)
{
    this.ctx.beginPath();
    this.ctx.moveTo(x_i, y_i);
    this.ctx.lineTo(x_f, y_f);
    this.ctx.stroke();
}

const paint_curve = function(x_i, y_i, x_m, y_m, x_f, y_f, w)
{
    this.ctx.beginPath();
    this.ctx.moveTo(x_i, y_i);
    this.ctx.quadraticCurveTo(x_m, y_m, x_f, y_f);
    this.ctx.lineWidth = w;
    this.ctx.stroke();
}

const paint_offset = function()
{
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.offset, this.height);
    this.ctx.fillRect(this.width, 0, -this.offset, this.height);
    this.ctx.fillRect(0, 0, this.width, this.offset);
    this.ctx.fillRect(0, this.height, this.width, -this.offset);
}

const reset_paint = function()
{
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0 , this.width, this.height);
}

export { paint_gg, final_paint, paint_line, paint_curve, paint_offset, reset_paint }