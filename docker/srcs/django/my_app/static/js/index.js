import "./spa/component.js";
import UserProfile from "./user/user_profile.js";
import HomePage from "./home/home_page.js";
import HeaderBar from "./header/header.js";
import LoginButtons from "./login/login.js";
import Route from "./spa/route.js";
import RegistrationForm from "./login/registration_form.js";
import LoginForm from "./login/login_form.js";
import Friends from "./header/friends.js";
import PlayGames from "./play_games/play_games.js";
import PongMain from "./pong/pong_main.js"
import PongCreate from "./pong/pong_create.js"
import PongJoin from "./pong/pong_join.js"
import PongGame from "./pong/pong_game.js"
import PongLobby from "./pong/pong_lobby.js"
import CurveMain from "./curve/curve_main.js"
import CurveGame from "./curve/curve_game.js"
import CurveCreate from "./curve/curve_create.js"
import CurveJoin from "./curve/curve_join.js"
import CurveHistory from "./curve/curve_history.js"
import CurveLobby from "./curve/curve_lobby.js"
import ChatRoom from "./chat/chat_room.js";

Route.subscribe("/", HomePage);
Route.subscribe("/user", UserProfile);
Route.subscribe("/header", HeaderBar);
Route.subscribe("/login", LoginButtons);
Route.subscribe("/registration_form", RegistrationForm);
Route.subscribe("/login_form", LoginForm);
Route.subscribe("/friends", Friends);
Route.subscribe("/play-games", PlayGames);
Route.subscribe('/pong_main', PongMain);
Route.subscribe('/pong_create', PongCreate);
Route.subscribe('/pong_join', PongJoin);
Route.subscribe('/pong_game', PongGame);
Route.subscribe('/pong_lobby', PongLobby);
Route.subscribe('/curve_main', CurveMain);
Route.subscribe('/curve_game', CurveGame);
Route.subscribe('/curve_create', CurveCreate);
Route.subscribe('/curve_join', CurveJoin);
Route.subscribe('/curve_history', CurveHistory);
Route.subscribe('/curve_lobby', CurveLobby);
Route.subscribe('/chat_room', ChatRoom);


function checkLoginStatus() {
  fetch("/api/current_user/", {
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Login status:", data);
      if (data.logged_in) {
        Route.go("/header");
      } else {
        Route.go("/login");
      }
    })
    .catch((error) => {
      console.error("Error checking login status:", error);
      Route.go("/login");
    });
}

window.addEventListener("DOMContentLoaded", checkLoginStatus);