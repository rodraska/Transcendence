import HeaderBar from "./header/header.js";
import Route from "./spa/route.js";

function loadHeader() {
  const headerContainer = document.getElementById("header");
  if (!customElements.get("header-bar")) {
    customElements.define("header-bar", HeaderBar);
  }
  headerContainer.innerHTML = "";
  const headerInstance = document.createElement("header-bar");
  headerContainer.appendChild(headerInstance);
}

function checkLoginStatus() {
  fetch("/api/current_user/", {
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.logged_in) {
        Route.go("/matchmaking");
      } else {
        Route.go("/login");
      }
    })
    .catch((error) => {
      console.error("Error checking login status:", error);
      Route.go("/login");
    });
}

window.addEventListener("DOMContentLoaded", () => {
  loadHeader();
  checkLoginStatus();
});
