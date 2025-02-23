import Component from "../spa/component.js";

class FriendsPage extends Component {
	constructor() {
		super("static/html/friends.html");
	}

	onInit() {
		const friendsList = document.getElementById("friends-list");
		let friendsData = [];
		let currentPage = 1;
		const friendsPerPage = 2;

		function fetchFriends() {
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
						friendsData = data.map((user) => ({
							id: user.id,
							name: user.username,
							status: user.is_online ? "online" : "offline", // should we keep this?
							photo: user.profile_picture || "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg",
							isFriend: user.relationship || user.relationship?.status === "accepted",
							receivedFriendRequest: user.relationship || user.relationship?.direction === "received",
							sentFriendRequest: user.relationship || user.relationship?.direction === "sent"
						}));
						// friendsData= [
						//   { id: 1, name: "João Silva", status: "online", photo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg", isFriend: false, receivedFriendRequest: true, sentFriendRequest: false },
						//   { id: 2, name: "Maria Oliveira", status: "offline", photo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg", isFriend: false, receivedFriendRequest: false, sentFriendRequest: true },
						//   { id: 3, name: "Carlos Souza", status: "online", photo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg", isFriend: true, receivedFriendRequest: false, sentFriendRequest: true },
						//   { id: 4, name: "Ana Costa", status: "offline", photo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg", isFriend: true, receivedFriendRequest: true },
						//   { id: 5, name: "Lucas Santos", status: "online", photo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg", isFriend: false, receivedFriendRequest: false, sentFriendRequest: true },
						//   { id: 6, name: "Fernanda Lima", status: "offline", photo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg", isFriend: true },
						//   { id: 7, name: "Paula Almeida", status: "online", photo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg", isFriend: true },
						//   { id: 8, name: "Roberto Gomes", status: "offline", photo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg", isFriend: true },
						// ];
						friendsData = [
							{ id: 1, name: "João Silva", status: "online", photo: "https://randomuser.me/api/portraits/men/1.jpg", isFriend: false, receivedFriendRequest: true, sentFriendRequest: false },
							{ id: 2, name: "Maria Oliveira", status: "offline", photo: "https://randomuser.me/api/portraits/women/2.jpg", isFriend: false, receivedFriendRequest: false, sentFriendRequest: true },
							{ id: 3, name: "Carlos Souza", status: "online", photo: "https://randomuser.me/api/portraits/men/3.jpg", isFriend: false, receivedFriendRequest: false, sentFriendRequest: false },
							{ id: 4, name: "Ana Costa", status: "offline", photo: "https://randomuser.me/api/portraits/women/4.jpg", isFriend: true, receivedFriendRequest: false, sentFriendRequest: false },
							{ id: 5, name: "Lucas Santos", status: "online", photo: "https://randomuser.me/api/portraits/men/5.jpg", isFriend: false, receivedFriendRequest: false, sentFriendRequest: true },
							{ id: 6, name: "Fernanda Lima", status: "offline", photo: "https://randomuser.me/api/portraits/women/6.jpg", isFriend: true, receivedFriendRequest: false, sentFriendRequest: false },
							{ id: 7, name: "Paula Almeida", status: "online", photo: "https://randomuser.me/api/portraits/women/7.jpg", isFriend: true, receivedFriendRequest: false, sentFriendRequest: false },
							{ id: 8, name: "Roberto Gomes", status: "offline", photo: "https://randomuser.me/api/portraits/men/8.jpg", isFriend: true, receivedFriendRequest: false, sentFriendRequest: false },
						];
						displayFriends(currentPage);
						setupPagination();
					}
				})
				.catch((error) => console.error("Error getting users:", error));
		}

		function displayFriends(page) {
			friendsList.innerHTML = "";
			const startIndex = (page - 1) * friendsPerPage;
			const endIndex = page * friendsPerPage;
			const currentFriends = friendsData.slice(startIndex, endIndex);
			console.log("CURRENT FRIENDS", currentFriends)
			console.log("FRIENDS DATA", friendsData)

			currentFriends.forEach((friend) => {
				try {
				console.log("FRIEND", friend)
				const friendItem = document.createElement("li");
				friendItem.className = "list-group-item d-flex align-items-center";
				friendItem.innerHTML = `
					<img src="${friend.photo}" class="friend-photo" alt="Profile">
					<span class="me-2">${friend.name}</span>
					<span class="status ${friend.status} me-2"></span>
					<small class="text-muted me-2">Last seen online</small>
					<div class="friend-actions ms-auto">
						${friend.isFriend ?
							'<span class="badge bg-secondary"><i class="bi bi-person-check"></i> Friend</span>' :
						friend.receivedFriendRequest ?
						'<button class="btn btn-sm btn-success accept-btn"><i class="bi bi-check-circle"></i></button><button class="btn btn-sm btn-danger decline-btn"><i class="bi bi-x-circle"></i></button>' :
						friend.sentFriendRequest ? '<button class="btn btn-sm btn-warning send-request-btn" disabled><i class="bi bi-hourglass-split">Pending</i></button>' :
						'<button class="btn btn-sm btn-primary send-request-btn"><i class="bi bi-person-plus"></i> Send Request</button>'}
					</div>
				`;

				console.log(`Generated HTML for ${friend.name}:`, friendItem.innerHTML);

				if (!friend.isFriend) {
					if (friend.receivedFriendRequest) {
						const acceptBtn = friendItem.querySelector(".accept-btn");
						const declineBtn = friendItem.querySelector(".decline-btn");
						if (acceptBtn) {
							acceptBtn.addEventListener("click", () => {
								sendFriendRequest("accept", friend.id, friendItem);
							});
						}
						if (declineBtn) {
							declineBtn.addEventListener("click", () => {
								sendFriendRequest("decline", friend.id, friendItem);
							});
						}
					} else {
						const sendRequestBtn = friendItem.querySelector(".send-request-btn");
						if (sendRequestBtn) {
							sendRequestBtn.addEventListener("click", () => {
								sendFriendRequest("send", friend.id, friendItem);
							});
						}
					}
				}
				friendsList.appendChild(friendItem);
				} catch (error) {
			console.error("Error processing friend:", error);
		}
			});
		}

		function sendFriendRequest(action, userId, friendItem) {
			let url;
			if (action === "send") url = "/api/friend_request/send/";
			else if (action === "accept") url = "/api/friend_request/accept/";
			else url = "/api/friend_request/decline/";

			fetch(url, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ to_user_id: userId }),
			})
			.then((res) => res.json())
			.then((resData) => {
				if (resData.error) {
					alert("Error: " + resData.error);
				} else {
					if (action === "send") {
						friendItem.querySelector(".friend-actions").innerHTML = '<span class="badge bg-warning">Request Sent</span>';
					} else if (action === "accept") {
						friendItem.querySelector(".friend-actions").innerHTML = '<span class="badge bg-secondary"><i class="bi bi-person-check"></i> Friend</span>';
					} else {
						friendItem.querySelector(".friend-actions").innerHTML = '<button class="btn btn-sm btn-primary send-request-btn"><i class="bi bi-person-plus"></i> Send Request</button>';
						friendItem.querySelector(".send-request-btn").addEventListener("click", () => {
							sendFriendRequest("send", userId, friendItem);
						});
					}
				}
			})
			.catch((error) => console.error("Error sending request:", error));
		}

		function setupPagination() {
			const totalPages = Math.ceil(friendsData.length / friendsPerPage);
			document.getElementById("prev-page").style.visibility = currentPage > 1 ? "visible" : "hidden";
			document.getElementById("next-page").style.visibility = currentPage < totalPages ? "visible" : "hidden";

			document.getElementById("prev-page").onclick = () => {
				if (currentPage > 1) {
					currentPage--;
					displayFriends(currentPage);
					setupPagination();
				}
			};

			document.getElementById("next-page").onclick = () => {
				if (currentPage < totalPages) {
					currentPage++;
					displayFriends(currentPage);
					setupPagination();
				}
			};
		}

		document.getElementById("search").addEventListener("input", function () {
			const searchText = this.value.toLowerCase();
			friendsData = friendsData.filter((friend) => friend.name.toLowerCase().includes(searchText));
			currentPage = 1;
			displayFriends(currentPage);
			setupPagination();
		});

		fetchFriends();
	}
}

export default FriendsPage
