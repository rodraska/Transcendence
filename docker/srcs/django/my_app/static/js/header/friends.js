import Component from "../spa/component.js";
class FriendsPage extends Component {
	constructor() {
		super("static/html/friends.html");
		this.originalFriendsData = [];
		this.friendsData = [];
		this.currentPage = 1;
		this.friendsPerPage = 8;
		this.friendsList = null;
	}

	onInit() {
		this.friendsList = document.getElementById("friends-list");
		this.fetchFriends();
		this.setupSearch();
		this.setupModal();
	}

	fetchFriends() {
		fetch(`/api/all-users/?target_user_id=${window.loggedInUserId}`, {
			method: "GET",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.error) {
					alert("Error getting users!");
				} else {
					this.originalFriendsData = data.map((user) => ({
						id: user.id,
						name: user.username,
						status: user.is_online ? "online" : "offline",
						photo: user.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg",
						isFriend: user.relationship?.status === "accepted",
						receivedFriendRequest: user.relationship?.status === "pending" && user.relationship?.direction === "received",
						sentFriendRequest: user.relationship?.status === "pending" && user.relationship?.direction === "sent",
					}));
					this.friendsData = [...this.originalFriendsData];
					this.displayFriends(this.currentPage);
					this.setupPagination();
				}
			})
			.catch((error) => console.error("Error getting users:", error));
	}

	displayFriends(page) {
		this.friendsList.innerHTML = "";
		const startIndex = (page - 1) * this.friendsPerPage;
		const endIndex = page * this.friendsPerPage;
		const currentFriends = this.friendsData.slice(startIndex, endIndex);

		currentFriends.forEach((friend) => {
			const friendItem = document.createElement("li");
			friendItem.className = "list-group-item d-flex align-items-center";
			friendItem.innerHTML = `
				<img src="${friend.photo}" class="friend-photo" alt="Profile">
				<span class="me-2">${friend.name}</span>
				<span class="status ${friend.status} me-2"></span>
				<div class="friend-actions ms-auto">
					${friend.isFriend ?
						'<button class="btn btn-sm btn-secondary is-friend-btn"><i class="bi bi-person-check"></i> Friend</button>' :
					friend.receivedFriendRequest ?
						'<button class="btn btn-sm btn-success accept-btn"><i class="bi bi-check-circle"></i></button><button class="btn btn-sm btn-danger decline-btn"><i class="bi bi-x-circle"></i></button>' :
					friend.sentFriendRequest ? '<button class="btn btn-sm btn-warning pending-request-btn"><i class="bi bi-hourglass-split">Pending</i></button>' :
					'<button class="btn btn-sm btn-primary send-request-btn"><i class="bi bi-person-plus"></i> Send Request</button>'}
				</div>
			`;

			this.setupFriendActions(friendItem, friend);
			this.friendsList.appendChild(friendItem);
		});
	}

	setupFriendActions(friendItem, friend) {
		friendItem.querySelector(".is-friend-btn")?.addEventListener("click", () => {
			this.showConfirmationModal("Unfriend", `Are you sure you want to remove ${friend.name} from your friends' list?`, "unfriend", friend.id);
		});

		friendItem.querySelector(".pending-request-btn")?.addEventListener("click", () => {
			this.showConfirmationModal("Cancel Friend Request", `Are you sure you want to cancel the friend request to ${friend.name}?`, "cancel", friend.id);
		});

		friendItem.querySelector(".send-request-btn")?.addEventListener("click", () => {
			this.action("send", friend.id);
		});

		friendItem.querySelector(".accept-btn")?.addEventListener("click", () => {
			this.action("accept", friend.id);
		});

		friendItem.querySelector(".decline-btn")?.addEventListener("click", () => {
			this.action("decline", friend.id);
		});
	}

	action(actionType, userId) {
		let url = `/api/friend_request/${actionType}/`;
		let body;
		if (actionType === "send" || actionType === "cancel") body = JSON.stringify({ to_user_id: userId });
		else if ((actionType === "accept") || (actionType === "decline")) body = JSON.stringify({ from_user_id: userId });
		else body = JSON.stringify({ user_id: userId });

		fetch(url, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: body,
		})
		.then((res) => res.json())
		.then((resData) => {
			if (resData.error) {
				alert("Error: " + resData.error);
			} else {
				this.fetchFriends();
			}
		})
		.catch((error) => console.error("Error sending request:", error));
	}

	setupPagination() {
		const totalPages = Math.ceil(this.friendsData.length / this.friendsPerPage);
		const prev = document.getElementById("prev-page");
		const next = document.getElementById("next-page");

		if (prev) {
			prev.style.visibility = this.currentPage > 1 ? "visible" : "hidden";
			prev.onclick = () => {
				if (this.currentPage > 1) {
					this.currentPage--;
					this.displayFriends(this.currentPage);
					this.setupPagination();
				}
			};
		}

		if (next) {
			next.style.visibility = this.currentPage < totalPages ? "visible" : "hidden";
			next.onclick = () => {
				if (this.currentPage < totalPages) {
					this.currentPage++;
					this.displayFriends(this.currentPage);
					this.setupPagination();
				}
			};
		}
	}

	setupSearch() {
		document.getElementById("search").addEventListener("input", (e) => {
			const searchText = e.target.value.toLowerCase();
			this.friendsData = this.originalFriendsData.filter((friend) =>
				friend.name.toLowerCase().includes(searchText)
			);
			this.currentPage = 1;
			this.displayFriends(this.currentPage);
			this.setupPagination();
		});
	}

	setupModal() {
		this.confirmationModal = new bootstrap.Modal(document.getElementById("confirmationModal"));
		this.confirmationTitle = document.getElementById("confirmationTitle");
		this.confirmationMessage = document.getElementById("confirmationMessage");
		this.confirmActionBtn = document.getElementById("confirmActionBtn");

		this.confirmActionBtn.addEventListener("click", () => {
			if (this.selectedFriendId && this.actionType) {
				this.action(this.actionType, this.selectedFriendId);
			}
		});
	}

	showConfirmationModal(title, message, actionType, friendId) {
		this.confirmationTitle.textContent = title;
		this.confirmationMessage.textContent = message;
		this.confirmActionBtn.textContent = actionType === "unfriend" ? "Remove Friend" : "Cancel Request";
		this.confirmActionBtn.classList.toggle("btn-danger", actionType === "unfriend");
		this.confirmActionBtn.classList.toggle("btn-primary", actionType === "cancel");

		this.selectedFriendId = friendId;
		this.actionType = actionType;

		this.confirmationModal.show();
	}
}

export default FriendsPage



// TODO:
// - click pending button -> cancel request
// - click friend button -> unfriend person
// '<span class="badge bg-secondary"><i class="bi bi-person-check"></i> Friend</span>'


// originalFriendsData = [
// 	{ id: 1, name: "João Silva", status: "online", photo: "https://randomuser.me/api/portraits/men/1.jpg", isFriend: false, receivedFriendRequest: true, sentFriendRequest: false },
// 	{ id: 2, name: "Maria Oliveira", status: "offline", photo: "https://randomuser.me/api/portraits/women/2.jpg", isFriend: false, receivedFriendRequest: false, sentFriendRequest: true },
// 	{ id: 3, name: "Carlos Souza", status: "online", photo: "https://randomuser.me/api/portraits/men/3.jpg", isFriend: false, receivedFriendRequest: false, sentFriendRequest: false },
// 	{ id: 4, name: "Ana Costa", status: "offline", photo: "https://randomuser.me/api/portraits/women/4.jpg", isFriend: true, receivedFriendRequest: false, sentFriendRequest: false },
// 	{ id: 5, name: "Lucas Santos", status: "online", photo: "https://randomuser.me/api/portraits/men/5.jpg", isFriend: false, receivedFriendRequest: false, sentFriendRequest: true },
// 	{ id: 6, name: "Fernanda Lima", status: "offline", photo: "https://randomuser.me/api/portraits/women/6.jpg", isFriend: true, receivedFriendRequest: false, sentFriendRequest: false },
// 	{ id: 7, name: "Paula Almeida", status: "online", photo: "https://randomuser.me/api/portraits/women/7.jpg", isFriend: true, receivedFriendRequest: false, sentFriendRequest: false },
// 	{ id: 9, name: "Roberto Gomes", status: "offline", photo: "https://randomuser.me/api/portraits/men/8.jpg", isFriend: true, receivedFriendRequest: false, sentFriendRequest: false },
// 	{ id: 10, name: "Lucas Santos", status: "online", photo: "https://randomuser.me/api/portraits/men/5.jpg", isFriend: false, receivedFriendRequest: false, sentFriendRequest: true },
// 	{ id: 11, name: "Fernanda Lima", status: "offline", photo: "https://randomuser.me/api/portraits/women/6.jpg", isFriend: true, receivedFriendRequest: false, sentFriendRequest: false },
// 	{ id: 12, name: "Paula Almeida", status: "online", photo: "https://randomuser.me/api/portraits/women/7.jpg", isFriend: true, receivedFriendRequest: false, sentFriendRequest: false },
// 	{ id: 13, name: "Roberto Gomes", status: "offline", photo: "https://randomuser.me/api/portraits/men/8.jpg", isFriend: true, receivedFriendRequest: false, sentFriendRequest: false },
// ];
