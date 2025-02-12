import Component from "../spa/component.js"
import FriendCard from "./friend_card.js";

export default class FriendsPage extends Component
{
	constructor()
	{
		super('static/html/friends/friends.html')
	}

	onInit(){
		// Dados simulados de amigos (para exemplo)
		const friendsData = [
			{ id: 1, name: "João Silva", status: "online", photo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg", isFriend: true },
			{ id: 2, name: "Maria Oliveira", status: "offline", photo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg", isFriend: false },
			{ id: 3, name: "Carlos Souza", status: "online", photo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg", isFriend: true },
			{ id: 4, name: "Ana Costa", status: "offline", photo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg", isFriend: false, isFriendRequest: true },
			{ id: 5, name: "Lucas Santos", status: "online", photo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg", isFriend: false },
			{ id: 6, name: "Fernanda Lima", status: "offline", photo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg", isFriend: true },
			{ id: 7, name: "Paula Almeida", status: "online", photo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg", isFriend: true },
			{ id: 8, name: "Roberto Gomes", status: "offline", photo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg", isFriend: true },
			// Adicione mais amigos aqui para testar a paginação
		];

		// Parâmetros de paginação
		let currentPage = 1;
		const friendsPerPage = 8;  // Número de amigos por página

		function displayFriends(page) {
			const startIndex = (page - 1) * friendsPerPage;
			const endIndex = page * friendsPerPage;
			const currentFriends = friendsData.slice(startIndex, endIndex);
			const friendsList = document.getElementById('friends-list');
			friendsList.innerHTML = '';

			currentFriends.forEach(friend => {
			const statusClass = friend.status === 'online' ? 'online' : 'offline';

			// Create list item
			const listItem = document.createElement('li');
			listItem.className = 'list-group-item d-flex align-items-center';

			// Create and append photo
			const img = document.createElement('img');
			img.src = friend.photo;
			img.className = 'friend-photo';
			img.alt = 'Foto de amigo';
			listItem.appendChild(img);

			// Create and append name
			const nameSpan = document.createElement('span');
			nameSpan.className = 'me-2';
			nameSpan.textContent = friend.name;
			listItem.appendChild(nameSpan);

			// Create and append status
			const statusSpan = document.createElement('span');
			statusSpan.className = `status ${statusClass} me-2`;
			listItem.appendChild(statusSpan);

			// Create and append last seen
			const lastSeen = document.createElement('small');
			lastSeen.className = 'text-muted me-2';
			lastSeen.textContent = 'Last seen online';
			listItem.appendChild(lastSeen);

			// Create and append actions
			const actionsDiv = document.createElement('div');
			actionsDiv.className = 'friend-actions ms-auto';

			if (friend.isFriend) {
				const friendBadge = document.createElement('span');
				friendBadge.className = 'badge bg-secondary';
				friendBadge.innerHTML = '<i class="bi bi-person-check"></i> Amigo';
				actionsDiv.appendChild(friendBadge);
			} else if (friend.isFriendRequest) {
				const acceptButton = document.createElement('button');
				acceptButton.className = 'btn btn-sm btn-success me-1';
				acceptButton.innerHTML = '<i class="bi bi-check-circle"></i> Aceitar';
				actionsDiv.appendChild(acceptButton);

				const denyButton = document.createElement('button');
				denyButton.className = 'btn btn-sm btn-danger';
				denyButton.innerHTML = '<i class="bi bi-x-circle"></i> Recusar';
				actionsDiv.appendChild(denyButton);
			} else {
				const addButton = document.createElement('button');
				addButton.className = 'btn btn-sm btn-primary';
				addButton.innerHTML = '<i class="bi bi-person-plus"></i> Adicionar Amigo';
				actionsDiv.appendChild(addButton);
			}

			listItem.appendChild(actionsDiv);
			friendsList.appendChild(listItem);
			});
		}

		// Função para configurar a navegação da página
		function setupPagination() {
			const totalPages = Math.ceil(friendsData.length / friendsPerPage);

			// Mostrar/ocultar botões de navegação
			document.getElementById('prev-page').style.display = currentPage > 1 ? '' : 'none';
			document.getElementById('next-page').style.display = currentPage < totalPages ? '' : 'none';

			// Definir comportamento dos botões de navegação
			document.getElementById('prev-page').addEventListener('click', () => {
				if (currentPage > 1) {
					currentPage--;
					displayFriends(currentPage);
					setupPagination();
				}
			});

			document.getElementById('next-page').addEventListener('click', () => {
				if (currentPage < totalPages) {
					currentPage++;
					displayFriends(currentPage);
					setupPagination();
				}
			});
		}

		// Função de pesquisa
		document.getElementById('search').addEventListener('input', function () {
			const searchText = this.value.toLowerCase();
			const filteredFriends = friendsData.filter(friend => friend.name.toLowerCase().includes(searchText));
			friendsData.length = 0;  // Limpar dados atuais
			friendsData.push(...filteredFriends);  // Atualizar com os filtrados
			currentPage = 1;  // Resetar para a primeira página
			displayFriends(currentPage);
			setupPagination();
		});

		// Inicializar
		displayFriends(currentPage);
		setupPagination();
	}
}



		// function displayFriends(page) {
		// 	const startIndex = (page - 1) * friendsPerPage;
		// 	const endIndex = page * friendsPerPage;
		// 	const currentFriends = friendsData.slice(startIndex, endIndex);
		// 	const friendsList = document.getElementById('friends-list');
		// 	friendsList.innerHTML = '';

		// 	fetch('../static/html/friends/friend_card.html')
		// 		.then(response => {
		// 		if (!response.ok) {
		// 			throw new Error('Network response was not ok');
		// 		}
		// 		return response.text();
		// 		})
		// 		.then(template => {
		// 		console.log('Template fetched:', template); // Log the fetched template
		// 		currentFriends.forEach(friend => {
		// 			const statusClass = friend.status === 'online' ? 'online' : 'offline';
		// 			let friendCard = template;
		// 			friendCard = friendCard.replace('src=""', `src="${friend.photo}"`);
		// 			friendCard = friendCard.replace('<a href=""', `<a href="perfil.html?user=${friend.id}"`);
		// 			friendCard = friendCard.replace('</a>', `${friend.name}</a>`);
		// 			friendCard = friendCard.replace('class="status"', `class="status ${statusClass}"`);
		// 			friendsList.innerHTML += friendCard;
		// 		});
		// 		})
		// 		.catch(error => {
		// 		console.error('Error fetching the template:', error);
		// 		});
		// }

		// function displayFriends(page) {
		// 	const startIndex = (page - 1) * friendsPerPage;
		// 	const endIndex = page * friendsPerPage;
		// 	const currentFriends = friendsData.slice(startIndex, endIndex);
		// 	const friendsList = document.getElementById('friends-list');
		// 	friendsList.innerHTML = '';

		// 	fetch('../static/html/friends/friend_card.html')
		// 	.then(response => {
		// 		if (!response.ok) {
		// 		throw new Error('Network response was not ok');
		// 		}
		// 		return response.text();
		// 	})
		// 	.then(template => {
		// 		console.log('Template fetched:', template); // Log the fetched template
		// 		currentFriends.forEach(friend => {
		// 		const statusClass = friend.status === 'online' ? 'online' : 'offline';
		// 		let friendCard = template;
		// 		friendCard = friendCard.replace('src=""', `src="${friend.photo}"`);
		// 		friendCard = friendCard.replace('<span class="me-2"></span>', `<span class="me-2">${friend.name}</span>`);
		// 		friendCard = friendCard.replace('class="status me-2"', `class="status ${statusClass} me-2"`);

		// 		const actions = friend.isFriend ?
		// 			'<span class="badge bg-secondary"><i class="bi bi-person-check"></i> Friend</span>' :
		// 			friend.isFriendRequest ?
		// 			'<button class="btn btn-sm btn-success me-1"><i class="bi bi-check-circle"></i></button><button class="btn btn-sm btn-danger"><i class="bi bi-x-circle"></i></button>' :
		// 			'<button class="btn btn-sm btn-primary"><i class="bi bi-person-plus"></i> Add Friend</button>';

		// 		friendCard = friendCard.replace('<!-- Buttons will be dynamically added here -->', actions);
		// 		friendsList.innerHTML += friendCard;
		// 		});
		// 	})
		// 	.catch(error => {
		// 		console.error('Error fetching the template:', error);
		// 	});
		// }


				// function displayFriends(page) {
		// 	const startIndex = (page - 1) * friendsPerPage;
		// 	const endIndex = page * friendsPerPage;
		// 	const currentFriends = friendsData.slice(startIndex, endIndex);
		// 	const friendsList = document.getElementById('friends-list');
		// 	friendsList.innerHTML = '';

		// 	currentFriends.forEach(friend => {
		// 		const statusClass = friend.status === 'online' ? 'online' : 'offline';
		// 		const friendItem = `
		// 		<li class="list-group-item d-flex align-items-center">
		// 			<img src="${friend.photo}" class="friend-photo" alt="Foto de amigo">
		// 			<span class="me-2">${friend.name}</span>
		// 			<span class="status ${statusClass} me-2"></span>
		// 			<small class="text-muted me-2">Last seen online</small>
		// 			<div class="friend-actions ms-auto">
		// 			${friend.isFriend ?
		// 				'<span class="badge bg-secondary"><i class="bi bi-person-check"></i> Amigo</span>' :
		// 				friend.isFriendRequest ?
		// 				'<button class="btn btn-sm btn-success"><i class="bi bi-check-circle"></i></button><button class="btn btn-sm btn-danger"><i class="bi bi-x-circle"></i></button>' :
		// 				'<button class="btn btn-sm btn-primary"><i class="bi bi-person-plus"></i> Adicionar Amigo</button>'
		// 			}
		// 			</div>
		// 		</li>
		// 		`;
		// 		friendsList.innerHTML += friendItem;
		// 	});
		// }
		// function displayFriends(page) {
		// 	const startIndex = (page - 1) * friendsPerPage;
		// 	const endIndex = page * friendsPerPage;
		// 	const currentFriends = friendsData.slice(startIndex, endIndex);
		// 	const friendsList = document.getElementById('friends-list');
		// 	friendsList.innerHTML = '';

		// 	currentFriends.forEach(friend => {
		// 		const friendCard = new FriendCard(friend);
		// 		friendCard.renderCard().then(cardHtml => {
		// 			friendsList.innerHTML += cardHtml;
		// 		});
		// 	});
		// }
