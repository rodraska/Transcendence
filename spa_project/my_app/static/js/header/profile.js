import Component from "../spa/component.js"

export default class UserProfile extends Component
{
	constructor()
	{
		super('static/html/profile.html')
	}

	onInit(){
		// Alterar imagem para a escolhida
		document.getElementById('changeImageBtn').addEventListener('click', function() {
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = 'image/*';
			input.click();
		
			input.addEventListener('change', function() {
			const file = input.files[0];
			const reader = new FileReader();
			reader.onload = function(e) {
				document.getElementById('profileImage').src = e.target.result;
			};
			reader.readAsDataURL(file);
			});
	  	});
	
		// Resetar para imagem padrão
		document.getElementById('resetImageBtn').addEventListener('click', function() {
			document.getElementById('profileImage').src = 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg';
		});
	}

	
}
