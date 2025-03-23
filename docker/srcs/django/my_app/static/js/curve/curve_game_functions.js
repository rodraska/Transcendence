const gameCoordinates = function()
{
    this.players[this.playerNumber - 1].generalized_coordinates();
}

const gameSaveHist = function()
{
    this.players[this.playerNumber - 1].save_hist();
} 

const gameHoles = function()
{
    this.players[this.playerNumber - 1].holes();
}

const gamePowers = function()
{
    this.players[this.playerNumber - 1].pick_powerups();
}

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

const gamePaintArrows = function()
{
    /*for (let i = 0; i < this.players.length; i++)
    {
        this.players[i].paint_arrow();
    }*/
    this.players[this.playerNumber - 1].paint_arrow();
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

export { gameCoordinates, gameSaveHist, gameHoles, gamePowers, gameCheckCollision, gamePaintHist, gamePaintPlayer, gamePaintArcs, gamePaintArrows, gamePaintPowers, saveCanvas, restoreCanvas }
