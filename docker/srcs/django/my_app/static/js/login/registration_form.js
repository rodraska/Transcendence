import Component from "../spa/component.js";
import { showToast } from "../utils/toast.js";
import Route from "../spa/route.js";
import { getCookie } from "../utils/cookie.js";

const isAlpha = str => /^[a-zA-Z]*$/.test(str);
class RegistrationForm extends Component {
  constructor() {
    super("static/html/registration_form.html");
  }

  onInit() {
    const form = this.querySelector("form");
    const usernameInput = form.querySelector("#username");
    const usernameError = form.querySelector("#username_error");
    const submitButton = form.querySelector("button[type='submit']");

    submitButton.disabled = true;

    const validateUsername = () => {
      const value = usernameInput.value.trim();
      let errorMsg = "";

      if (value.length > 0 && value.length > 8) {
        errorMsg = "Username is too long.";
      } else if (value.length < 3) {
        errorMsg = "Username is too short.";
      } else if (!isAlpha(value)) {
        errorMsg = "Username can only contain letters.";
      }

      if (errorMsg) {
        usernameError.textContent = errorMsg;
        usernameError.classList.remove("d-none");
        submitButton.disabled = true;
      } else {
        usernameError.textContent = "";
        usernameError.classList.add("d-none");
        submitButton.disabled = false;
      }
    };

    usernameInput.addEventListener("blur", validateUsername);

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const username = usernameInput.value.trim();
      const email = form.querySelector("#email").value;
      const password = form.querySelector("#password").value;
      const confirm_password = form.querySelector("#confirm-password").value;

      const payload = {
        username: username,
        email: email,
        password: password,
        confirm_password: confirm_password,
      };

      const csrftoken = getCookie("csrftoken");
      fetch("/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", 
          "X-CSRFToken": csrftoken
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            showToast("Error: " + data.error, "danger", "Register");
          } else {
            showToast("Registration successful you can now login.", "success", "Register");
            Route.go("/login")
          }
        })
        .catch((error) => {
          console.error("Error registering user:", error);
          showToast("Error registering user: " + data.error, "danger", "Register");
        });
    });
  }
}

export default RegistrationForm;
