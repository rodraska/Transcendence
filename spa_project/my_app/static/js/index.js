import "./spa/component.js"
import HomePage from './home/home_page.js'
import HeaderBar from "./header/header.js";
import UserProfile from './header/profile.js'
import PongPage from "./pong/pong.js";
import CurvePage from "./curve/curve.js"
import LoginButtons from "./login/login.js";
import LoginForm from "./login/login_form.js";
import RegistrationForm from "./login/registration_form.js";
import PlayGames from "./header/play_games.js";

Route.subscribe('/', HomePage);
Route.subscribe('/profile', UserProfile);
Route.subscribe('/header', HeaderBar);
Route.subscribe('/play_games', PlayGames)
Route.subscribe('/pong', PongPage);
Route.subscribe('/curve', CurvePage);
Route.subscribe('/login', LoginButtons);
Route.subscribe('/login_form', LoginForm);
Route.subscribe('/registration_form', RegistrationForm);

// Route.go('/login_form')
//Route.go('/login')
Route.go('/header')

//este file precisa de ser revisto,nao podemos ter as routes assim, para a Carla quando estiveres a testar tens de comentar o Route.go('/user')
