import Component from "../spa/component.js";
import { showToast } from "../utils/toast.js";

class RegistrationForm extends Component {
  constructor() {
    super("static/html/registration_form.html");
  }

  onInit() {
    const form = this.querySelector("form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = form.querySelector("#username").value;
      const email = form.querySelector("#email").value;
      const password = form.querySelector("#password").value;
      const confirm_password = form.querySelector("#confirm-password").value;

      const payload = {
        username: username,
        email: email,
        password: password,
        confirm_password: confirm_password,
      };

      fetch("/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            showToast("Error: " + data.error, "danger", "Register");
            //alert("Error: " + data.error);
          } else {
            showToast("Registration successful you can now login.", "success", "Register");
            //alert("Registration successful you can now login.");
            // window.location.href = "#/login";
            Route.go("/login")
          }
        })
        .catch((error) => {
          console.error("Error registering user:", error);
          showToast("Error registering user: " + data.error, "danger", "Register");
          //alert("Error registering user: " + error);
        });
    });
  }
}

export default RegistrationForm;
