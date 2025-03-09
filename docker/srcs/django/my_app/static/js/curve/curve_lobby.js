import Component from "../spa/component.js"

class CurveLobby extends Component
{
    constructor()
    {
        super('static/html/curve_lobby.html')
    }

    onInit()
    {
        document.getElementById('button_start').addEventListener('click', () => {
			window.location.href = '#/curve_game';
		});

        const curveSocket = new WebSocket(`ws://localhost:8000/ws/curve_lobby/`);

        curveSocket.onopen = function()
        {
            console.log('curve_lobby onopen');
        }   

        curveSocket.onmessage = function(e)
        {
            console.log('curve_lobby onmessage');
        }
    }
}

export default CurveLobby;