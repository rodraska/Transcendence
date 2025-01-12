import "./spa/component.js"
import UserProfile from './user/user_profile.js'
import HomePage from './home/home_page.js'
import HeaderBar from "./header/header.js";

Route.subscribe('/', HomePage);
Route.subscribe('/user', UserProfile);
Route.subscribe('/header', HeaderBar);
Route.go('/header');
