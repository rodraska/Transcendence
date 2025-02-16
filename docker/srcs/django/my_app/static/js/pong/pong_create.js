import Component from "../spa/component.js"

class PongCreate extends Component
{
    constructor()
    {
        super('static/html/pong_create.html')
    }

    onInit()
    {
        document.getElementById('button_create').addEventListener('click', () => {
			window.location.href = '#/pong_lobby';
		});
    }
}

export default PongCreate;