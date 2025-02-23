import Component from "../spa/component.js"
import Route from "../spa/route.js"

class PongMain extends Component
{
    constructor()
    {
        super('static/html/pong_main.html')
    }

    onInit()
    {
        document.getElementById('button_create').addEventListener('click', () => {
            Route.go('/pong_create');
		});

        document.getElementById('button_join').addEventListener('click', () => {
            Route.go('/pong_join');
		});
    }
}

export default PongMain;