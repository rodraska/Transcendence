import Component from "../spa/component.js"

export default class PongPage extends Component
{
    constructor()
    {
        super('static/pages/Games/pong.html')
    }

    onInit()
    {
        map = document.getElementById('pong');
        ctx = map.getContext('2d');
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, map.clientWidth, map.height);

        width = map.width;
        height = map.height;
    }
}