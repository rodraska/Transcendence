import Component from "../spa/component.js"

export default class UserProfile extends Component
{
    constructor()
    {
        super('static/html/test.html')
    }

    onInit(){
        console.log('hello');
        const div = this.getElementById("test");
        console.log("User: ", div)
        div.innerHTML = "asdasd";

    }
}


