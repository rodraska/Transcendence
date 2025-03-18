import Component from "../spa/component.js"

class CurveMain extends Component
{
    constructor()
    {
        super('static/html/curve_main.html')
    }

    onInit()
    {
        document.getElementById('button_create').addEventListener('click', () => {
			window.location.href = '#/curve_create';
		});

        document.getElementById('button_join').addEventListener('click', () => {
			window.location.href = '#/curve_join';
		});

        document.getElementById('button_history').addEventListener('click', () => {
			window.location.href = '#/curve_history';
		});
    }
}

export default CurveMain;