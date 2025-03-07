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
		if (friend.isFriend) {
			friendItem.querySelector(".is-friend-btn")?.addEventListener("click", () => {
				const confirmCancel = confirm(`Are you sure you want to remove ${friend.name} from your friends' list?`);
				if (confirmCancel) {
					this.action("unfriend", friend.id);
				}
			})
		} else {
			if (friend.receivedFriendRequest) {
				friendItem.querySelector(".accept-btn")?.addEventListener("click", () => this.action("accept", friend.id));
				friendItem.querySelector(".decline-btn")?.addEventListener("click", () => this.action("decline", friend.id));
			} else if (friend.sentFriendRequest) {
				friendItem.querySelector(".pending-request-btn")?.addEventListener("click", () => {
					const confirmCancel = confirm("Are you sure you want to cancel the friend request?");
					if (confirmCancel) {
						this.action("cancel", friend.id);
					}
				})
			} else {
				friendItem.querySelector(".send-request-btn")?.addEventListener("click", () => this.action("send", friend.id));
			}
		}
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
}

// class FriendsPage extends Component {
// 	constructor() {
// 		super("static/html/friends.html");
// 	}

// 	onInit() {
// 		const friendsList = document.getElementById("friends-list");
// 		let originalFriendsData = [];
// 		let friendsData = [];
// 		let currentPage = 1;
// 		const friendsPerPage = 8;

// 		function fetchFriends() {
// 			fetch(`/api/all-users/?target_user_id=${window.loggedInUserId}`, {
// 				method: "GET",
// 				credentials: "include",
// 				headers: { "Content-Type": "application/json" },
// 			})
// 				.then((response) => response.json())
// 				.then((data) => {
// 					if (data.error) {
// 						alert("Error getting users!");
// 					} else {
// 						// console.log(data)
// 						originalFriendsData = data.map((user) => ({
// 							id: user.id,
// 							name: user.username,
// 							status: user.is_online ? "online" : "offline", // should we keep this?
// 							photo: user.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg",
// 							isFriend: user.relationship?.status === "accepted",
// 							receivedFriendRequest: user.relationship?.status === "pending" && user.relationship?.direction === "received",
// 							sentFriendRequest:  user.relationship?.status === "pending" && user.relationship?.direction === "sent"
// 						}));
// 						friendsData = [...originalFriendsData];
// 						displayFriends(currentPage);
// 						setupPagination();
// 					}
// 				})
// 				.catch((error) => console.error("Error getting users:", error));
// 		}

// 		function displayFriends(page) {
// 			friendsList.innerHTML = "";
// 			const startIndex = (page - 1) * friendsPerPage;
// 			const endIndex = page * friendsPerPage;
// 			const currentFriends = friendsData.slice(startIndex, endIndex);
// 			// console.log("CURRENT FRIENDS", currentFriends)
// 			// console.log("FRIENDS DATA", friendsData)

// 			currentFriends.forEach((friend) => {
// 				try {
// 					// console.log("FRIEND", friend)
// 					const friendItem = document.createElement("li");
// 					friendItem.className = "list-group-item d-flex align-items-center";
// 					friendItem.innerHTML = `
// 						<img src="${friend.photo}" class="friend-photo" alt="Profile">
// 						<span class="me-2">${friend.name}</span>
// 						<span class="status ${friend.status} me-2"></span>
// 						<small class="text-muted me-2">Last seen online</small>
// 						<div class="friend-actions ms-auto">
// 							${friend.isFriend ?
// 								'<button class="btn btn-sm btn-secondary is-friend-btn"><i class="bi bi-person-check"></i> Friend</button>' :
// 							friend.receivedFriendRequest ?
// 							'<button class="btn btn-sm btn-success accept-btn"><i class="bi bi-check-circle"></i></button><button class="btn btn-sm btn-danger decline-btn"><i class="bi bi-x-circle"></i></button>' :
// 							friend.sentFriendRequest ? '<button class="btn btn-sm btn-warning pending-request-btn"><i class="bi bi-hourglass-split">Pending</i></button>' :
// 							'<button class="btn btn-sm btn-primary send-request-btn"><i class="bi bi-person-plus"></i> Send Request</button>'}
// 						</div>
// 					`;

// 					// console.log(`Generated HTML for ${friend.name}:`, friendItem.innerHTML);

// 					if (!friend.isFriend) {
// 						if (friend.receivedFriendRequest) {
// 							const acceptBtn = friendItem.querySelector(".accept-btn");
// 							const declineBtn = friendItem.querySelector(".decline-btn");
// 							if (acceptBtn) {
// 								acceptBtn.addEventListener("click", () => {
// 									action("accept", friend.id, friendItem);
// 								});
// 							}
// 							if (declineBtn) {
// 								declineBtn.addEventListener("click", () => {
// 									action("decline", friend.id, friendItem);
// 								});
// 							}
// 						}
// 						else if (friend.sentFriendRequest) {
// 							const pendingBtn = friendItem.querySelector(".pending-request-btn")
// 							if (pendingBtn) {
// 								pendingBtn.addEventListener("click", () => {
// 									action("cancel", friend.id, friendItem);
// 								});
// 							}
// 						}
// 						else {
// 							const sendRequestBtn = friendItem.querySelector(".send-request-btn");
// 							if (sendRequestBtn) {
// 								sendRequestBtn.addEventListener("click", () => {
// 									action("send", friend.id, friendItem);
// 								});
// 							}
// 						}
// 					}
// 					else if (friend.isFriend) {
// 						const friendBtn = friendItem.querySelector(".is-friend-btn")
// 						friendBtn.addEventListener("click", () => {
// 							action("unfriend", friend.id, friendItem);
// 						});
// 					}
// 					friendsList.appendChild(friendItem);
// 				} catch (error) {
// 					console.error("Error processing friend:", error);
// 				}
// 			});
// 		}

// 		function action(actionType, userId, friendItem) {
// 			let url;
// 			if (actionType === "send") url = "/api/friend_request/send/";
// 			else if (actionType === "accept") url = "/api/friend_request/accept/";
// 			else if (actionType === "decline") url = "/api/friend_request/decline/";
// 			else if (actionType === "unfriend") url = "/api/friend_request/unfriend/";
// 			else if (actionType === "cancel") url = "/api/friend_request/cancel/";

// 			let body;
// 			if (actionType === "send" || actionType === "cancel") body = JSON.stringify({ to_user_id: userId });
// 			else if ((actionType === "accept") || (actionType === "decline")) body = JSON.stringify({ from_user_id: userId });
// 			else body = JSON.stringify({ user_id: userId });

// 			fetch(url, {
// 				method: "POST",
// 				credentials: "include",
// 				headers: { "Content-Type": "application/json" },
// 				body: body,
// 			})
// 			.then((res) => {
// 				if (!res.ok) {
// 					throw new Error(`HTTP error! status: ${res.status}`);
// 				}
// 				console.log("here 1")
// 				return res.json()
// 			})
// 			.then((resData) => {
// 				console.log("here 2")
// 				console.log("Response Data:", resData);
// 				if (resData.error) {
// 					alert("Error: " + resData.error);
// 					console.log("here 2")
// 				} else {
// 					console.log("here 3")
// 					if (actionType === "send") {
// 						friendItem.querySelector(".friend-actions").innerHTML = '<button class="btn btn-sm btn-warning pending-request-btn"><i class="bi bi-hourglass-split">Pending</i></button>';
// 						const pendingBtn = friendItem.querySelector(".pending-request-btn");
// 						if (pendingBtn) {
// 							pendingBtn.addEventListener("click", () => {
// 								action("cancel", userId, friendItem);
// 							});
// 						}
// 					} else if (actionType === "accept") {
// 						friendItem.querySelector(".friend-actions").innerHTML = '<button class="btn btn-sm btn-secondary is-friend-btn"><i class="bi bi-person-check"></i> Friend</button>';
// 						const friendBtn = friendItem.querySelector(".is-friend-btn")
// 						if (friendBtn) {
// 							friendBtn.addEventListener("click", () => {
// 								action("unfriend", userId, friendItem);
// 							});
// 						}
// 					} else if (actionType === "decline" || actionType === "unfriend" || actionType === "cancel") {
// 						friendItem.querySelector(".friend-actions").innerHTML = '<button class="btn btn-sm btn-primary send-request-btn"><i class="bi bi-person-plus"></i> Send Request</button>';
// 						const requestBtn = friendItem.querySelector(".send-request-btn")
// 						if (requestBtn) {
// 							requestBtn.addEventListener("click", () => {
// 								action("send", userId, friendItem);
// 							});
// 						}
// 					}
// 				}
// 			})
// 			.catch((error) => console.error("Error sending request:", error));
// 		}

// 		function setupPagination() {
// 			const totalPages = Math.ceil(friendsData.length / friendsPerPage);
// 			let prev = document.getElementById("prev-page")
// 			if (prev){
// 				prev.style.visibility = currentPage > 1 ? "visible" : "hidden";
// 				prev.onclick = () => {
// 					if (currentPage > 1) {
// 						currentPage--;
// 						displayFriends(currentPage);
// 						setupPagination();
// 					}
// 				};
// 			}

// 			let next = document.getElementById("next-page")
// 			if (next) {
// 				next.style.visibility = currentPage < totalPages ? "visible" : "hidden";
// 				next.onclick = () => {
// 					if (currentPage < totalPages) {
// 						currentPage++;
// 						displayFriends(currentPage);
// 						setupPagination();
// 					}
// 				};
// 			}
// 		}

// 		document.getElementById("search").addEventListener("input", function () {
// 			const searchText = this.value.toLowerCase();
// 			friendsData = originalFriendsData.filter((friend) => friend.name.toLowerCase().includes(searchText));
// 			currentPage = 1;
// 			displayFriends(currentPage);
// 			setupPagination();
// 		});

// 		fetchFriends();
// 	}
// }

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
