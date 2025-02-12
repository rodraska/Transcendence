import Component from "../spa/component.js"
import FriendCard from "./friend_card.js";

export default class FriendsPage extends Component
{
	constructor()
	{
		super('static/html/friends.html')
	}

	onInit(){
		// Mock data
		const originalFriendsData = [
			{ id: 1, name: "João Silva", status: "online", photo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg", isFriend: true },
			{ id: 2, name: "Maria Oliveira", status: "offline", photo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg", isFriend: false },
			{ id: 3, name: "Carlos Souza", status: "online", photo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg", isFriend: true },
			{ id: 4, name: "Ana Costa", status: "offline", photo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg", isFriend: false, hasFriendRequest: true },
			{ id: 5, name: "Lucas Santos", status: "online", photo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg", isFriend: false, hasFriendRequest: false },
			{ id: 6, name: "Fernanda Lima", status: "offline", photo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg", isFriend: true },
			{ id: 7, name: "Paula Almeida", status: "online", photo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg", isFriend: true },
			{ id: 8, name: "Roberto Gomes", status: "offline", photo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg", isFriend: true },
		];

		let friendsData = [...originalFriendsData];

		// Pagination parameters
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
				const friendItem = document.createElement('li');
				friendItem.className = 'list-group-item d-flex align-items-center';
				friendItem.innerHTML = `
					<img src="${friend.photo}" class="friend-photo" alt="Foto de amigo">
					<span class="me-2">${friend.name}</span>
					<span class="status ${statusClass} me-2"></span>
					<small class="text-muted me-2">Last seen online</small>
					<div class="friend-actions ms-auto">
					${friend.isFriend ?
						'<span class="badge bg-secondary"><i class="bi bi-person-check"></i> Friend</span>' :
						friend.hasFriendRequest ?
						'<button class="btn btn-sm btn-success"><i class="bi bi-check-circle"></i></button><button class="btn btn-sm btn-danger"><i class="bi bi-x-circle"></i></button>' :
						'<button class="btn btn-sm btn-primary send-request-btn"><i class="bi bi-person-plus"></i> Send friend request</button>'
						}
					</div>
				`;

				if (!friend.isFriend && !friend.hasFriendRequest) {
					const sendRequestBtn = friendItem.querySelector('.send-request-btn');
					sendRequestBtn.addEventListener('click', () => {
						sendRequestBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Pending';
						sendRequestBtn.classList.remove('btn-primary');
						sendRequestBtn.classList.add('btn-warning');
						// Optionally, update the friend status in your data
						friend.hasFriendRequest = true;
					});
				}

				friendsList.appendChild(friendItem);
			});
		}

		// Função para configurar a navegação da página
		function setupPagination() {
			const totalPages = Math.ceil(friendsData.length / friendsPerPage);

			// Show/Hide "Anterior" button
			document.getElementById('prev-page').style.display = currentPage > 1 ? '' : 'none';

			// Show/Hide "Próximo" button
			console.log(currentPage)
			console.log(totalPages)
			document.getElementById('next-page').style.display = currentPage < totalPages ? '' : 'none';

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
			friendsData = originalFriendsData.filter(friend => friend.name.toLowerCase().includes(searchText));
			currentPage = 1;
			displayFriends(currentPage);
			setupPagination();
		});

		// Inicializar
		displayFriends(currentPage);
		setupPagination();
	}
}
