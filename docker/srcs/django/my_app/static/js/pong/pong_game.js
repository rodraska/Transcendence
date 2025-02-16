import Component from "../spa/component.js"

class PongGame extends Component
{
    constructor()
    {
        super('static/html/pong_game.html')
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

export default PongGame;