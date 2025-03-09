import Component from "../spa/component.js"

class CurveGame extends Component
{
    constructor()
    {
        super('static/html/curve_game.html')
    }

    onInit()
    {
        setTimeout(() => {
            let playersPlay = document.getElementById('playersPlay');
            let canvas = document.getElementById('curve');
            let playerList = document.getElementById('playerList');

            if (!playersPlay || !canvas || !playerList) {
                return;
            }

            let ctx = canvas.getContext('2d');
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            let s_canvas = document.createElement("canvas");
            s_canvas.width = canvas.width;
            s_canvas.height = canvas.height;
            let s_ctx = s_canvas.getContext('2d');

            let offset = 4;
            let width = canvas.width;
            let height = canvas.height;

            playersPlay.textContent = game.numberCurvePlayers + ' CurvePlayers';
            
            for (let i = 0; i < game.numberCurvePlayers; i++)
            {
                let playerNumber = i + 1;
                //Create div element
                let playerDiv = document.createElement('div');
                playerDiv.style.display = 'flex';
                //CurvePlayer Name
                let playerName = document.createElement('p');
                playerName.textContent = 'CurvePlayer ' + playerNumber;
                playerName.style.justifyContent = 'left';
                playerName.style.flexGrow = '1';
                //CurvePlayer Score
                let playerScore = document.createElement('p');
                playerScore.textContent = '0';
                playerScore.id = 'score' + playerNumber;
                playerScore.style.justifyContent = 'left';
                playerScore.style.flexGrow = '1';
                playerDiv.appendChild(playerName);
                playerDiv.appendChild(playerScore);
                playerList.appendChild(playerDiv);
            }

            const curveSocket = new WebSocket(`ws://localhost:8000/ws/curve_game/`);

            curveSocket.onopen = function()
            {
                console.log('curvesocket onopen');
            }

            curveSocket.onmessage = function(e)
            {
                console.log('curvesocket onmessage');
                const data = JSON.parse(e.data)
                const type = data.type
                console.log(type)
            }

            function sendMessage() 
            {
                console.log('ft sendMessage')
                if (curveSocket && curveSocket.readyState === WebSocket.OPEN)
                    curveSocket.send(JSON.stringify({'type': 'message'}));
            }
        }, 100);
    }   
}

export default CurveGame;