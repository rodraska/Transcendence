FtCurveGame.ft_round = function()
{
    if (this.game_winner != 0) return (this.final_paint());
    this.round++;
    document.getElementById("round").innerHTML = "Round " + game.round;
    this.powers = [];
    this.players = [];
    ctx.reset();
    this.initial_loop();
}

FtCurveGame.players_spawn = function()
{
    for (let i = 1; i <= this.numberCurvePlayers; i++)
    {
        outer: while (1)
        {
            x = Math.floor(Math.random() * 3 * width / 4) - 3 * width / 8;
            y = Math.floor(Math.random() * 3 * height / 4) - 3 * height / 8;
            for (let p = 0; p < this.players.length; p++)
                if (this.dist([x, y], this.players[p].pos) < 100) {continue outer};
            break ;
        }
        let t = Math.floor(Math.random() * 361) * Math.PI / 180;
        this.players.push(new CurvePlayer(i, this.playerColors[i], this.playerRGB[i], [x, y], t, this.playerControls[i][0], this.playerControls[i][1]));
    }
}

FtCurveGame.players_load = function()
{
    for (let key in this.currentIters) this.currentIters[key] = 0;
    this.round_winner = 0;
    this.stp = 0;
    this.paint_offset();
    this.gamePaintCurvePlayer();
    this.gamePaintArrows();
}

FtCurveGame.players_still = function()
{
    if (this.currentIters.load == 150) return (this.players_free());
    this.currentIters.load++;
    requestAnimationFrame(this.players_still.bind(this));
}

FtCurveGame.roundWinner = function()
{
    this.stp = 1;
    let top_scorer = 0;
    for (let i = 1; i <= this.players.length; i++)
    {
        if (this.players[i - 1].stop == false) this.round_winner = i;
        if (this.playerScores[i] == this.playerScores[top_scorer]) top_scorer = 0;
        if (this.playerScores[i] > this.playerScores[top_scorer]) top_scorer = i;
    }
    if (this.numberCurvePlayers == 1) this.round_winner = 1;
    if (top_scorer != 0 && this.playerScores[top_scorer] >= this.numberCurvePlayers * 1) this.game_winner = top_scorer;
}