import Route, { normalizeRoute } from "./spa/route.js";
import HeaderBar from "./header/header.js";
import HomePage from "./home/home_page.js";
import UserProfile from "./header/profile.js";
import PongPage from "./pong/pong.js";
import CurvePage from "./curve/curve.js";
import LoginButtons from "./login/login.js";
import RegistrationForm from "./login/registration_form.js";
import LoginForm from "./login/login_form.js";
import FriendsPage from "./header/friends.js";
import PlayGames from "./play_games/play_games.js";
import Record from "./match/record.js";
import Play from "./play_games/play.js";
import ActiveMatch from "./match/active_match.js";
import PongGame from "./pong/pong_game.js"
import CurveGame from "./curve/curve_game.js"
import ChatRoom from "./chat/chat_room.js";

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
Route.subscribe("/home", HomePage);
Route.subscribe("/profile", UserProfile);
//Route.subscribe("/user", UserProfile);
Route.subscribe("/pong", PongPage);
Route.subscribe("/curve", CurvePage);
Route.subscribe("/header", HeaderBar);
Route.subscribe("/login", LoginButtons);
Route.subscribe("/registration_form", RegistrationForm);
Route.subscribe("/login_form", LoginForm);
Route.subscribe("/friends", FriendsPage);
Route.subscribe("/record", Record);
Route.subscribe("/play", Play);
Route.subscribe("/active-match", ActiveMatch);
Route.subscribe("/play-games", PlayGames);
Route.subscribe('/pong_game', PongGame);
Route.subscribe('/curve_game', CurveGame);
Route.subscribe('/chat_room', ChatRoom);

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
          Route.go("/play");
        } else {
          //Route.go(window.location.hash);
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

let activeSocket = null;

export function getOrCreateSocket() {
  if (activeSocket && activeSocket.readyState === WebSocket.OPEN) {
    return activeSocket;
  }
  activeSocket = new WebSocket("ws://localhost:8000/ws/matchmaking/");
  activeSocket.onopen = () => console.log("Global WebSocket connected.");
  activeSocket.onclose = () => console.warn("Global WebSocket closed.");
  activeSocket.onerror = (err) => console.error("Global WebSocket error:", err);
  activeSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.event === "match_forfeited") {
      alert(data.message || "Opponent forfeited.");
      forceCloseAllModals();
      window.currentMatchData = null;
      window.location.hash = "#/play";
    } else {
      console.log("Global message:", data);
    }
  };
  return activeSocket;
}

function forceCloseAllModals() {
  document.body.classList.remove("modal-open");
  document.querySelectorAll(".modal-backdrop").forEach((b) => b.remove());
}
