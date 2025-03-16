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

    const homeButton = this.querySelector("#homebtn");
    if (homeButton) {
      homeButton.addEventListener("click", () => {
        Route.go("/home");
      });
    }

    const profileButton = this.querySelector("#profilebtn");
    if (profileButton) {
      profileButton.addEventListener("click", () => {
        Route.go("/profile");
      });
    }

    const playButton = this.querySelector("#playgamebtn");
    if (playButton) {
      playButton.addEventListener("click", () => {
        Route.go("/play");
      });
    }

    const friendsButton = this.querySelector("#friends-button");
    if (friendsButton) {
      friendsButton.addEventListener("click", () => {
        Route.go("/friends");
      });
    }
    
   
    const userNameElement = this.querySelector("#userName");
    if (userNameElement && window.loggedInUserName) {
      userNameElement.textContent = window.loggedInUserName;
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
