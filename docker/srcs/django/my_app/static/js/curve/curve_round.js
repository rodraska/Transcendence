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
    for (let i = 1; i <= this.numberPlayers; i++)
    {
        outer: while (1)
        {
            var x = Math.floor(Math.random() * 3 * this.width / 4) - 3 * this.width / 8;
            var y = Math.floor(Math.random() * 3 * this.height / 4) - 3 * this.height / 8;
            for (let p = 0; p < this.players.length; p++)
                if (this.dist([x, y], this.players[p].pos) < 100) {continue outer};
            break ;
        }
        let t = Math.floor(Math.random() * 361) * Math.PI / 180;
        this.players.push(new Player(i, this.playerColors[i], this.playerRGB[i], [x, y], t, this.playerControls[i][0], this.playerControls[i][1], this));
    }
}

const players_load = function()
{
    for (let key in this.currentIters) this.currentIters[key] = 0;
    this.round_winner = 0;
    this.stp = 0;
    this.paint_offset();
    this.gamePaintPlayer();
    this.gamePaintArrows();
}

const players_still = function()
{
    if (this.currentIters.load == 150) return (this.players_free());
    this.currentIters.load++;
    requestAnimationFrame(this.players_still.bind(this));
}

const roundWinner = function()
{
    this.stp = 1;
    let top_scorer = 0;
    for (let i = 1; i <= this.players.length; i++)
    {
        if (this.players[i - 1].stop == false) this.round_winner = i;
        if (this.playerScores[i] == this.playerScores[top_scorer]) top_scorer = 0;
        if (this.playerScores[i] > this.playerScores[top_scorer]) top_scorer = i;
    }
    if (this.numberPlayers == 1) this.round_winner = 1;
    if (top_scorer != 0 && this.playerScores[top_scorer] >= this.points_to_win) this.game_winner = top_scorer;
}

export { ft_round, players_spawn, players_load, players_still, roundWinner }