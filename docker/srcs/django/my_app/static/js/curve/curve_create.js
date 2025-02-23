import Component from "../spa/component.js"
import Route from "../spa/route.js"

class CurveCreate extends Component
{
    constructor()
    {
        super('static/html/curve_create.html')
    }

    onInit()
    {
        document.getElementById('button_create').addEventListener('click', () => {
            Route.go('/curve_lobby');
		});
    }
}

export default CurveCreate;