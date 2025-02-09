import Component from "../spa/component.js"

export default class HeaderBar extends Component
{
	constructor()
	{
		super('static/html/header.html')
	}

	onInit(){

		document.getElementById('profilebtn').addEventListener('click', () => {
			window.location.href = '#/profile';
		});

		document.getElementById('playgamebtn').addEventListener('click', () => {
			window.location.href = '#/play_games';
		});
	
		document.getElementById('logoutbtn').addEventListener('click', () => {
			window.location.href = '#/login';
		});
		// Example usage
		updateHeader('John Doe', 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg');
	}

	// Function to update user details
	updateHeader(userName, profileImage) {
		const userNameElement = document.getElementById('userName');
		const profileImageElement = document.querySelector('header img');

		if (userName) userNameElement.textContent = userName;
		if (profileImage) profileImageElement.src = profileImage;
	}

}
