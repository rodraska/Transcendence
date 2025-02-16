import "./spa/component.js";
import UserProfile from "./user/user_profile.js";
import HomePage from "./home/home_page.js";
import HeaderBar from "./header/header.js";
import PongPage from "./pong/pong.js";
import CurvePage from "./curve/curve.js";
import LoginButtons from "./login/login.js";
import Route from "./spa/route.js";
import RegistrationForm from "./login/registration_form.js";
import LoginForm from "./login/login_form.js";
import Friends from "./header/friends.js";
import PlayGames from "./play_games/play_games.js";

Route.subscribe("/", HomePage);
Route.subscribe("/user", UserProfile);
Route.subscribe("/header", HeaderBar);
Route.subscribe("/pong", PongPage);
Route.subscribe("/curve", CurvePage);
Route.subscribe("/login", LoginButtons);
Route.subscribe("/registration_form", RegistrationForm);
Route.subscribe("/login_form", LoginForm);
Route.subscribe("/friends", Friends);
Route.subscribe("/play-games", PlayGames);


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
