import Component from "../spa/component.js"
import Route from "../spa/route.js"

class PongCreate extends Component
{
    constructor()
    {
        super('static/html/pong_create.html')
    }

    onInit()
    {
        document.getElementById('button_create').addEventListener('click', () => {
            Route.go('/pong_lobby');
		});
    }
}

export default PongCreate;