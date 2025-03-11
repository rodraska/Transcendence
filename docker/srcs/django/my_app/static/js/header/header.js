import Component from "../spa/component.js";
import Route from "../spa/route.js";

class HeaderBar extends Component {
  constructor() {
    super("static/html/header.html");
  }

  onInit() {
    const logoutButton = this.querySelector("#logout-button");
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        window.location.href = "/accounts/logout/";
      });
    }
    const friendsButton = this.querySelector("#friends-button");
    if (friendsButton) {
      friendsButton.addEventListener("click", () => {
        Route.go("/friends");
      });
    }
    this.updateHeader(
      window.loggedInUserName || "Guest",
      window.loggedInAvatarUrl ||
        "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg"
    );
  }

  updateHeader(userName, profileImage) {
    const userNameElement = this.querySelector("#userName");
    const profileImages = this.querySelectorAll("img[alt='Profile']");
    if (userNameElement) {
      userNameElement.textContent = userName;
    }
    profileImages.forEach((img) => {
      img.src = profileImage;
    });
  }
}

export default HeaderBar;
