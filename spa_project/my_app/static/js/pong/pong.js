import Component from "../spa/component.js"

export default class PongPage extends Component
{
    constructor()
    {
        super('static/html/pong.html')
    }

    onInit()
    {
        if (game) console.log(game);
        map = document.getElementById('pong');
        pong_ctx = map.getContext('2d');
        pong_ctx.fillStyle = 'black';
        pong_ctx.fillRect(0, 0, map.clientWidth, map.height);

        width = map.width;
        height = map.height;
    }
}