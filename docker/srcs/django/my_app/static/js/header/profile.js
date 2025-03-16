import Component from "../spa/component.js"

class UserProfile extends Component
{
	constructor()
	{
		super('static/html/profile.html')
	}

	onInit(){

		console.log("UserProfile carregado!");

		document.getElementById('dname').value = window.loggedInUserName;
		document.getElementById('name1').value = window.loggedInFirstName || "";
    	document.getElementById('name2').value = window.loggedInLastName || "";
   		document.getElementById('email').value = window.loggedInEmail;

		document.getElementById('profileImage').src = window.loggedInAvatarUrl || 
		   "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg";


	// Adiciona evento ao botão de salvar
    document.querySelector("form").addEventListener("submit", this.updateProfile.bind(this));
    }

	updateProfile(event) {
		event.preventDefault(); // Evita que o formulário recarregue a página

		// Capturar valores do formulário
		const updatedData = {
			username: document.getElementById("dname").value,  // Django usa 'username' em vez de 'displayName'
			first_name: document.getElementById("name1").value,
			last_name: document.getElementById("name2").value,
			email: document.getElementById("email").value
    };

	fetch(`/api/user/${window.loggedInUserId}/update/`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(updatedData),
			credentials: "include" // Garante que os cookies de autenticação do Django são enviados
		})
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert("Erro ao atualizar: " + data.error);
        } else {
            alert("Profile updated!");

            // Atualizar os valores no window para refletir as mudanças
            window.loggedInUserName = updatedData.username;
            window.loggedInFirstName = updatedData.first_name;
            window.loggedInLastName = updatedData.last_name;
            window.loggedInEmail = updatedData.email;

            // Atualiza o header/nav com os novos dados
            document.getElementById("userName").textContent = updatedData.username;
        }
    })
    .catch(error => console.error("Erro ao atualizar perfil:", error));
	}



/* 		
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
	}*/

	
} 

export default UserProfile;


/* 
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
		  */
	/* 	  fetch("/api/current_user/", { credentials: "include" })
			.then((response) => response.json())
			.then((data) => {
				if (data.logged_in) {
					document.getElementById('dname').value = data.username;
					document.getElementById('name1').value = data.first_name; 
					document.getElementById('name2').value = data.last_name;  
					document.getElementById('email').value = data.email;  
					document.getElementById('profileImage').src = data.avatar_url || 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg';
				} else if (data.error) {
						alert("Error getting user!");
					}
				})
			.catch(error => console.error("Error loading profile:", error));
		// Função para obter CSRF Token
		function getCsrfToken() {
			return document.cookie.split("; ")
				.find(row => row.startsWith("csrftoken="))
				?.split("=")[1];
		}
 */
