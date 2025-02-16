import Component from "../spa/component.js"

class PongLobby extends Component
{
    constructor()
    {
        super('static/html/pong_lobby.html')
    }

    onInit()
    {
        document.getElementById('button_start').addEventListener('click', () => {
			window.location.href = '#/pong_game';
		});
    }
}

export default PongLobby;