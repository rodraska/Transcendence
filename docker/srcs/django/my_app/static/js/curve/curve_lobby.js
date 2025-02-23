import Component from "../spa/component.js"
import Route from "../spa/route.js"

class CurveLobby extends Component
{
    constructor()
    {
        super('static/html/curve_lobby.html')
    }

    onInit()
    {
        document.getElementById('button_start').addEventListener('click', () => {
            Route.go('/curve_game');
		});
    }
}

export default CurveLobby;