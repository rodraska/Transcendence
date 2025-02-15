import Component from "../spa/component.js";

class Friends extends Component {
  constructor() {
    super("static/html/friends.html");
  }

  onInit() {
    const usersListContainer = this.querySelector("#users-list");
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
          data.forEach((user) => {
            const li = document.createElement("li");
            li.textContent = `${user.username} (ID: ${user.id})`;
            const friendRequestBtn = document.createElement("button");
            if (user.relationship && user.relationship.status === "accepted") {
              friendRequestBtn.textContent = "Friends";
              friendRequestBtn.disabled = true;
            } else if (user.relationship) {
              if (user.relationship.direction === "sent") {
                friendRequestBtn.textContent = "Request Sent";
                friendRequestBtn.disabled = true;
              } else if (user.relationship.direction === "received") {
                friendRequestBtn.textContent = "Accept Request";
                friendRequestBtn.addEventListener("click", () => {
                  fetch("/api/friend_request/accept/", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ from_user_id: user.id }),
                  })
                    .then((res) => res.json())
                    .then((resData) => {
                      if (resData.error) {
                        alert("Error: " + resData.error);
                      } else {
                        alert("Friend request accepted!");
                        friendRequestBtn.textContent = "Friends";
                        friendRequestBtn.disabled = true;
                      }
                    })
                    .catch((error) => {
                      console.error("Error accepting friend request:", error);
                      alert("Error accepting friend request: " + error);
                    });
                });
              }
            } else {
              friendRequestBtn.textContent = "Send Friend Request";
              friendRequestBtn.addEventListener("click", () => {
                fetch("/api/friend_request/send/", {
                  method: "POST",
                  credentials: "include",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ to_user_id: user.id }),
                })
                  .then((res) => res.json())
                  .then((resData) => {
                    if (resData.error) {
                      alert("Error: " + resData.error);
                    } else {
                      alert("Friend request sent!");
                      friendRequestBtn.textContent = "Request Sent";
                      friendRequestBtn.disabled = true;
                    }
                  })
                  .catch((error) => {
                    console.error("Error sending friend request:", error);
                    alert("Error sending friend request: " + error);
                  });
              });
            }
            li.appendChild(friendRequestBtn);
            usersListContainer.appendChild(li);
          });
        }
      })
      .catch((error) => {
        console.error("Error getting users!:", error);
        alert("Error getting users!: " + error);
      });
  }
}

export default Friends;
