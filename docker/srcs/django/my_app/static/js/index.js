import Route, { normalizeRoute } from "./spa/route.js";
import HeaderBar from "./header/header.js";
import HomePage from "./home/home_page.js";
import UserProfile from "./user/user_profile.js";
import PongPage from "./pong/pong.js";
import CurvePage from "./curve/curve.js";
import LoginButtons from "./login/login.js";
import RegistrationForm from "./login/registration_form.js";
import LoginForm from "./login/login_form.js";
import Friends from "./header/friends.js";
import PlayGames from "./play_games/play_games.js";

const headerContainer = document.getElementById("header-container");
const contentContainer = document.getElementById("content-container");

if (!customElements.get("header-component")) {
  customElements.define("header-component", HeaderBar);
}
headerContainer.appendChild(document.createElement("header-component"));

function toggleHeader() {
  let currentRoute = normalizeRoute(window.location.hash || "/");
  if (
    currentRoute === "/login" ||
    currentRoute === "/login_form" ||
    currentRoute === "/registration_form"
  ) {
    headerContainer.style.display = "none";
  } else {
    headerContainer.style.display = "block";
  }
}

Route.setContentContainer(contentContainer);
Route.subscribe("/", HomePage);
Route.subscribe("/user", UserProfile);
Route.subscribe("/pong", PongPage);
Route.subscribe("/curve", CurvePage);
Route.subscribe("/login", LoginButtons);
Route.subscribe("/registration_form", RegistrationForm);
Route.subscribe("/login_form", LoginForm);
Route.subscribe("/friends", Friends);
Route.subscribe("/play-games", PlayGames);

window.addEventListener("hashchange", () => {
  toggleHeader();
});

window.addEventListener("DOMContentLoaded", () => {
  toggleHeader();
  checkLoginStatus();
});

function checkLoginStatus() {
  fetch("/api/current_user/", { credentials: "include" })
    .then((r) => r.json())
    .then((data) => {
      if (data.logged_in) {
        window.loggedInUserName = data.username;
        window.loggedInUserId = data.user_id;
        window.loggedInAvatarUrl = data.avatar_url;
        if (normalizeRoute(window.location.hash) === "/") {
          Route.go("/friends");
        } else {
          Route.go(window.location.hash);
        }
      } else {
        window.loggedInUserName = null;
        window.loggedInUserId = null;
        window.loggedInAvatarUrl = null;
        Route.go("/login");
      }
    })
    .catch(() => {
      window.loggedInUserName = null;
      window.loggedInUserId = null;
      window.loggedInAvatarUrl = null;
      Route.go("/login");
    });
}
