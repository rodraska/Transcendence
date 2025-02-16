import Component from "../spa/component.js"

class CurveCreate extends Component
{
    constructor()
    {
        super('static/html/curve_create.html')
    }

    onInit()
    {
        document.getElementById('button_create').addEventListener('click', () => {
			window.location.href = '#/curve_lobby';
		});
    }
}

export default CurveCreate;