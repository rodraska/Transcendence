import Component from "../spa/component.js"
import Route from "../spa/route.js";

export default class PlayGames extends Component
{
	constructor()
	{
		super('static/pages/Games/play_games.html')
	}

	onInit(){
		document.addEventListener("DOMContentLoaded", function() {
			console.log("Games Page loaded!");
		});		

		document.getElementById('playpong').addEventListener('click', () => {
			Route.go('/pong');
		});
		document.getElementById('playcurve').addEventListener('click', () => {
			Route.go('/curve');;
		});
	}
}
