const gameCheckCollision = function()
{
    for (let i = 0; i < this.players.length; i++)
    {
        this.players[i].checkCollision();
    }
}

const gamePaintHist = function()
{
    for (let i = 0; i < this.players.length; i++)
    {
        this.players[i].paint_hist();
    }
} 

const gamePaintPlayer = function()
{
    for (let i = 0; i < this.players.length; i++)
    {
        this.players[i].paint_player();
    }
} 

const gamePaintArcs = function()
{
    for (let i = 0; i < this.players.length; i++)
    {
        this.players[i].paint_arcs();
    }
}

const gamePaintPowers = function()
{
    for (let i = 0; i < this.powers.length; i++)
    {
        this.paint_powerup(this.powers[i]);
    }
} 

const saveCanvas = function() 
{
    this.s_ctx.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, this.canvas.width, this.canvas.height)
}

const restoreCanvas = function() 
{
    this.ctx.drawImage(this.s_canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, this.canvas.width, this.canvas.height)
}

export { gameCheckCollision, gamePaintHist, gamePaintPlayer, gamePaintArcs, gamePaintPowers, saveCanvas, restoreCanvas }
