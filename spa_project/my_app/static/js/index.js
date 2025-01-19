import "./spa/component.js"
import UserProfile from './user/user_profile.js'
import HomePage from './home/home_page.js'
import PongPage from "./pong/pong.js";

Route.subscribe('/', HomePage);
Route.subscribe('/user', UserProfile);
Route.subscribe('/pong', PongPage);
Route.go('/user');