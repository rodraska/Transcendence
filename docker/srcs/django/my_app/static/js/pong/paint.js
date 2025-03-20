const paint_black = function()
{
    this.pong_ctx.fillStyle = 'black';
    this.pong_ctx.fillRect(0, 0 , this.map.width, this.map.height);
}

const paint_squares = function()
{
    this.pong_ctx.fillStyle = 'white';
    for (let i = 0; i < 31; i++)
    {
        if (i % 2 == 0)
        {
            let x = this.width / 2 - 10;
            let y = this.height / 31 * (i + 1);
            this.pong_ctx.fillRect(x, y, 20, 30);
        }
    }
}

const paint_score = function()
{
    this.pong_ctx.font = "80px 'Press Start 2P', cursive";
    this.pong_ctx.fillStyle = 'white';
    this.pong_ctx.textAlign = "right";
    this.pong_ctx.textBaseline = "bottom";
    this.pong_ctx.fillText(this.p1.score, this.width / 2 - this.s_width, this.s_height);
    this.pong_ctx.textAlign = "left";
    this.pong_ctx.textBaseline = "bottom";
    this.pong_ctx.fillText(this.p2.score, this.width / 2 + this.s_width, this.s_height);
}

const paint_ball = function()
{
    let x = (this.ball.pos[0]) + this.width / 2;
    let y = (this.ball.pos[1]) + this.height / 2;
    this.pong_ctx.beginPath();
    this.pong_ctx.arc(x, y, this.b_radius, 0, 2 * Math.PI);
    this.pong_ctx.fill();
}

const paint_players = function()
{
    let x = this.p1.pos[0] - this.p_width / 2 + this.width / 2;
    let y = this.p1.pos[1] - this.p_height / 2 + this.height / 2;
    this.pong_ctx.fillRect(x, y, this.p_width, this.p_height);

    x = this.p2.pos[0] - this.p_width / 2 + this.width / 2;
    y = this.p2.pos[1] - this.p_height / 2 + this.height / 2;
    this.pong_ctx.fillRect(x, y, this.p_width, this.p_height);
}

const paint_pong_gameover = function()
{
    this.pong_ctx.textAlign = "right";
    this.pong_ctx.textBaseline = "middle";
    this.pong_ctx.fillText("GAME", this.width / 2 - this.s_width, this.height / 2);
    this.pong_ctx.textAlign = "left";
    this.pong_ctx.textBaseline = "middle";
    this.pong_ctx.fillText("OVER", this.width / 2 + this.s_width, this.height / 2);
}

const paint_stop = function()
{
    this.pong_ctx.clearRect(0, 0, this.map.width, this.map.height);
    this.paint_black();
    this.paint_squares();
    this.paint_score();
    this.paint_pong_gameover();
    this.paint_players();
}

const paint_loop = function()
{
    this.paint_black();
    this.paint_squares();
    this.paint_score();
    this.paint_ball();
    this.paint_players();
}

export { paint_black, paint_squares, paint_score, paint_ball, paint_players, paint_pong_gameover, paint_stop, paint_loop }