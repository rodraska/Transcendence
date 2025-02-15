import Component from "../spa/component.js"

class PlayGames extends Component
{
	constructor()
	{
		super('static/html/play_games.html')
	}

	onInit(){
		fetch(() => {
			
		})
		document.getElementById('playpong').addEventListener('click', () => {
			window.location.href = '#/pong';
		});
		document.getElementById('playcurve').addEventListener('click', () => {
			window.location.href = '#';
		});
	}
}

export default PlayGames;