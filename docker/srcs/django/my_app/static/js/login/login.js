import Component from "../spa/component.js";

class LoginButtons extends Component {
  constructor() {
    super("static/html/login.html");
  }

  onInit() {
    document.getElementById("login-button").addEventListener("click", () => {
      window.location.href = "#/login_form";
    });
    document.getElementById("register-button").addEventListener("click", () => {
      window.location.href = "#/registration_form";
    });
    document
      .getElementById("authenticate-button")
      .addEventListener("click", () => {
        window.location.href = "/accounts/fortytwo/login/";
      });
  }
}

export default LoginButtons;
