import Route, { normalizeRoute } from "./spa/route.js";
import HeaderBar from "./header/header.js";
import HomePage from "./home/home_page.js";
import UserProfile from "./header/profile.js";
import PongGame from "./pong/pong_game.js";
import CurveGame from "./curve/curve_game.js";
import LoginButtons from "./login/login.js";
import RegistrationForm from "./login/registration_form.js";
import LoginForm from "./login/login_form.js";
import FriendsPage from "./header/friends.js";
import PlayGames from "./play_games/play_games.js";
import Record from "./match/record.js";
import Play from "./play_games/play.js";
import ActiveMatch from "./match/active_match.js";
import TournamentPage from "./tournament/tournament.js";

const headerContainer = document.getElementById("header-container");
const contentContainer = document.getElementById("content-container");

if (!customElements.get("header-component")) {
  customElements.define("header-component", HeaderBar);
}
headerContainer.appendChild(document.createElement("header-component"));

function toggleHeader() {
  const currentRoute = normalizeRoute(window.location.hash || "/");
  if (
    currentRoute === "/login" ||
    currentRoute === "/login_form" ||
    currentRoute === "/registration_form" ||
    !window.loggedInUserName
  ) {
    headerContainer.style.display = "none";
  } else {
    headerContainer.style.display = "block";
  }
}

Route.setContentContainer(contentContainer);
Route.subscribe("/home", HomePage);
Route.subscribe("/profile", UserProfile);
Route.subscribe("/pong", PongGame);
Route.subscribe("/curve", CurveGame);
Route.subscribe("/login", LoginButtons);
Route.subscribe("/registration_form", RegistrationForm);
Route.subscribe("/login_form", LoginForm);
Route.subscribe("/friends", FriendsPage);
Route.subscribe("/record", Record);
Route.subscribe("/play", Play);
Route.subscribe("/active-match", ActiveMatch);
Route.subscribe("/tournament", TournamentPage);

window.addEventListener("hashchange", toggleHeader);
window.addEventListener("DOMContentLoaded", () => {
  checkLoginStatus();
  toggleHeader();
});

function checkLoginStatus() {
  fetch("/api/current_user/", { credentials: "include" })
    .then((r) => r.json())
    .then((data) => {
      if (data.logged_in) {
        window.loggedInUserName = data.username;
        window.loggedInUserId = data.user_id;
        window.loggedInAvatarUrl = data.avatar_url;
        import("./utils/socketManager.js").then((m) => m.getOrCreateSocket());
        if (normalizeRoute(window.location.hash) === "/") {
          Route.go("/play");
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
