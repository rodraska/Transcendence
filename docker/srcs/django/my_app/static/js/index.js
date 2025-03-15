/*import "./spa/component.js";
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

window.addEventListener("DOMContentLoaded", checkLoginStatus);*/


import "./spa/component.js" 
import Route from "./spa/route.js";
import HomePage from './home/home_page.js'
import HeaderBar from "./header/header.js";
import UserProfile from './header/profile.js'
import PongPage from "./pong/pong.js";
import CurvePage from "./curve/curve.js"
import LoginButtons from "./login/login.js";
import LoginForm from "./login/login_form.js";
import RegistrationForm from "./login/registration_form.js";
import PlayGames from "./header/play_games.js";

Route.subscribe('/home', HomePage);
Route.subscribe('/profile', UserProfile);
Route.subscribe('/header', HeaderBar);
Route.subscribe('/play_games', PlayGames)
Route.subscribe('/pong', PongPage);
Route.subscribe('/curve', CurvePage);
Route.subscribe('/login', LoginButtons);
Route.subscribe('/login_form', LoginForm);
Route.subscribe('/registration_form', RegistrationForm);


/* 
function checkLoginStatus() {
  fetch("/api/current_user/", {
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Login status:", data);
      if (data.logged_in) {
        Route.go("/home");
      } else {
        Route.go("/login");
      }
    })
    .catch((error) => {
      console.error("Error checking login status:", error);
      Route.go("/login");
    });
}

window.addEventListener("DOMContentLoaded", checkLoginStatus); */

window.Route = Route;

function checkLoginStatus() {
  fetch("/api/current_user/", {
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Login status:", data);
      if (data.logged_in) {
        // Se o usuário estiver logado, carregar o cabeçalho
        fetch("../static/html/header.html")
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to load header.");
            }
            return response.text();
          })
          .then((headerContent) => {
            document.body.insertAdjacentHTML('afterbegin', headerContent);
            Route.go("/home");
          })
          .catch((error) => {
            console.error("Failed to load header:", error);
            // Optionally, redirect if header loading fails
            Route.go("/login");
          });
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


  /* let headerLoaded = false; // Marca se o cabeçalho já foi carregado

  function checkLoginStatus() {
    fetch("/api/current_user/", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Login status:", data);
        if (data.logged_in) {
          // Verifica se o cabeçalho já foi carregado
          if (!headerLoaded) {
            // Carrega o cabeçalho apenas uma vez
            fetch("../static/html/header.html")
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Failed to load header.");
                }
                return response.text();
              })
              .then((headerContent) => {
                // Verifica se o cabeçalho já foi inserido no DOM
                if (!document.getElementById("header-container")) {
                  document.body.insertAdjacentHTML('afterbegin', headerContent);
                }
                headerLoaded = true; // Marca que o cabeçalho foi carregado
                Route.go("/home");  // Redireciona para a página inicial
              })
              .catch((error) => {
                console.error("Failed to load header:", error);
                Route.go("/login");  // Redireciona para login caso falhe
              });
          } else {
            // Se o cabeçalho já foi carregado, apenas redireciona para /home
            Route.go("/home");
          }
        } else {
          Route.go("/login");  // Redireciona para login se não estiver logado
        }
      })
      .catch((error) => {
        console.error("Error checking login status:", error);
        Route.go("/login");  // Redireciona para login em caso de erro
      });
  }
  
  // Aciona a verificação de login quando o DOM estiver completamente carregado
  window.addEventListener("DOMContentLoaded", checkLoginStatus);
   */