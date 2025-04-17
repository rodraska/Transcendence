import Component from "../spa/component.js";
import {
  getOrCreateSocket,
  addSocketListener,
  removeSocketListener,
} from "../utils/socketManager.js";
import { showToast } from "../utils/toast.js";
import { getCookie } from "../utils/cookie.js";

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

    this.socketListener = (d) => {
      if (d.friend_request) this.fetchFriends();
    };
    addSocketListener(this.socketListener);
  }

  disconnectedCallback() {
    removeSocketListener(this.socketListener);
  }

  fetchFriends() {
    fetch(`/api/all-users/?target_user_id=${window.loggedInUserId}`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          showToast("Error getting users!", "danger");
        } else {
          this.originalFriendsData = data.map((user) => ({
            id: user.id,
            name: user.username,
            status: user.is_online ? "online" : "offline",
            photo:
              user.avatar_url ||
              "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg",
            isFriend: user.relationship?.status === "accepted",
            receivedFriendRequest:
              user.relationship?.status === "pending" &&
              user.relationship?.direction === "received",
            sentFriendRequest:
              user.relationship?.status === "pending" &&
              user.relationship?.direction === "sent",
          }));
          this.friendsData = [...this.originalFriendsData];
          this.displayFriends(this.currentPage);
          this.setupPagination();
        }
      })
      .catch(() => showToast("Error fetching users.", "danger"));
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
          ${
            friend.isFriend
              ? '<button class="btn btn-sm btn-secondary is-friend-btn"><i class="bi bi-person-check"></i> Friend</button>'
              : friend.receivedFriendRequest
              ? '<button class="btn btn-sm btn-success accept-btn"><i class="bi bi-check-circle"></i></button><button class="btn btn-sm btn-danger decline-btn"><i class="bi bi-x-circle"></i></button>'
              : friend.sentFriendRequest
              ? '<button class="btn btn-sm btn-warning pending-request-btn"><i class="bi bi-hourglass-split">Pending</i></button>'
              : '<button class="btn btn-sm btn-primary send-request-btn"><i class="bi bi-person-plus"></i> Send Request</button>'
          }
        </div>
      `;

      const photo = friendItem.querySelector(".friend-photo");
      let tooltip = null;

      function closeTooltip(e) {
        if (tooltip && !tooltip.contains(e.target) && e.target !== photo) {
          tooltip.remove();
          tooltip = null;
        }
      }

      photo.addEventListener("click", async () => {
        if (!friend.isFriend) return;
        if (tooltip) {
          tooltip.remove();
          tooltip = null;
          return;
        }
        tooltip = document.createElement("div");
        tooltip.className = "user-tooltip";
        tooltip.style.position = "absolute";
        tooltip.style.background = "#fff";
        tooltip.style.border = "1px solid #ccc";
        tooltip.style.padding = "10px";
        tooltip.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
        tooltip.style.zIndex = "1000";
        document.body.appendChild(tooltip);
        const stats = await fetchUserStats(friend.id, friend.name);
        tooltip.innerHTML =
          stats && Object.keys(stats).length
            ? `<strong>${friend.name}</strong><br>${Object.entries(stats)
                .map(([g, v]) => {
                  const winRate =
                    v.total > 0 ? Math.round((v.wins / v.total) * 100) : 0;
                  return `<span style="display:inline-block;margin-bottom:4px;">
                    ${g} → Games: ${v.total} Wins: ${winRate}%
                  </span>`;
                })
                .join("<br>")}`
            : `<strong>${friend.name}</strong><br><em>No games played.</em>`;
        const rect = photo.getBoundingClientRect();
        tooltip.style.left = `${rect.left + window.scrollX + 20}px`;
        tooltip.style.top = `${rect.top + window.scrollY + 20}px`;
        document.addEventListener("click", closeTooltip);
      });

      this.setupFriendActions(friendItem, friend);
      this.friendsList.appendChild(friendItem);
    });
  }

  setupFriendActions(friendItem, friend) {
    friendItem
      .querySelector(".is-friend-btn")
      ?.addEventListener("click", () => {
        this.showConfirmationModal(
          "Unfriend",
          `Are you sure you want to remove ${friend.name} from your friends' list?`,
          "unfriend",
          friend.id
        );
      });
    friendItem
      .querySelector(".pending-request-btn")
      ?.addEventListener("click", () => {
        this.showConfirmationModal(
          "Cancel Friend Request",
          `Are you sure you want to cancel the friend request to ${friend.name}?`,
          "cancel",
          friend.id
        );
      });
    friendItem
      .querySelector(".send-request-btn")
      ?.addEventListener("click", () => {
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
    if (actionType === "send") {
      const socket = getOrCreateSocket();
      socket.send(
        JSON.stringify({
          action: "send_friend_request",
          to_user_id: userId,
        })
      );
      const friend = this.friendsData.find((f) => f.id === userId);
      if (friend) friend.sentFriendRequest = true;
      this.displayFriends(this.currentPage);
      return;
    }
    let url = `/api/friend_request/${actionType}/`;
    let body;
    if (actionType === "cancel") body = JSON.stringify({ to_user_id: userId });
    else if (actionType === "accept" || actionType === "decline") {
      body = JSON.stringify({ from_user_id: userId });
    } else {
      body = JSON.stringify({ user_id: userId });
    }
    const csrftoken = getCookie("csrftoken");
    fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken },
      body: body,
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.error) showToast(`Error: ${resData.error}`, "danger");
        else this.fetchFriends();
      })
      .catch(() => showToast("Error sending request.", "danger"));
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
      next.style.visibility =
        this.currentPage < totalPages ? "visible" : "hidden";
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
    this.confirmationModal = new bootstrap.Modal(
      document.getElementById("confirmationModal")
    );
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
    this.confirmActionBtn.textContent =
      actionType === "unfriend" ? "Remove Friend" : "Cancel Request";
    this.confirmActionBtn.classList.toggle(
      "btn-danger",
      actionType === "unfriend"
    );
    this.confirmActionBtn.classList.toggle(
      "btn-primary",
      actionType === "cancel"
    );
    this.selectedFriendId = friendId;
    this.actionType = actionType;
    this.confirmationModal.show();
  }
}

async function fetchUserStats(userId, username) {
  try {
    const r = await fetch(`/api/match_record/${userId}/`, {
      credentials: "include",
    });
    if (!r.ok) throw new Error();
    const data = await r.json();
    return data.matches ? calculateStats(data.matches, username) : null;
  } catch {
    return null;
  }
}

function calculateStats(matches, username) {
  const stats = {};
  matches.forEach((m) => {
    const g = m.game_type;
    if (!stats[g]) stats[g] = { total: 0, wins: 0 };
    stats[g].total += 1;
    if (m.winner === username) stats[g].wins += 1;
  });
  return stats;
}

export default FriendsPage;
