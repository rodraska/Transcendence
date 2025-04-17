const gamePaintHist = function()
{
    for (let i = 0; i < this.players.length; i++)
    {
        this.players[i].paint_hist();
    }
} 

const gamePaintPlayers = function()
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

const gamePaintArrows = function()
{
    for (let i = 0; i < this.players.length; i++)
    {
        this.players[i].paint_arrow();
    }
}

const gameSaveHist = function()
{
    for (let i = 0; i < this.players.length; i++)
    {
        this.players[i].save_hist();
    }
}

const gameGeneralizedCoordinates = function()
{
    for (let i = 0; i < this.players.length; i++)
    {
        this.players[i].generalized_coordinates();
    }
}

const gameHoles = function()
{
    for (let i = 0; i < this.players.length; i++)
    {
        this.players[i].holes();
    }
}

const gamePickPowers = function()
{
    for (let i = 0; i < this.players.length; i++)
    {
        this.players[i].pick_powerups();
    }
}

const gameCheckCollision = function()
{
    for (let i = 0; i < this.players.length; i++)
    {
        this.players[i].checkCollision();
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

export { gamePaintHist, gamePaintPlayers, gamePaintArcs, gamePaintPowers, gamePaintArrows, saveCanvas, restoreCanvas, gameSaveHist, gameGeneralizedCoordinates, gameHoles, gamePickPowers, gameCheckCollision }
