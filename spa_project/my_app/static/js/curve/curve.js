import Component from "../spa/component.js"

export default class CurvePage extends Component
{
    constructor()
    {
        super('static/html/curve.html')
    }

    onInit()
    {
        canvas = document.getElementById('curve');
        ctx = canvas.getContext('2d');
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        s_canvas = document.createElement("canvas");
        s_canvas.width = canvas.width;
        s_canvas.height = canvas.height;
        s_ctx = s_canvas.getContext('2d');

        offset = 4;
        width = canvas.width;
        height = canvas.height;

        playersPlay = document.getElementById('playersPlay');
        playersPlay.textContent = game.numberPlayers + ' Players';
        playerList = document.getElementById('playerList');
        for (let i = 0; i < game.numberPlayers; i++)
        {
            let playerNumber = i + 1;
            //Create div element
            let playerDiv = document.createElement('div');
            playerDiv.style.display = 'flex';
            //Player Name
            let playerName = document.createElement('p');
            playerName.textContent = 'Player ' + playerNumber;
            playerName.style.justifyContent = 'left';
            playerName.style.flexGrow = '1';
            //Player Score
            let playerScore = document.createElement('p');
            playerScore.textContent = '0';
            playerScore.id = 'score' + playerNumber;
            playerScore.style.justifyContent = 'left';
            playerScore.style.flexGrow = '1';
            playerDiv.appendChild(playerName);
            playerDiv.appendChild(playerScore);
            playerList.appendChild(playerDiv);
        }
    }
}