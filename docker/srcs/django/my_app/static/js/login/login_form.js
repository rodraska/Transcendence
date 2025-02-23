import Component from "../spa/component.js";

class LoginForm extends Component {
  constructor() {
    super("static/html/login_form.html");
  }

  onInit() {
    const form = this.querySelector("form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = form.querySelector("#username").value;
      const password = form.querySelector("#password").value;

      const payload = {
        username: username,
        password: password,
      };

      fetch("/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            alert("Error: " + data.error);
          } else {
            alert("Login successful.");
            fetch("/api/current_user/", { credentials: "include" })
              .then((response) => response.json())
              .then((data) => {
                if (data.logged_in) {
                  window.loggedInUserName = data.username;
                  window.loggedInUserId = data.user_id;
                  window.loggedInAvatarUrl = data.avatar_url;
                  window.location.hash = "#/header";
                }
              });
          }
        })
        .catch((error) => { 
          console.error("Error logging in user:", error);
          alert("Error logging in user: " + error);
        });
    });
  }
}

export default LoginForm;
