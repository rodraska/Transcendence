import Component from "../spa/component.js"

class CurveLobby extends Component
{
    constructor()
    {
        super('static/html/curve_lobby.html')
    }

    onInit()
    {
        document.getElementById('button_start').addEventListener('click', () => {
			window.location.href = '#/curve_game';
		});
    }
}

export default CurveLobby;