import Component from "../spa/component.js"

export default class PlayGames extends Component
{
	constructor()
	{
		super('static/pages/Games/play_games.html')
	}

	onInit(){
		console.log("PlayGames carregado!");
		document.getElementById('playpong').addEventListener('click', () => {
			window.location.href = '#/pong';
		});
		document.getElementById('playcurve').addEventListener('click', () => {
			window.location.href = '#';
		});

		/* window.currentComponent = this; */

	}
}

