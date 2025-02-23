import Component from "../spa/component.js"
import Route from "../spa/route.js"

class CurveJoin extends Component
{
    constructor()
    {
        super('static/html/curve_join.html')
    }
    onInit()
    {
        document.getElementById('button1').addEventListener('click', () => {
            Route.go('/curve_lobby');
		});

        document.getElementById('button2').addEventListener('click', () => {
            Route.go('/curve_lobby');
		});

        document.getElementById('button3').addEventListener('click', () => {
            Route.go('/curve_lobby');
		});
    }
}

export default CurveJoin;