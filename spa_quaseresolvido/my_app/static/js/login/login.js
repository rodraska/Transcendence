import Component from "../spa/component.js"

export default class LoginButtons extends Component
{
	constructor()
	{
		super('static/html/login.html')
	}

	onInit(){
		document.getElementById('login-button').addEventListener('click', () => {
			window.location.href = '#/login_form';
		});
		document.getElementById('register-button').addEventListener('click', () => {
			window.location.href = '#/registration_form';
		});
	}
}
