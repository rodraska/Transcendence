import Component from "../spa/component.js"
import Route from "../spa/route.js"

class PongJoin extends Component
{
    constructor()
    {
        super('static/html/pong_join.html')
    }

    onInit()
    {
        document.getElementById('button1').addEventListener('click', () => {
			Route.go('/pong_lobby');
		});

        document.getElementById('button2').addEventListener('click', () => {
			Route.go('/pong_lobby');
		});

        document.getElementById('button3').addEventListener('click', () => {
			Route.go('/pong_lobby');
		});
    }
}

export default PongJoin;