import Component from "../spa/component.js"

class CurveJoin extends Component
{
    constructor()
    {
        super('static/html/curve_join.html')
    }
    onInit()
    {
        document.getElementById('button1').addEventListener('click', () => {
			window.location.href = '#/curve_lobby';
		});

        document.getElementById('button2').addEventListener('click', () => {
			window.location.href = '#/curve_lobby';
		});

        document.getElementById('button3').addEventListener('click', () => {
			window.location.href = '#/curve_lobby';
		});
    }
}

export default CurveJoin;