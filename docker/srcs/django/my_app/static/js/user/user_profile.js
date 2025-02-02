import Component from "../spa/component.js"

export default class UserProfile extends Component
{
    constructor()
    {
        super('static/html/test.html')
    }

    onInit(){
        const div = this.getElementById("test");
        div.innerHTML = "asdasd";
    }
}


