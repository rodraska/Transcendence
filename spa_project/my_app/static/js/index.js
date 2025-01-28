import "./spa/component.js"
import UserProfile from './user/user_profile.js'
import HomePage from './home/home_page.js'
import HeaderBar from "./header/header.js";
import PongPage from "./pong/pong.js";
import CurvePage from "./curve/curve.js"

Route.subscribe('/', HomePage);
Route.subscribe('/user', UserProfile);
Route.subscribe('/header', HeaderBar);
Route.subscribe('/pong', PongPage);
Route.subscribe('/curve', CurvePage);
Route.go('/header');
Route.go('/user');


//este file precisa de ser revisto,nao podemos ter as routes assim, para a Carla quando estiveres a testar tens de comentar o Route.go('/user')