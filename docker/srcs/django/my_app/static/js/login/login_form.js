import Component from "../spa/component.js";
import { showToast } from "../utils/toast.js";
import { getCookie } from "../utils/cookie.js";

class LoginForm extends Component {
  constructor() {
    super("static/html/login_form.html");
  }

  onInit() {
    const form = this.querySelector("form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = this.querySelector("#username").value;
      const password = this.querySelector("#password").value;
      const payload = { username, password };

      const csrftoken = getCookie("csrftoken");
      fetch("/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json",
          "X-CSRFToken": csrftoken
        },
        body: JSON.stringify(payload),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.error) {
            showToast("Error: " + data.error, "danger", "Login");
          } else {
            showToast("Login successful.", "success", "Login");
            fetch("/api/current_user/", { credentials: "include" })
              .then((resp) => resp.json())
              .then((userData) => {
                if (userData.logged_in) {
                  window.loggedInUserName = userData.username;
                  window.loggedInUserId = userData.user_id;
                  window.loggedInAvatarUrl =
                    userData.avatar_url ||
                    "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg";
                  const headerEl = document.querySelector("header-component");
                  if (headerEl && typeof headerEl.updateHeader === "function") {
                    headerEl.updateHeader(
                      userData.username,
                      userData.avatar_url ||
                        "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg"
                    );
                  }
                  window.location.hash = "#/play";
                }
              });
          }
        })
        .catch((error) => {
          console.error("Error logging in user:", error);
          showToast("Error logging in user: " + data.error, "danger", "Login");
        });
    });
  }
}

export default LoginForm;
