const gameCoordinates = function()
{
    this.myPlayer.generalized_coordinates();
}

const gameSaveHist = function()
{
    this.myPlayer.save_hist();
} 

const gameHoles = function()
{
    this.myPlayer.holes();
}

const gamePowers = function()
{
    this.myPlayer.pick_powerups();
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
    this.myPlayer.paint_arrow();
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
