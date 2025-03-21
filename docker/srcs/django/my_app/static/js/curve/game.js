const gameCoordinates = function()
{
    for (let i = 0; i < this.players.length; i++)
    {
        this.players[i].generalized_coordinates();
    }
}

const gameSaveHist = function()
{
    for (let i = 0; i < this.players.length; i++)
    {
        this.players[i].save_hist();
    }
} 

const gameHoles = function()
{
    for (let i = 0; i < this.players.length; i++)
    {
        this.players[i].holes();
    }
}

const gamePowers = function()
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
    for (let i = 0; i < this.players.length; i++)
    {
        this.players[i].paint_arrow();
    }
} 

const gamePaintPowers = function()
{
    for (let i = 0; i < this.powers.length; i++)
    {
        this.powers[i].paint_powerup();
    }
} 

const saveCanvas = function() 
{
    s_ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height)
}

const restoreCanvas = function() 
{
    ctx.drawImage(s_canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height)
}

export { gameCoordinates, gameSaveHist, gameHoles, gamePowers, gameCheckCollision, gamePaintHist, gamePaintPlayer, gamePaintArcs, gamePaintArrows, gamePaintPowers, saveCanvas, restoreCanvas }

/*const FtGame = Game.prototype;

game = new Game();

playersPlay = document.getElementById('playersPlay');
playersPlay.textContent = this.numberPlayers + ' Players';
playerList = document.getElementById('playerList');
for (let i = 0; i < this.numberPlayers; i++)
{
    playerNumber = i + 1;
    //Create div element
    playerDiv = document.createElement('div');
    playerDiv.style.display = 'flex';
    //Player Name
    playerName = document.createElement('p');
    playerName.textContent = 'Player ' + playerNumber;
    playerName.style.justifyContent = 'left';
    playerName.style.flexGrow = '1';
    //Player Score
    playerScore = document.createElement('p');
    playerScore.textContent = '0';
    playerScore.id = 'score' + playerNumber;
    playerScore.style.justifyContent = 'left';
    playerScore.style.flexGrow = '1';
    playerDiv.appendChild(playerName);
    playerDiv.appendChild(playerScore);
    playerList.appendChild(playerDiv);
}*/
