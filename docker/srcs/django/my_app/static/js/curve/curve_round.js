import Player from "./curve_player.js"

const ft_round = function()
{
    if (this.game_winner != 0) return (this.final_paint());
    this.round++;
    document.getElementById("round").innerHTML = "Round " + this.round;
    this.powers = [];
    this.players = [];
    this.ctx.reset();
    this.ft_start(true);
}

const players_spawn = function()
{
    for (let i = 1; i <= 2; i++)
    {
        var x = Math.floor(Math.random() * 3 * this.width / 4) - 3 * this.width / 8;
        var y = Math.floor(Math.random() * 3 * this.height / 4) - 3 * this.height / 8;
        let t = Math.floor(Math.random() * 361) * Math.PI / 180;
        this.players.push(new Player(i, this.playerColors[i], this.playerRGB[i], [x, y], t, this.playerControls[i][0], this.playerControls[i][1], this));
    }
    this.myPlayer = this.players[this.playerNumber - 1];
    this.sendPlayerState(this.players[this.playerNumber - 1]);
}

const players_load = function()
{
    for (let key in this.currentIters) this.currentIters[key] = 0;
    this.round_winner = 0;
    this.dead = 0;
    this.reset_paint();
    this.paint_offset();
    this.gamePaintPlayer();
    this.gamePaintArrows();
}

const players_still = function()
{
    if (this.currentIters.load == 150) return (this.players_free());
    this.reset_paint();
    this.paint_offset();
    this.gamePaintPlayer();
    this.gamePaintArrows();
    this.currentIters.load++;
    requestAnimationFrame(this.players_still.bind(this));
}

export { ft_round, players_spawn, players_load, players_still }