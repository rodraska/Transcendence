import Component from "../spa/component.js"
import Route from "../spa/route.js";

export default class HomePage extends Component
{
    constructor()
    {
        super('static/html/home.html')
    }

    onInit() {
        if (!window.loggedInUserName) {
            Route.go('/login');
            return;
        }
    }
}
