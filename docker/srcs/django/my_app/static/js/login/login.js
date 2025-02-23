import Route from "./spa/route.js";
import Component from "../spa/component.js";

class LoginButtons extends Component {
  constructor() {
    super("static/html/login.html");
  }

  onInit() {
    document.getElementById("login-button").addEventListener("click", () => {
      Route.go("/login_form");
    });
    document.getElementById("register-button").addEventListener("click", () => {
      Route.go("#/registration_form");
    });
    document
      .getElementById("authenticate-button")
      .addEventListener("click", () => {
        Route.go("/accounts/fortytwo/login/");
      });
  }
}

export default LoginButtons;
