import Component from "../spa/component.js";
import Route from "../spa/route.js";
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
    if (!window.loggedInUserName) {
      Route.go("/login");
      return;
    }
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
    const start = (page - 1) * this.friendsPerPage;
    const end = page * this.friendsPerPage;
    const slice = this.friendsData.slice(start, end);

    slice.forEach((friend) => {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex align-items-center";

      li.innerHTML = `
        <img src="${friend.photo}" class="friend-photo" alt="Profile">
        <span class="friend-name me-2">${friend.name}</span>
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

      const nameEl = li.querySelector(".friend-name");
      nameEl.style.cursor = "pointer";
      nameEl.addEventListener("click", () => {
        if (!friend.isFriend) return;
        this.showUserDetails(friend);
      });

      this.setupFriendActions(li, friend);
      this.friendsList.appendChild(li);
    });
  }

  async showUserDetails(friend) {
    const modalTitle = document.getElementById("userDetailModalTitle");
    const modalBody = document.getElementById("userDetailModalBody");

    try {
      const res = await fetch(`/api/match_record/${friend.id}/`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load records");
      const data = await res.json();

      const finished = (data.matches || []).filter((m) => m.ended_on && m.winner);

      const byType = finished.reduce((acc, m) => {
        acc[m.game_type] = acc[m.game_type] || [];
        acc[m.game_type].push(m);
        return acc;
      }, {});

      const records = Object.entries(byType)
        .map(([type, arr]) => {
          const total = arr.length;
          const wins = arr.filter((m) => m.winner === friend.name).length;
          const losses = total - wins;
          return `<p>
          <strong>${type} Record:</strong>
          ${total > 0 ? `${wins}W / ${losses}L` : `No record`}
        </p>`;
        })
        .join("");

      const lastFive = finished
        .sort((a, b) => new Date(b.ended_on) - new Date(a.ended_on))
        .slice(0, 5);

      const lastFiveHTML = lastFive.length
        ? `<ul>${lastFive
            .map((m) => {
              const d = new Date(m.ended_on);
              const dateStr = d.toLocaleDateString("en-GB");
              const timeStr = d.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              const opponent =
                m.player1 === friend.name ? m.player2 : m.player1;
              return `<li>
              <strong>${m.game_type}</strong>
              on ${dateStr} ${timeStr},
              vs ${opponent} — Winner: ${m.winner}
            </li>`;
            })
            .join("")}</ul>`
        : `<p>No matches played.</p>`;

      modalTitle.textContent = friend.name;
      modalBody.innerHTML = `
        <div class="d-flex align-items-center mb-3">
          <img src="${friend.photo}"
               alt="Avatar"
               style="width:80px;height:80px;border-radius:50%;margin-right:15px;">
          <h4 class="m-0">${friend.name}</h4>
        </div>
        ${records}
        <hr>
        <h5>Last 5 Matches</h5>
        ${lastFiveHTML}
      `;
    } catch (err) {
      modalTitle.textContent = friend.name;
      modalBody.innerHTML = `<p class="text-danger">Error loading records.</p>`;
    }

    new bootstrap.Modal(document.getElementById("userDetailModal")).show();
  }

  setupFriendActions(friendItem, friend) {
    friendItem
      .querySelector(".is-friend-btn")
      ?.addEventListener("click", () =>
        this.showConfirmationModal(
          "Unfriend",
          `Remove ${friend.name} from your friends?`,
          "unfriend",
          friend.id
        )
      );
    friendItem
      .querySelector(".pending-request-btn")
      ?.addEventListener("click", () =>
        this.showConfirmationModal(
          "Cancel Friend Request",
          `Cancel friend request to ${friend.name}?`,
          "cancel",
          friend.id
        )
      );
    friendItem
      .querySelector(".send-request-btn")
      ?.addEventListener("click", () => this.action("send", friend.id));
    friendItem
      .querySelector(".accept-btn")
      ?.addEventListener("click", () => this.action("accept", friend.id));
    friendItem
      .querySelector(".decline-btn")
      ?.addEventListener("click", () => this.action("decline", friend.id));
  }

  action(actionType, userId) {
    if (!navigator.onLine) {
      showToast("No internet connection.", "danger");
      return;
    }
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
      next.style.visibility =
        this.currentPage < totalPages ? "visible" : "hidden";
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

export default FriendsPage;
