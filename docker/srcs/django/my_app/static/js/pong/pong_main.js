import Component from "../spa/component.js"

class PongMain extends Component
{
    constructor()
    {
        super('static/html/pong_main.html')
    }

    onInit()
    {
        document.getElementById('button_create').addEventListener('click', () => {
			window.location.href = '#/pong_create';
		});

        document.getElementById('button_join').addEventListener('click', () => {
			window.location.href = '#/pong_join';
		});
    }
}

export default PongMain;