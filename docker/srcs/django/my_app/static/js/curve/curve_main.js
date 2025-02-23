import Component from "../spa/component.js"
import Route from "../spa/route.js"

class CurveMain extends Component
{
    constructor()
    {
        super('static/html/curve_main.html')
    }

    onInit()
    {
        document.getElementById('button_create').addEventListener('click', () => {
			Route.go('/curve_lobby');
		});

        document.getElementById('button_join').addEventListener('click', () => {
            Route.go('/curve_join');
		});

        document.getElementById('button_history').addEventListener('click', () => {
            Route.go('/curve_history');
		});
    }
}

export default CurveMain;