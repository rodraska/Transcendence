import Component from "../spa/component.js";

export default class HeaderBar extends Component {
  constructor() {
    super("/static/html/header.html");
  }

  onInit() {
	const dataSetElement = this.querySelector("#dataSet");
    // Update Username
    const userNameElement = this.querySelector("#userName");
    if (userNameElement && window.loggedInUserName) {
      userNameElement.textContent = window.loggedInUserName;
    }

    // Toggle Menu
    const menuButton = this.querySelector(".menu-btn");
    if (menuButton) {
      menuButton.addEventListener("click", () => {
        const menu = this.querySelector(".sidebar");
        if (menu) {
          menu.classList.toggle("d-none");
        }
      });
    }

    // Update Profile Image
    this.updateHeader(
      window.loggedInUserName || "Guest",
      window.loggedInAvatarUrl ||
        "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg"
    );
  }

  updateHeader(userName, profileImage) {
    const userNameElement = this.querySelector("#userName");
    const profileImageElements = this.querySelectorAll("img[alt='Profile']");

    if (userNameElement) {
      userNameElement.textContent = userName;
    }

    profileImageElements.forEach((img) => {
      img.src = profileImage;
    });
  }
}
