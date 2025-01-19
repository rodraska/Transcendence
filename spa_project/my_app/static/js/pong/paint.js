FtPongGame.paint_black = function()
{
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0 , map.width, map.height);
}

FtPongGame.paint_squares = function()
{
    ctx.fillStyle = 'white';
    for (i = 0; i < 31; i++)
    {
        if (i % 2 == 0)
        {
            x = width / 2 - 10;
            y = height / 31 * (i + 1);
            ctx.fillRect(x, y, 20, 30);
        }
    }
}

FtPongGame.paint_score = function()
{
    ctx.font = "80px 'Press Start 2P', cursive";
    ctx.fillStyle = 'white';
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText(this.p1.score, width / 2 - this.s_width, this.s_height);
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText(this.p2.score, width / 2 + this.s_width, this.s_height);
}

FtPongGame.paint_ball = function()
{
    x = (this.ball.pos[0]) + width / 2;
    y = (this.ball.pos[1]) + height / 2;
    ctx.beginPath();
    ctx.arc(x, y, this.b_radius, 0, 2 * Math.PI);
    ctx.fill();
}

FtPongGame.paint_players = function()
{
    x = this.p1.pos[0] - this.p_width / 2 + width / 2;
    y = this.p1.pos[1] - this.p_height / 2 + height / 2;
    ctx.fillRect(x, y, this.p_width, this.p_height);

    x = this.p2.pos[0] - this.p_width / 2 + width / 2;
    y = this.p2.pos[1] - this.p_height / 2 + height / 2;
    ctx.fillRect(x, y, this.p_width, this.p_height);
}

FtPongGame.paint_pong_gameover = function()
{
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText("GAME", width / 2 - this.s_width, height / 2);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("OVER", width / 2 + this.s_width, height / 2);
}

FtPongGame.paint_stop = function()
{
    ctx.clearRect(0, 0, map.width, map.height);
    this.paint_black();
    this.paint_squares();
    this.paint_score();
    this.paint_pong_gameover();
    this.paint_players();
}

FtPongGame.paint_loop = function()
{
    this.paint_black();
    this.paint_squares();
    this.paint_score();
    this.paint_ball();
    this.paint_players();
}