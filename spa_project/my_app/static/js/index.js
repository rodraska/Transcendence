import "./spa/component.js"
import UserProfile from './user/user_profile.js'
import HomePage from './home/home_page.js'
import PongPage from "./pong/pong.js";
import CurvePage from "./curve/curve.js"

Route.subscribe('/', HomePage);
Route.subscribe('/user', UserProfile);
Route.subscribe('/pong', PongPage);
Route.subscribe('/curve', CurvePage);
Route.go('/user');