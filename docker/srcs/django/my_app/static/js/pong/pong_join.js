import Component from "../spa/component.js"

class PongJoin extends Component
{
    constructor()
    {
        super('static/html/pong_join.html')
    }

    onInit()
    {
        document.getElementById('button1').addEventListener('click', () => {
			window.location.href = '#/pong_lobby';
		});

        document.getElementById('button2').addEventListener('click', () => {
			window.location.href = '#/pong_lobby';
		});

        document.getElementById('button3').addEventListener('click', () => {
			window.location.href = '#/pong_lobby';
		});
    }
}

export default PongJoin;