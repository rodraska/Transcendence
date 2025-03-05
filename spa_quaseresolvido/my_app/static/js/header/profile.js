import Component from "../spa/component.js"

class UserProfile extends Component
{
	constructor()
	{
		super('static/pages/Profile/profile.html')
	}

	onInit(){

		console.log("UserProfile carregado!");

		const dataset = {
			displayName: "João Silva",
			firstName: "João",
			lastName: "Silva",
			email: "joao.silva@email.com"
		  };
		
		  // Preenchendo os campos do formulário com os dados do dataset
		  document.getElementById('dname').value = dataset.displayName;
		  document.getElementById('name1').value = dataset.firstName;
		  document.getElementById('name2').value = dataset.lastName;
		  document.getElementById('email').value = dataset.email;
		  
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

export default UserProfile;
/* customElements.define('user-profile', UserProfile);

export { };
 */