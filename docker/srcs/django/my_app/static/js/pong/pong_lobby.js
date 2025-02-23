import Component from "../spa/component.js"
import Route from "../spa/route.js"

class PongLobby extends Component
{
    constructor()
    {
        super('static/html/pong_lobby.html')
    }

    onInit()
    {
        document.getElementById('button_start').addEventListener('click', () => {
            Route.go('/pong_game');
		});
    }
}

export default PongLobby;