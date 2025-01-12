import Component from "../spa/component.js"

export default class HeaderBar extends Component
{
	constructor()
	{
		super('static/html/header.html')
	}

	onInit(){

		// Add a click event to the menu button
		document.getElementById('menuButton').addEventListener('click', () => {
			const menu = document.getElementById('menu'); // Assuming your menu is hidden initially
			if (menu) {
				menu.classList.toggle('d-none'); // Toggle visibility
			}
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
