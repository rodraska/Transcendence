import "./spa/component.js"
import HomePage from './home/home_page.js'
import HeaderBar from "./header/header.js";
import UserProfile from './header/profile.js'
import LoginButtons from "./login/login.js";
import LoginForm from "./login/login_form.js";
import RegistrationForm from "./login/registration_form.js";
import PlayGames from "./header/play_games.js";
import FriendsPage from "./friends/friends.js";
import FriendCard from "./friends/friend_card.js";
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

Route.subscribe('/', HomePage);
Route.subscribe('/profile', UserProfile);
Route.subscribe('/header', HeaderBar);
Route.subscribe('/play_games', PlayGames)
Route.subscribe('/login', LoginButtons);
Route.subscribe('/login_form', LoginForm);
Route.subscribe('/registration_form', RegistrationForm);
Route.subscribe('/friends', FriendsPage);
Route.subscribe('/friend_card', FriendCard);
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

// Route.go('/login_form')
//Route.go('/login')
Route.go('/friends')

//este file precisa de ser revisto,nao podemos ter as routes assim, para a Carla quando estiveres a testar tens de comentar o Route.go('/user')
